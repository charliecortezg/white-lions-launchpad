

# Plan: ALAN-lite v1 - Motor de Reglas para Pipeline de Clases Muestra

## Resumen Ejecutivo

Implementar automatizaciones para el pipeline de clases muestra:
- Auto-cambio a "No Asistió" después de 2 horas de gracia post-clase
- Creación de tareas de llamada para no-shows
- Emails automáticos de no-show (inmediato + 24h)
- Acciones rápidas en el Kanban
- Reprogramación con cancelación/recreación de recordatorios

---

## Arquitectura del Sistema

```text
+-------------------+       +--------------------+       +-------------------+
|  FORMULARIO WEB   | ----> | trial_class_       | <---- | ADMIN PANEL       |
| (TrialClassModal) |       | registrations      |       | (Kanban UI)       |
+-------------------+       +--------------------+       +-------------------+
                                    |
                                    v
+-------------------------------------------------------------------+
|                    EDGE FUNCTIONS                                  |
+-------------------------------------------------------------------+
| run-reminders     | send-confirmation | admin-prospects           |
| (24h/2h)          | (on signup)       | (CRUD manual)             |
+-------------------+-------------------+---------------------------+
                                    |
                                    v
                    +-------------------------------+
                    | NUEVO: process-trial-pipeline |
                    | (cron cada 15 min)            |
                    +-------------------------------+
                            |
            +---------------+---------------+
            |               |               |
            v               v               v
     Auto No-Show    Crear Task      Enviar/Programar
     (si 22:00)      (call_no_show)  Emails No-Show
```

---

## Parte 1: Cambios en Base de Datos (SQL Migration)

### 1.1 Nuevas Columnas en `trial_class_registrations`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `trial_start_at` | timestamptz | Fecha/hora exacta de la clase (calculada al insertar) |
| `trial_duration_min` | int | Duración de la clase (default 120) |
| `attendance_grace_min` | int | Tiempo de gracia para marcar asistencia (default 120) |
| `attendance_marked_at` | timestamptz | Cuando se marcó asistencia |
| `attendance_marked_by` | text | Quién marcó (email/nombre) |
| `status_updated_at` | timestamptz | Última actualización de status |
| `no_show_processed_at` | timestamptz | Para idempotencia del auto-no-show |

### 1.2 Nueva Tabla: `follow_up_tasks`

```text
+-------------------+-------------+----------------------------------+
| Columna           | Tipo        | Descripción                      |
+-------------------+-------------+----------------------------------+
| id                | uuid PK     | Identificador único              |
| prospect_id       | uuid FK     | Referencia a trial_class_reg     |
| type              | text        | 'call_no_show'                   |
| due_at            | timestamptz | Cuando se debe hacer la tarea    |
| status            | text        | 'open' / 'done'                  |
| assigned_to       | text        | 'Carlos' (default)               |
| notes             | text        | Notas de la llamada              |
| created_at        | timestamptz | Fecha creación                   |
| completed_at      | timestamptz | Fecha completada                 |
+-------------------+-------------+----------------------------------+
```

### 1.3 Nueva Tabla: `email_queue`

Cola de emails programables/cancelables para no-show emails:

```text
+-------------------+-------------+----------------------------------+
| Columna           | Tipo        | Descripción                      |
+-------------------+-------------+----------------------------------+
| id                | uuid PK     | Identificador único              |
| prospect_id       | uuid FK     | Referencia a trial_class_reg     |
| template          | text        | 'no_show_1' / 'no_show_2'        |
| to_email          | text        | Email destino                    |
| scheduled_for     | timestamptz | Cuando enviar                    |
| status            | text        | 'queued'/'sent'/'canceled'       |
| idempotency_key   | text UNIQUE | Para evitar duplicados           |
| sent_at           | timestamptz | Cuando se envió                  |
| error             | text        | Mensaje de error si falló        |
| created_at        | timestamptz | Fecha creación                   |
+-------------------+-------------+----------------------------------+
```

### 1.4 Trigger para Calcular `trial_start_at`

Al insertar/actualizar `preferred_schedule`, calcular automáticamente `trial_start_at`:

```text
Trigger: calculate_trial_start_at
  BEFORE INSERT OR UPDATE ON trial_class_registrations
  Parsea "miércoles 28 de enero - Lunes y miércoles, 6:00–8:00 pm"
  Extrae fecha + hora (18:00 para Fútbol, 18:30 para Basketball)
  Guarda en trial_start_at
```

