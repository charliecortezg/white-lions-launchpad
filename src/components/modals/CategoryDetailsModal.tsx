import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Trophy, ExternalLink } from "lucide-react";

interface CategoryDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: {
    name: string;
    age: string;
    sport: string;
    schedule: string;
    location: string;
    mapLink: string;
  };
}

const CategoryDetailsModal = ({ open, onOpenChange, category }: CategoryDetailsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-navy text-center">
            {category.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-gold flex-shrink-0" />
            <div>
              <div className="text-sm text-muted-foreground">Categoría</div>
              <div className="font-semibold text-foreground">{category.age}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-gold flex-shrink-0" />
            <div>
              <div className="text-sm text-muted-foreground">Deporte</div>
              <div className="font-semibold text-foreground">{category.sport}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div>
              <div className="text-sm text-muted-foreground">Horario</div>
              <div className="font-semibold text-foreground">{category.schedule}</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Sede</div>
              <div className="font-semibold text-foreground mb-2">{category.location}</div>
              <Button 
                variant="outline" 
                size="sm"
                className="w-full"
                onClick={() => window.open(category.mapLink, '_blank')}
              >
                Ver en Google Maps
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDetailsModal;
