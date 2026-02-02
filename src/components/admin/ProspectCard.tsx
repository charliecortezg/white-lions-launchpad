import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  MessageSquare, 
  Phone,
  CheckCircle,
  XCircle,
  Calendar,
  Trophy,
  Clock,
  StickyNote,
  Trash2,
  UserCheck,
  CalendarClock
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Prospect = Tables<"trial_class_registrations">;

interface ProspectCardProps {
  prospect: Prospect;
  onStatusChange: (id: string, status: string) => void;
  onOpenNotes: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onViewDetails: (prospect: Prospect) => void;
  onMarkAttended?: (prospect: Prospect) => void;
  onMarkNoShow?: (prospect: Prospect) => void;
  onReschedule?: (prospect: Prospect) => void;
  onMarkEnrolled?: (prospect: Prospect) => void;
}

const STATUS_OPTIONS = [
  { value: "Pendiente", label: "Pendiente", icon: Clock, color: "text-blue-400" },
  { value: "Asistió", label: "Asistió", icon: CheckCircle, color: "text-green-400" },
  { value: "No Asistió", label: "No Asistió", icon: XCircle, color: "text-red-400" },
  { value: "Reprogramado", label: "Reprogramado", icon: Calendar, color: "text-yellow-400" },
  { value: "Inscrito", label: "Inscrito", icon: Trophy, color: "text-primary" },
];

const getSportIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes("basket") || lowerCategory.includes("baloncesto")) {
    return "🏀";
  }
  return "⚽";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

const formatWhatsAppLink = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneWithCode = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
  return `https://wa.me/${phoneWithCode}`;
};

export const ProspectCard = ({ 
  prospect, 
  onStatusChange, 
  onOpenNotes,
  onDelete,
  onViewDetails,
  onMarkAttended,
  onMarkNoShow,
  onReschedule,
  onMarkEnrolled,
}: ProspectCardProps) => {
  const canShowQuickActions = prospect.status === "Pendiente" || prospect.status === "Reprogramado";
  const canEnroll = prospect.status === "Asistió";

  return (
    <Card 
      className="bg-background/50 border-border hover:border-primary/30 transition-colors cursor-pointer"
      onClick={() => onViewDetails(prospect)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getSportIcon(prospect.category)}</span>
              <h4 className="font-semibold text-foreground truncate">
                {prospect.player_name}
              </h4>
              {prospect.notes && (
                <StickyNote className="h-3 w-3 text-primary shrink-0" />
              )}
            </div>
            
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="truncate">{prospect.category}</p>
              <p>{formatDate(prospect.created_at)}</p>
              <p className="truncate">{prospect.tutor_name}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              {/* Quick Actions for pending/rescheduled */}
              {canShowQuickActions && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAttended?.(prospect);
                    }}
                    className="flex items-center gap-2 text-green-600"
                  >
                    <UserCheck className="h-4 w-4" />
                    ✅ Marcar Asistió
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkNoShow?.(prospect);
                    }}
                    className="flex items-center gap-2 text-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                    ❌ Marcar No Asistió
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onReschedule?.(prospect);
                    }}
                    className="flex items-center gap-2"
                  >
                    <CalendarClock className="h-4 w-4" />
                    📅 Reprogramar
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Quick action for attended - can enroll */}
              {canEnroll && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkEnrolled?.(prospect);
                    }}
                    className="flex items-center gap-2 text-primary"
                  >
                    <Trophy className="h-4 w-4" />
                    🏆 Marcar Inscrito
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Status submenu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Cambiar Estado
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(prospect.id, option.value);
                      }}
                      className="flex items-center gap-2"
                    >
                      <option.icon className={`h-4 w-4 ${option.color}`} />
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNotes(prospect);
                }}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {prospect.notes ? "Ver/Editar Notas" : "Agregar Nota"}
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild>
                <a
                  href={formatWhatsAppLink(prospect.contact_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="h-4 w-4 text-emerald-500" />
                  WhatsApp
                </a>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(prospect.id);
                }}
                className="flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-3 flex gap-2">
          <Badge variant="outline" className="text-xs">
            {prospect.preferred_location}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
