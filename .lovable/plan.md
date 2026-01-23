
# Plan: Rediseno Visual "White Lions Elite" - Dark Premium Theme

## Resumen Ejecutivo

Transformar el sitio de White Lions de un diseno con fondo claro (actual) a un tema oscuro premium que proyecte tecnologia, exclusividad y profesionalismo deportivo. Implementar la regla 60-30-10 de colores, tipografia condensada para titulos, y estilo "Bento Grid" para tarjetas.

---

## Fase 1: Sistema de Colores (Regla 60-30-10)

### Cambios en `src/index.css`

**Paleta Nueva:**
- **60% Base**: Negro Mate `#0F172A` (Slate 900) como fondo principal
- **30% Contraste**: Blanco `#FFFFFF` para titulos, Gris `#94A3B8` para parrafos
- **10% Acento**: Dorado/Ambar `#F59E0B` solo para CTAs y highlights

**Variables CSS a modificar:**
```text
--background: 222 47% 11%     (Fondo oscuro #0F172A)
--foreground: 0 0% 100%       (Texto blanco)
--card: 217 33% 17%           (Tarjetas #1E293B)
--card-foreground: 0 0% 100%
--muted: 217 33% 17%          (Fondos secundarios)
--muted-foreground: 215 20% 65%  (Texto gris #94A3B8)
--border: 217 33% 25%         (Bordes sutiles #334155)
--accent: 38 92% 50%          (Dorado #F59E0B)
```

---

## Fase 2: Tipografia Deportiva

### Cambios en `index.html`

Agregar Google Fonts:
- **Titulos**: Oswald (Condensada, Bold, MAYUSCULAS)
- **Cuerpo**: Inter (ya existe, mantener)

### Cambios en `tailwind.config.ts`

Extender fontFamily:
```text
fontFamily: {
  display: ['Oswald', 'sans-serif'],
  body: ['Inter', 'sans-serif'],
}
```

### Aplicacion en componentes

- H1, H2: `font-display uppercase tracking-wide`
- Parrafos: `font-body`

---

## Fase 3: Hero Section - Full Width + Overlay Oscuro

### Cambios en `src/components/HeroNew.tsx`

**Antes (actual):**
- Overlay con gradiente `from-primary/95 via-primary/85 to-primary/70`
- Fondo navy semi-transparente

**Despues:**
- Overlay negro solido: `bg-black/70`
- Titulo en MAYUSCULAS con Oswald
- Boton dorado con glow effect
- Efecto de "scanlines" o textura sutil (opcional)

```text
Estructura visual:
+-----------------------------------------------+
|   [Imagen Full-Width de fondo]                |
|   +---------------------------------------+   |
|   |  Overlay Negro 70%                    |   |
|   |                                       |   |
|   |  ESTRUCTURA, DISCIPLINA Y             |   |
|   |  DESARROLLO DEPORTIVO                 |   |
|   |  EN MEXICALI.                         |   |
|   |                                       |   |
|   |  [Subheadline en gris claro]          |   |
|   |                                       |   |
|   |  [===== BOTON DORADO BRILLANTE =====] |   |
|   +---------------------------------------+   |
+-----------------------------------------------+
```

---

## Fase 4: Tarjetas Estilo "Bento Grid"

### Cambios en `src/components/ValueProposition.tsx`

**Estilo actual:**
- Tarjetas blancas con sombra
- Bordes sutiles

**Nuevo estilo Dark Tech:**
- Fondo: `bg-[#1E293B]`
- Borde: `border border-[#334155]`
- Border-radius: `rounded-xl` (12px)
- Iconos grandes en color dorado
- Hover: `hover:border-accent/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]`

```text
+------------------------+
|  [ICONO GRANDE]        |
|  Dorado                |
|                        |
|  TECNOLOGIA STRYK      |
|  (Blanco, Oswald)      |
|                        |
|  Descripcion en gris   |
|  claro...              |
+------------------------+
```

### Aplicar mismo estilo a:
- `ClientFilter.tsx`
- `ChallengeOffer.tsx`
- `Schedule.tsx`
- `FAQNew.tsx`

