import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface ProspectFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sportFilter: string;
  onSportChange: (value: string) => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
}

export const ProspectFilters = ({
  searchTerm,
  onSearchChange,
  sportFilter,
  onSportChange,
  categoryFilter,
  onCategoryChange,
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
          <SelectItem value="escuelita">Escuelita</SelectItem>
          <SelectItem value="estrellita">Estrellita</SelectItem>
          <SelectItem value="infantil">Infantil</SelectItem>
          <SelectItem value="juvenil">Juvenil</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
