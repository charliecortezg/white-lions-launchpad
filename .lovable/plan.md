

# Plan: Conectar datos de Biberon al calendario y CRM

## Problema

Los datos de la lista de espera (Biberon) existen en la base de datos (10 registros), pero no se muestran en el panel admin. La causa es que el header personalizado `x-type: waitlist` no esta incluido en los headers CORS permitidos del edge function, por lo que el navegador lo descarta durante la solicitud.

## Solucion

Cambiar la forma en que se solicitan los datos de waitlist: usar un query parameter (`?type=waitlist`) en lugar de un header personalizado, lo cual es mas robusto y no requiere configuracion CORS adicional.

## Cambios

### 1. Edge function `supabase/functions/admin-prospects/index.ts`

- Leer el parametro `type` de la URL en lugar del header `x-type`
- Cambiar `req.headers.get("x-type")` por `new URL(req.url).searchParams.get("type")`
- Agregar `x-type` a los CORS allowed headers como respaldo

### 2. Admin Panel `src/pages/AdminPanel.tsx`

- Cambiar la query de waitlist para pasar `type=waitlist` como query parameter en el body o en la URL
- En `supabase.functions.invoke`, cambiar de `headers: { "x-type": "waitlist" }` a usar el body con un flag, enviando via POST con `{ action: "list_waitlist" }`

### Enfoque final (mas limpio)

Usar POST con body `{ action: "list_waitlist" }` para el fetch de waitlist, ya que es la forma mas confiable con `supabase.functions.invoke`.

**Edge function:** Agregar handler para `action === "list_waitlist"` dentro del bloque POST, antes de verificar `id`.

**AdminPanel:** Cambiar el query de waitlist a:
```
supabase.functions.invoke("admin-prospects", {
  method: "POST",
  body: { action: "list_waitlist" },
})
```

### Detalle tecnico del edge function

Reestructurar el bloque POST para:
1. Primero verificar si `action === "list_waitlist"` (no requiere `id`)
2. Luego continuar con la logica existente que requiere `id`

Esto no afecta ninguna funcionalidad existente.

