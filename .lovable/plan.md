
# Plan: Multi-Step Onboarding Wizard — Reto White Lions

## Resumen Ejecutivo

Transformar el formulario actual de registro (ChallengeRegistrationModal.tsx) de una sola vista larga en un **wizard de 4 pasos** con progressive disclosure, optimizado para conversión mobile-first.

---

## Análisis del Estado Actual

### Campos Actuales (Orden Actual)
1. Deporte (auto-seleccionado: Fútbol)
2. Nombre del jugador
3. Año de nacimiento
4. Categoría (condicional)
5. Info de ubicación/horario (solo lectura)
6. Kit de inicio (solo lectura)
7. Nombre del tutor
8. Email del tutor
9. Teléfono WhatsApp
10. Fecha de inicio del reto
11. Precio y garantía
12. Botón submit

**Problema**: Todo se muestra de golpe → fricción cognitiva alta en móvil.

---

## Nueva Estructura: 4 Pasos

### STEP 1 — Datos del Jugador
**Campos visibles:**
- Nombre del jugador
- Año de nacimiento (select)
- Categoría (auto-mostrada al seleccionar año)

**Validación antes de continuar:**
- `player_name` mínimo 2 caracteres
- `birth_year` seleccionado
- `category` seleccionada

**CTA:** "Continuar →"

---

### STEP 2 — La Experiencia del Reto
**Elementos visibles (solo lectura):**
- Ubicación: Campo Hacienda del Bosque
- Horario: Lunes y miércoles, 6:00–8:00 pm
- Kit de inicio (lista visual)
- **Campo editable:** Fecha de inicio del reto

**Validación antes de continuar:**
- `start_date` seleccionada

**CTA:** "Quiero apartar mi lugar →"

---

### STEP 3 — Datos del Tutor
**Campos visibles:**
- Nombre del tutor
- Correo electrónico
- Teléfono WhatsApp

**Validación antes de continuar:**
- `tutor_name` mínimo 2 caracteres
- `tutor_email` válido
- `contact_phone` mínimo 10 dígitos

**CTA:** "Ver total y garantía →"

---

### STEP 4 — Precio y Cierre
**Elementos visibles:**
- Total a pagar: $1,100 MXN
- Desglose: Kit + 30 días + Garantía
- Garantía completa (texto)
- Botón final de submit

**CTA Final:** "🦁 Iniciar Reto White Lions"

---

## Arquitectura Técnica

### Estado del Wizard
```typescript
const [step, setStep] = useState(1);
const TOTAL_STEPS = 4;
```

### Validación Por Paso
```typescript
const validateStep = async (currentStep: number): Promise<boolean> => {
  switch (currentStep) {
    case 1:
      return form.trigger(["player_name", "birth_year", "category"]);
    case 2:
      return form.trigger(["start_date"]);
    case 3:
      return form.trigger(["tutor_name", "tutor_email", "contact_phone"]);
    case 4:
      return true; // Submit final
    default:
      return false;
  }
};
```

### Navegación
```typescript
const nextStep = async () => {
  const isValid = await validateStep(step);
  if (isValid && step < TOTAL_STEPS) {
    setStep(step + 1);
  }
};

const prevStep = () => {
  if (step > 1) setStep(step - 1);
};
```

---

## Componentes UI Nuevos

### 1. Progress Indicator
```text
┌─────────────────────────────────────────────┐
│  ● ─── ○ ─── ○ ─── ○    Paso 1 de 4         │
│  [======                           ]         │
└─────────────────────────────────────────────┘
```

Implementación:
- Barra de progreso visual (25%, 50%, 75%, 100%)
- Texto "Paso X de 4"
- Íconos de paso activo/completado/pendiente

### 2. Animaciones Entre Pasos
```typescript
// Clases de transición (CSS)
.step-enter { opacity: 0; transform: translateX(20px); }
.step-enter-active { opacity: 1; transform: translateX(0); transition: all 0.3s ease; }
.step-exit { opacity: 1; transform: translateX(0); }
.step-exit-active { opacity: 0; transform: translateX(-20px); transition: all 0.3s ease; }
```

Alternativa simple con Tailwind:
```typescript
className={cn(
  "transition-all duration-300 ease-out",
  step === currentStep ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
)}
```

---

## Estructura del Componente Refactorizado

