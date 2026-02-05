

# Plan: Optimización Mobile-First del Modal de Registro

## Problema Identificado

Las imágenes muestran scroll horizontal en el modal en móvil, causado por:

1. El contenedor del diálogo no está restringido al 100% del viewport en móvil
2. Los botones de navegación (Atrás + CTA) están usando flexbox pero los textos largos causan overflow
3. Algunos textos del encabezado son muy largos y no tienen text wrapping apropiado

---

## Cambios a Implementar

### 1. DialogContent - Restringir ancho en móvil

**Archivo:** `src/components/ChallengeRegistrationModal.tsx` (línea 330)

```typescript
// Antes
className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-background/95"

// Después  
className="w-[calc(100vw-2rem)] max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden backdrop-blur-xl bg-background/95"
```

### 2. Título del Modal - Hacer responsive

**Línea 340-342:** Reducir tamaño de fuente en móvil y permitir wrap

```typescript
// Antes
className="text-2xl md:text-3xl font-bold text-foreground text-center font-display uppercase"

// Después
className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground text-center font-display uppercase leading-tight"
```

### 3. Subtítulos del Step - Responsive text

**Líneas 365-370:** Ajustar tamaños de texto para mejor legibilidad en móvil

```typescript
// Título del step
className="text-base sm:text-lg font-semibold text-foreground"

// Subtítulo
className="text-xs sm:text-sm text-muted-foreground"
```

### 4. Botones de Navegación - Evitar overflow

**Múltiples ubicaciones (líneas 572-593, 663-684, 745-765):**

Los botones deben usar flex-wrap y textos más cortos en móvil:

```typescript
// Container de botones
className="flex flex-col sm:flex-row gap-3 pt-2"

// Botón Atrás
className="w-full sm:flex-1 order-2 sm:order-1"

// Botón CTA
className="w-full sm:flex-[2] order-1 sm:order-2"
```

Textos del CTA más cortos en móvil usando clases responsive:

```typescript
// Ejemplo para Step 4:
<span className="hidden sm:inline">📅 Agendar clase muestra</span>
<span className="sm:hidden">📅 Agendar clase</span>
```

### 5. Grid del Kit de Inicio - Cambiar a 1 columna en móvil muy pequeño

**Línea 507:**

```typescript
// Antes
className="grid grid-cols-2 gap-2 text-sm text-muted-foreground"

// Después  
className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-sm text-muted-foreground"
```

### 6. Nota de Confianza - Texto responsive

**Línea 739-741:** El texto largo puede causar problemas

```typescript
// Agregar break-words para evitar overflow
className="text-xs text-muted-foreground break-words"
```

### 7. Pantalla de Éxito - Responsive

**Línea 806-808:** Fecha puede ser larga

```typescript
// Agregar text wrap
className="font-medium capitalize text-right max-w-[50%] break-words"
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/ChallengeRegistrationModal.tsx` | Múltiples ajustes de clases CSS para mobile-first |

---

## Resultado Esperado

1. Sin scroll horizontal en ningún dispositivo
2. Botones apilados verticalmente en móvil, horizontalmente en desktop
3. Textos legibles y con wrap apropiado
4. Experiencia fluida en pantallas desde 320px de ancho

