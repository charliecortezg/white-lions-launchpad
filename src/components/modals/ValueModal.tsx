import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ValueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valueName: string;
}

const ValueModal = ({ open, onOpenChange, valueName }: ValueModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy text-center">
            {valueName}
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          <p className="text-muted-foreground leading-relaxed text-center">
            En White Lions Academies utilizamos el deporte como un medio pedagógico para inculcar 
            este valor. A través de entrenamientos estructurados, situaciones guiadas y participación 
            activa en comunidad, enseñamos a nuestros jugadores a aplicar este valor dentro y fuera 
            del campo.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValueModal;
