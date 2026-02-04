
# Plan: Actualización Copy & Pricing 2026 — White Lions Academies

## Resumen Ejecutivo

Actualizar todo el copy del sitio web para posicionar el **Reto White Lions – 30 días** a **$1,100 MXN** como la opción principal y más segura de entrada, usando la nueva estructura de precios como anclaje estratégico.

---

## Cambios Principales de Precios

| Concepto | Precio Anterior | Precio Nuevo |
|----------|-----------------|--------------|
| Reto White Lions – 30 días | $700 MXN | **$1,100 MXN** |
| Inscripción Estándar | No existía | **$950 MXN** |
| Mensualidad Regular | $500 MXN | **$500 MXN** (sin cambio) |
| Evaluación Individual | No existía | **$300 MXN** |

---

## Parte 1: HeroNew.tsx (Hero Section)

### Copy Nuevo

```
Badge: "🟡 Cupos limitados · Niños de 6 a 11 años"

Headline: "WHITE LIONS NO ES UNA ACTIVIDAD. ES UNA DECISIÓN PARA TU HIJO."

Subheadline: "Un sistema deportivo diseñado para que tu hijo se divierta más, 
deje el celular y construya hábitos positivos a través del fútbol."

Supporting line: "Entrenamiento estructurado · Comunidad real · Seguimiento del progreso"

Precio ancla: "Desde $500 MXN al mes"
Sub-texto: "👉 La mayoría de las familias inicia con el Reto White Lions"

CTA: "🦁 Iniciar con el Reto White Lions"

Micro-copy: "Empieza con 30 días. La decisión final es tuya."
```

---

## Parte 2: Nueva Sección — "El Problema" (ProblemSection.tsx)

### Ubicación
Después del Hero, antes de ClientFilter

### Copy Exacto

```
Título: "Hoy no es fácil encontrar una actividad que realmente ayude a tu hijo"

Texto: "Muchos padres buscan algo más que 'entretener' a sus hijos."

Lista (bullets):
- Que se muevan más
- Que desarrollen disciplina
- Que salgan de la rutina de pantallas
- Que pertenezcan a un entorno sano

Cierre: "White Lions existe para cubrir exactamente eso."
```

---

## Parte 3: ClientFilter.tsx (Para Quién Es / No Es)

### Copy Actualizado

```
Título: "¿White Lions es para tu familia?"

SÍ es para familias que:
- Buscan estructura, no solo juegos
- Valoran disciplina y constancia
- Quieren ver progreso real
- Están dispuestas a comprometerse

NO es para quienes:
- Solo buscan partidos o trofeos
- Cambian de actividad cada mes
- No respetan reglas ni procesos

Micro-copy final: "White Lions no es para todos. Es para familias 
que toman en serio el desarrollo de sus hijos."
```

---

## Parte 4: ChallengeOffer.tsx (Oferta Principal + Comparativo)

### Estructura Completamente Nueva

#### A) Sección del Reto (Hero de la oferta)

```
Título: "Reto White Lions – 30 días"
Precio: "$1,100 MXN"

Texto: "El Reto White Lions es la forma más segura y recomendada de iniciar.
Durante 30 días tu hijo:"

Lista:
- Vive la experiencia real de la academia
- Entrena con metodología estructurada
- Se integra a un grupo con reglas y valores
- Comienza un proceso de seguimiento deportivo

Incluye:
- Entrenamientos
- Kit de inicio White Lions
- Acompañamiento inicial
- Garantía de satisfacción

Garantía: "Si después de 30 días tu hijo no se divierte más, no se mueve más 
y no se adapta al entorno White Lions, te devolvemos tu dinero (menos el kit)."

CTA: "🦁 Iniciar el Reto White Lions"
```

#### B) Tabla Comparativa de Opciones (Anclaje)

