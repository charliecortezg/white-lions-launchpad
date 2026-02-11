

# Plan: Elevar la pagina de Evaluacion a maquina de autoridad y conversion

## Resumen

Agregar 4 nuevas secciones de contenido estrategico y modificar el Hero y CTA existentes para aumentar percepcion de valor, autoridad metodologica y tasa de registro. Sin cambios en diseno visual, cronograma ni logica de pago.

---

## Cambios en el archivo `src/pages/EvaluationDay.tsx`

### 1. Hero — Mejoras de posicionamiento y urgencia

**Agregar debajo del subtitulo (linea 381):**
- Texto metodologico: "Evaluacion estructurada bajo metodologias europeas certificadas."

**Modificar CTA bottom (lineas 985-994):**
- Nuevo headline: "Reserva el lugar de tu hijo"
- Nuevo CTA: "Reserva el lugar y descubre el verdadero nivel de tu hijo"
- Agregar badge de urgencia: "Cupos limitados por categoria - Registro previo obligatorio"

### 2. Nueva seccion — "Que mide realmente esta evaluacion?" (despues de "Que incluye?")

5 bloques visuales con icono + titulo + descripcion:

| Bloque | Contenido |
|--------|-----------|
| Tecnica individual | Control, pase, conduccion, perfil corporal |
| Toma de decision | Lectura de juego y velocidad de reaccion |
| Comprension tactica | Posicionamiento y movimiento segun edad |
| Intensidad y disciplina | Comportamiento en cancha y actitud competitiva |
| Mentalidad y autonomia | Confianza, resiliencia y autodireccion |

Texto de cierre: "No es observacion general. Es medicion estructurada con criterios definidos por categoria."

### 3. Nueva seccion — Diferenciacion comparativa (despues de "Que mide?")

Tabla visual de 2 columnas:

| Academia promedio | White Lions Academies |
|---|---|
| Observacion subjetiva | Evaluacion estructurada |
| Sin metricas | Criterios claros por edad |
| Sin reporte formal | Reporte personalizado digital |
| Sin seguimiento | Recomendaciones de mejora |
| — | Posibilidad de integracion al sistema formativo |

### 4. Nueva seccion — Mockup del reporte (despues de Diferenciacion)

Titulo: "Asi luce el reporte que recibiras"

Mockup visual (componente React, no imagen) mostrando:
- Puntajes por area (barras horizontales de progreso)
- Comentarios del entrenador (texto placeholder)
- Recomendaciones practicas (lista)
- Nivel actual vs estandar WLA (indicador visual)

Texto de cierre: "En 24-48 horas recibiras un diagnostico claro y accionable."

### 5. Nueva seccion — "Que sigue despues de la evaluacion?" (antes del CTA final)

Texto: "Las familias que deseen continuar pueden iniciar el Reto White Lions -- 30 dias e integrarse al sistema formativo completo."

Conexion sutil con el funnel principal sin mencionar precios, kits ni inscripcion.

---

## Orden final de secciones

1. Hero (con texto metodologico + badge urgencia)
2. Selector de ruta (Activo / Externo)
3. Ruta activa o Formulario externo (condicional)
4. Que incluye (existente)
5. **Que mide realmente esta evaluacion? (NUEVA)**
6. **Diferenciacion comparativa (NUEVA)**
7. **Mockup del reporte (NUEVA)**
8. Como funciona (existente)
9. **Que sigue despues? (NUEVA)**
10. FAQ (existente, sin cambios)
11. CTA Bottom (mejorado)
12. Footer (existente)

---

## Detalle tecnico

Todo se implementa dentro de `src/pages/EvaluationDay.tsx`. No se crean archivos nuevos ni se modifican otros componentes.

Cada nueva seccion usa el componente `AnimatedSection` existente con animaciones `fade-up` y `scale` para mantener coherencia visual.

Los bloques de la seccion de diferenciacion usan el mismo patron de tarjetas `bg-card border border-border/50 rounded-xl` ya presente en la pagina.

El mockup del reporte se construye con componentes UI existentes (Progress bars de Tailwind, tarjetas) — no requiere imagenes externas.

Los iconos nuevos necesarios (Target, Brain, Eye, Zap, Heart, X, Check) se importan de `lucide-react` que ya esta instalado.

---

## Lo que NO se modifica

- Diseno visual general (colores, tipografia, branding)
- Cronograma (estructura y datos)
- Logica de pago en campo
- Formulario de registro (campos, steps, validacion)
- Diferenciacion activo vs externo
- FAQ (contenido existente)
- Base de datos
- Edge functions

