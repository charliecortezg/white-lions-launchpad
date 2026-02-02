import { KanbanColumn } from "./KanbanColumn";
import type { Tables } from "@/integrations/supabase/types";

type Prospect = Tables<"trial_class_registrations">;

interface KanbanBoardProps {
  prospects: Prospect[];
  onStatusChange: (id: string, status: string) => void;
  onOpenNotes: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onViewDetails: (prospect: Prospect) => void;
  onMarkAttended?: (prospect: Prospect) => void;
  onMarkNoShow?: (prospect: Prospect) => void;
  onReschedule?: (prospect: Prospect) => void;
  onMarkEnrolled?: (prospect: Prospect) => void;
}

const COLUMNS = [
  { status: "Pendiente", title: "Pendiente", colorClass: "text-blue-400" },
  { status: "Asistió", title: "Asistió", colorClass: "text-green-400" },
  { status: "No Asistió", title: "No Asistió", colorClass: "text-red-400" },
  { status: "Reprogramado", title: "Reprogramado", colorClass: "text-yellow-400" },
  { status: "Inscrito", title: "Inscrito", colorClass: "text-primary" },
];

export const KanbanBoard = ({
  prospects,
  onStatusChange,
  onOpenNotes,
  onDelete,
  onViewDetails,
  onMarkAttended,
  onMarkNoShow,
  onReschedule,
  onMarkEnrolled,
}: KanbanBoardProps) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => (
        <KanbanColumn
          key={column.status}
          title={column.title}
          status={column.status}
          prospects={prospects}
          colorClass={column.colorClass}
          onStatusChange={onStatusChange}
          onOpenNotes={onOpenNotes}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
          onMarkAttended={onMarkAttended}
          onMarkNoShow={onMarkNoShow}
          onReschedule={onReschedule}
          onMarkEnrolled={onMarkEnrolled}
        />
      ))}
    </div>
  );
};
