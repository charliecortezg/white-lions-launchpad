

# Plan: ALAN-lite v1 - Sistema Completo de Reactivación NO-SHOW

## Resumen Ejecutivo

Implementar un sistema automatizado de reactivación para prospectos que no asistieron a su clase muestra, con:
- Secuencia de 3 emails de reactivación en 72h
- Magic Link multi-uso para reprogramación 1-click
- Columna "Perdido" con estado terminal automático
- Airbag anti-duplicados en el formulario
- Sin tareas de llamadas internas (eliminadas por CEO)

---

## Arquitectura del Sistema

```text
+-------------------+       +--------------------+       +-------------------+
|  FORMULARIO WEB   | ----> | trial_class_       | <---- | ADMIN PANEL       |
| (TrialClassModal) |       | registrations      |       | (Kanban UI)       |
|                   |       | [DEDUPE/UPSERT]    |       | [+ Perdido column]|
+-------------------+       +--------------------+       +-------------------+
                                    |
           +------------------------+------------------------+
           |                        |                        |
           v                        v                        v
+-------------------+    +-------------------+    +-------------------+
| send-confirmation |    | run-reminders     |    | admin-prospects   |
| (on signup)       |    | (24h/2h)          |    | (CRUD + actions)  |
+-------------------+    +-------------------+    +-------------------+
                                    |
                    +---------------+---------------+
                    |                               |
                    v                               v
      +---------------------------+    +---------------------------+
      | process-trial-pipeline    |    | NUEVA: /reprogramar/*     |
      | (cron 15 min)             |    | (Magic Link pages)        |
      +---------------------------+    +---------------------------+
              |
    +---------+---------+---------+
    |         |         |         |
    v         v         v         v
Auto       Queue     Send      Mark
No-Show    3 Emails  Emails    Lost
(4h)       (+0/24/72h)  (Resend)  (78h)
```

---

## Parte 1: Cambios en Base de Datos (SQL Migration)

### 1.1 Nuevos Campos en `trial_class_registrations`

| Campo | Tipo | Propósito |
|-------|------|-----------|
| `reactivation_status` | text | 'active' / 'paused' / 'completed' |
| `reactivation_paused_until` | timestamptz | Cuando reanuda si pausado |
| `lost_at` | timestamptz | Fecha cuando se marcó perdido |
| `lost_reason` | text | 'opt_out' / 'no_response_72h' / 'manual' |
| `email_normalized` | text | Email en minúsculas para dedupe |
| `phone_normalized` | text | Teléfono limpio (solo números) |

### 1.2 Nueva Tabla: `reprogram_tokens` (Magic Links)

```text
+-------------------+-------------+----------------------------------+
| Campo             | Tipo        | Descripción                      |
+-------------------+-------------+----------------------------------+
| id                | uuid PK     | Identificador único              |
| prospect_id       | uuid FK     | Referencia a prospect            |
| token_hash        | text UNIQUE | SHA256 del token (seguridad)     |
| expires_at        | timestamptz | Expiración 72h desde creación    |
| uses_count        | int         | Cuántas veces se usó             |
| last_used_at      | timestamptz | Última vez que se usó            |
| created_at        | timestamptz | Fecha de creación                |
+-------------------+-------------+----------------------------------+
```

### 1.3 Expandir `email_queue`

Agregar nuevos templates al CHECK constraint:
- `no_show_3` (email final)
- `lost_check` (job interno para marcar perdido)

### 1.4 Triggers de Normalización

Trigger automático al INSERT/UPDATE para:
- `email_normalized = LOWER(TRIM(parent_email))`
- `phone_normalized = REGEXP_REPLACE(contact_phone, '[^0-9]', '', 'g')`

---

## Parte 2: Edge Function `process-trial-pipeline` (Actualizada)

### 2.1 Regla 1: Auto No-Show (ya existe, mejorar)

```text
CUANDO:
  - status IN ('Pendiente', 'Reprogramado')
  - attendance_marked_at IS NULL
  - no_show_processed_at IS NULL
  - now() > trial_start_at + 4 horas (duración + gracia)

ENTONCES:
  1. UPDATE prospect: status = 'No Asistió', no_show_processed_at = now()
  2. Crear/reutilizar reprogram_token (72h, multi-uso)
  3. Queue 3 emails:
     - no_show_1: now()
     - no_show_2: +24h
     - no_show_3: +72h
  4. Queue lost_check: +78h (6h después del email 3)
```

### 2.2 Regla 2: Procesar Cola de Emails (mejorar)

Para cada email queued donde `scheduled_for <= now()`:

