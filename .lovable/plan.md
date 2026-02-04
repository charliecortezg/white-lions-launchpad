

# Plan: Reestructuración de Precios con Efecto Señuelo (Decoy Effect)

## Resumen Ejecutivo

Separar la estrategia de **Venta de Entrada** (Reto de 30 días) de la **Venta de Retención** (Planes Mensuales), aplicando el Efecto Señuelo para empujar al usuario hacia el plan de mayor valor ($700 Elite).

---

## Problema Actual

1. **Hero** muestra "Desde $500 MXN" — ancla muy baja sin contexto
2. **Sección de Precios** mezcla 4 opciones que no compiten entre sí
3. **Parálisis por análisis**: El usuario no sabe si elegir Reto, Inscripción, Mensualidad o Evaluación
4. **Sin separación clara** entre oferta de entrada y retención

---

## Solución: Arquitectura de 2 Fases

### Fase 1: Venta de Entrada (El Reto)
Solo el Reto White Lions ($1,100) se muestra como la puerta de entrada.

### Fase 2: Venta de Retención (Planes Mensuales)
Nueva sección después del Reto: "Después del reto, tú eliges el nivel de compromiso".

---

## Cambios a Implementar

### 1. HeroNew.tsx — Ancla de Precio

**Antes:**
```
Desde $500 MXN al mes
```

**Después:**
```
Planes desde $500 MXN al mes
```

Este pequeño cambio evita comprometerse con el precio más bajo como único referente.

---

### 2. ChallengeOffer.tsx — Separación y Efecto Señuelo

#### A) Eliminar la tabla comparativa actual (4 opciones confusas)

#### B) Mantener solo la oferta del Reto ($1,100) como oferta de entrada

#### C) Crear nueva sección: "El Camino al Éxito"

**Título:** "Después del Reto, tú eliges el nivel de compromiso de tu hijo"

**Subtítulo:** "El Reto es solo el comienzo. Aquí está cómo continúa la transformación."

---

### 3. Nueva Sección: MonthlyPlansSection.tsx (Efecto Señuelo)

Tres tarjetas horizontales con jerarquía visual clara:

#### Tarjeta 1: ENTRENAMIENTO ($500 MXN/mes)
- **Lenguaje:** "Fútbol + App para ganar puntos por esfuerzo"
- **Beneficios:**
  - Clases de fútbol con metodología White Lions
  - Acceso a la app para ver puntos de disciplina
  - Entrenamientos divertidos y estructurados
- **Visual:** Tarjeta normal, borde sutil

#### Tarjeta 2: LIDERAZGO ($675 MXN/mes) — El Señuelo
- **Lenguaje:** "Fútbol + App + Escuela para Padres Líderes"
- **Beneficios:**
  - Todo lo de Entrenamiento
  - Clase mensual en vivo para papás
  - Cómo formar el carácter de tus hijos
- **Visual:** Tarjeta normal, ligeramente más grande
- **Psicología:** Salto de $175 (+35%) se siente grande

#### Tarjeta 3: ELITE WHITE LIONS ($700 MXN/mes) — El Ganador
- **Lenguaje:** "Fútbol + App + Escuela para Padres + Mapa de Crecimiento + Medalla de Oro"
- **Beneficios:**
  - Todo lo de Liderazgo
  - Reporte Especial de comportamiento mensual
  - Medalla Digital de Honor en la app para el papá
  - Acceso prioritario a eventos especiales
- **Visual:** 
  - Tarjeta MÁS GRANDE (scale-105 o padding extra)
  - Borde DORADO/NARANJA brillante
  - Sticker: "EL MÁS ELEGIDO"
  - Fondo con gradiente sutil dorado
- **Psicología:** Solo $25 más que Liderazgo (+3.7%) = decisión obvia

---

## Arquitectura de la Nueva Sección

```text
<section id="monthly-plans">
  
  <!-- Header -->
  <AnimatedSection>
    <h2>Después del Reto, tú eliges el nivel de compromiso</h2>
    <p>El Reto es solo el comienzo. Aquí está cómo continúa la transformación.</p>
  </AnimatedSection>

  <!-- 3 Cards Grid -->
  <AnimatedSection>
    <div className="grid md:grid-cols-3 gap-6">
      
      <!-- Card 1: Entrenamiento -->
      <PlanCard 
        name="Entrenamiento"
        price={500}
        tagline="Fútbol + App para ganar puntos"
        features={[...]}
      />
      
      <!-- Card 2: Liderazgo (Decoy) -->
      <PlanCard 
        name="Liderazgo"
        price={675}
        tagline="+ Escuela para Padres Líderes"
        features={[...]}
      />
      
      <!-- Card 3: Elite (Winner) -->
      <PlanCard 
        name="Elite White Lions"
        price={700}
        tagline="La experiencia completa"
        features={[...]}
        highlighted={true}
        badge="EL MÁS ELEGIDO"
      />
      
    </div>
  </AnimatedSection>

  <!-- Micro-copy -->
  <p>Los planes mensuales comienzan después del Reto de 30 días.</p>
  
</section>
```

