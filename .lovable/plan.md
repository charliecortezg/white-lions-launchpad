

# Plan: Arreglar Eliminación de Prospectos

## Problema Identificado

El error ocurre porque el SDK de Supabase Functions no envía correctamente el body en requests DELETE. Los logs de la Edge Function muestran:

```
Error: SyntaxError: Unexpected end of JSON input
```

Esto sucede en la línea 274 de `admin-prospects/index.ts` cuando intenta hacer `await req.json()` en un DELETE request que llega sin body.

## Solución Recomendada

Cambiar la lógica de eliminación para usar **POST con action="delete"** en lugar de DELETE method. Esto es más robusto y consistente con las otras acciones que ya usan POST.

---

## Cambios en la Edge Function

**Archivo:** `supabase/functions/admin-prospects/index.ts`

Agregar un nuevo case en el POST handler:

```typescript
if (action === "delete") {
  // First, delete related records in email_queue
  await supabase
    .from("email_queue")
    .delete()
    .eq("prospect_id", id);
    
  // Delete related reprogram_tokens
  await supabase
    .from("reprogram_tokens")
    .delete()
    .eq("prospect_id", id);
    
  // Delete the prospect
  const { error } = await supabase
    .from("trial_class_registrations")
    .delete()
    .eq("id", id);

  if (error) throw error;

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

**Nota importante:** También se deben eliminar los registros relacionados en `email_queue` y `reprogram_tokens` antes de eliminar el prospecto, ya que aunque no hay FK constraints, mantiene la integridad de los datos.

---

## Cambios en el Frontend

**Archivo:** `src/pages/AdminPanel.tsx`

Cambiar la mutación de DELETE para usar POST:

```typescript
// Delete prospect mutation
const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const { data, error } = await supabase.functions.invoke("admin-prospects", {
      method: "POST",  // Cambiado de DELETE a POST
      body: { id, action: "delete" },  // Agregar action
    });
    if (error) throw error;
    return data;
  },
  // ... resto igual
});
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/admin-prospects/index.ts` | Agregar handler para `action === "delete"` en POST |
| `src/pages/AdminPanel.tsx` | Cambiar `method: "DELETE"` a `method: "POST"` con `action: "delete"` |

---

## Opcional: Mantener Compatibilidad con DELETE

Si quieres mantener el método DELETE funcionando (para APIs RESTful), puedes hacer que lea el ID de los query parameters:

```typescript
// DELETE - Remove prospect (using query param for ID)
if (req.method === "DELETE") {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  
  if (!id) {
    return new Response(
      JSON.stringify({ error: "ID is required as query parameter" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  // ... resto del delete logic
}
```

---

## Pruebas de Aceptación

1. **Eliminar prospecto dummy:** Ir al admin panel, hacer click en Eliminar en cualquier tarjeta → debe eliminarse sin error
2. **Verificar integridad:** Después de eliminar, verificar que no quedan registros huérfanos en `email_queue` ni `reprogram_tokens`

