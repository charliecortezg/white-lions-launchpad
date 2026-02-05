
# Plan: Soporte para Juvenil A (2012-2013) + Beneficios Adicionales para Todas las Categorías

## Resumen

1. **Agregar años 2012-2013** al selector de año de nacimiento para la categoría **Juvenil A** (12-13 años)
2. **Flujo diferenciado para Juvenil A**: Sin Reto, solo inscripción directa con pricing diferente
3. **Agregar beneficios adicionales** a TODAS las categorías (incluidas 6-11 años) en el Step 4

---

## Cambios a Implementar

### 1. ChallengeRegistrationModal.tsx

#### A) Expandir años válidos (línea 75-77)
```typescript
// Antes: 6 años (2019-2014)
return Array.from({ length: 6 }, (_, i) => (2019 - i).toString());

// Después: 8 años (2019-2012)
return Array.from({ length: 8 }, (_, i) => (2019 - i).toString());
```

#### B) Agregar categoría Juvenil A (línea 79-86)
```typescript
const getCategories = (birthYear: string | undefined) => {
  if (!birthYear) return [];
  const year = parseInt(birthYear);
  if (year >= 2018) return ["Escuelita"];
  if (year >= 2016 && year <= 2017) return ["Estrellita"];
  if (year >= 2014 && year <= 2015) return ["Infantil"];
  if (year >= 2012 && year <= 2013) return ["Juvenil A"]; // NUEVO
  return [];
};
```

#### C) Función helper para detectar Juvenil A
```typescript
const isJuvenilA = (birthYear: string | undefined): boolean => {
  if (!birthYear) return false;
  const year = parseInt(birthYear);
  return year >= 2012 && year <= 2013;
};
```

#### D) Actualizar subtítulos dinámicos según categoría
```typescript
const getStepTitles = (isJuvenil: boolean) => [
  { 
    title: "Cuéntanos sobre el jugador", 
    subtitle: isJuvenil 
      ? "Para jugadores de 12-13 años ofrecemos inscripción directa" 
      : "El Reto está diseñado para niños de 6 a 11 años" 
  },
  // ...resto de títulos
];
```

#### E) Step 2 - Ocultar Kit para Juvenil A
Para Juvenil A, no mostrar la sección del Kit de Inicio ya que no aplica.

#### F) Step 4 - Pricing diferenciado

**Para categorías 6-11 años (Escuelita, Estrellita, Infantil):**
```
Total a pagar: $1,100 MXN
├─ Kit de Inicio White Lions ............. Incluido
├─ 30 días de entrenamiento .............. Incluido
├─ Garantía de satisfacción .............. Incluida
├─ Evaluaciones mensuales ................ ✓   ← NUEVO
├─ Acceso a app de rendimiento ........... ✓   ← NUEVO
└─ Planes de crecimiento personalizado ... ✓   ← NUEVO
```

**Para Juvenil A (2012-2013):**
```
⚠️ Nota: El Reto de 30 días no está disponible 
   para la categoría Juvenil A (12-13 años).

Total a pagar:
├─ Inscripción ........................... $500 MXN
├─ Mensualidad .................... desde $500 MXN
│   (Explicadas en campo)
├─ Garantía de satisfacción .............. ✓
├─ Evaluaciones mensuales ................ ✓
├─ Acceso a app de rendimiento ........... ✓
└─ Planes de crecimiento personalizado ... ✓
```

#### G) Título del modal dinámico
- Reto (6-11): "🦁 Reto White Lions – 30 Días"
- Inscripción (Juvenil A): "🦁 Inscripción White Lions"

#### H) Botón final diferenciado
- Reto (6-11): "🦁 Iniciar Reto White Lions"
- Juvenil A: "🦁 Inscribir a mi hijo"

#### I) Pantalla de éxito diferenciada
Para Juvenil A, mostrar el precio como "Inscripción + Mensualidad" en lugar de "$1,100 MXN".

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/ChallengeRegistrationModal.tsx` | Años 2012-2013, categoría Juvenil A, pricing diferenciado, beneficios adicionales para todas las categorías |

---

## Flujo de Usuario para Juvenil A

```
PASO 1 → Año 2012/2013 → Categoría "Juvenil A"
PASO 2 → Sin Kit (ocultado), solo ubicación y horario
PASO 3 → Datos del tutor (sin cambios)
PASO 4 → Nota de "Sin Reto" + Inscripción $500 + Mensualidad desde $500
        + Beneficios: Garantía, Evaluaciones, App, Planes personalizados
```

---

## Beneficios Adicionales para TODAS las Categorías

En el Step 4, agregar a la lista de beneficios (tanto para Reto como para Inscripción directa):
- ✓ Garantía de satisfacción
- ✓ Evaluaciones mensuales
- ✓ Acceso a app de rendimiento  
- ✓ Planes de crecimiento personalizado
