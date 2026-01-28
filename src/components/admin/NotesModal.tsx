import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  currentNotes: string | null;
  onSave: (notes: string) => void;
  isSaving: boolean;
}

export const NotesModal = ({
  isOpen,
  onClose,
  playerName,
  currentNotes,
  onSave,
  isSaving,
}: NotesModalProps) => {
  const [notes, setNotes] = useState(currentNotes || "");

  useEffect(() => {
    setNotes(currentNotes || "");
  }, [currentNotes, isOpen]);

  const handleSave = () => {
    onSave(notes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            📝 Notas - {playerName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Agregar observaciones sobre el prospecto..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[150px] bg-background border-border"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
