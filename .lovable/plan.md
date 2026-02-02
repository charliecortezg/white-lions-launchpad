
# Plan: ALAN-lite v1 Production-Ready - 5 Frentes Críticos

## Resumen Ejecutivo

Cerrar los pendientes críticos para dejar ALAN-lite v1 "production-ready":

1. **Dedupe/Upsert en formulario** - Prevenir duplicados con búsqueda por email/teléfono normalizado
2. **Cron robusto + logging** - Agregar tabla job_runs, locking para evitar corridas paralelas
3. **Slots desde fuente única** - Crear tabla `class_schedules` para eliminar hardcode
4. **Token reutilizable** - Almacenar token en `email_queue.payload` para no crear nuevos por email
5. **Recordatorios sin duplicar** - Cancel/recreate de 24h/2h al reprogramar

---

## Estado Actual del Sistema

### Lo que ya funciona:
- ✅ Cron jobs activos: `run-reminders` (hourly) y `process-trial-pipeline` (cada 15 min)
- ✅ Auto No-Show después de 4h de gracia
- ✅ Secuencia de 3 emails no-show + lost_check
- ✅ Magic Links con validación de token hasheado
- ✅ UI de reprogramación (/reprogramar, /reprogramar/confirm)
- ✅ Columna "Perdido" en Kanban
- ✅ Campos `email_normalized` y `phone_normalized` en DB
- ✅ Trigger para calcular `trial_start_at` desde `preferred_schedule`

### Problemas identificados:
- ❌ Formulario hace INSERT directo sin verificar duplicados
- ❌ No hay tabla `job_runs` para logging del cron
- ❌ No hay locking para evitar corridas paralelas
- ❌ Horarios hardcodeados en Edge Functions (no fuente única)
- ❌ Se crea token nuevo por cada email (líneas 595-639 en process-trial-pipeline)
- ❌ Al reprogramar no se recrean recordatorios 24h/2h
- ❌ Referencias a `follow_up_tasks` (tabla que CEO eliminó del alcance)

---

## Parte 1: Dedupe/Upsert en Formulario (CRÍTICO)

### 1.1 Modificar `TrialClassModal.tsx`

**Lógica actual (líneas 147-169):**
```typescript
const { error } = await supabase
  .from("trial_class_registrations")
  .insert([...]);
```

**Nueva lógica con dedupe:**
```text
1. Normalizar datos:
   email_normalized = tutor_email.toLowerCase().trim()
   phone_normalized = contact_phone.replace(/[^0-9]/g, '')

2. Buscar prospecto existente abierto:
   SELECT id FROM trial_class_registrations
   WHERE (email_normalized = $1 OR phone_normalized = $2)
     AND status NOT IN ('Inscrito', 'Perdido')
     AND created_at >= now() - interval '45 days'
   ORDER BY created_at DESC
   LIMIT 1

3. Si existe:
   - UPDATE con nuevos datos
   - Mostrar toast "Actualizamos tu reservación existente"
   
4. Si no existe:
   - INSERT normal
```

### 1.2 Crear función helper para normalización

```typescript
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}
```

---

## Parte 2: Cron Robusto + Logging (CRÍTICO)

### 2.1 Crear tabla `job_runs`

```text
CREATE TABLE job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz NULL,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  processed_count int DEFAULT 0,
  error_count int DEFAULT 0,
  last_error text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_runs_name_status ON job_runs(job_name, status);
CREATE INDEX idx_job_runs_started ON job_runs(started_at DESC);
```

### 2.2 Locking con advisory lock

En `process-trial-pipeline`, al inicio:

```text
1. Verificar si hay job 'running' en últimos 10 minutos
2. Si hay, salir inmediatamente (log: "Skipping, another run in progress")
3. Si no hay, insertar job_run con status='running'
4. Al finalizar, actualizar a 'completed' o 'failed'
```

### 2.3 Modificar `process-trial-pipeline/index.ts`