1. Re-validar elegibilidad:
   - Si status cambió a ('Asistió', 'Inscrito', 'Pendiente', 'Reprogramado', 'Perdido') → cancelar
   - Si reactivation_status = 'paused' → cancelar

2. Si es `lost_check`:
   - Verificar que sigue en 'No Asistió'
   - Marcar como 'Perdido', lost_reason = 'no_response_72h'
   - Cancelar emails restantes

3. Si es email de no-show:
   - Obtener token activo para construir links
   - Calcular "2 mejores opciones" con getNextBestSlots()
   - Enviar email con HTML dinámico
   - Marcar como sent

### 2.3 Función: getNextBestSlots()

```text
function getNextBestSlots(prospect, limit = 2):
  sport = detectSport(prospect.category)
  
  if sport == 'Fútbol':
    validDays = [Lun=1, Mié=3]
    startHour = 18, startMinute = 0
  else:  // Basketball
    validDays = [Mar=2, Jue=4]
    startHour = 18, startMinute = 30
  
  slots = []
  date = today + 1  // empezar mañana
  
  while slots.length < limit AND date < today + 30:
    if dayOfWeek(date) in validDays:
      slots.push(date at startHour:startMinute America/Tijuana)
    date += 1 day
  
  return slots
```

---

## Parte 3: Nuevas Rutas de Reprogramación

### 3.1 Página `/reprogramar` (Token Landing)

```text
URL: /reprogramar?token=abc123

Flujo:
1. Validar token (hash match, expires_at > now)
2. Cargar datos del prospecto
3. Mostrar UI:

+--------------------------------------------------+
|  🦁 White Lions Academy                          |
+--------------------------------------------------+
|                                                   |
|  ¡Hola [tutor_name]! 👋                          |
|                                                   |
|  Queremos reservarte el mejor horario para       |
|  [player_name].                                   |
|                                                   |
|  +--------------------------------------------+  |
|  | 📅 Miércoles 5 de febrero                  |  |
|  | ⏰ 6:00 PM                                 |  |
|  | [     ✓ Reservar Este Horario        ]    |  |
|  +--------------------------------------------+  |
|                                                   |
|  +--------------------------------------------+  |
|  | 📅 Lunes 10 de febrero                     |  |
|  | ⏰ 6:00 PM                                 |  |
|  | [     ✓ Reservar Este Horario        ]    |  |
|  +--------------------------------------------+  |
|                                                   |
|  [Ver más horarios disponibles →]                |
|                                                   |
|  ─────────────────────────────────               |
|  [Pausar mensajes por ahora]                     |
+--------------------------------------------------+
```

### 3.2 Endpoint `/reprogramar/confirm`

```text
GET /reprogramar/confirm?token=abc123&slot=2026-02-05T18:00:00-08:00

Acciones:
1. Validar token
2. Validar slot (pertenece a horarios válidos del deporte)
3. Actualizar prospecto:
   - trial_start_at = slot
   - status = 'Reprogramado'
   - attendance_marked_at = NULL
   - no_show_processed_at = NULL
   - reactivation_status = 'completed'
4. Cancelar email_queue pendientes
5. Recrear recordatorios 24h/2h
6. Incrementar token uses_count
7. Mostrar confirmación con botón Google Maps
```

### 3.3 Endpoint `/reactivacion/pausar`

```text
GET /reactivacion/pausar?token=abc123

Acciones:
1. Validar token
2. Actualizar prospecto:
   - status = 'Perdido'
   - reactivation_status = 'paused'
   - reactivation_paused_until = now + 30 días
   - lost_at = now
   - lost_reason = 'opt_out'
3. Cancelar email_queue pendientes
4. Mostrar confirmación
```

---

## Parte 4: Airbag Anti-Duplicados (Form Submit)

### 4.1 Lógica de Dedupe/Upsert

Al hacer submit del formulario TrialClassModal:

```text
1. Normalizar datos:
   email_normalized = LOWER(TRIM(email))
   phone_normalized = solo dígitos

2. Buscar prospecto existente:
   SELECT * FROM trial_class_registrations
   WHERE (email_normalized = :email OR phone_normalized = :phone)
     AND status NOT IN ('Inscrito', 'Perdido')
     AND created_at >= now() - 45 days
   ORDER BY created_at DESC
   LIMIT 1

3. Si existe:
   UPDATE (no INSERT):
     - trial_start_at = nuevo slot
     - status = 'Reprogramado' (si estaba en No Asistió)
     - status = 'Pendiente' (si estaba en otro estado)
     - attendance_marked_at = NULL
     - no_show_processed_at = NULL
     - Cancelar emails pendientes
     
4. Si no existe:
   INSERT normal
```

