

# Plan: Reposicionar Copy del Reto White Lions ($500, sin kit, clase muestra gratuita)

## Resumen

Actualizar el copy de todo el sitio para reflejar el nuevo modelo del Reto: clase muestra gratuita como primer paso, Reto a $500 MXN (sin kit, sin inscripcion, sin partidos), y kit/partidos solo al inscribirse formalmente post-Reto.

---

## Archivos a Modificar

| Archivo | Cambio principal |
|---------|-----------------|
| `src/components/HeroNew.tsx` | Nuevo anclaje de precio ($500), CTA a clase muestra |
| `src/components/ChallengeOffer.tsx` | Precio $500, eliminar kit, nuevo copy de integracion |
| `src/components/ChallengeRegistrationModal.tsx` | Step 2: eliminar kit, nuevo copy. Step 4: nuevo bloque "Importante" y bullets |
| `src/components/CTASection.tsx` | Eliminar mencion de kit, nuevo copy y CTAs |
| `src/components/FAQNew.tsx` | Reescribir FAQs para alinear con nuevo modelo |
| `src/components/MonthlyPlansSection.tsx` | Ajuste menor al microcopy |
| `src/components/modals/JoinFamilyModal.tsx` | Ajustar precio de inscripcion post-reto |

---

## Cambios por Archivo

### 1. HeroNew.tsx

**Bloque de precio (lineas 69-81):**
- Cambiar "Planes desde $500 MXN al mes" por "Reto White Lions desde $500 MXN"
- Agregar microcopy "(Sin inscripcion . Sin riesgo)"
- Mantener "La mayoria de las familias inicia con el Reto White Lions"

**CTA principal (linea 94):**
- Cambiar de "Iniciar con el Reto White Lions" a "Agendar clase muestra gratuita"

**Microcopy inferior (linea 103):**
- Cambiar de "Empieza con 30 dias. La decision final es tuya." a "Clase gratuita y sin compromiso. La decision final es tuya."

### 2. ChallengeOffer.tsx

**Precio (linea 54):**
- Cambiar $1,100 a $500

**Eliminar seccion "Incluye" (lineas 17-22):**
- Quitar el array `challengeIncludes` que menciona "Kit de inicio White Lions"
- Reemplazar la columna "Incluye" por un bloque "Durante el Reto tu hijo vivira" con los nuevos bullets

**Nuevos bullets para la experiencia:**
- Entrenamientos dos veces por semana
- Adaptacion progresiva al sistema White Lions
- Desarrollo de habitos deportivos
- Integracion al grupo y entrenadores
- Evaluacion real de si este sistema es para tu familia

**Nuevo copy introductorio:**
- "El Reto White Lions es una experiencia de integracion de 30 dias. Tu hijo conocera nuestra metodologia, se adaptara al grupo y vivira el sistema White Lions desde dentro."

**Garantia (lineas 114-116):**
- Cambiar "te devolvemos tu dinero (menos el kit)" a "te devolvemos tu dinero. Sin preguntas."

**Nota adicional (nueva):**
- Agregar microcopy: "Los partidos oficiales y el kit White Lions se habilitan al finalizar el Reto y completar la inscripcion."

**CTA (linea 130):**
- Cambiar a "Agendar clase muestra gratuita"

### 3. ChallengeRegistrationModal.tsx

**Step 2 regular (lineas 669-682) - Eliminar kit:**
- Eliminar completamente el bloque "Tu Kit de Inicio incluye" con los 4 items (camiseta, calcetas, espinilleras, termo)
- Reemplazar por nuevo bloque "Durante el Reto White Lions tu hijo vivira:" con bullets:
  - Entrenamientos dos veces por semana
  - Adaptacion progresiva al sistema White Lions
  - Desarrollo de habitos deportivos
  - Integracion al grupo y entrenadores
  - Evaluacion real de si este sistema es para tu familia
- Agregar nota visible: "Los partidos oficiales y el kit White Lions se habilitan unicamente al finalizar el Reto y completar la inscripcion."

