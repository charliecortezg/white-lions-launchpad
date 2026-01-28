

# Plan: Panel de Seguimiento Kanban para Clases Muestra

## Resumen

Crear un panel administrativo estilo Kanban en `/admin-panel` que permita visualizar y gestionar el pipeline de clases muestra. Las tarjetas de prospectos se organizan en columnas según su status y pueden arrastrarse entre estados.

---

## Vista del Panel Kanban

```text
+------------------------------------------------------------------+
|  🦁 WHITE LIONS - Panel de Seguimiento                           |
|  [Filtro: Deporte ▾] [Filtro: Categoría ▾] [Buscar...]           |
+------------------------------------------------------------------+
|                                                                   |
|  PENDIENTE (5)    ASISTIÓ (3)    NO ASISTIÓ (2)    INSCRITO (1)  |
|  +-----------+    +-----------+   +-----------+    +-----------+ |
|  |  Pedrito  |    |  María    |   |  Carlos   |    |  Ana      | |
|  |  ⚽ Fútbol|    |  🏀 Basket|   |  ⚽ Fútbol|    |  ⚽ Fútbol| |
|  |  Escuelita|    |  Infantil |   |  Juvenil A|    |  Estrella | |
|  |  Mié 28   |    |  Mar 27   |   |  Lun 26   |    |  Lun 26   | |
|  |  [📝 Nota]|    |  [📝 Nota]|   |  [📝 Nota]|    |  [📝 Nota]| |
|  +-----------+    +-----------+   +-----------+    +-----------+ |
|  |  Juan     |    |  ...      |   |  ...      |                  |
|  +-----------+    +-----------+   +-----------+                  |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Columnas del Kanban (Status)

| Columna | Color | Descripción |
|---------|-------|-------------|
| Pendiente | Azul | Clase programada, aún no ocurre |
| Asistió | Verde | El niño asistió a la clase muestra |
| No Asistió | Rojo | No se presentó a la clase |
| Reprogramado | Amarillo | Se agendó otra fecha |
| Inscrito | Dorado | ¡Conversión exitosa! |

---

## Funcionalidades

### 1. Tarjetas de Prospecto
Cada tarjeta muestra:
- Nombre del jugador
- Icono de deporte (⚽/🏀)
- Categoría
- Fecha programada
- Teléfono de contacto (click para WhatsApp)
- Botón para agregar/ver notas

### 2. Cambio de Status
- Click en botones de acción rápida en la tarjeta
- O menú dropdown con todas las opciones
- El status se actualiza inmediatamente en la base de datos

### 3. Filtros
- Por deporte: Fútbol / Basketball / Todos
- Por categoría: Escuelita / Estrellita / Infantil / Juvenil
- Búsqueda por nombre

### 4. Notas
- Modal para agregar observaciones
- Las notas se guardan en el campo `notes` existente
- Icono indicador cuando hay notas

---

## Archivos Nuevos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/pages/AdminPanel.tsx` | Página principal del panel Kanban |
| `src/components/admin/KanbanBoard.tsx` | Componente del tablero con columnas |
| `src/components/admin/KanbanColumn.tsx` | Columna individual con tarjetas |
| `src/components/admin/ProspectCard.tsx` | Tarjeta de cada prospecto |
| `src/components/admin/NotesModal.tsx` | Modal para agregar/editar notas |
| `src/components/admin/ProspectFilters.tsx` | Barra de filtros |

---

## Cambios en Archivos Existentes

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Agregar ruta `/admin-panel` |

---

## Esquema de Base de Datos

### Campo `status` - Valores permitidos

Actualmente solo existe "Pendiente". Agregaremos los demás valores posibles:

```text
Valores de status:
- "Pendiente"     (default actual)
- "Asistió"
- "No Asistió"
- "Reprogramado"
- "Inscrito"
```

No se requiere migración de esquema ya que el campo `status` es de tipo `text` y acepta cualquier valor.

---

## Lógica de Consultas

### Cargar Prospectos
```text
SELECT * FROM trial_class_registrations
ORDER BY created_at DESC
```

### Actualizar Status
```text
UPDATE trial_class_registrations
SET status = 'Asistió'
WHERE id = [prospect_id]
```

### Actualizar Notas
```text
UPDATE trial_class_registrations
SET notes = 'Muy interesado, papá preguntó por mensualidad'
WHERE id = [prospect_id]
```

---

## Diseño Visual

### Estilo consistente con el tema Dark Premium:
- Fondo: `bg-background` (#0F172A)
- Columnas: `bg-card` (#1E293B) con bordes sutiles
- Tarjetas: `bg-background` con hover dorado sutil
- Headers de columna con badge de conteo
- Iconos de deporte con colores distintivos

### Acceso
- URL: `/admin-panel`
- Sin protección de login (URL oculta como solicitaste)
- No aparece en la navegación pública

---

## Flujo de Usuario

```text
1. Admin navega a: tudominio.com/admin-panel

2. Ve el tablero Kanban con todas las clases muestra

3. Puede filtrar por deporte (Fútbol/Basketball)

4. Click en tarjeta → Menú de opciones:
   - Marcar como "Asistió"
   - Marcar como "No Asistió"
   - Reprogramar
   - Marcar como "Inscrito"
   - Agregar nota
   - Llamar por WhatsApp

5. Al cambiar status, la tarjeta se mueve a la columna correspondiente

6. Las notas se guardan y aparece un indicador visual
```

---

## Sección Técnica

### Dependencias
No se requieren nuevas dependencias. Usaremos:
- React Query (ya instalado) para data fetching
- Supabase client (ya configurado)
- Componentes UI existentes (Card, Button, Dialog, etc.)

### Políticas RLS
Las políticas actuales permiten que cualquiera haga INSERT pero solo admin/staff pueden SELECT y UPDATE. Para la URL oculta sin login:
- **Problema**: Los usuarios anónimos no podrán leer los datos por RLS
- **Solución**: Necesitamos agregar una política temporal que permita SELECT sin autenticación, o implementar login básico

**Opción recomendada**: Agregar login con usuario ya existente en Supabase Auth para aprovechar las políticas RLS que ya están configuradas para admin/staff.

### Alternativa sin login
Si insistes en URL oculta sin login, podemos crear un Edge Function que lea los datos con service_role key y los devuelva al frontend. Esto bypassea RLS pero es menos seguro.