Agregar al inicio del handler:
```text
// Check for concurrent runs
const { data: runningJob } = await supabase
  .from('job_runs')
  .select('id')
  .eq('job_name', 'process-trial-pipeline')
  .eq('status', 'running')
  .gt('started_at', new Date(now.getTime() - 10 * 60 * 1000).toISOString())
  .maybeSingle();

if (runningJob) {
  console.log("⏭️ Skipping: another run in progress");
  return Response with {skipped: true}
}

// Create job run record
const { data: jobRun } = await supabase
  .from('job_runs')
  .insert({ job_name: 'process-trial-pipeline', status: 'running' })
  .select()
  .single();
```

Al final:
```text
await supabase
  .from('job_runs')
  .update({
    status: 'completed',
    finished_at: now.toISOString(),
    processed_count: results.autoNoShow.processed,
    error_count: results.autoNoShow.errors
  })
  .eq('id', jobRun.id);
```

---

## Parte 3: Slots desde Fuente Única (RECOMENDADO)

### 3.1 Crear tabla `class_schedules`

```text
CREATE TABLE class_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_hour int NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
  start_minute int NOT NULL CHECK (start_minute BETWEEN 0 AND 59),
  duration_minutes int NOT NULL DEFAULT 90,
  location_name text NOT NULL,
  location_zone text NULL,
  maps_url text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed data
INSERT INTO class_schedules (sport, day_of_week, start_hour, start_minute, duration_minutes, location_name, location_zone, maps_url) VALUES
('Fútbol', 1, 18, 0, 90, 'Campo Hacienda del Bosque', 'Zona Haciendas, Mexicali', 'https://maps.app.goo.gl/ZoLbWvaQgFAsoDYa8'),
('Fútbol', 3, 18, 0, 90, 'Campo Hacienda del Bosque', 'Zona Haciendas, Mexicali', 'https://maps.app.goo.gl/ZoLbWvaQgFAsoDYa8'),
('Basketball', 2, 18, 30, 90, 'Parque Quinta del Rey III', 'Fracc. Quinta del Rey, Mexicali', 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8'),
('Basketball', 4, 18, 30, 90, 'Parque Quinta del Rey III', 'Fracc. Quinta del Rey, Mexicali', 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8');
```

### 3.2 Actualizar `getNextBestSlots` en Edge Functions

Cambiar de heurística hardcodeada a:

```text
async function getNextBestSlots(supabase, category: string, limit: number = 2) {
  // Detect sport from category
  const sport = detectSport(category);
  
  // Fetch schedules from DB
  const { data: schedules } = await supabase
    .from('class_schedules')
    .select('*')
    .eq('sport', sport)
    .eq('is_active', true);
  
  if (!schedules || schedules.length === 0) {
    return []; // Fallback or error
  }
  
  // Calculate next N slots using schedules
  const slots = [];
  const now = new Date();
  const tijuanaNow = toTijuanaTime(now);
  const checkDate = addDays(tijuanaNow, 1);
  
  while (slots.length < limit && daysChecked < 30) {
    for (const schedule of schedules) {
      if (checkDate.getDay() === schedule.day_of_week) {
        const slotDate = new Date(checkDate);
        slotDate.setHours(schedule.start_hour, schedule.start_minute);
        slots.push({
          formatted: formatSlot(slotDate),
          iso: toUTC(slotDate).toISOString(),
          location: schedule.location_name,
          maps_url: schedule.maps_url
        });
      }
    }
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  return slots.slice(0, limit);
}
```

---

## Parte 4: Token Reutilizable (RECOMENDADO)

### 4.1 Problema Actual

En `process-trial-pipeline` líneas 593-639:
- Siempre crea token nuevo porque "solo almacenamos el hash"
- Cada email (no_show_2, no_show_3) genera token nuevo

### 4.2 Solución: Almacenar token en `email_queue.payload`

