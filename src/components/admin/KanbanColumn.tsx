import { Badge } from "@/components/ui/badge";
import { ProspectCard } from "./ProspectCard";
import type { Tables } from "@/integrations/supabase/types";

type Prospect = Tables<"trial_class_registrations">;

interface KanbanColumnProps {
  title: string;
  status: string;
  prospects: Prospect[];
  colorClass: string;
  onStatusChange: (id: string, status: string) => void;
  onOpenNotes: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
}

export const KanbanColumn = ({
  title,
  status,
  prospects,
  colorClass,
  onStatusChange,
  onOpenNotes,
  onDelete,
}: KanbanColumnProps) => {
  const filteredProspects = prospects.filter((p) => p.status === status);

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold ${colorClass}`}>{title}</h3>
          <Badge variant="secondary" className="bg-background">
            {filteredProspects.length}
          </Badge>
        </div>

        <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {filteredProspects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sin prospectos
            </p>
          ) : (
            filteredProspects.map((prospect) => (
              <ProspectCard
                key={prospect.id}
                prospect={prospect}
                onStatusChange={onStatusChange}
                onOpenNotes={onOpenNotes}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};
