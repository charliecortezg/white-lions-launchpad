

# Plan: Agregar Botón "Cómo Llegar" con Link a Google Maps en los Emails

## Resumen

Agregar un botón prominente en todos los emails (confirmación y recordatorios) que lleve directamente a la ubicación del campo según el deporte seleccionado.

---

## Enlaces de Google Maps

| Ubicación | Deporte | Link |
|-----------|---------|------|
| Hacienda del Bosque | Fútbol | `https://maps.app.goo.gl/QUwr6WjptEKwRg6b8` |
| Parque Quinta del Rey III | Basketball | `https://maps.app.goo.gl/1o1iuUroqA4yD86M8` |

---

## Archivo 1: `supabase/functions/send-confirmation/index.ts`

### Cambios Requeridos

**1. Agregar función helper para obtener el link de Google Maps:**

```text
const getLocationMapLink = (location: string): string => {
  if (location.toLowerCase().includes('hacienda') || location.toLowerCase().includes('bosque')) {
    return 'https://maps.app.goo.gl/QUwr6WjptEKwRg6b8';
  }
  if (location.toLowerCase().includes('quinta') || location.toLowerCase().includes('rey')) {
    return 'https://maps.app.goo.gl/1o1iuUroqA4yD86M8';
  }
  return '';
};
```

**2. Agregar botón "Cómo Llegar" en el HTML del email:**

Despues de la tabla de detalles (linea ~84), agregar:

```text
+--------------------------------------+
|  📍 CÓMO LLEGAR                      |
|  [Botón dorado con link a Maps]      |
+--------------------------------------+
```

**Diseño del botón:**
- Fondo dorado (#d4af37)
- Texto negro
- Bordes redondeados
- Padding generoso para facil tap en movil
- Icono de ubicación

---

## Archivo 2: `supabase/functions/run-reminders/index.ts`

### Cambios Requeridos

**1. Agregar función para obtener link de Maps basado en ubicación/deporte:**

Similar al archivo anterior, determinar el link según:
- Si es Fútbol → Hacienda del Bosque
- Si es Basketball → Parque Quinta del Rey III

**2. Agregar botón en el HTML del recordatorio:**

Después de la tabla de detalles (línea ~295), agregar el mismo botón "Cómo Llegar" con el link correspondiente.

---

## Diseño del Botón en Email (HTML)

```text
<div style="text-align: center; margin: 25px 0;">
  <a href="[LINK_MAPS]" 
     style="display: inline-block; 
            background-color: #d4af37; 
            color: #1a1a2e; 
            padding: 16px 32px; 
            border-radius: 8px; 
            text-decoration: none; 
            font-weight: bold; 
            font-size: 16px;">
    📍 Cómo Llegar
  </a>
</div>
```

---

## Lógica de Selección de Link

| Campo `location` contiene | Link asignado |
|---------------------------|---------------|
| "hacienda" o "bosque" | Hacienda del Bosque |
| "quinta" o "rey" | Parque Quinta del Rey III |
| Fallback: usar `sport` | Fútbol → Hacienda, Basketball → Quinta |

---

## Resultado Esperado

El padre recibe un email con:

```text
+----------------------------------------+
|  🦁 WHITE LIONS ACADEMY                |
|  Confirmación de Clase Muestra         |
+----------------------------------------+
|                                        |
|  ¡Hola Juan!                           |
|                                        |
|  📋 Detalles:                          |
|  - Jugador: Pedrito                    |
|  - Deporte: Fútbol                     |
|  - Fecha: miércoles 15 de enero       |
|  - Ubicación: Hacienda del Bosque     |
|                                        |
|  +----------------------------------+  |
|  |   📍 CÓMO LLEGAR                 |  |
|  +----------------------------------+  |
|                                        |
|  📌 Recuerda: Llega 10 min antes...   |
+----------------------------------------+
```

---

## Seccion Tecnica

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/functions/send-confirmation/index.ts` | Agregar helper + botón HTML |
| `supabase/functions/run-reminders/index.ts` | Agregar helper + botón HTML |

### Despliegue

Las Edge Functions se despliegan automáticamente al guardar los cambios.

### Sin Dependencias Nuevas

No se requieren librerías adicionales.

