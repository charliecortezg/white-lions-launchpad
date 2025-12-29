import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, MapPin, Clock, Users, Target, Dumbbell, AlertTriangle } from "lucide-react";
import { format, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getStoredUTMParams } from "@/hooks/useUTMTracking";

const formSchema = z.object({
  player_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre es demasiado largo"),
  tutor_name: z.string().min(2, "El nombre del tutor debe tener al menos 2 caracteres").max(100, "El nombre es demasiado largo"),
  contact_phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").max(15, "El teléfono es demasiado largo"),
  birth_year: z.string().min(4, "Selecciona el año de nacimiento"),
  sport: z.enum(["Fútbol", "Basketball"], {
    required_error: "Selecciona un deporte",
  }),
  category: z.string().min(1, "Selecciona una categoría"),
  trial_date: z.date({
    required_error: "Selecciona una fecha para la clase muestra",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface TrialClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to convert date to America/Tijuana timezone
const toTijuanaDate = (date: Date): string => {
  return date.toLocaleDateString('en-CA', { timeZone: 'America/Tijuana' });
};

const TrialClassModal = ({ open, onOpenChange }: TrialClassModalProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selectedSport = form.watch("sport");
  const selectedBirthYear = form.watch("birth_year");

  // Obtener años válidos según el deporte
  const getValidYears = (sport: string | undefined) => {
    if (sport === "Fútbol") {
      return Array.from({ length: 10 }, (_, i) => (2019 - i).toString()); // 2019 a 2010
    } else if (sport === "Basketball") {
      return Array.from({ length: 4 }, (_, i) => (2017 - i).toString()); // 2017 a 2014
    }
    return [];
  };

  // Función para determinar categorías según deporte y año de nacimiento
  const getCategories = (sport: string | undefined, birthYear: string | undefined) => {
    if (!sport || !birthYear) return [];

    const year = parseInt(birthYear);

    if (sport === "Fútbol") {
      if (year >= 2018) return ["Escuelita"];
      if (year >= 2016 && year <= 2017) return ["Estrellita"];
      if (year >= 2014 && year <= 2015) return ["Infantil"];
      if (year >= 2012 && year <= 2013) return ["Juvenil A"];
      if (year >= 2010 && year <= 2011) return ["Juvenil B"];
      return [];
    } else if (sport === "Basketball") {
      if (year >= 2016 && year <= 2017) return ["Estrellita"];
      if (year >= 2014 && year <= 2015) return ["Infantil"];
      return [];
    }
    return [];
  };

  // Función para filtrar días válidos según el deporte
  const isValidDate = (date: Date) => {
    const day = getDay(date);
    // Get current date in Tijuana timezone
    const now = new Date();
    const tijuanaToday = new Date(now.toLocaleString('en-US', { timeZone: 'America/Tijuana' }));
    tijuanaToday.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    if (checkDate < tijuanaToday) return false;

    if (selectedSport === "Fútbol") {
      // Lunes (1) y Miércoles (3)
      return day === 1 || day === 3;
    } else if (selectedSport === "Basketball") {
      // Martes (2) y Jueves (4)
      return day === 2 || day === 4;
    }
    return false;
  };

  // Obtener la próxima fecha disponible
  const getNextAvailableDate = (sport: string | undefined): Date | undefined => {
    if (!sport) return undefined;
    
    const now = new Date();
    const tijuanaToday = new Date(now.toLocaleString('en-US', { timeZone: 'America/Tijuana' }));
    const validDays = sport === "Fútbol" ? [1, 3] : [2, 4]; // Lun/Mié o Mar/Jue
    
    for (let i = 1; i <= 14; i++) {
      const checkDate = new Date(tijuanaToday);
      checkDate.setDate(tijuanaToday.getDate() + i);
      if (validDays.includes(getDay(checkDate))) {
        return checkDate;
      }
    }
    return undefined;
  };

  const getLocation = (sport: string | undefined) => {
    if (sport === "Fútbol") return "Campo Hacienda del Bosque";
    if (sport === "Basketball") return "Parque Quinta del Rey III";
    return "";
  };

  const getLocationZone = (sport: string | undefined) => {
    if (sport === "Fútbol") return "Zona Haciendas, Mexicali";
    if (sport === "Basketball") return "Fracc. Quinta del Rey, Mexicali";
    return "";
  };

  const getSchedule = (sport: string | undefined) => {
    if (sport === "Fútbol") return "Lunes y miércoles, 6:00–8:00 pm";
    if (sport === "Basketball") return "Martes y jueves, 6:30–8:00 pm";
    return "";
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const location = getLocation(data.sport);
      const schedule = getSchedule(data.sport);
      const utmParams = getStoredUTMParams();
      
      // Format trial date in Tijuana timezone
      const trialDateStr = toTijuanaDate(data.trial_date);

      // Insert into booking_intents table (new table with UTM tracking)
      const { error: intentError } = await supabase
        .from("booking_intents")
        .insert([{
          player_name: data.player_name,
          birth_year: data.birth_year,
          sport: data.sport,
          category: data.category,
          tutor_name: data.tutor_name,
          contact_phone: data.contact_phone,
          preferred_location: location,
          preferred_schedule: `${format(data.trial_date, "EEEE d 'de' MMMM", { locale: es })} - ${schedule}`,
          trial_date: trialDateStr,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          utm_term: utmParams.utm_term,
          utm_content: utmParams.utm_content,
          status: 'pending',
          assigned_admin: 'whitelions.admn@gmail.com',
        }]);

      if (intentError) {
        console.error("Error saving booking intent:", intentError);
        throw intentError;
      }

      // Also insert into legacy trial_class_registrations for backward compatibility
      const { error: legacyError } = await supabase
        .from("trial_class_registrations")
        .insert([{
          player_name: data.player_name,
          age_or_birth_year: data.birth_year,
          tutor_name: data.tutor_name,
          contact_phone: data.contact_phone,
          category: data.category,
          preferred_location: location,
          preferred_schedule: `${format(data.trial_date, "EEEE d 'de' MMMM", { locale: es })} - ${schedule}`,
          comments: null,
        }]);

      if (legacyError) {
        console.error("Warning: Legacy registration failed:", legacyError);
        // Don't throw - the main booking intent was saved successfully
      }

      setSubmittedData(data);
      setIsSubmitted(true);
      form.reset();

      toast({
        title: "¡Registro exitoso!",
        description: "Hemos recibido tu solicitud de clase muestra.",
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al enviar tu registro. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    form.reset();
    onOpenChange(false);
  };

  const categories = getCategories(selectedSport, selectedBirthYear);
  const nextAvailableDate = getNextAvailableDate(selectedSport);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-background/95">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <span className="sr-only">Cerrar</span>
          ✕
        </button>

        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-navy text-center">
            Agenda tu Clase Muestra
          </DialogTitle>
          <p className="text-center text-muted-foreground">Completa el registro en pocos pasos</p>
        </DialogHeader>

        {!isSubmitted ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              {/* Sibling Notice */}
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Si registras a dos o más hermanos, por favor realiza un registro individual por cada uno para asegurar su lugar en el grupo correcto.
                </p>
              </div>

              {/* Sport Selection - Cards */}
              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecciona un deporte</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange("Fútbol");
                            form.setValue("birth_year", "");
                            form.setValue("category", "");
                          }}
                          className={cn(
                            "p-6 rounded-xl border-2 transition-all text-left",
                            field.value === "Fútbol"
                              ? "border-gold bg-gold/10 shadow-lg"
                              : "border-border hover:border-gold/50 hover:bg-muted/50"
                          )}
                        >
                          <span className="text-4xl block mb-2">⚽</span>
                          <span className="font-semibold text-lg block">Fútbol</span>
                          <span className="text-xs text-muted-foreground">Lun y Mié</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange("Basketball");
                            form.setValue("birth_year", "");
                            form.setValue("category", "");
                          }}
                          className={cn(
                            "p-6 rounded-xl border-2 transition-all text-left",
                            field.value === "Basketball"
                              ? "border-gold bg-gold/10 shadow-lg"
                              : "border-border hover:border-gold/50 hover:bg-muted/50"
                          )}
                        >
                          <span className="text-4xl block mb-2">🏀</span>
                          <span className="font-semibold text-lg block">Basketball</span>
                          <span className="text-xs text-muted-foreground">Mar y Jue</span>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="player_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Jugador</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo del jugador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año de Nacimiento</FormLabel>
                    <Select
                      disabled={!selectedSport}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el año" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getValidYears(selectedSport).map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Si no recuerdas el año exacto, puedes elegir uno aproximado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {categories.length > 0 && (
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedSport && (
                <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{getLocation(selectedSport)}</p>
                      <p className="text-sm text-muted-foreground">{getLocationZone(selectedSport)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gold flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{getSchedule(selectedSport)}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-2">¿Qué incluye la clase muestra?</p>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Dumbbell className="w-4 h-4 text-gold/70" />
                        <span>Actividad guiada</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4 text-gold/70" />
                        <span>Grupo acorde a la edad</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="w-4 h-4 text-gold/70" />
                        <span>Sesión introductoria</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <p className="text-sm font-medium text-foreground">Datos del tutor</p>
                
                <FormField
                  control={form.control}
                  name="tutor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Tutor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre completo del tutor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto (WhatsApp)</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="686 123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <p className="text-xs text-muted-foreground">
                  Usaremos estos datos únicamente para fines relacionados con tu registro.
                </p>
              </div>

              {selectedSport && (
                <FormField
                  control={form.control}
                  name="trial_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de Clase Muestra</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "EEEE, d 'de' MMMM", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={!isValidDate}
                            initialFocus
                            locale={es}
                            defaultMonth={nextAvailableDate}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription className="text-xs">
                        {selectedSport === "Fútbol" 
                          ? "Las clases de Fútbol son los lunes y miércoles."
                          : "Las clases de Basketball son los martes y jueves."
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                className="w-full bg-gold hover:bg-gold/90 text-navy font-bold py-6 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Confirmar Registro"}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="text-center py-8 space-y-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                ¡Registro Completado!
              </h3>
              <p className="text-muted-foreground">
                Hemos recibido la solicitud de clase muestra para <strong>{submittedData?.player_name}</strong>
              </p>
            </div>
            
            {submittedData && (
              <div className="bg-muted/30 rounded-xl p-5 text-left space-y-3 border border-border/50">
                <h4 className="font-semibold text-foreground">Resumen del registro:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deporte:</span>
                    <span className="font-medium">{submittedData.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <span className="font-medium">{submittedData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">
                      {format(submittedData.trial_date, "EEEE, d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground">Ubicación:</span>
                    <span className="font-medium text-right">{getLocation(submittedData.sport)}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground">Horario:</span>
                    <span className="font-medium text-right">{getSchedule(submittedData.sport)}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 text-sm">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>¿Qué sigue?</strong> Nos pondremos en contacto contigo vía WhatsApp para confirmar la asistencia.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="bg-gold hover:bg-gold/90 text-navy font-bold px-8"
            >
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrialClassModal;
