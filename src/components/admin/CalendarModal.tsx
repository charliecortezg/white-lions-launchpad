import { useMemo, useState } from "react";
import { format, isSameDay, isSameMonth, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Prospect = Tables<"trial_class_registrations">;
type WaitlistRegistration = Tables<"waitlist_registrations">;

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  prospects: Prospect[];
  waitlistRegistrations?: WaitlistRegistration[];
  onStatusChange: (id: string, status: string) => void;
  onViewDetails: (prospect: Prospect) => void;
}

const MONTH_MAP: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

function parseTrialDate(preferredSchedule: string): Date | null {
  // Input: "miércoles 28 de enero - Lunes y miércoles, 6:00–8:00 pm"
  const match = preferredSchedule.match(/(\d{1,2})\s+de\s+(\w+)/i);
  if (!match) return null;

  const day = parseInt(match[1]);
  const monthName = match[2].toLowerCase();
  const month = MONTH_MAP[monthName];

  if (month === undefined) return null;

  const year = new Date().getFullYear();
  return new Date(year, month, day);
}

const statusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Pendiente: { color: "bg-blue-500", bgColor: "bg-blue-500/10 text-blue-400 border-blue-500/30", label: "Pendiente" },
  Asistió: { color: "bg-green-500", bgColor: "bg-green-500/10 text-green-400 border-green-500/30", label: "Asistió" },
  "No Asistió": { color: "bg-red-500", bgColor: "bg-red-500/10 text-red-400 border-red-500/30", label: "No Asistió" },
  Reprogramado: { color: "bg-yellow-500", bgColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30", label: "Reprogramado" },
  Inscrito: { color: "bg-primary", bgColor: "bg-primary/10 text-primary border-primary/30", label: "Inscrito" },
  Waitlist: { color: "bg-purple-500", bgColor: "bg-purple-500/10 text-purple-400 border-purple-500/30", label: "Lista de espera" },
};