**Opción elegida:** Agregar columna `payload` a `email_queue`:

```text
ALTER TABLE email_queue ADD COLUMN payload jsonb NULL;
```

**Flujo actualizado:**

1. Al auto no-show, generar UN token y almacenarlo en plaintext en `payload`:
```text
const token = crypto.randomUUID();
const tokenHash = await hashToken(token);

// Store hash in reprogram_tokens
await supabase.from('reprogram_tokens').insert({
  prospect_id, token_hash, expires_at
});

// Store plaintext token in email_queue.payload for all 3 emails
for (const template of ['no_show_1', 'no_show_2', 'no_show_3']) {
  await supabase.from('email_queue').insert({
    prospect_id,
    template,
    to_email,
    scheduled_for,
    status: 'queued',
    idempotency_key: `${template}_${prospect_id}_${dateKey}`,
    payload: { token, reprogram_link: `${SITE_URL}/reprogramar?token=${token}` }
  });
}
```

2. Al procesar email_queue, usar el token del payload:
```text
const token = email.payload?.token;
if (!token) {
  // Fallback: create new token
}
const sent = await sendNoShowEmail(registration, email.template, token);
```

### 4.3 Beneficios
- Un solo token válido por 72h para toda la secuencia
- No se crean tokens redundantes
- El hash sigue en `reprogram_tokens` para validación segura

---

## Parte 5: Recordatorios 24h/2h sin Duplicar (CRÍTICO)

### 5.1 Problema Actual

El sistema de recordatorios (`run-reminders`) usa `comm_log` para deduplicación, pero:
- No usa `email_queue` para programar recordatorios
- Al reprogramar, no se cancelan recordatorios viejos ni se crean nuevos

### 5.2 Solución: Unificar recordatorios en `email_queue`

**Opción 1 (Mínima): Agregar templates de recordatorio a email_queue**

1. En `run-reminders`, antes de enviar, verificar si ya existe en `email_queue` con template `reminder_24h` o `reminder_2h` para ese `prospect_id` y `trial_start_at`.

2. En `reprogramar-api` (action=confirm), agregar:
```text
// Cancel old reminders
await supabase
  .from('email_queue')
  .update({ status: 'canceled' })
  .eq('prospect_id', prospect.id)
  .in('template', ['reminder_24h', 'reminder_2h'])
  .eq('status', 'queued');

// Note: New reminders will be created by run-reminders cron
// based on the new trial_start_at
```

**Opción 2 (Más robusta): Programar recordatorios explícitamente**

Al reprogramar o al insertar nuevo prospecto:
```text
// Calculate reminder times
const trial_start = new Date(slotDate);
const reminder24h = new Date(trial_start.getTime() - 24 * 60 * 60 * 1000);
const reminder2h = new Date(trial_start.getTime() - 2 * 60 * 60 * 1000);

// Insert to email_queue with idempotency
const dateKey = trial_start.toISOString().split('T')[0];

await supabase.from('email_queue').upsert([
  {
    prospect_id,
    template: 'reminder_24h',
    to_email: prospect.parent_email,
    scheduled_for: reminder24h.toISOString(),
    status: 'queued',
    idempotency_key: `reminder_24h_${prospect_id}_${dateKey}`
  },
  {
    prospect_id,
    template: 'reminder_2h',
    to_email: prospect.parent_email,
    scheduled_for: reminder2h.toISOString(),
    status: 'queued',
    idempotency_key: `reminder_2h_${prospect_id}_${dateKey}`
  }
], { onConflict: 'idempotency_key' });
```

### 5.3 Recomendación

Usar **Opción 1** (mínima) para no reescribir `run-reminders` completamente:
- `run-reminders` sigue funcionando como hoy
- Al reprogramar, solo cancelamos los emails queued antiguos
- Los nuevos recordatorios se enviarán naturalmente cuando corresponda

---

