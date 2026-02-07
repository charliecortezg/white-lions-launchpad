

# Plan: Scroll al Top y Optimización del Step 4 en Móvil

## Problema

Cuando el usuario avanza al Step 4 (último paso), el modal queda scrolleado hasta abajo, mostrando los botones y la nota de confianza pero ocultando el título del paso. Esto pasa porque el contenido del step anterior era largo y el scroll position se mantiene.

---

## Solución en 2 Partes

### Parte 1: Scroll automático al top en cada cambio de paso

Agregar un `useEffect` que detecte cambios en `step` y haga scroll al inicio del contenido del modal. Se usará un `ref` en el `DialogContent` para llamar `scrollTo(0, 0)` cada vez que cambie el paso.

**Archivo:** `src/components/ChallengeRegistrationModal.tsx`

```typescript
// Agregar ref
const contentRef = useRef<HTMLDivElement>(null);

// useEffect para scroll al top
useEffect(() => {
  if (contentRef.current) {
    contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }
}, [step]);
```

Y aplicar el ref al `DialogContent`:
```typescript
<DialogContent ref={contentRef} className="...">
```

### Parte 2: Hacer Step 4 más compacto en móvil

Reducir el padding y espaciado del Step 4 para que quepa mejor en pantallas pequeñas:

1. **Lista de beneficios:** Reducir a un grid de 2 columnas en móvil para ocupar menos espacio vertical
2. **Padding interno:** Reducir `p-5` a `p-3 sm:p-5` en las secciones
3. **Espaciado vertical:** Cambiar `space-y-5` a `space-y-3 sm:space-y-5` en el contenedor del step
4. **Nota "Importante":** Hacer más compacta en móvil con padding reducido

Ejemplo de la lista de beneficios en grid:
```typescript
<div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
  <div className="flex items-center gap-1.5">
    <span className="text-primary text-xs">✓</span>
    <span className="text-xs">Kit de inicio</span>
  </div>
  // ... más items
</div>
```

---

## Archivo a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/ChallengeRegistrationModal.tsx` | Agregar ref + useEffect para scroll-to-top, compactar layout del Step 4 |

---

## Resultado Esperado

1. Al avanzar a cualquier paso, el modal se scrollea automáticamente al inicio
2. El Step 4 cabe completo (o casi) en pantallas de 360-414px sin necesidad de scroll
3. La experiencia de llenado es fluida y el usuario siempre ve el título del paso actual

