

# Plan: Actualizar Link de Google Maps para Fútbol en Hacienda del Bosque

## Resumen

Actualizar el link de Google Maps en los correos de confirmación y recordatorios para que apunte a la ubicación exacta de la cancha de Fútbol en Hacienda del Bosque.

---

## Cambio Requerido

| Ubicación | Link Actual | Link Nuevo |
|-----------|-------------|------------|
| Hacienda del Bosque (Fútbol) | `https://maps.app.goo.gl/QUwr6WjptEKwRg6b8` | `https://maps.app.goo.gl/ZoLbWvaQgFAsoDYa8` |

---

## Archivos a Modificar

### 1. `supabase/functions/send-confirmation/index.ts`
Actualizar la función `getLocationMapLink`:
- Línea 24: Cambiar el link de Hacienda/Bosque
- Línea 32: Cambiar el fallback de Fútbol

### 2. `supabase/functions/run-reminders/index.ts`  
Actualizar la misma función `getLocationMapLink`:
- Línea 24: Cambiar el link de Hacienda/Bosque
- Línea 32: Cambiar el fallback de Fútbol

---

## Código Actualizado

```text
const getLocationMapLink = (location: string, sport: string): string => {
  const loc = (location || '').toLowerCase();
  const sp = (sport || '').toLowerCase();
  
  // Check location first
  if (loc.includes('hacienda') || loc.includes('bosque')) {
    return 'https://maps.app.goo.gl/ZoLbWvaQgFAsoDYa8';  // ← NUEVO
  }
  if (loc.includes('quinta') || loc.includes('rey')) {
    return 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8';
  }
  
  // Fallback to sport
  if (sp.includes('fútbol') || sp.includes('futbol') || sp.includes('soccer')) {
    return 'https://maps.app.goo.gl/ZoLbWvaQgFAsoDYa8';  // ← NUEVO
  }
  if (sp.includes('basketball') || sp.includes('basquet') || sp.includes('básquet')) {
    return 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8';
  }
  
  return '';
};
```

---

## Resultado

Después de aplicar este cambio:

1. **Correo de confirmación** - El botón "📍 Cómo Llegar" para Fútbol abrirá la ubicación exacta
2. **Recordatorio 24h** - El botón de ubicación usará el link correcto  
3. **Recordatorio 2h** - El botón de ubicación usará el link correcto

Los papás podrán llegar en un click directamente a la cancha correcta.