### 4.2 Modificar TrialClassModal

Agregar lógica de dedupe antes del insert, mostrar mensaje si se actualiza registro existente.

---

## Parte 5: UI Kanban (Admin Panel)

### 5.1 Nueva Columna "Perdido"

Agregar al array de columnas:
```text
{ status: "Perdido", title: "Perdido", colorClass: "text-gray-400" }
```

### 5.2 Acciones Rápidas Actualizadas

| Acción | Disponible en | Comportamiento |
|--------|---------------|----------------|
| Marcar Asistió | Pendiente, Reprogramado | status='Asistió', attendance_marked_at=now, cancelar emails |
| Marcar No Asistió | Pendiente, Reprogramado | status='No Asistió', queue emails, crear token |
| Reprogramar | Cualquiera menos Inscrito/Perdido | Modal con selector de fecha |
| Marcar Inscrito | Asistió | status='Inscrito', cancelar emails |
| Marcar Perdido | No Asistió | status='Perdido', lost_reason='manual', cancelar emails |

### 5.3 Indicador Visual de Reactivación

En tarjetas de "No Asistió", mostrar badge pequeño:
- 📧 Email 1 enviado
- 📧📧 Email 2 enviado
- 📧📧📧 Email 3 enviado
- ⏸️ Pausado

---

## Parte 6: Templates de Email No-Show

### 6.1 Email 1 - Inmediato (Empatía)

```text
Asunto: "Te extrañamos hoy - White Lions Academy 🦁"

Cuerpo:
  ¡Hola [tutor_name]! 👋
  
  Notamos que [player_name] no pudo asistir a su clase muestra de hoy.
  ¡No te preocupes! Sabemos que las agendas cambian.
  
  Te reservamos los mejores horarios disponibles:
  
  [Botón 1: 📅 Miércoles 5 de febrero - 6:00 PM]
  [Botón 2: 📅 Lunes 10 de febrero - 6:00 PM]
  
  [Link: Ver más horarios →]
  
  ¿Preguntas? Responde a este correo.
  
  — El equipo de White Lions
```

### 6.2 Email 2 - +24h (Recordatorio)

```text
Asunto: "¿Agendamos otra fecha? - White Lions Academy"

Cuerpo:
  ¡Hola [tutor_name]!
  
  Solo un recordatorio de que [player_name] todavía puede conocer
  nuestra academia. ¡Nos encantaría verlo/a!
  
  Opciones disponibles:
  
  [Botón 1: 📅 Opción recalculada 1]
  [Botón 2: 📅 Opción recalculada 2]
  
  [Link: Ver más horarios →]
  
  — El equipo de White Lions
```

### 6.3 Email 3 - +72h (Cierre)

```text
Asunto: "Cerramos tu lugar por ahora - White Lions"

Cuerpo:
  ¡Hola [tutor_name]!
  
  Como no hemos podido coordinar una nueva fecha para
  [player_name], vamos a cerrar tu lugar por ahora.
  
  Si en el futuro quieres una clase muestra, 
  estaremos encantados de recibirte:
  
  [Botón: 🗓️ Agendar Clase Muestra]
  
  ─────────────────────
  [Link pequeño: No deseo recibir más mensajes]
  
  ¡Gracias!
  — El equipo de White Lions
```

---

## Parte 7: Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/pages/Reprogramar.tsx` | Página landing de Magic Link |
| `src/pages/ReprogramarConfirm.tsx` | Confirmación de reprogramación |
| `src/pages/PausarReactivacion.tsx` | Opt-out de mensajes |
| `supabase/functions/reprogramar-api/index.ts` | Edge function para validar tokens y confirmar |

---

