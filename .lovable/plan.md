

# Plan: Agregar Campos "Escuela" y "Notas" al Formulario de Registro

## Resumen

Agregar dos nuevos campos al formulario de registro:
1. **Escuela** - En el Step 1 (Datos del Jugador) para saber dónde estudia el niño
2. **Notas** - Información adicional que ayude a trabajar mejor con el jugador

---

## Cambios a la Base de Datos

La tabla `trial_class_registrations` ya tiene un campo `comments` que actualmente se guarda como `null`. Lo reutilizaremos para las notas.

Para el campo "escuela" necesitamos agregarlo a la tabla:

```sql
ALTER TABLE trial_class_registrations 
ADD COLUMN school TEXT;
```

---

## Cambios al Formulario

### 1. Actualizar Schema de Validación (línea 20-33)

Agregar los nuevos campos al schema de Zod:

```typescript
const formSchema = z.object({
  player_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  school: z.string().optional(), // NUEVO - opcional
  tutor_name: z.string().min(2, "El nombre del tutor debe tener al menos 2 caracteres"),
  tutor_email: z.string().email("Ingresa un correo electrónico válido"),
  contact_phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  birth_year: z.string().min(4, "Selecciona el año de nacimiento"),
  sport: z.enum(["Fútbol"], {
    required_error: "Selecciona un deporte",
  }).default("Fútbol"),
  category: z.string().min(1, "Selecciona una categoría"),
  start_date: z.date({
    required_error: "Selecciona una fecha de inicio",
  }),
  notes: z.string().optional(), // NUEVO - opcional
});
```

### 2. Agregar Campo "Escuela" en Step 1 (después de player_name)

Ubicación: Después del campo "Nombre del Jugador" (línea ~408)

```typescript
<FormField
  control={form.control}
  name="school"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Escuela <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
      <FormControl>
        <Input 
          placeholder="¿En qué escuela estudia?" 
          className="h-12"
          {...field} 
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 3. Agregar Campo "Notas" en Step 3 (después de los datos de contacto)

Ubicación: Al final del Step 3, antes del botón "Confirmar clase muestra"

```typescript
<FormField
  control={form.control}
  name="notes"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        ¿Algo que debamos saber? 
        <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
      </FormLabel>
      <FormControl>
        <Textarea 
          placeholder="Ej: Experiencia previa, lesiones, necesidades especiales, objetivos del jugador..."
          className="min-h-[80px] resize-none"
          {...field} 
        />
      </FormControl>
      <FormDescription className="text-xs">
        Esta información nos ayuda a personalizar la experiencia de tu hijo.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

### 4. Actualizar Submit del Formulario

Modificar tanto el INSERT como el UPDATE para incluir los nuevos campos:

**INSERT (línea ~256):**
```typescript
.insert([{
  player_name: data.player_name,
  age_or_birth_year: data.birth_year,
  tutor_name: data.tutor_name,
  contact_phone: data.contact_phone,
  parent_email: data.tutor_email,
  category: data.category,
  preferred_location: location,
  preferred_schedule: `${formattedDate} - ${schedule}`,
  school: data.school || null,         // NUEVO
  comments: data.notes || null,        // ACTUALIZADO (antes era null)
}])
```

**UPDATE (línea ~229):**
```typescript
.update({
  player_name: data.player_name,
  age_or_birth_year: data.birth_year,
  tutor_name: data.tutor_name,
  contact_phone: data.contact_phone,
  parent_email: data.tutor_email,
  category: data.category,
  preferred_location: location,
  preferred_schedule: `${formattedDate} - ${schedule}`,
  school: data.school || null,         // NUEVO
  comments: data.notes || null,        // ACTUALIZADO
  status: newStatus,
  // ... resto de campos
})
```

### 5. Agregar Import de Textarea

```typescript
import { Textarea } from "@/components/ui/textarea";
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/ChallengeRegistrationModal.tsx` | Schema, campos de formulario, submit |

## Migración SQL

```sql
ALTER TABLE trial_class_registrations ADD COLUMN school TEXT;
```

---

## UX del Formulario Actualizado

**Step 1 - Datos del Jugador:**
```
┌────────────────────────────────────────┐
│  ⚽ Fútbol                              │
├────────────────────────────────────────┤
│  Nombre del Jugador*                   │
│  [___________________________]         │
│                                        │
│  Escuela (opcional)                    │
│  [___________________________]         │
│                                        │
│  Año de Nacimiento*                    │
│  [Selecciona el año ▼]                 │
│                                        │
│  Categoría*                            │
│  [Selecciona categoría ▼]              │
│                                        │
│  [Continuar →]                         │
└────────────────────────────────────────┘
```

**Step 3 - Datos de Contacto:**
```
┌────────────────────────────────────────┐
│  Nombre del Padre/Tutor*               │
│  [___________________________]         │
│                                        │
│  Correo Electrónico*                   │
│  [___________________________]         │
│                                        │
│  Teléfono WhatsApp*                    │
│  [___________________________]         │
│                                        │
│  ¿Algo que debamos saber? (opcional)   │
│  ┌──────────────────────────────────┐  │
│  │ Ej: Experiencia previa, lesiones,│  │
│  │ necesidades especiales...        │  │
│  └──────────────────────────────────┘  │
│  Esta info nos ayuda a personalizar    │
│  la experiencia de tu hijo.            │
│                                        │
│  [← Atrás]  [Confirmar clase muestra]  │
└────────────────────────────────────────┘
```

---

## Notas Técnicas

- Ambos campos son **opcionales** para no aumentar fricción
- El campo `comments` ya existe en la tabla, solo lo estamos utilizando
- El campo `school` requiere una migración SQL
- Los datos de escuela y notas serán visibles en el panel admin para ayudar al equipo

