## Problema actual

En `/veranofutcenter` los botones de Stripe están en la sección **PAQUETES** como links directos. Si un papá hace clic ahí y paga, **no tenemos su información** (nombre, WhatsApp, jugador, edad, grupo, mes). Solo nos llega el correo de Stripe sin contexto — no sabemos a quién contactar ni para qué grupo.

Además, los leads del formulario hoy se mandan solo por email (no se guardan), porque la migración de la tabla no se había aprobado.

## Solución

**Pago obligatoriamente después del formulario.** Los links directos de Stripe se quitan de las tarjetas de paquetes y se reemplazan por un botón "Apartar este paquete →" que hace scroll a `#registro` con el paquete pre-seleccionado. El pago solo se desbloquea después de guardar el lead.

### Cambios

**1. Migración — crear tabla `leads_verano`**

Campos:
- `nombre_padre`, `telefono`, `nombre_jugador`, `edad_jugador`, `grupo`, `mes_interes`, `paquete_interes`, `fuente`, `estado`, `stripe_clicked` (bool), `stripe_link_clicked` (text)

RLS:
- Cualquiera puede insertar (formulario público)
- Solo admins/staff pueden ver, actualizar, borrar

**2. Edge function `send-verano-lead`**

Después de enviar el email, también inserta en `leads_verano` usando service role.

**3. Página `VeranoFutcenter.tsx`**

- En las 3 tarjetas de PAQUETES: quitar links directos a Stripe. Reemplazar con un solo botón navy "Apartar este paquete →" que hace scroll a `#registro` y pre-selecciona el paquete + opción de pago (completo / depósito) en el formulario.
- Agregar campo "Forma de pago" en el formulario cuando el paquete elegido tiene depósito (Mes completo, 2 semanas):
  - Pago completo
  - Depósito para apartar
- Flujo al enviar formulario:
  1. Validar con zod
  2. Llamar edge function → guarda en DB + manda email a admin
  3. Solo si guarda OK → mostrar pantalla de confirmación con **un solo botón** que lleva al link exacto de Stripe correspondiente (paquete + forma de pago)
  4. Si paquete = "Día suelto" → toast "Te contactamos por WhatsApp" sin Stripe
- Eliminar el modal con dos botones de pago (ya no se necesita, la elección se hace en el form)

### Resultado

Ningún papá puede llegar a Stripe sin antes haber dejado sus datos en la base de datos. Cada pago queda ligado 1:1 a un registro en `leads_verano`.

### Nota técnica

El flujo aún depende de que el papá haga clic en el botón final de Stripe. Si abandona ahí, al menos tenemos el lead capturado para darle seguimiento por WhatsApp.
