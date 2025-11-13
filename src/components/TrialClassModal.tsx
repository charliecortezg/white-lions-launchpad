import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { format, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  player_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  tutor_name: z.string().min(2, "El nombre del tutor debe tener al menos 2 caracteres"),
  contact_phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
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

const TrialClassModal = ({ open, onOpenChange }: TrialClassModalProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const selectedSport = form.watch("sport");
  const selectedBirthYear = form.watch("birth_year");

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;

    if (selectedSport === "Fútbol") {
      // Lunes (1) y Miércoles (3)
      return day === 1 || day === 3;
    } else if (selectedSport === "Basketball") {
      // Martes (2) y Jueves (4)
      return day === 2 || day === 4;
    }
    return false;
  };

  const getLocation = (sport: string | undefined) => {
    if (sport === "Fútbol") return "Campo Hacienda del Bosque";
    if (sport === "Basketball") return "Parque Quinta del Rey III";
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

      const { error } = await supabase
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

      if (error) throw error;

      setIsSubmitted(true);
      form.reset();

      toast({
        title: "¡Registro exitoso!",
        description: "Tu clase muestra ha sido agendada correctamente.",
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
    form.reset();
    onOpenChange(false);
  };

  const categories = getCategories(selectedSport, selectedBirthYear);

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
            Registra tu Clase Muestra
          </DialogTitle>
          <p className="text-center text-muted-foreground">Tu mejor versión inicia aquí</p>
        </DialogHeader>

        {!isSubmitted ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el año" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i - 4).map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              <FormField
                control={form.control}
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deporte</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un deporte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Fútbol">⚽ Fútbol</SelectItem>
                        <SelectItem value="Basketball">🏀 Basketball</SelectItem>
                      </SelectContent>
                    </Select>
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
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-foreground">📍 Sede: {getLocation(selectedSport)}</p>
                  <p className="text-sm text-muted-foreground">⏰ Horario: {getSchedule(selectedSport)}</p>
                </div>
              )}

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
                            disabled={(date) => !isValidDate(date)}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <p className="text-xs text-muted-foreground">
                        {selectedSport === "Fútbol" 
                          ? "Solo puedes seleccionar lunes y miércoles"
                          : "Solo puedes seleccionar martes y jueves"}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" variant="gold" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Registrando..." : "Confirmar Registro"}
              </Button>
            </form>
          </Form>
        ) : (
          <div className="py-12 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gold/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-gold" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-navy mb-2">¡Gracias!</h3>
              <p className="text-muted-foreground">
                Hemos recibido tu registro y nos pondremos en contacto contigo.
              </p>
            </div>
            <Button onClick={handleClose} variant="outline" size="lg" className="mt-6">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TrialClassModal;