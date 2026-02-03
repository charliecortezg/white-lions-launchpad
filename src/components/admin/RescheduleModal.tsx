import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type Prospect = Tables<"trial_class_registrations">;

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospect: Prospect | null;
  onReschedule: (prospectId: string, newDate: Date, newScheduleText: string) => void;
  isLoading?: boolean;
}

// Basketball pausado temporalmente
const SCHEDULE_OPTIONS = [
  { value: "lunes_miercoles", label: "Lunes y miércoles, 6:00–8:00 pm", sport: "Fútbol" },
  // { value: "martes_jueves", label: "Martes y jueves, 6:30–8:00 pm", sport: "Basketball" },
];

export const RescheduleModal = ({
  isOpen,
  onClose,
  prospect,
  onReschedule,
  isLoading = false,
}: RescheduleModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");

  // Determine sport from category
  const isBasketball = prospect?.category?.toLowerCase().includes("basket") || 
                       prospect?.category?.toLowerCase().includes("baloncesto");
  
  // Filter schedule options based on sport
  const availableSchedules = SCHEDULE_OPTIONS.filter(opt => 
    isBasketball ? opt.sport === "Basketball" : opt.sport === "Fútbol"
  );

  // Get available days based on schedule
  const getAvailableDays = () => {
    if (selectedSchedule === "lunes_miercoles") {
      return [1, 3]; // Monday, Wednesday
    } else if (selectedSchedule === "martes_jueves") {
      return [2, 4]; // Tuesday, Thursday
    }
    return isBasketball ? [2, 4] : [1, 3];
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return true;
    
    // Only allow specific days of the week
    const dayOfWeek = date.getDay();
    const availableDays = getAvailableDays();
    return !availableDays.includes(dayOfWeek);
  };

  const handleConfirm = () => {
    if (!selectedDate || !prospect) return;

    const scheduleOption = availableSchedules.find(s => s.value === selectedSchedule) || availableSchedules[0];
    const dayName = format(selectedDate, "EEEE", { locale: es });
    const dateStr = format(selectedDate, "d 'de' MMMM", { locale: es });
    
    // Format: "miércoles 28 de enero - Lunes y miércoles, 6:00–8:00 pm"
    const newScheduleText = `${dayName} ${dateStr} - ${scheduleOption.label}`;

    onReschedule(prospect.id, selectedDate, newScheduleText);
    
    // Reset state
    setSelectedDate(undefined);
    setSelectedSchedule("");
  };

  const handleClose = () => {
    setSelectedDate(undefined);
    setSelectedSchedule("");
    onClose();
  };

  // Set default schedule based on sport
  useState(() => {
    if (isOpen && !selectedSchedule) {
      setSelectedSchedule(isBasketball ? "martes_jueves" : "lunes_miercoles");
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Reprogramar Inicio del Reto
          </DialogTitle>
        </DialogHeader>

        {prospect && (
          <div className="space-y-4">
            {/* Current info */}
            <div className="bg-muted/50 rounded-lg p-3 space-y-1">
              <p className="text-sm font-medium">{prospect.player_name}</p>
              <p className="text-xs text-muted-foreground">{prospect.category}</p>
              <p className="text-xs text-muted-foreground">
                Fecha original: {prospect.preferred_schedule?.split(" - ")[0] || "No definida"}
              </p>
            </div>

            {/* Schedule selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horario
              </Label>
              <div className="space-y-2">
                {availableSchedules.map((schedule) => (
                  <label
                    key={schedule.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSchedule === schedule.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="schedule"
                      value={schedule.value}
                      checked={selectedSchedule === schedule.value}
                      onChange={(e) => {
                        setSelectedSchedule(e.target.value);
                        setSelectedDate(undefined); // Reset date when schedule changes
                      }}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedSchedule === schedule.value ? "border-primary" : "border-muted-foreground"
                    }`}>
                      {selectedSchedule === schedule.value && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <span className="text-sm">{schedule.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Nueva fecha
              </Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                locale={es}
                className="rounded-md border mx-auto"
              />
            </div>

            {selectedDate && (
              <div className="bg-primary/10 rounded-lg p-3 text-center">
                <p className="text-sm font-medium text-primary">
                  Nueva fecha: {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedDate || isLoading}
          >
            {isLoading ? "Reprogramando..." : "Confirmar Reprogramación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
