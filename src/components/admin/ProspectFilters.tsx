import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, CalendarDays, ClipboardList } from "lucide-react";

interface ProspectFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sportFilter: string;
  onSportChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  onOpenCalendar: () => void;
  onOpenTasks?: () => void;
  taskCount?: number;
}

export const ProspectFilters = ({
  searchTerm,
  onSearchChange,
  sportFilter,
  onSportChange,
  categoryFilter,
  onCategoryChange,
  onOpenCalendar,
  onOpenTasks,
  taskCount = 0,
}: ProspectFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>
      
      <Select value={sportFilter} onValueChange={onSportChange}>
        <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
          <SelectValue placeholder="Deporte" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los deportes</SelectItem>
          <SelectItem value="futbol">⚽ Fútbol</SelectItem>
          <SelectItem value="basketball">🏀 Basketball</SelectItem>
        </SelectContent>
      </Select>

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full sm:w-[180px] bg-card border-border">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          <SelectItem value="biberón">🍼 Biberón</SelectItem>
          <SelectItem value="escuelita">Escuelita</SelectItem>
          <SelectItem value="estrellita">Estrellita</SelectItem>
          <SelectItem value="infantil">Infantil</SelectItem>
          <SelectItem value="juvenil">Juvenil</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onOpenCalendar}
          className="flex items-center gap-2"
        >
          <CalendarDays className="h-4 w-4" />
          <span className="hidden sm:inline">Calendario</span>
        </Button>

        {onOpenTasks && (
          <Button
            variant="outline"
            onClick={onOpenTasks}
            className="flex items-center gap-2 relative"
          >
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Tareas</span>
            {taskCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {taskCount}
              </Badge>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