---

## Parte 2: Edge Function `process-trial-pipeline`

### 2.1 Scheduling

- Ejecutar cada 15 minutos vía pg_cron
- Timezone: America/Tijuana

### 2.2 Regla 1: Auto No-Show

```text
CUANDO:
  - status IN ('Pendiente', 'Reprogramado')
  - attendance_marked_at IS NULL
  - no_show_processed_at IS NULL
  - now() > trial_start_at + trial_duration_min + attendance_grace_min

ENTONCES (atómico):
  1. UPDATE prospect:
     - status = 'No Asistió'
     - status_updated_at = now()
     - no_show_processed_at = now()
  
  2. INSERT follow_up_task (si no existe open para mismo prospect):
     - type = 'call_no_show'
     - due_at = mañana 09:00 America/Tijuana
     - assigned_to = 'Carlos'
  
  3. INSERT email_queue (con idempotency_key):
     - no_show_1: scheduled_for = now() (inmediato)
     - no_show_2: scheduled_for = now() + 24h
```

### 2.3 Regla 2: Procesar Cola de Emails

```text
SELECT * FROM email_queue
WHERE status = 'queued'
  AND scheduled_for <= now()
ORDER BY scheduled_for ASC
LIMIT 20

PARA CADA email:
  1. Enviar vía Resend
  2. UPDATE status = 'sent', sent_at = now()
  3. INSERT comm_log (para auditoría)
```

---

## Parte 3: Cambios en UI (Kanban)

### 3.1 Acciones Rápidas en ProspectCard

Agregar al menú de tres puntos:

| Acción | Comportamiento |
|--------|----------------|
| **Marcar Asistió** | `status='Asistió'`, `attendance_marked_at=now()`, cerrar tasks open |
| **Marcar No Asistió** | `status='No Asistió'`, crear task + emails (como regla automática) |
| **Reprogramar** | Abrir modal de fecha, actualizar `trial_start_at`, cancelar emails viejos, crear nuevos recordatorios |
| **Marcar Inscrito** | `status='Inscrito'`, cerrar tasks, cancelar emails pendientes |

### 3.2 Modal de Reprogramación

```text
+------------------------------------------+
| 📅 Reprogramar Clase Muestra             |
+------------------------------------------+
| Jugador: Addai Gamez                     |
| Clase original: mié 28 enero, 6:00 pm    |
|                                          |
| Nueva fecha:                             |
| [Calendario - solo Lun/Mié o Mar/Jue]    |
|                                          |
| [ Cancelar ]  [ Confirmar Reprogramación]|
+------------------------------------------+
```

### 3.3 Vista "Tareas de Hoy"

Agregar botón/pestaña en header del admin panel:

```text
+------------------------------------------------------------------+
|  🦁 WHITE LIONS - Panel de Seguimiento                           |
|  [Filtros...] [📅 Calendario] [📋 Tareas (3)]  <-- Nuevo botón   |
+------------------------------------------------------------------+
```

Modal de tareas:

```text
+------------------------------------------+
| 📋 Tareas de Hoy - Carlos                |
+------------------------------------------+
| 📞 Llamar: Addai Gamez (No asistió)      |
|    📱 686-XXX-XXXX  [Llamar] [✓ Done]    |
+------------------------------------------+
| 📞 Llamar: María López (No asistió)      |
|    📱 686-YYY-YYYY  [Llamar] [✓ Done]    |
+------------------------------------------+
```

---

## Parte 4: Templates de Email No-Show

### 4.1 Email No-Show Inmediato (`no_show_1`)

```text
Asunto: "Te extrañamos hoy - White Lions Academy"

Cuerpo:
  Hola [tutor_name],
  
  Notamos que [player_name] no pudo asistir a su clase muestra de hoy.
  ¡No te preocupes! Podemos agendar otra fecha.
  
  [Botón: Reprogramar mi Clase Muestra]
  
  Si tienes alguna pregunta, responde a este correo.
  
  — El equipo de White Lions
```

### 4.2 Email No-Show +24h (`no_show_2`)

```text
Asunto: "¿Agendamos otra fecha? - White Lions Academy"

Cuerpo:
  Hola [tutor_name],
  
  Queremos asegurarnos de que [player_name] tenga la oportunidad
  de conocer nuestra academia.
  
  ¿Te gustaría reprogramar la clase muestra?
  
  [Botón: Agendar Nueva Fecha]
  
  Este enlace expira en 72 horas.
  
  — El equipo de White Lions
```