```text
<Dialog>
  <DialogContent>
    <DialogHeader>
      <Title>🦁 Reto White Lions – 30 Días</Title>
      <ProgressIndicator step={step} totalSteps={4} />
    </DialogHeader>

    <Form>
      {/* STEP 1: Datos del Jugador */}
      {step === 1 && (
        <StepContainer>
          <PlayerNameField />
          <BirthYearField />
          <CategoryField />
          <ContinueButton onClick={nextStep}>Continuar</ContinueButton>
        </StepContainer>
      )}

      {/* STEP 2: La Experiencia */}
      {step === 2 && (
        <StepContainer>
          <LocationInfo />     {/* Solo lectura */}
          <ScheduleInfo />     {/* Solo lectura */}
          <KitInfo />          {/* Solo lectura */}
          <StartDateField />   {/* Editable */}
          <BackButton onClick={prevStep} />
          <ContinueButton onClick={nextStep}>Quiero apartar mi lugar</ContinueButton>
        </StepContainer>
      )}

      {/* STEP 3: Datos del Tutor */}
      {step === 3 && (
        <StepContainer>
          <TutorNameField />
          <TutorEmailField />
          <PhoneField />
          <BackButton onClick={prevStep} />
          <ContinueButton onClick={nextStep}>Ver total y garantía</ContinueButton>
        </StepContainer>
      )}

      {/* STEP 4: Precio y Cierre */}
      {step === 4 && (
        <StepContainer>
          <PriceSummary />
          <GuaranteeText />
          <BackButton onClick={prevStep} />
          <SubmitButton type="submit">🦁 Iniciar Reto White Lions</SubmitButton>
        </StepContainer>
      )}
    </Form>
  </DialogContent>
</Dialog>
```

---

## Copy Específico Por Paso

### Step 1
- **Título del paso:** "Cuéntanos sobre el jugador"
- **Subtítulo:** "El Reto está diseñado para niños de 6 a 11 años"

### Step 2
- **Título del paso:** "Tu experiencia White Lions"
- **Subtítulo:** "Esto es lo que vivirá tu hijo durante 30 días"

### Step 3
- **Título del paso:** "¿Cómo te contactamos?"
- **Subtítulo:** "Usaremos estos datos para coordinar el inicio del Reto"

### Step 4
- **Título del paso:** "Estás a un paso de comenzar"
- **Subtítulo:** "Revisa el total y confirma tu inscripción"

---

## Cambios en el Archivo

### ChallengeRegistrationModal.tsx

| Sección | Cambio |
|---------|--------|
| Estado | Agregar `step` y funciones de navegación |
| Render | Dividir campos en 4 bloques condicionales |
| UI | Agregar ProgressIndicator |
| Botones | Cambiar submit por navegación multi-step |
| Animaciones | Agregar transiciones fade/slide |
| Reset | Resetear `step` a 1 al cerrar |

---

## Mobile-First Considerations

1. **Un solo scroll por paso** (máximo)
2. **Botones sticky en bottom** para fácil acceso
3. **Inputs grandes** (h-12 en lugar de h-10)
4. **Espaciado amplio** entre elementos
5. **Progress bar visible siempre** (sticky top)

---

## Diagrama de Flujo del Usuario

```text
┌──────────────────┐
│   Usuario abre   │
│      modal       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   PASO 1         │
│   Datos Jugador  │───► Valida → ✗ Muestra error
│   (10 segundos)  │
└────────┬─────────┘
         │ ✓
         ▼
┌──────────────────┐
│   PASO 2         │
│   Experiencia    │───► Ve valor ANTES del precio
│   + Fecha inicio │
└────────┬─────────┘
         │ ✓
         ▼
┌──────────────────┐
│   PASO 3         │
│   Datos Tutor    │───► Compromiso emocional
│                  │
└────────┬─────────┘
         │ ✓
         ▼
┌──────────────────┐
│   PASO 4         │
│   Precio final   │───► Decisión informada
│   + Garantía     │
└────────┬─────────┘
         │ Submit
         ▼
┌──────────────────┐
│   Confirmación   │
│   + Email sent   │
└──────────────────┘
```

---

## Criterios de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo Step 1 | < 10 segundos |
| Drop-off rate | Menor que formulario actual |
| Mobile completion | Fluido sin scroll excesivo |
| Percepción de valor | Usuario ve experiencia antes del precio |
| Fricción cognitiva | Mínima (1 decisión por pantalla) |

---

## Archivos a Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/ChallengeRegistrationModal.tsx` | **REFACTORIZAR** — Agregar lógica multi-step |

---

## Lo que NO Cambia

- ✅ Schema de validación Zod (mismo)
- ✅ Lógica de submit a Supabase (mismo)
- ✅ Envío de email de confirmación (mismo)
- ✅ Pantalla de éxito post-submit (mismo)
- ✅ Branding, colores, tipografía (mismo)
- ✅ Estructura del Dialog (mismo)

---

## Notas de Implementación

1. **Form.trigger()** permite validar campos específicos sin hacer submit
2. **Mantener un solo `<form>`** — no múltiples submits
3. **El submit real solo ocurre en Step 4**
4. **Agregar botón "Atrás"** en steps 2, 3, 4
5. **Resetear step a 1** cuando se cierra el modal
