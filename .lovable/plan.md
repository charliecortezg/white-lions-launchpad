

# Plan: Actualizar evento + formulario en steps

## 1. Actualizar datos del evento en BD

Ejecutar un UPDATE en `evaluation_events` para el evento activo:

- `event_date`: 2026-02-21
- `location_name`: Juventud 2000 — Cancha Bardeada
- `address`: Juventud 2000, Mexicali, B.C.
- `check_in_time`: 8:45 AM
- `start_time`: 9:00 AM
- `end_time`: 11:00 AM
- `maps_url`: null (o conservar si aplica)

## 2. Agregar cronograma visible en la pagina

Agregar una seccion o bloque dentro del Hero/info del evento que muestre:

| Horario | Categoria | Nacimiento |
|---------|-----------|------------|
| 9:00 – 9:40 | Escuelita | 2018–2019 |
| 9:40 – 10:00 | Estrellita | 2016–2017 |
| 10:00 – 11:00 | Infantil | 2014–2015 |

Este cronograma se mostrara tanto en la seccion hero como en las instrucciones del jugador activo y en el email de confirmacion.

## 3. Formulario en 3 pasos (stepper)

Convertir el formulario actual (que muestra todo junto) en un flujo de 3 pasos:

**Paso 1 — Datos del Jugador**
- Nombre del jugador
- Fecha de nacimiento
- Escuela (con autosuggest de aliadas)
- Club actual (opcional)

**Paso 2 — Datos del Tutor**
- Nombre completo del padre/tutor
- Telefono
- Correo electronico

**Paso 3 — Confirmacion + Registro**
- Resumen del evento (fecha, sede, horario) — read-only
- Banner de costo ($0 o $300)
- Checkbox de privacidad
- Boton "Registrar jugador"

Se agrega un indicador visual de progreso (Step 1 de 3, Step 2 de 3, Step 3 de 3) con navegacion "Siguiente" / "Atras". Las validaciones se ejecutan por paso (no se puede avanzar sin completar los campos obligatorios del paso actual).

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/EvaluationDay.tsx` | Formulario en steps + cronograma visible |
| `supabase/functions/send-evaluation-confirmation/index.ts` | Agregar cronograma al email |

No se necesita migracion de BD — solo un UPDATE de datos al evento existente.

## Detalle tecnico

### EvaluationDay.tsx

- Agregar estado `formStep` (1, 2, 3)
- Crear 3 bloques condicionales dentro del `<form>` segun `formStep`
- Validar parcialmente con `form.trigger(["player_name", "player_dob", "school_name"])` antes de avanzar al paso 2
- Validar `form.trigger(["guardian_full_name", "guardian_phone", "guardian_email"])` antes de avanzar al paso 3
- En paso 3 solo se muestra resumen + checkbox + boton submit
- Agregar barra de progreso visual (3 circulos con linea conectora)
- Agregar array constante `CRONOGRAMA` con los 3 bloques de horario
- Mostrar cronograma en el hero, instrucciones activas, y en el paso 3 del formulario

### Email de confirmacion

- Agregar seccion de cronograma en el HTML del email
- Actualizar el email para incluir las 3 categorias con sus horarios

