import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Phone, StickyNote } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type WaitlistRegistration = Tables<"waitlist_registrations">;

interface WaitlistTableProps {
  registrations: WaitlistRegistration[];
  searchTerm: string;
}

export const WaitlistTable = ({ registrations, searchTerm }: WaitlistTableProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notesOpen, setNotesOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistRegistration | null>(null);
  const [notesText, setNotesText] = useState("");
  const [saving, setSaving] = useState(false);

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

  const handleCall = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`tel:${cleanPhone}`);
  };

  const handleOpenNotes = (entry: WaitlistRegistration) => {
    setSelectedEntry(entry);
    setNotesText(entry.notes || "");
    setNotesOpen(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedEntry) return;
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("admin-prospects", {
        method: "POST",
        body: { id: selectedEntry.id, action: "update_waitlist_notes", notes: notesText },
      });
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-waitlist"] });
      toast({ title: "Notas guardadas", description: "Las notas se actualizaron correctamente." });
      setNotesOpen(false);
      setSelectedEntry(null);
    } catch {
      toast({ title: "Error", description: "No se pudieron guardar las notas.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
              <TableHead>Notas</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className={`h-8 w-8 ${entry.notes ? "text-yellow-500 hover:text-yellow-400" : "text-muted-foreground hover:text-foreground"}`}
                      onClick={() => handleOpenNotes(entry)}
                      title={entry.notes || "Sin notas"}
                    >
                      <StickyNote className="h-4 w-4" />
                    </Button>
                  </TableCell>
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
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        onClick={() => handleWhatsApp(entry.parent_whatsapp)}
                        title="Contactar por WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                        onClick={() => handleCall(entry.parent_whatsapp)}
                        title="Llamar"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
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

      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas — {selectedEntry?.child_name}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            placeholder="Escribe notas sobre este registro..."
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveNotes} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