## Parte 8: Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/process-trial-pipeline/index.ts` | Agregar regla lost_check, 3 emails, tokens |
| `supabase/functions/admin-prospects/index.ts` | Agregar acción mark_lost |
| `src/components/admin/KanbanBoard.tsx` | Agregar columna Perdido |
| `src/components/admin/ProspectCard.tsx` | Agregar acción Marcar Perdido |
| `src/components/TrialClassModal.tsx` | Implementar dedupe/upsert |
| `src/App.tsx` | Agregar rutas /reprogramar/* |

---

## Parte 9: Criterios de Aceptación

| # | Escenario | Resultado Esperado |
|---|-----------|-------------------|
| 1 | **Auto No-Show**: Clase a las 18:00, no se marca asistencia | A las 22:01, status='No Asistió', 3 emails programados, token creado |
| 2 | **Reprogramación 1-click**: Click en botón de email | Actualiza MISMO prospecto, NO crea duplicado, cancela secuencia, crea nuevos recordatorios |
| 3 | **Opt-out**: Click "Pausar mensajes" | status='Perdido', lost_reason='opt_out', emails cancelados |
| 4 | **Auto Lost**: No responde tras email 3 | 6h después, status='Perdido', lost_reason='no_response_72h' |
| 5 | **Dedupe Form**: Mismo email/teléfono dentro de 45 días | UPDATE del prospecto existente, NO crea nuevo |
| 6 | **Idempotencia**: Cron corre 5 veces seguidas | Solo 1 token, solo 3 emails, sin duplicados |
| 7 | **Magic Link Multi-uso**: Usa link 3 veces | Funciona las 3 veces (token no se invalida), pero después de confirmar una vez el status cambia |

---

## Sección Técnica

### Hash de Token (Seguridad)

```text
// Generar token
const token = crypto.randomUUID();
const tokenHash = await crypto.subtle.digest('SHA-256', 
  new TextEncoder().encode(token)
);
const hashHex = Array.from(new Uint8Array(tokenHash))
  .map(b => b.toString(16).padStart(2, '0'))
  .join('');

// Almacenar hashHex en DB, enviar token en claro por email
```

### Cálculo de Slots Disponibles

```text
function getNextBestSlots(sport: string, limit: number = 2) {
  const now = new Date();
  const tijuanaNow = new Date(now.toLocaleString('en-US', { 
    timeZone: 'America/Tijuana' 
  }));
  
  const validDays = sport === 'Fútbol' ? [1, 3] : [2, 4];
  const hour = sport === 'Fútbol' ? 18 : 18;
  const minute = sport === 'Fútbol' ? 0 : 30;
  
  const slots: Date[] = [];
  const checkDate = new Date(tijuanaNow);
  checkDate.setDate(checkDate.getDate() + 1); // Empezar mañana
  
  while (slots.length < limit) {
    if (validDays.includes(checkDate.getDay())) {
      const slot = new Date(checkDate);
      slot.setHours(hour, minute, 0, 0);
      slots.push(slot);
    }
    checkDate.setDate(checkDate.getDate() + 1);
    if (checkDate > addDays(tijuanaNow, 30)) break;
  }
  
  return slots;
}
```

### Normalización de Datos

```text
// SQL Trigger
CREATE OR REPLACE FUNCTION normalize_contact_data()
RETURNS trigger AS $$
BEGIN
  IF NEW.parent_email IS NOT NULL THEN
    NEW.email_normalized := LOWER(TRIM(NEW.parent_email));
  END IF;
  
  IF NEW.contact_phone IS NOT NULL THEN
    NEW.phone_normalized := REGEXP_REPLACE(NEW.contact_phone, '[^0-9]', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Idempotency Keys Actualizados

```text
// Para emails
no_show_1_{prospect_id}_{date_YYYYMMDD}
no_show_2_{prospect_id}_{date_YYYYMMDD}
no_show_3_{prospect_id}_{date_YYYYMMDD}
lost_check_{prospect_id}_{date_YYYYMMDD}

// Para tokens (reutilizables)
- Un solo token activo por prospect
- Si existe token no expirado, reutilizar
- Si expiró, crear nuevo
```

### URLs de Reprogramación

```text
Base URL: https://whitelionsacademy.com

/reprogramar?token={uuid}
  → Muestra 2 mejores opciones + ver más

/reprogramar/confirm?token={uuid}&slot={ISO_DATETIME}
  → Confirma la reprogramación

/reactivacion/pausar?token={uuid}
  → Opt-out de mensajes
```

---

## Secuencia de Implementación

```text
1. SQL Migration
   - Nuevos campos en trial_class_registrations
   - Tabla reprogram_tokens
   - Expandir email_queue templates
   - Triggers de normalización
   
2. Edge Function: reprogramar-api
   - Validar token
   - Confirmar slot
   - Pausar reactivación
   
3. Actualizar process-trial-pipeline
   - Crear tokens al auto no-show
   - Queue 3 emails + lost_check
   - Procesar lost_check
   
4. Páginas de Reprogramación
   - /reprogramar (landing)
   - Confirmación
   - Pausar
   
5. UI Admin
   - Columna Perdido
   - Acción Marcar Perdido
   
6. Dedupe en Formulario
   - Modificar TrialClassModal
   
7. Testing end-to-end
```

