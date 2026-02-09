

# Plan: Mostrar datos completos en tarjeta + Biberon en calendario

## Problema 1: Datos incompletos en la tarjeta del cliente

Al revisar la base de datos, los campos `school` y `comments` SI existen en `trial_class_registrations`. El modal de detalles (`ProspectDetailsModal.tsx`) ya muestra `comments` y `school`, pero:
- `school` se accede con `(prospect as any).school` lo cual es fragil
- El campo `school` existe en la tabla pero no aparece en los tipos TypeScript generados

**Solucion:** Verificar que el tipo incluya `school` y quitar el cast `as any`. Tambien asegurar que la seccion de comentarios sea mas visible (actualmente solo se muestra si `prospect.comments` tiene valor, lo cual es correcto).

---

## Problema 2: Registros Biberon no aparecen en el calendario

El calendario (`CalendarModal.tsx`) solo recibe datos de `trial_class_registrations`. Los registros de Biberon estan en la tabla `waitlist_registrations`, que es completamente separada. El admin panel no consulta esa tabla.

**Solucion:** 
1. Agregar una consulta de `waitlist_registrations` en el admin panel
2. Crear registros "virtuales" que se puedan mostrar en el calendario con fecha fija (2 de marzo de 2026)
3. Mostrarlos con un indicador visual diferente (emoji de biberon)

---

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/admin/ProspectDetailsModal.tsx` | Quitar `(prospect as any).school` y usar tipo correcto. Asegurar que comments siempre se muestre de forma clara |
| `src/components/admin/CalendarModal.tsx` | Aceptar registros de waitlist y mostrarlos en el calendario con fecha 2 de marzo |
| `src/pages/AdminPanel.tsx` | Agregar query para `waitlist_registrations` y pasarlos al CalendarModal |
| `supabase/functions/admin-prospects/index.ts` | Agregar endpoint para obtener registros de waitlist |

---

## Detalle tecnico

### ProspectDetailsModal - Mostrar school y comments

El tipo `trial_class_registrations` ya tiene `school` y `comments` en la tabla de la BD. Se eliminara el cast `(prospect as any).school` y se verificara que los tipos esten actualizados. Tambien se hara mas prominente la seccion de comentarios del usuario para que no pase desapercibida.

### CalendarModal - Integrar waitlist

Se agregara una prop opcional `waitlistRegistrations` al CalendarModal. Los registros de Biberon se mostraran en la fecha del 2 de marzo de 2026 con un indicador especial (🍼). En la vista diaria se mostraran con un badge "Lista de espera" en vez de los botones de asistencia (ya que no tienen clase muestra).

### AdminPanel - Fetch de waitlist

Se agregara una segunda query con `useQuery` para obtener los datos de `waitlist_registrations` via la edge function `admin-prospects` (agregando un parametro `?type=waitlist` al GET). Se pasaran estos datos al `CalendarModal`.

### Edge Function - Soporte waitlist

Se agregara un query param al GET de `admin-prospects`: si `type=waitlist`, retornar datos de `waitlist_registrations` en vez de `trial_class_registrations`.
