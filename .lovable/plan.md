
# Plan: Pausar Programa de Basketball (Mantener Solo Fútbol)

## Resumen

Pausar temporalmente toda la funcionalidad de Basketball en el sitio web y sistema, manteniendo:
- El código guardado (comentado/condicionalizado) para reactivación futura
- Los datos existentes en la base de datos intactos
- Solo Fútbol visible y disponible para inscripciones

---

## Estrategia: Pausa Suave

En lugar de eliminar el código de Basketball, lo vamos a **desactivar** de forma que sea fácil reactivarlo en el futuro. Esto se logra mediante:

1. **Base de datos**: Marcar schedules de Basketball como `is_active = false`
2. **UI**: Ocultar opciones de Basketball en formularios y secciones
3. **Código**: Mantener la lógica pero condicionalizada

---

## Parte 1: Base de Datos

### Desactivar schedules de Basketball

```sql
UPDATE class_schedules 
SET is_active = false 
WHERE sport = 'Basketball';
```

Esto preserva los registros para reactivación futura y afecta las funciones que leen horarios desde la tabla.

---

## Parte 2: Componentes a Modificar

### 2.1 `ChallengeRegistrationModal.tsx`
**Cambios:**
- Remover el botón de selección de Basketball
- Hacer que Fútbol sea la selección por defecto
- Ocultar la lógica de categorías/horarios de Basketball

**Antes:** Grid con 2 botones (Fútbol | Basketball)
**Después:** Un solo deporte, auto-seleccionado como "Fútbol"

### 2.2 `Schedule.tsx`
**Cambios:**
- Filtrar el array `schedules` para mostrar solo Fútbol
- Ajustar layout a una sola tarjeta centrada

### 2.3 `Locations.tsx`
**Cambios:**
- Filtrar el array `locations` para mostrar solo Fútbol
- Ajustar layout a una sola tarjeta centrada

### 2.4 `FAQNew.tsx`
**Cambios:**
- Modificar la pregunta sobre "tenis de cancha para basket" → solo mencionar fútbol
- Mantener el resto igual

### 2.5 `Navbar.tsx`
**Cambios:**
- Remover el link "Basketball" de la navegación
- Mantener solo: Inicio, Fútbol, Ubicaciones

### 2.6 `JoinFamilyModal.tsx`
**Cambios:**
- Remover la ubicación de Basketball
- Remover la mensualidad de Basketball
- Mostrar solo información de Fútbol

### 2.7 `MethodologyModal.tsx`
**Cambios:**
- Mantener la sección de Basketball pero con un mensaje de "Próximamente" o similar
- O simplemente ocultarla temporalmente

### 2.8 `RescheduleModal.tsx` (Admin)
**Cambios:**
- Filtrar opciones de reprogramación para no mostrar Basketball
- Solo aplica a nuevos prospectos, los existentes de Basketball mantienen sus opciones

### 2.9 `Coaches.tsx`
**Cambios:**
- Actualizar el rol de Carlos Cortez (remover "Coach Basketball")
- O mantenerlo pero no visible si la sección no se muestra

---

## Parte 3: Edge Functions

Las Edge Functions (`process-trial-pipeline`, `reprogramar-api`, `run-reminders`) ya leen los schedules desde la tabla `class_schedules` con filtro `is_active = true`, por lo que al desactivar Basketball en la base de datos, automáticamente dejarán de ofrecer esos horarios.

---

## Parte 4: Mantener Datos Históricos

Los prospectos existentes de Basketball se mantienen intactos en `trial_class_registrations`. Simplemente ya no se podrán crear nuevos registros de Basketball desde la UI.

---

## Archivos a Modificar

| Archivo | Cambio Principal |
|---------|------------------|
| `src/components/ChallengeRegistrationModal.tsx` | Auto-seleccionar Fútbol, ocultar botón Basketball |
| `src/components/Schedule.tsx` | Filtrar a solo Fútbol |
| `src/components/Locations.tsx` | Filtrar a solo Fútbol |
| `src/components/Navbar.tsx` | Remover link "Basketball" |
| `src/components/FAQNew.tsx` | Actualizar pregunta sobre equipamiento |
| `src/components/modals/JoinFamilyModal.tsx` | Remover info de Basketball |
| `src/components/modals/MethodologyModal.tsx` | Ocultar o marcar Basketball como "próximamente" |
| `src/components/admin/RescheduleModal.tsx` | Filtrar opciones de Basketball |
| `src/components/Coaches.tsx` | Actualizar rol de Carlos |

---

## Secuencia de Implementación

1. **SQL**: Desactivar schedules de Basketball (`is_active = false`)
2. **Frontend**: Actualizar todos los componentes para ocultar Basketball
3. **Verificar**: Probar que el formulario solo muestre Fútbol
4. **Admin**: Asegurar que los prospectos existentes de Basketball sigan siendo visibles pero no editables a nuevos horarios de basket

---

## Criterios de Éxito

- Formulario de inscripción solo muestra Fútbol
- Sección de horarios solo muestra Fútbol  
- Sección de ubicaciones solo muestra la sede de Fútbol
- Navegación no menciona Basketball
- Prospectos históricos de Basketball se mantienen en el sistema
- El código de Basketball queda guardado para reactivación futura

---

## Reversibilidad

Para reactivar Basketball en el futuro:
1. `UPDATE class_schedules SET is_active = true WHERE sport = 'Basketball';`
2. Revertir los cambios en los componentes (descomentar/reactivar condiciones)