**Step 4 regular - Bloque informativo (lineas 986-1023):**
- Titulo: "Que sigue despues de la clase muestra?"
- Nuevo texto: "Despues de la clase muestra, puedes iniciar el Reto White Lions -- 30 dias, una experiencia de integracion disenada para que tu hijo conozca nuestra metodologia, se adapte al grupo y viva el sistema White Lions desde dentro."
- Nuevos bullets (eliminar "Kit de inicio"):
  - 30 dias de entrenamientos estructurados
  - Metodologia White Lions (inspirada en modelos europeos)
  - Seguimiento formativo
  - Ambiente sano y comunidad real
  - Garantia de satisfaccion

**Bloque "Importante" (lineas 1027-1035):**
- Nuevo copy: "La clase muestra es gratuita y sin compromiso. El Reto White Lions tiene un costo accesible de $500 MXN y se paga en campo unicamente si decides continuar despues de la experiencia inicial."

### 4. CTASection.tsx

**Parrafo descriptivo (lineas 67-69):**
- Eliminar "Kit de inicio incluido"
- Nuevo copy: "Agenda tu clase muestra gratuita y descubre por que somos la academia deportiva preferida de Mexicali. Reto de 30 dias con garantia de satisfaccion."

**CTA principal (linea 82):**
- Cambiar "Inscribirme al Reto" a "Agendar clase muestra gratuita"

**CTA secundario (linea 89-91):**
- Cambiar "Unirme a la Familia White Lions" a "Conocer el Reto White Lions"

**Benefits grid (lineas 98-101):**
- Eliminar "Kit Incluido / Camiseta, calcetas, espinilleras y termo"
- Reemplazar por: "Clase Gratuita / Primer contacto sin compromiso"
- Mantener "Garantia Real" y "30 Dias Completos"

### 5. FAQNew.tsx

Reescribir las FAQs para alinear con el nuevo modelo. Cambios principales:

1. **"Que es el Reto White Lions?"** - Precio $500, sin mencion de kit, enfasis en integracion y proceso
2. **"Que incluye el Kit?"** - Eliminar esta FAQ o reconvertirla a "Que incluye el Reto?" con los nuevos bullets
3. **"Como funciona la garantia?"** - Eliminar "(menos el valor del kit)", devolucion completa
4. **"Cuanto cuesta continuar?"** - Mantener $500/mes, agregar mencion de que la inscripcion incluye kit y acceso a partidos
5. **"Hay otra forma sin el Reto?"** - Actualizar con nuevo modelo (inscripcion directa post-clase)
6. **"Que debe llevar al primer dia?"** - Eliminar "te entregaremos el kit", reemplazar por instrucciones de clase muestra
7. **"Por que no ofrecen clase muestra gratis?"** - ELIMINAR esta FAQ ya que ahora SI hay clase muestra gratuita. Reemplazar por "Como funciona la clase muestra?"
8. Mantener FAQs de experiencia/mixtas sin cambios

### 6. MonthlyPlansSection.tsx

**Microcopy (linea 167):**
- Mantener como esta: "Los planes mensuales comienzan despues de completar el Reto de 30 dias." (ya esta correcto)

### 7. JoinFamilyModal.tsx

**Costos (lineas 47-55):**
- Verificar que los precios esten alineados. Actualmente muestra "Inscripcion $300" -- esto debe actualizarse si el modelo cambio. Segun el nuevo modelo no hay inscripcion separada durante el Reto, asi que ajustar el copy para reflejar que la inscripcion formal ($300) ocurre post-Reto.

---

## Resumen de Reglas de Copy Aplicadas

| Antes | Despues |
|-------|---------|
| $1,100 MXN | $500 MXN |
| Kit de inicio incluido | (eliminado) |
| Inscripcion | (eliminado del Reto) |
| Partidos | (eliminado del Reto) |
| "te devolvemos tu dinero (menos el kit)" | "te devolvemos tu dinero" |
| "Inscribirme al Reto" | "Agendar clase muestra gratuita" |
| No hay clase muestra | Clase muestra gratuita como primer paso |
| Lenguaje de compra | Lenguaje de proceso/decision/integracion |

---

## Lo que NO se modifica

- Estructura visual y layout de componentes
- Flujo del formulario de registro (4 pasos)
- Logica de Biberon/Juvenil A
- MonthlyPlansSection (precios post-Reto se mantienen)
- Integraciones con base de datos y emails
- Colores, tipografia, animaciones
