import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Calendar, Clock, User, Users, MessageSquare } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Prospect = Tables<"trial_class_registrations">;

interface ProspectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: Prospect | null;
}

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatWhatsAppLink = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneWithCode = cleanPhone.startsWith("52") ? cleanPhone : `52${cleanPhone}`;
  return `https://wa.me/${phoneWithCode}`;
};

const getSportIcon = (category: string) => {
  const lowerCategory = category.toLowerCase();
  if (lowerCategory.includes("basket") || lowerCategory.includes("baloncesto")) {
    return "🏀";
  }
  return "⚽";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Pendiente":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "Asistió":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "No Asistió":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "Reprogramado":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "Inscrito":
      return "bg-primary/20 text-primary border-primary/30";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const ProspectDetailsModal = ({
  isOpen,
  onClose,
  prospect,
}: ProspectDetailsModalProps) => {
  if (!prospect) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground">
            <span className="text-2xl">{getSportIcon(prospect.category)}</span>
            <div>
              <span className="text-xl">{prospect.player_name}</span>
              <Badge className={`ml-3 ${getStatusColor(prospect.status)}`}>
                {prospect.status}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Fechas importantes */}
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Fechas
            </h4>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fecha de registro:</span>
                <span className="text-foreground font-medium">
                  {formatFullDate(prospect.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Horario preferido:</span>
                <span className="text-foreground font-medium">
                  {prospect.preferred_schedule}
                </span>
              </div>
            </div>
          </div>

          {/* Información del jugador */}
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Jugador
            </h4>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="text-foreground font-medium">{prospect.player_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Año de nacimiento:</span>
                <span className="text-foreground font-medium">{prospect.age_or_birth_year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Categoría:</span>
                <span className="text-foreground font-medium">{prospect.category}</span>
              </div>
              {(prospect as any).school && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escuela:</span>
                  <span className="text-foreground font-medium">{(prospect as any).school}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información del tutor */}
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Tutor / Contacto
            </h4>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="text-foreground font-medium">{prospect.tutor_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="text-foreground font-medium">{prospect.contact_phone}</span>
              </div>
              {prospect.parent_email && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground font-medium truncate max-w-[200px]">
                    {prospect.parent_email}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" asChild className="flex-1">
                <a
                  href={formatWhatsAppLink(prospect.contact_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  WhatsApp
                </a>
              </Button>
              {prospect.parent_email && (
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <a href={`mailto:${prospect.parent_email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Ubicación */}
          <div className="bg-background/50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Ubicación preferida
            </h4>
            <p className="text-foreground">{prospect.preferred_location}</p>
          </div>

          {/* Comentarios del usuario */}
          {prospect.comments && (
            <div className="bg-background/50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Comentarios del usuario
              </h4>
              <p className="text-muted-foreground text-sm">{prospect.comments}</p>
            </div>
          )}

          {/* Notas internas */}
          {prospect.notes && (
            <div className="bg-primary/10 rounded-lg p-4 space-y-3 border border-primary/20">
              <h4 className="font-semibold text-primary flex items-center gap-2">
                📝 Notas internas
              </h4>
              <p className="text-foreground text-sm">{prospect.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