---

## Especificaciones Visuales

### Tarjeta Elite (Resaltada)
```css
/* Tailwind classes */
- scale-105 (ligeramente más grande)
- border-2 border-primary (borde dorado)
- bg-gradient-to-b from-primary/10 to-transparent
- shadow-gold (sombra dorada)
- relative (para el badge)

/* Badge "EL MÁS ELEGIDO" */
- absolute -top-3 left-1/2 -translate-x-1/2
- bg-primary text-primary-foreground
- font-bold uppercase text-xs
- px-4 py-1 rounded-full
- animate-pulse (opcional)
```

### Iconografía
- Entrenamiento: Ícono de balón
- Liderazgo: Ícono de usuarios/comunidad
- Elite: Ícono de corona o trofeo

---

## Flujo de Usuario Optimizado

```text
┌────────────────────────┐
│        HERO            │
│ "Planes desde $500"    │ ◄── Ancla corregida
│ CTA → Reto             │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│   RETO WHITE LIONS     │
│      $1,100 MXN        │ ◄── Venta de Entrada
│   (Sin tabla confusa)  │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  PLANES MENSUALES      │
│  (Nueva Sección)       │
│                        │
│ $500 ── $675 ── $700   │ ◄── Efecto Señuelo
│ [     ] [    ] [ELITE] │
│                        │
│ Salto $175   Salto $25 │
│ (grande)     (pequeño) │
└────────────────────────┘
```

---

## Archivos a Modificar/Crear

| Archivo | Acción |
|---------|--------|
| `src/components/HeroNew.tsx` | **MODIFICAR** — "Planes desde $500" |
| `src/components/ChallengeOffer.tsx` | **MODIFICAR** — Eliminar tabla comparativa |
| `src/components/MonthlyPlansSection.tsx` | **CREAR** — Nueva sección de planes |
| `src/pages/Index.tsx` | **MODIFICAR** — Agregar MonthlyPlansSection después de ChallengeOffer |

---

## Lenguaje Prohibido vs Permitido

| Prohibido | Usar en su lugar |
|-----------|------------------|
| Algoritmos | Sistema de puntos |
| Base de datos | Tu perfil en la app |
| Sincronización | Actualización automática |
| Métricas | Progreso visible |
| Analytics | Reporte de comportamiento |

---

## Criterios de Éxito

1. **Visual:** La tarjeta Elite es claramente la más prominente
2. **Psicológico:** El salto de $675 a $700 se siente insignificante
3. **Claridad:** No hay confusión entre oferta de entrada y retención
4. **Mobile-first:** Las 3 tarjetas se apilan bien en móvil
5. **Preparado para Supabase:** Botones con `onClick` listo para guardar selección

---

## Detalles de Implementación Técnica

### Estructura de Datos para Planes
```typescript
const monthlyPlans = [
  {
    id: "entrenamiento",
    name: "Entrenamiento",
    price: 500,
    tagline: "Fútbol + App para ganar puntos por esfuerzo",
    features: [
      "Clases de fútbol con metodología White Lions",
      "Acceso a la app para ver puntos de disciplina",
      "Entrenamientos divertidos y estructurados"
    ],
    icon: "⚽",
    highlighted: false
  },
  {
    id: "liderazgo",
    name: "Liderazgo",
    price: 675,
    tagline: "Fútbol + App + Escuela para Padres Líderes",
    features: [
      "Todo lo de Entrenamiento",
      "Clase mensual en vivo para papás",
      "Cómo formar el carácter de tus hijos"
    ],
    icon: "👥",
    highlighted: false
  },
  {
    id: "elite",
    name: "Elite White Lions",
    price: 700,
    tagline: "La experiencia completa para familias comprometidas",
    features: [
      "Todo lo de Liderazgo",
      "Reporte Especial de comportamiento mensual",
      "Medalla Digital de Honor para papás",
      "Acceso prioritario a eventos especiales"
    ],
    icon: "👑",
    highlighted: true,
    badge: "EL MÁS ELEGIDO"
  }
];
```

### Botones Preparados para Supabase
```typescript
<Button
  onClick={() => handlePlanSelection(plan.id)}
  variant={plan.highlighted ? "hero" : "outline"}
>
  Elegir {plan.name}
</Button>

// Función placeholder
const handlePlanSelection = async (planId: string) => {
  // TODO: Guardar en Supabase
  console.log("Plan seleccionado:", planId);
  toast.success(`Has elegido el plan ${planId}`);
};
```

---

## Notas de Psicología de Ventas

1. **Efecto Señuelo (Decoy):** El plan Liderazgo a $675 existe para hacer que Elite a $700 parezca una ganga
2. **Anclaje:** El usuario ya vio $1,100 en el Reto, así que $700/mes se siente razonable
3. **Pérdida percibida:** "Solo $25 más y obtengo TODO esto" activa el miedo a perderse algo
4. **Social proof:** "EL MÁS ELEGIDO" implica que otros padres lo prefieren

