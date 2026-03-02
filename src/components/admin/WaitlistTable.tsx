import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type WaitlistRegistration = Tables<"waitlist_registrations">;

interface WaitlistTableProps {
  registrations: WaitlistRegistration[];
  searchTerm: string;
}

export const WaitlistTable = ({ registrations, searchTerm }: WaitlistTableProps) => {
  const filtered = registrations.filter((r) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      r.child_name.toLowerCase().includes(search) ||
      r.parent_name.toLowerCase().includes(search)
    );
  });

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Jugador</TableHead>
            <TableHead>Año Nac.</TableHead>
            <TableHead>Tutor</TableHead>
            <TableHead>WhatsApp</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Escuela</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Registro</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No hay registros en la lista de espera.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>🍼</span>
                    {entry.child_name}
                  </div>
                </TableCell>
                <TableCell>{entry.child_birth_year || "—"}</TableCell>
                <TableCell>{entry.parent_name}</TableCell>
                <TableCell className="text-sm">{entry.parent_whatsapp}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.parent_email || "—"}</TableCell>
                <TableCell className="text-sm">{entry.school || "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      entry.status === "accepted"
                        ? "bg-green-500/10 text-green-400 border-green-500/30"
                        : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {entry.status === "accepted" ? "✅ Aceptado" : "⏳ En espera"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(entry.created_at), "d MMM yyyy", { locale: es })}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                    onClick={() => handleWhatsApp(entry.parent_whatsapp)}
                    title="Contactar por WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {filtered.length > 0 && (
        <div className="px-4 py-3 border-t border-border text-sm text-muted-foreground">
          {filtered.filter((r) => r.status === "accepted").length} aceptados · {filtered.filter((r) => r.status !== "accepted").length} en espera · {filtered.length} total
        </div>
      )}
    </div>
  );
};
