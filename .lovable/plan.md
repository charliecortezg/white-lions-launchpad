

# Plan: Actualización de negocio White Lions Academy

Este es un cambio grande que abarca landing, CRM y base de datos. Lo divido en fases priorizadas para no romper flujos existentes.

---

## Fase 1: Pricing y Landing (UI)

### A) Actualizar precios del Reto

**`src/components/ChallengeOffer.tsx`**
- Cambiar precio de $500 a estructura: Inscripción $400 + Primera mensualidad $500 = $900
- Mostrar oferta post clase muestra: "Antes $900 / Hoy $700" (esto se muestra como info, no como checkout activo)
- Mantener CTA "Agendar clase muestra gratuita"

**`src/components/HeroNew.tsx`**
- Actualizar price anchor: "Reto White Lions desde $700 MXN" (inscripción + 1er mes)
- Cambiar "Sin inscripción · Sin riesgo" → "Inscripción + 1er mes incluidos"

**`src/components/ChallengeRegistrationModal.tsx`** (líneas ~1062)
- Actualizar texto "$500 MXN" → "$700 MXN (inscripción $400 + primera mensualidad $500)" en el step 4

### B) Garantía con offboarding
- Actualizar texto de garantía en `ChallengeOffer.tsx`: agregar mención de formulario de offboarding como requisito
- En FAQ (`FAQNew.tsx`): actualizar respuesta de garantía y agregar FAQ sobre inscripción por ciclo Ago-Jun

### C) Biberón activo con cupo dinámico
**`src/components/ChallengeRegistrationModal.tsx`**
- Cambiar el banner de Biberón de "lista de espera" a "categoría activa con cupo limitado"
- Agregar horario: "Martes y Jueves, 6:00-7:00 PM"
- Mostrar cupo dinámico (ocupados/8) consultando la BD
- Si llega a 8/8 → automáticamente mostrar flujo de lista de espera

**`src/components/Schedule.tsx`**
- Agregar sección de Biberón: "Martes y Jueves, 6:00-7:00 PM, Hacienda del Bosque"

### D) Desactivar upsells
**`src/pages/Index.tsx`**
- Remover `<MonthlyPlansSection />` del render

---

## Fase 2: CRM Kanban

### F) Lista de espera como columna Kanban
**`src/components/admin/KanbanBoard.tsx`**
- Agregar columna "Lista de Espera" con colorClass `text-amber-400`

**`src/pages/AdminPanel.tsx`**
- Eliminar el sistema de tabs separado (Prospectos / Lista de Espera)
- Integrar waitlist registrations en el Kanban como prospects con status "Lista de Espera"
- Combinar ambos datasets en un formato unificado para el KanbanBoard

### G) Call + WhatsApp en cada ProspectCard
**`src/components/admin/ProspectCard.tsx`**
- Agregar botones de Llamar (tel:) y WhatsApp (wa.me con mensaje prellenado) visibles directamente en la card (no solo en dropdown)
- Si no hay teléfono → deshabilitar con tooltip "Falta teléfono"
- Mensaje WhatsApp prellenado: "Hola, soy [Nombre] de White Lions Academy. Te escribo para ayudarte con tu clase muestra gratuita. ¿Qué edad tiene tu hijo/a?"

---

## Fase 3: Base de datos y Offboarding

### Migración SQL
1. Agregar tabla `offboarding_forms`:
   - `id`, `prospect_id` (uuid), `reason` (text), `feedback` (text), `completed_at` (timestamptz), `created_at`
   - RLS: anyone can insert, admins can view

2. Agregar status "Refund Requested" y "Lista de Espera" como opciones válidas en `trial_class_registrations.status`

### Offboarding Form
- Nueva ruta `/offboarding/:prospect_id`
- Nueva página `src/pages/Offboarding.tsx`: formulario corto (razón de salida, feedback, confirmación)
- Al completar: insertar en `offboarding_forms`, actualizar status del prospect a "Refund Requested" via edge function

### Edge Function updates
**`supabase/functions/admin-prospects/index.ts`**
- Agregar action "mark_refund_requested" que setea status y crea nota

---

## Fase 4: FAQ y copy updates

**`src/components/FAQNew.tsx`**
- Actualizar FAQ del Reto: $700 (inscripción $400 + mensualidad $500)
- Agregar FAQ: "¿La inscripción es anual?" → "La inscripción de $400 corresponde al ciclo Agosto-Junio"
- Actualizar FAQ de continuación: solo existe mensualidad de $500, sin planes múltiples
- Actualizar FAQ de garantía: mencionar formulario de offboarding

---

## Archivos a modificar (resumen)

| Archivo | Cambio |
|---------|--------|
| `src/components/HeroNew.tsx` | Precio anchor $700, copy |
| `src/components/ChallengeOffer.tsx` | Precios, garantía con offboarding |
| `src/components/ChallengeRegistrationModal.tsx` | Biberón activo, cupo dinámico, precios |
| `src/components/Schedule.tsx` | Agregar horario Biberón |
| `src/components/FAQNew.tsx` | Precios, ciclo, garantía |
| `src/pages/Index.tsx` | Remover MonthlyPlansSection |
| `src/components/admin/KanbanBoard.tsx` | Columna Lista de Espera |
| `src/components/admin/ProspectCard.tsx` | Botones Call + WhatsApp en card |
| `src/pages/AdminPanel.tsx` | Integrar waitlist al Kanban |
| `src/pages/Offboarding.tsx` | Nuevo formulario |
| `src/App.tsx` | Ruta /offboarding/:id |
| Edge function `admin-prospects` | Actions nuevas |
| Migración SQL | Tabla offboarding_forms |

---

## QA Checklist

1. Landing muestra $700 (inscripción $400 + mensualidad $500)
2. MonthlyPlansSection no aparece
3. Biberón visible en Schedule con horario Mar/Jue 6-7pm
4. Registro Biberón muestra cupo dinámico y cambia a waitlist al llenarse
5. Garantía menciona offboarding como requisito
6. FAQ actualizadas con precios correctos y ciclo Ago-Jun
7. Kanban tiene columna "Lista de Espera"
8. Cards tienen botones Call + WhatsApp visibles
9. Offboarding form funciona y actualiza status
10. No se generan registros de planes distintos a "Mensualidad $500"