## Limpieza: Remover referencias a `follow_up_tasks`

### Archivos a limpiar:

| Archivo | Líneas | Acción |
|---------|--------|--------|
| `supabase/functions/admin-prospects/index.ts` | 82-86, 112-130, 201-206, 237-241, 281-286 | Eliminar bloque completo de follow_up_tasks |
| `supabase/functions/reprogramar-api/index.ts` | 242-247, 302-307 | Eliminar bloque completo de follow_up_tasks |

Simplemente remover los bloques que hacen update/insert a `follow_up_tasks`.

---

## Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| SQL Migration | Crear `job_runs`, `class_schedules`, agregar `payload` a `email_queue` |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/TrialClassModal.tsx` | Implementar lógica dedupe/upsert |
| `supabase/functions/process-trial-pipeline/index.ts` | Job locking, token reutilizable, usar class_schedules |
| `supabase/functions/reprogramar-api/index.ts` | Remover follow_up_tasks, cancelar reminder emails, usar class_schedules |
| `supabase/functions/admin-prospects/index.ts` | Remover follow_up_tasks |
| `supabase/functions/run-reminders/index.ts` | (Opcional) Integrar con email_queue para deduplicación |

---

## Secuencia de Implementación

```text
1. SQL Migration
   - Crear job_runs
   - Crear class_schedules + seed data
   - Agregar payload a email_queue
   
2. Limpiar follow_up_tasks
   - Remover de admin-prospects
   - Remover de reprogramar-api
   
3. Implementar job locking
   - Modificar process-trial-pipeline
   
4. Token reutilizable
   - Modificar lógica en process-trial-pipeline
   
5. Slots desde class_schedules
   - Actualizar getNextBestSlots en ambas funciones
   
6. Cancel/recreate recordatorios
   - Modificar reprogramar-api (action=confirm)
   
7. Dedupe en formulario
   - Modificar TrialClassModal.tsx
   
8. Deploy y testing
```

---

## Criterios de Aceptación (Testing)

| # | Prueba | Resultado Esperado |
|---|--------|-------------------|
| A | Enviar formulario 2 veces con mismo email | Solo 1 registro (UPDATE del existente) |
| B | trial_start_at=Hoy 18:00, deadline 22:01 | Auto No-Show + 3 emails queued con mismo token |
| C | Correr cron 5 veces en 1 minuto | Solo 1 ejecución real (otras skipped) |
| D | Reprogramar desde Magic Link | Cancela emails no-show, status=Reprogramado |
| E | Verificar job_runs después de cron | Registro con processed_count, status=completed |
| F | no_show_2 y no_show_3 | Usan mismo token que no_show_1 |
| G | Reprogramar clase | Recordatorios 24h/2h se resetean para nueva fecha |

---

## Sección Técnica

### Timezone handling (America/Tijuana)

```typescript
function toTijuanaTime(utcDate: Date): Date {
  return new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/Tijuana' }));
}
```

### Normalización de datos

```typescript
// Email
const normalizeEmail = (email: string) => email.toLowerCase().trim();

// Phone (solo dígitos)
const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '');
```

### Idempotency keys

```text
// Emails no-show (por fecha de no-show)
no_show_1_{prospect_id}_{YYYY-MM-DD}
no_show_2_{prospect_id}_{YYYY-MM-DD}
no_show_3_{prospect_id}_{YYYY-MM-DD}

// Recordatorios (por fecha de clase)
reminder_24h_{prospect_id}_{trial_start_date}
reminder_2h_{prospect_id}_{trial_start_date}

// Job runs
process-trial-pipeline (solo 1 running a la vez)
```

### RLS para nuevas tablas

```text
job_runs:
  - SELECT: admin/staff (para debugging)
  - INSERT/UPDATE: via service_role only
  - No user access needed

class_schedules:
  - SELECT: public (para el formulario)
  - INSERT/UPDATE/DELETE: admin only
```