```
Título: "Formas de iniciar en White Lions"

┌─────────────────────────────────────────────────────────────────────┐
│ 🔹 OPCIÓN RECOMENDADA                                               │
│ Reto White Lions – 30 días                                          │
│ $1,100 MXN                                                          │
│ ✔ Kit  ✔ Garantía  ✔ Experiencia completa                          │
│ 👉 La mayoría de las familias inicia aquí.                          │
├─────────────────────────────────────────────────────────────────────┤
│ 🔹 OPCIÓN DIRECTA                                                   │
│ Inscripción Estándar                                                │
│ $950 MXN                                                            │
│ Incluye registro + primer mes                                       │
│ ❌ Sin kit  ❌ Sin garantía                                          │
│ 👉 Solo para quienes ya conocen el sistema White Lions.             │
├─────────────────────────────────────────────────────────────────────┤
│ 🔹 CONTINUIDAD                                                      │
│ Mensualidad Regular                                                 │
│ $500 MXN / mes                                                      │
│ Entrenamientos + evaluaciones mensuales + STRYK                     │
├─────────────────────────────────────────────────────────────────────┤
│ 🔹 SERVICIO EXTERNO                                                 │
│ Evaluación Individual                                               │
│ $300 MXN                                                            │
│ Para jugadores externos a la academia.                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Parte 5: FAQNew.tsx

### Actualizar precios en respuestas

- Reto: $1,100 MXN (antes $700)
- Mencionar la Inscripción Estándar ($950) como alternativa
- Actualizar el cálculo de la garantía (reembolso menos kit)

---

## Parte 6: Index.tsx (Orden de Secciones)

### Nuevo orden

```tsx
<Navbar />
<HeroNew />            // Hero actualizado
<ProblemSection />     // NUEVA sección "El Problema"
<ClientFilter />       // "¿Para quién es?"
<ValueProposition />   // Por qué el Reto
<ChallengeOffer />     // Oferta principal + Comparativo
<Schedule />
<Director />
<Locations />
<FAQNew />
<FooterNew />
```

---

## Parte 7: Actualizar Modal de Registro

### ChallengeRegistrationModal.tsx

- Actualizar el precio mostrado de $700 → $1,100 MXN
- Mantener la lógica de registro igual

---

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/ProblemSection.tsx` | **CREAR** — Sección "El Problema" |
| `src/components/HeroNew.tsx` | **MODIFICAR** — Nuevo copy y estructura |
| `src/components/ClientFilter.tsx` | **MODIFICAR** — Nuevo copy |
| `src/components/ChallengeOffer.tsx` | **MODIFICAR** — Precios y comparativo |
| `src/components/FAQNew.tsx` | **MODIFICAR** — Actualizar precios |
| `src/components/ChallengeRegistrationModal.tsx` | **MODIFICAR** — Precio $1,100 |
| `src/pages/Index.tsx` | **MODIFICAR** — Agregar ProblemSection |

---

## Criterios de Éxito

1. El Reto White Lions ($1,100) es la opción más visible y recomendada
2. Los precios funcionan como anclaje (la tabla muestra que el Reto tiene más valor)
3. Un solo CTA principal en todo el flujo
4. Lenguaje dirigido a padres (no a niños ni entrenadores)
5. Mobile-first: sin párrafos largos, todo escaneable
6. Narrativa: decisión → problema → solución → oferta → acción

---

## Diagrama de Flujo de Conversión

```text
                    ┌──────────────┐
                    │    HERO      │
                    │   $500/mes   │◄── Ancla mental
                    │   (CTA Reto) │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PROBLEMA    │
                    │ (Pantallas,  │◄── Conexión emocional
                    │  disciplina) │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ ¿PARA QUIÉN? │
                    │ (Filtro)     │◄── Auto-calificación
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  PROPUESTA   │
                    │  DE VALOR    │◄── Justificación del Reto
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   OFERTA     │
                    │  $1,100 Reto │◄── Decisión principal
                    │ + Comparativo│
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │   REGISTRO   │
                    │   (Modal)    │◄── Conversión
                    └──────────────┘
```

---

## Notas Técnicas

- **NO cambiar**: Branding, colores, tipografía, infraestructura de pagos
- **SÍ cambiar**: Copy, jerarquía de mensajes, presentación de precios, micro-copy
- Mantener diseño mobile-first con tarjetas bento existentes
- La tabla comparativa usa el sistema de tarjetas actual pero con jerarquía visual clara
