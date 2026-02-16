
# Plan: Permitir registro de clase muestra para el mismo dia

## Problema

La funcion `getMinStartDate()` en `ChallengeRegistrationModal.tsx` (linea 149-154) suma 7 dias a la fecha actual, lo que impide seleccionar el dia de hoy o los proximos 6 dias en el calendario.

```typescript
// Codigo actual - bloquea toda la semana
const getMinStartDate = () => {
  const today = new Date();
  today.setDate(today.getDate() + 7);  // <-- aqui esta el problema
  today.setHours(0, 0, 0, 0);
  return today;
};
```

## Solucion

Cambiar `getMinStartDate()` para que la fecha minima sea HOY (sin sumar dias). Tambien actualizar `getNextAvailableDate()` que usa la misma logica para calcular la fecha sugerida.

### Cambios en `src/components/ChallengeRegistrationModal.tsx`

**Lineas 149-154** - Cambiar `getMinStartDate`:

```typescript
const getMinStartDate = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};
```

Se elimina la linea `today.setDate(today.getDate() + 7)` para que el calendario permita seleccionar desde hoy mismo, siempre que sea lunes o miercoles (dias validos para futbol).

No se modifica ningun otro archivo ni logica de validacion.