### 4.3 Link de Reprogramación

- URL: `https://whitelionsacademy.com/reprogramar?token=xxxxx`
- Token generado con UUID + expiración 72h
- Almacenar en nueva tabla `reschedule_tokens`

---

## Parte 5: Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `supabase/functions/process-trial-pipeline/index.ts` | Edge function principal del motor de reglas |
| `src/components/admin/RescheduleModal.tsx` | Modal para reprogramar clase |
| `src/components/admin/TasksModal.tsx` | Modal para ver tareas de hoy |

---

## Parte 6: Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/ProspectCard.tsx` | Agregar acciones rápidas al menú |
| `src/components/admin/ProspectFilters.tsx` | Agregar botón de tareas |
| `src/pages/AdminPanel.tsx` | Integrar modales y handlers |
| `supabase/functions/admin-prospects/index.ts` | Expandir para soportar nuevas acciones |
| `supabase/config.toml` | Agregar config para nueva edge function |

---

## Parte 7: Criterios de Aceptación

| # | Escenario | Resultado Esperado |
|---|-----------|-------------------|
| 1 | Prospecto registra clase para mié 28 enero 18:00 | `trial_start_at` se calcula automáticamente |
| 2 | A las 22:01 del 28 enero, sin marcar asistencia | Auto-cambio a "No Asistió", task creada para 29 enero 9:00am, email 1 enviado, email 2 programado +24h |
| 3 | Staff marca "Asistió" a las 20:00 | `attendance_marked_at` = 20:00, NO se auto-cambia a No Asistió |
| 4 | Correr cron 5 veces seguidas | Solo 1 task y 2 emails por prospecto (idempotencia) |
| 5 | Reprogramar desde UI | Status = "Reprogramado", nueva `trial_start_at`, recordatorios viejos cancelados, nuevos creados |
| 6 | Marcar "Inscrito" | Tasks cerradas, emails no-show cancelados |

---

## Secuencia de Implementación

```text
1. Migration SQL (tablas + trigger)
   ↓
2. Edge Function process-trial-pipeline
   ↓
3. Configurar pg_cron
   ↓
4. Modificar admin-prospects (nuevas acciones)
   ↓
5. UI: RescheduleModal + TasksModal
   ↓
6. UI: Actualizar ProspectCard con acciones
   ↓
7. Testing end-to-end
```

---

## Sección Técnica

### Cálculo de Hora de Clase

```text
function calculateTrialStartAt(preferredSchedule: string): Date {
  // "miércoles 28 de enero - Lunes y miércoles, 6:00–8:00 pm"
  
  // 1. Extraer fecha: "28 de enero"
  const dateMatch = schedule.match(/(\d{1,2})\s+de\s+(\w+)/i);
  const day = parseInt(dateMatch[1]);
  const month = MONTH_MAP[dateMatch[2].toLowerCase()];
  
  // 2. Determinar hora según deporte
  // "Lunes y miércoles" -> Fútbol -> 18:00
  // "Martes y jueves" -> Basketball -> 18:30
  const isFutbol = schedule.toLowerCase().includes('lunes y miércoles');
  const hour = isFutbol ? 18 : 18;
  const minute = isFutbol ? 0 : 30;
  
  // 3. Crear timestamp en America/Tijuana
  return new Date(year, month, day, hour, minute);
}
```

### Ventana de Gracia

```text
Clase: 18:00 - 20:00 (120 min duración)
Gracia: 120 min adicionales
Deadline para marcar asistencia: 22:00

Si a las 22:01 no hay attendance_marked_at:
  → Auto No-Show
```

### Idempotency Keys

```text
// Para tareas
task_key = `call_no_show_${prospect_id}_${date_YYYYMMDD}`

// Para emails
email_key_1 = `no_show_1_${prospect_id}_${date_YYYYMMDD}`
email_key_2 = `no_show_2_${prospect_id}_${date_YYYYMMDD}`

// Para recordatorios (existente en comm_log)
reminder_key = `reminder_24h_${prospect_id}_${trial_start_at_date}`
```

### RLS para Nuevas Tablas

```text
follow_up_tasks:
  - SELECT/UPDATE: admin o staff
  - INSERT: via service_role desde edge function
  - DELETE: admin only

email_queue:
  - SELECT: admin o staff
  - INSERT/UPDATE: via service_role desde edge function
  - DELETE: admin only
```

