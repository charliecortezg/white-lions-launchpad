

# Plan: Modal de Calendario para Visualización de Clases Muestra

## Resumen

Agregar un botón de calendario en el panel de administración que abra un modal con vista de calendario mensual. Las fechas con clases muestra programadas se resaltan con indicadores visuales, y al hacer click en una fecha se muestran los prospectos de ese día con acciones rápidas.

---

## Vista Propuesta

```text
+------------------------------------------------------------------+
|  🦁 WHITE LIONS - Panel de Seguimiento                           |
|  [Filtros...] [📅 Ver Calendario]  <-- Nuevo botón               |
+------------------------------------------------------------------+

              MODAL DE CALENDARIO
+------------------------------------------------------------------+
|  📅 Calendario de Clases Muestra              [← Enero 2026 →]   |
+------------------------------------------------------------------+
|  Lun   Mar   Mié   Jue   Vie   Sáb   Dom                         |
|  ···   ···   ···   ···   ···   ···   ···                         |
|  26    27    28    29    30    31    1                           |
|  (3)   (1)   (2)        (1)                                      |
|  🔵🔵  🟢    🔵🟡                🔵                              |
+------------------------------------------------------------------+
|                                                                   |
|  📅 Miércoles 28 de enero                                        |
|  ─────────────────────────────────────────                       |
|  ⚽ Addai Gamez         | Pendiente  | [✓] [✗] [📱]             |
|  ⚽ Ender Vargas        | Pendiente  | [✓] [✗] [📱]             |
|  ─────────────────────────────────────────                       |
|  Leyenda: 🔵 Pendiente  🟢 Asistió  🔴 No asistió  🟡 Reprogramado|
+------------------------------------------------------------------+
```

---

## Funcionalidades para CEO

### 1. Vista Mensual con Indicadores
- Cada día muestra cuántas clases hay programadas
- Puntos de colores indican el status de cada clase
- Navegación fácil entre meses

### 2. Al Seleccionar una Fecha
- Lista de todos los prospectos de ese día
- Botones de acción rápida:
  - ✓ Marcar como "Asistió"
  - ✗ Marcar como "No Asistió"
  - 📱 Contactar por WhatsApp
- Click en nombre para ver detalles completos

### 3. Contadores Rápidos
- Total de clases del mes
- Desglose por status (Pendientes, Asistieron, etc.)
- Tasa de conversión del mes

### 4. Filtros Integrados
- Los mismos filtros de deporte/categoría aplican al calendario

---

## Lógica de Extracción de Fechas

El campo `preferred_schedule` tiene formato:
```text
"miércoles 28 de enero - Lunes y miércoles, 6:00–8:00 pm"
```

Se parseará extrayendo "28 de enero" y combinándolo con el año actual para obtener la fecha real de la clase muestra.

---

## Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/components/admin/CalendarModal.tsx` | Modal principal con calendario y lista de prospectos |

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/AdminPanel.tsx` | Agregar botón y estado para abrir el modal de calendario |
| `src/components/admin/ProspectFilters.tsx` | Agregar botón de calendario junto a los filtros |

---

## Diseño del Componente CalendarModal

### Estructura
```text
<Dialog>
  <DialogContent className="max-w-4xl">
    
    <!-- Header con stats del mes -->
    <div className="grid grid-cols-4">
      <Stat label="Total" value={15} />
      <Stat label="Pendientes" value={8} color="blue" />
      <Stat label="Asistieron" value={5} color="green" />
      <Stat label="No Asistió" value={2} color="red" />
    </div>
    
    <!-- Calendario -->
    <Calendar 
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      modifiers={{ hasEvents: datesWithClasses }}
      modifiersStyles={{ hasEvents: {...} }}
    />
    
    <!-- Lista de prospectos del día seleccionado -->
    <div className="mt-4">
      {selectedDateProspects.map(prospect => (
        <ProspectRow 
          prospect={prospect}
          onMarkAttended={...}
          onMarkNoShow={...}
          onWhatsApp={...}
        />
      ))}
    </div>
    
  </DialogContent>
</Dialog>
```

### Props
```text
interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: Prospect[];
  onStatusChange: (id: string, status: string) => void;
  onViewDetails: (prospect: Prospect) => void;
}
```

---

## Flujo de Usuario

```text
1. CEO abre el panel admin (/admin-panel)

2. Click en botón "📅 Calendario"

3. Se abre modal con:
   - Stats del mes actual (conversiones, pendientes, etc.)
   - Calendario con fechas resaltadas donde hay clases
   - Hoy resaltado por defecto

4. Click en una fecha específica:
   - Debajo del calendario aparece lista de prospectos
   - Cada fila tiene nombre, status, y botones de acción

5. Acción rápida:
   - Click en ✓ → Marca como "Asistió" (sin confirmación)
   - Click en ✗ → Marca como "No Asistió"
   - Click en 📱 → Abre WhatsApp

6. Click en nombre del prospecto:
   - Abre el modal de detalles existente
```

---

## Sección Técnica

### Parseo de Fechas
```text
function parseTrialDate(preferredSchedule: string): Date | null {
  // Input: "miércoles 28 de enero - Lunes y miércoles, 6:00–8:00 pm"
  // Regex para extraer: "28 de enero"
  const match = preferredSchedule.match(/(\d{1,2})\s+de\s+(\w+)/i);
  if (!match) return null;
  
  const day = parseInt(match[1]);
  const monthName = match[2].toLowerCase();
  const monthMap = { enero: 0, febrero: 1, marzo: 2, ... };
  const month = monthMap[monthName];
  const year = new Date().getFullYear();
  
  return new Date(year, month, day);
}
```

### Agrupación por Fecha
```text
const prospectsByDate = useMemo(() => {
  const map = new Map<string, Prospect[]>();
  
  prospects.forEach(prospect => {
    const date = parseTrialDate(prospect.preferred_schedule);
    if (date) {
      const key = format(date, 'yyyy-MM-dd');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(prospect);
    }
  });
  
  return map;
}, [prospects]);
```

### Indicadores en Calendario
Uso de `modifiers` de react-day-picker para resaltar días con eventos:
```text
<Calendar
  modifiers={{
    hasEvents: (date) => prospectsByDate.has(format(date, 'yyyy-MM-dd')),
    hasPending: (date) => getStatusForDate(date).includes('Pendiente'),
    hasCompleted: (date) => getStatusForDate(date).includes('Asistió'),
  }}
  components={{
    DayContent: ({ date }) => (
      <div className="relative">
        {date.getDate()}
        {/* Indicadores de color debajo del número */}
      </div>
    )
  }}
/>
```

### Dependencias
No se requieren nuevas dependencias:
- `react-day-picker` ya está instalado (v8.10.1)
- `date-fns` ya está instalado (v3.6.0)
- Componentes UI existentes (Dialog, Button, Badge, etc.)

### Actualización del Calendario
```text
className={cn("p-3 pointer-events-auto", className)}
```
Se agregará `pointer-events-auto` al Calendar para asegurar interactividad dentro del modal.

---

## Resultado Final

Un calendario visual que permite al CEO:

1. Ver de un vistazo cuántas clases hay cada día
2. Identificar rápidamente por colores el status de cada clase
3. Hacer check-in masivo de asistencia desde una sola vista
4. Contactar padres directamente sin navegar entre tarjetas
5. Monitorear métricas de conversión del mes