---

## Fase 5: Secciones con Fondos Alternados

### Patron de fondos oscuros

| Seccion | Fondo |
|---------|-------|
| Hero | Imagen + Overlay negro |
| ClientFilter | `#0F172A` (base) |
| ValueProposition | `#0B1120` (mas oscuro) |
| ChallengeOffer | `#0F172A` con acento |
| Schedule | `#0B1120` |
| Director | `#0F172A` |
| Locations | `#0B1120` |
| FAQ | `#0F172A` |
| Footer | `#030712` (casi negro) |

### Variables adicionales
```text
--background-alt: 222 47% 7%   (#0B1120)
--background-deep: 220 60% 2%  (#030712)
```

---

## Fase 6: Componentes Especificos

### A. Navbar (`Navbar.tsx`)
- Fondo transparente -> Negro semi-transparente al scroll
- Logo: Asegurar version blanca visible
- Links en gris claro, hover en dorado

### B. Pricing Cards (`ChallengeOffer.tsx`)
- Fondo oscuro con borde dorado sutil
- Precio en blanco grande
- Boton dorado con glow animation

### C. Director Section (`Director.tsx`)
- Imagen con borde dorado sutil
- Quote con borde izquierdo dorado
- Tags en fondo `#1E293B`

### D. FAQ Accordion (`FAQNew.tsx`)
- Items con fondo `#1E293B`
- Trigger text en blanco
- Content en gris claro

---

## Fase 7: Efectos Visuales Premium

### Glow Effect para CTAs
```text
Keyframe: pulse-glow
- Box-shadow oscilante dorado
- 0 0 20px rgba(245, 158, 11, 0.4)
```

### Hover states
- Tarjetas: Border glow sutil
- Botones: Scale 1.02 + shadow expansion
- Links: Color transition a dorado

### Glassmorphism para Modal
- Ya existe, mantener pero ajustar a tema oscuro

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `index.html` | Agregar Google Font Oswald |
| `src/index.css` | Nueva paleta de colores oscuros |
| `tailwind.config.ts` | fontFamily display, colores adicionales |
| `src/components/HeroNew.tsx` | Overlay negro, tipografia Oswald |
| `src/components/ClientFilter.tsx` | Tema oscuro, tarjetas dark |
| `src/components/ValueProposition.tsx` | Bento grid style |
| `src/components/ChallengeOffer.tsx` | Cards oscuras, precios destacados |
| `src/components/Schedule.tsx` | Tablas tema oscuro |
| `src/components/Director.tsx` | Fondo oscuro, acentos dorados |
| `src/components/Locations.tsx` | Cards oscuras |
| `src/components/FAQNew.tsx` | Accordion dark theme |
| `src/components/FooterNew.tsx` | Fondo casi negro |
| `src/components/Navbar.tsx` | Transparente -> Negro blur |
| `src/components/ui/button.tsx` | Variante gold con glow |

---

## Resultado Visual Esperado

```text
ANTES (Actual):
- Fondo blanco/claro
- Navy como color primario
- Se ve "generico" y "folleto"

DESPUES (Elite):
- Fondo negro mate premium
- Dorado solo en CTAs (10%)
- Titulos en Oswald MAYUSCULAS
- Tarjetas flotantes con bordes sutiles
- Se ve "tech", "premium", "profesional"
```

---

## Seccion Tecnica

### Dependencias
No se requieren nuevas dependencias. Google Fonts se carga via CDN.

### Compatibilidad
- Tailwind CSS ya soporta todas las clases necesarias
- HSL colors son totalmente compatibles
- Animaciones ya definidas en config

### Performance
- Una sola fuente adicional (Oswald ~20KB)
- Sin impacto en bundle size
- CSS variables = cambio instantaneo

### Riesgos
- Contraste: Verificar que todo texto tenga ratio 4.5:1 minimo
- Imagenes: Pueden requerir ajuste de brillo
- Logo: Verificar visibilidad sobre fondo oscuro