export const CalendarModal = ({
  isOpen,
  onClose,
  prospects,
  waitlistRegistrations = [],
  onStatusChange,
  onViewDetails,
}: CalendarModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Biberon date: March 2, 2026
  const BIBERON_DATE_KEY = "2026-03-02";

  // Group prospects by date
  const prospectsByDate = useMemo(() => {
    const map = new Map<string, Prospect[]>();

    prospects.forEach((prospect) => {
      const date = parseTrialDate(prospect.preferred_schedule);
      if (date) {
        const key = format(date, "yyyy-MM-dd");
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(prospect);
      }
    });

    return map;
  }, [prospects]);

  // Group waitlist by date (all go to March 2)
  const waitlistByDate = useMemo(() => {
    const map = new Map<string, WaitlistRegistration[]>();
    if (waitlistRegistrations.length > 0) {
      map.set(BIBERON_DATE_KEY, waitlistRegistrations);
    }
    return map;
  }, [waitlistRegistrations]);

  // Get prospects for selected date
  const selectedDateProspects = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return prospectsByDate.get(key) || [];
  }, [selectedDate, prospectsByDate]);

  // Get waitlist for selected date
  const selectedDateWaitlist = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return waitlistByDate.get(key) || [];
  }, [selectedDate, waitlistByDate]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    let total = 0;
    let pending = 0;
    let attended = 0;
    let noShow = 0;
    let rescheduled = 0;
    let enrolled = 0;

    prospectsByDate.forEach((dayProspects, dateKey) => {
      const date = new Date(dateKey);
      if (date >= monthStart && date <= monthEnd) {
        dayProspects.forEach((p) => {
          total++;
          switch (p.status) {
            case "Pendiente":
              pending++;
              break;
            case "Asistió":
              attended++;
              break;
            case "No Asistió":
              noShow++;
              break;
            case "Reprogramado":
              rescheduled++;
              break;
            case "Inscrito":
              enrolled++;
              break;
          }
        });
      }
    });

    const conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;

    return { total, pending, attended, noShow, rescheduled, enrolled, conversionRate };
  }, [currentMonth, prospectsByDate]);

  // Get status indicators for a date
  const getStatusesForDate = (date: Date): string[] => {
    const key = format(date, "yyyy-MM-dd");
    const dayProspects = prospectsByDate.get(key) || [];
    const statuses = [...new Set(dayProspects.map((p) => p.status))];
    // Add waitlist indicator
    if (waitlistByDate.has(key)) {
      statuses.push("Waitlist");
    }
    return statuses;
  };

  // Check if date has events
  const hasEvents = (date: Date): boolean => {
    const key = format(date, "yyyy-MM-dd");
    return prospectsByDate.has(key) || waitlistByDate.has(key);
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const getSportEmoji = (category: string): string => {
    const cat = category.toLowerCase();
    if (cat.includes("basket") || cat.includes("baloncesto")) return "🏀";
    return "⚽";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            📅 Calendario de Clases Muestra
          </DialogTitle>
        </DialogHeader>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-card border border-border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-foreground">{monthlyStats.total}</div>
            <div className="text-xs text-muted-foreground">Total del Mes</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{monthlyStats.pending}</div>
            <div className="text-xs text-blue-400/80">Pendientes</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{monthlyStats.attended}</div>
            <div className="text-xs text-green-400/80">Asistieron</div>
          </div>
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{monthlyStats.conversionRate}%</div>
            <div className="text-xs text-primary/80">Conversión</div>
          </div>
        </div>

        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            locale={es}
            className="rounded-lg border border-border pointer-events-auto"
            modifiers={{
              hasEvents: (date) => hasEvents(date),
            }}
            modifiersStyles={{
              hasEvents: {
                fontWeight: "bold",
              },
            }}
            components={{
              DayContent: ({ date }) => {
                const statuses = getStatusesForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isCurrentMonth = isSameMonth(date, currentMonth);

                return (
                  <div className="relative flex flex-col items-center">
                    <span className={cn(!isCurrentMonth && "opacity-50")}>
                      {date.getDate()}
                    </span>
                    {statuses.length > 0 && (
                      <div className="flex gap-0.5 mt-0.5">
                        {statuses.slice(0, 3).map((status, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              statusConfig[status]?.color || "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              },
            }}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Pendiente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Asistió</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>No Asistió</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Reprogramado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>Inscrito</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Biberón (Lista espera)</span>
          </div>
        </div>

        {/* Selected Date Prospects */}
        {selectedDate && (
          <div className="mt-4 space-y-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              📅 {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              {(selectedDateProspects.length > 0 || selectedDateWaitlist.length > 0) && (
                <Badge variant="secondary" className="text-xs">
                  {selectedDateProspects.length + selectedDateWaitlist.length} registro{(selectedDateProspects.length + selectedDateWaitlist.length) !== 1 ? "s" : ""}
                </Badge>
              )}
            </h3>

            {selectedDateProspects.length === 0 && selectedDateWaitlist.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No hay clases muestra programadas para este día.
              </p>
            ) : (
              <div className="space-y-2">
                {/* Regular prospects */}
                {selectedDateProspects.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="flex items-center justify-between bg-card border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg">{getSportEmoji(prospect.category)}</span>
                      <div className="min-w-0">
                        <button
                          onClick={() => onViewDetails(prospect)}
                          className="font-medium text-foreground hover:text-primary transition-colors truncate block text-left"
                        >
                          {prospect.player_name}
                        </button>
                        <p className="text-xs text-muted-foreground truncate">
                          {prospect.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", statusConfig[prospect.status]?.bgColor)}
                      >
                        {prospect.status}
                      </Badge>

                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                          onClick={() => onStatusChange(prospect.id, "Asistió")}
                          title="Marcar como Asistió"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => onStatusChange(prospect.id, "No Asistió")}
                          title="Marcar como No Asistió"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                          onClick={() => handleWhatsApp(prospect.contact_phone)}
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => onViewDetails(prospect)}
                          title="Ver detalles"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Waitlist (Biberón) entries */}
                {selectedDateWaitlist.map((entry) => (
                  <div
                    key={`waitlist-${entry.id}`}
                    className="flex items-center justify-between bg-card border border-purple-500/30 rounded-lg p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-lg">🍼</span>
                      <div className="min-w-0">
                        <span className="font-medium text-foreground truncate block text-left">
                          {entry.child_name}
                        </span>
                        <p className="text-xs text-muted-foreground truncate">
                          Biberón • Tutor: {entry.parent_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", entry.status === "accepted"
                          ? "bg-green-500/10 text-green-400 border-green-500/30"
                          : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                        )}
                      >
                        {entry.status === "accepted" ? "Aceptado" : "En espera"}
                      </Badge>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        onClick={() => {
                          const cleanPhone = entry.parent_whatsapp.replace(/\D/g, "");
                          window.open(`https://wa.me/${cleanPhone}`, "_blank");
                        }}
                        title="Contactar por WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
