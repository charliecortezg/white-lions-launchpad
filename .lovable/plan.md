

# Plan: Actualizar Email de Confirmación para Clase Muestra Gratuita

## Problema Actual

El email `send-confirmation` tiene contenido de la versión anterior donde el flujo era "pago del Reto online". Con los cambios de hoy, el flujo es:

1. El padre agenda una **clase muestra gratuita**
2. La clase es **sin compromiso**
3. El pago del Reto solo ocurre **en campo** si decide continuar

El email actual menciona kit, pagos y garantías, lo cual genera confusión.

---

## Nuevo Contenido del Email

### Header
- **Título:** "🦁 White Lions Academy"
- **Subtítulo:** "¡Tu clase muestra está confirmada!"

### Saludo
```
¡Hola {tutor_name}! 👋

¡Excelente! {player_name} tiene reservado su lugar 
para vivir la experiencia White Lions.

Esta clase es gratuita y sin compromiso. 
Queremos que vivan la metodología antes de tomar cualquier decisión.
```

### Detalles de la Clase Muestra
```
📋 Detalles de tu Clase Muestra

🏅 Deporte: {sport}
👤 Jugador: {player_name}
👥 Categoría: {category}
📅 Fecha: {trial_date}
📍 Sede: {location}
🕐 Horario: {schedule}
```

### Qué Traer
```
📌 Para la clase muestra:

• Ropa deportiva cómoda
• Tenis adecuados (de preferencia para pasto)
• Agua o bebida hidratante
• ¡Muchas ganas de aprender!

Nosotros proporcionamos los balones y el espacio de entrenamiento.
```

### Sección "¿Qué sigue después?"
```
🤔 ¿Qué sigue después de la clase?

Si después de vivir la experiencia decides continuar, 
podrás inscribir a {player_name} en el Reto White Lions – 30 días, 
que incluye:

✓ Kit de inicio White Lions
✓ 30 días de entrenamiento estructurado
✓ Evaluaciones mensuales
✓ Acceso a la app de rendimiento
✓ Garantía de satisfacción

El pago se realiza únicamente en campo. 
Sin presiones, la decisión final es tuya.
```

### Nota de Tranquilidad
```
💡 Recuerda

La clase muestra es gratuita y sin compromiso.
Solo queremos que tu hijo viva la experiencia White Lions 
antes de tomar cualquier decisión.
```

### Cierre
```
¿Tienes preguntas? Responde a este correo 
o escríbenos por WhatsApp.

¡Nos vemos en la cancha! 🦁
El equipo de White Lions Academy
```

---

## Cambios al Subject del Email

**Antes:**
```
🦁 ¡Bienvenido al Reto White Lions! - {player_name}
```

**Después:**
```
🦁 ¡Tu clase muestra está confirmada! - {player_name}
```

---

## Secciones a ELIMINAR

| Sección | Razón |
|---------|-------|
| "🎁 Tu Kit de Inicio White Lions" | El kit solo se entrega si continúan con el Reto |
| "💳 Siguiente paso: Completar el pago" | No hay pago online |
| "Total: $700 MXN" | El pago es en campo |
| "🛡️ Nuestra garantía: te devolvemos $400 MXN" | Solo aplica si compran el Reto |

---

## Archivo a Modificar

| Archivo | Cambios |
|---------|---------|
| `supabase/functions/send-confirmation/index.ts` | Reescribir el contenido HTML del email |

---

## Resultado Esperado

1. El padre recibe un email que confirma la **clase muestra gratuita**
2. **Sin mencionar precios** ni pagos obligatorios
3. Explica claramente que **el Reto es el siguiente paso opcional**
4. Transmite tranquilidad y profesionalismo
5. Alineado con el nuevo flujo de conversión

