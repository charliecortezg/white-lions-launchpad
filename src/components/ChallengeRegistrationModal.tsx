import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, CheckCircle2, MapPin, Clock, Gift, Shield, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { format, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  player_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  tutor_name: z.string().min(2, "El nombre del tutor debe tener al menos 2 caracteres"),
  tutor_email: z.string().email("Ingresa un correo electrónico válido"),
  contact_phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  birth_year: z.string().min(4, "Selecciona el año de nacimiento"),
  sport: z.enum(["Fútbol"], {
    required_error: "Selecciona un deporte",
  }).default("Fútbol"),
  category: z.string().min(1, "Selecciona una categoría"),
  start_date: z.date({
    required_error: "Selecciona una fecha de inicio",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ChallengeRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TOTAL_STEPS = 4;

const getStepTitles = (isJuvenil: boolean) => [
  { 
    title: "Cuéntanos sobre el jugador", 
    subtitle: isJuvenil 
      ? "Para jugadores de 12-13 años ofrecemos inscripción directa" 
      : "El Reto está diseñado para niños de 6 a 11 años" 
  },
  { 
    title: "Tu experiencia White Lions", 
    subtitle: isJuvenil 
      ? "Esto es lo que vivirá tu hijo en White Lions"
      : "Esto es lo que vivirá tu hijo durante 30 días" 
  },
  { 
    title: "¿Cómo te contactamos?", 
    subtitle: isJuvenil 
      ? "Usaremos estos datos para coordinar el inicio"
      : "Usaremos estos datos para coordinar el inicio del Reto" 
  },
  { 
    title: "Estás a un paso de comenzar", 
    subtitle: "Revisa el total y confirma tu inscripción" 
  },
];

const ChallengeRegistrationModal = ({ open, onOpenChange }: ChallengeRegistrationModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sport: "Fútbol",
    },
  });

  // Reset step when modal closes
  useEffect(() => {
    if (!open) {
      setStep(1);
    }
  }, [open]);

  const selectedSport = "Fútbol";
  const selectedBirthYear = form.watch("birth_year");

  const getValidYears = () => {
    return Array.from({ length: 8 }, (_, i) => (2019 - i).toString());
  };

  const getCategories = (birthYear: string | undefined) => {
    if (!birthYear) return [];
    const year = parseInt(birthYear);
    if (year >= 2018) return ["Escuelita"];
    if (year >= 2016 && year <= 2017) return ["Estrellita"];
    if (year >= 2014 && year <= 2015) return ["Infantil"];
    if (year >= 2012 && year <= 2013) return ["Juvenil A"];
    return [];
  };

  const isJuvenilA = (birthYear: string | undefined): boolean => {
    if (!birthYear) return false;
    const year = parseInt(birthYear);
    return year >= 2012 && year <= 2013;
  };

  const getMinStartDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const isValidDate = (date: Date) => {
    const day = getDay(date);
    const minDate = getMinStartDate();
    if (date < minDate) return false;
    if (selectedSport === "Fútbol") {
      return day === 1 || day === 3;
    } else if (selectedSport === "Basketball") {
      return day === 2 || day === 4;
    }
    return false;
  };

  const getNextAvailableDate = (sport: string | undefined): Date | undefined => {
    if (!sport) return undefined;
    const startDate = getMinStartDate();
    const validDays = sport === "Fútbol" ? [1, 3] : [2, 4];
    for (let i = 0; i <= 14; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
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
    if (sport === "Fútbol") return "Zona Juventud 2000, Mexicali";
    if (sport === "Basketball") return "Fracc. Quinta del Rey, Mexicali";
    return "";
  };

  const getSchedule = (sport: string | undefined) => {
    if (sport === "Fútbol") return "Lunes y miércoles, 6:00–8:00 pm";
    if (sport === "Basketball") return "Martes y jueves, 6:30–8:00 pm";
    return "";
  };

  const normalizeEmail = (email: string) => email.toLowerCase().trim();
  const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '');

  // Step validation
  const validateStep = async (currentStep: number): Promise<boolean> => {
    switch (currentStep) {
      case 1:
        return form.trigger(["player_name", "birth_year", "category"]);
      case 2:
        return form.trigger(["start_date"]);
      case 3:
        return form.trigger(["tutor_name", "tutor_email", "contact_phone"]);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid && step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const location = getLocation(data.sport);
      const schedule = getSchedule(data.sport);
      const formattedDate = format(data.start_date, "EEEE d 'de' MMMM", { locale: es });
      
      const emailNormalized = normalizeEmail(data.tutor_email);
      const phoneNormalized = normalizePhone(data.contact_phone);
      
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - 45);
      
      const { data: existingProspects, error: searchError } = await supabase
        .from("trial_class_registrations")
        .select("id, status")
        .or(`email_normalized.eq.${emailNormalized},phone_normalized.eq.${phoneNormalized}`)
        .not("status", "in", "(Inscrito,Perdido)")
        .gte("created_at", thresholdDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (searchError) {
        console.warn("Search error (proceeding with insert):", searchError);
      }

      const existingProspect = existingProspects?.[0];
      let isUpdate = false;

      if (existingProspect) {
        isUpdate = true;
        const newStatus = existingProspect.status === 'No Asistió' ? 'Reprogramado' : 'Pendiente';
        
        const { error: updateError } = await supabase
          .from("trial_class_registrations")
          .update({
            player_name: data.player_name,
            age_or_birth_year: data.birth_year,
            tutor_name: data.tutor_name,
            contact_phone: data.contact_phone,
            parent_email: data.tutor_email,
            category: data.category,
            preferred_location: location,
            preferred_schedule: `${formattedDate} - ${schedule}`,
            status: newStatus,
            attendance_marked_at: null,
            no_show_processed_at: null,
            status_updated_at: new Date().toISOString(),
          })
          .eq("id", existingProspect.id);

        if (updateError) throw updateError;
        
        await supabase
          .from("email_queue")
          .update({ status: "canceled" })
          .eq("prospect_id", existingProspect.id)
          .eq("status", "queued");
          
      } else {
        const { error: insertError } = await supabase
          .from("trial_class_registrations")
          .insert([{
            player_name: data.player_name,
            age_or_birth_year: data.birth_year,
            tutor_name: data.tutor_name,
            contact_phone: data.contact_phone,
            parent_email: data.tutor_email,
            category: data.category,
            preferred_location: location,
            preferred_schedule: `${formattedDate} - ${schedule}`,
            comments: null,
          }]);

        if (insertError) throw insertError;
      }

      try {
        const { error: emailError } = await supabase.functions.invoke('send-confirmation', {
          body: {
            player_name: data.player_name,
            tutor_name: data.tutor_name,
            parent_email: data.tutor_email,
            sport: data.sport,
            category: data.category,
            trial_date: formattedDate,
            location: location,
            schedule: schedule,
          }
        });
        
        if (emailError) {
          console.error("Error sending email:", emailError);
        }
      } catch (emailErr) {
        console.error("Email function error:", emailErr);
      }

      setSubmittedData(data);
      setIsSubmitted(true);
      form.reset();

      toast({
        title: isUpdate ? "¡Inscripción actualizada!" : "¡Bienvenido al Reto White Lions!",
        description: isUpdate 
          ? "Hemos actualizado tu inscripción con la nueva fecha."
          : "Te enviamos un correo con los próximos pasos.",
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu inscripción. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setStep(1);
    form.reset();
    onOpenChange(false);
  };

  const categories = getCategories(selectedBirthYear);
  const nextAvailableDate = getNextAvailableDate(selectedSport);
  const progressValue = (step / TOTAL_STEPS) * 100;
  const isJuvenil = isJuvenilA(selectedBirthYear);
  const stepTitles = getStepTitles(isJuvenil);

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

        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl md:text-3xl font-bold text-foreground text-center font-display uppercase">
            {isJuvenil ? "🦁 Inscripción White Lions" : "🦁 Reto White Lions – 30 Días"}
          </DialogTitle>
          
          {!isSubmitted && (
            <div className="space-y-3">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Paso {step} de {TOTAL_STEPS}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300",
                        i + 1 <= step ? "bg-primary" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
              <Progress value={progressValue} className="h-2" />
              
              {/* Step Title */}
              <div className="text-center pt-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {stepTitles[step - 1].title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {stepTitles[step - 1].subtitle}
                </p>
              </div>
            </div>
          )}
        </DialogHeader>

        {!isSubmitted ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              
              {/* STEP 1: Datos del Jugador */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                step === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                {/* Sport Selection - Solo Fútbol */}
                <div className="bg-primary/10 border-2 border-primary rounded-xl p-4 text-center">
                  <span className="text-3xl block mb-1">⚽</span>
                  <span className="font-semibold text-foreground">Fútbol</span>
                  <span className="text-xs text-muted-foreground block">Lunes y Miércoles</span>
                </div>

                <FormField
                  control={form.control}
                  name="player_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Jugador</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre completo del jugador" 
                          className="h-12"
                          {...field} 
                        />
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
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Selecciona el año" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getValidYears().map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs">
                        {isJuvenil 
                          ? "Para jugadores de 12-13 años ofrecemos inscripción directa (sin Reto)."
                          : "El Reto está disponible para niños de 6 a 11 años."}
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
                            <SelectTrigger className="h-12">
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

                <Button 
                  type="button" 
                  onClick={nextStep} 
                  className="w-full" 
                  variant="hero" 
                  size="lg"
                >
                  Continuar
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* STEP 2: La Experiencia del Reto */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                step === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                {/* Location & Schedule Info */}
                <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{getLocation(selectedSport)}</p>
                      <p className="text-sm text-muted-foreground">{getLocationZone(selectedSport)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{getSchedule(selectedSport)}</p>
                  </div>
                  
                  {!isJuvenil && (
                    <div className="pt-3 border-t border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Gift className="w-4 h-4 text-primary" />
                        Tu Kit de Inicio incluye:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <span>👕 Camiseta oficial</span>
                        <span>🧦 Calcetas deportivas</span>
                        <span>🛡️ Espinilleras</span>
                        <span>🥤 Termo White Lions</span>
                      </div>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{isJuvenil ? "Fecha de Inicio" : "Fecha de Inicio del Reto"}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-12 pl-3 text-left font-normal",
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
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">
                          Solo puedes seleccionar lunes y miércoles
                        </p>
                        {nextAvailableDate && !field.value && (
                          <button
                            type="button"
                            onClick={() => field.onChange(nextAvailableDate)}
                            className="text-xs text-primary hover:text-primary/80 underline text-left w-fit"
                          >
                            Próxima fecha: {format(nextAvailableDate, "EEEE d 'de' MMMM", { locale: es })}
                          </button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    onClick={prevStep} 
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Atrás
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="flex-[2]" 
                    variant="hero" 
                    size="lg"
                  >
                    Quiero apartar mi lugar
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* STEP 3: Datos del Tutor */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                step === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                <FormField
                  control={form.control}
                  name="tutor_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Tutor</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre completo del tutor" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tutor_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico del Tutor</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            type="email" 
                            placeholder="correo@ejemplo.com" 
                            className="pl-10 h-12"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs">
                        Te enviaremos la confirmación y los pasos para el pago.
                      </FormDescription>
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
                        <Input 
                          type="tel" 
                          placeholder="686 123 4567" 
                          className="h-12"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    onClick={prevStep} 
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Atrás
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="flex-[2]" 
                    variant="hero" 
                    size="lg"
                  >
                    Ver total y garantía
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* STEP 4: Precio y Cierre */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                step === 4 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                {/* Juvenil A Notice */}
                {isJuvenil && (
                  <div className="bg-muted border border-border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground font-medium">
                      ⚠️ Nota: El Reto de 30 días no está disponible para la categoría Juvenil A (12-13 años).
                    </p>
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-primary/10 border-2 border-primary/30 rounded-xl p-5">
                  {isJuvenil ? (
                    <>
                      <p className="font-semibold text-lg text-foreground mb-3">Total a pagar:</p>
                      <div className="space-y-2 text-sm border-b border-border/50 pb-3 mb-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Inscripción</span>
                          <span className="text-xl font-bold text-primary font-display">$500 MXN</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mensualidad</span>
                          <span className="text-xl font-bold text-primary font-display">desde $500 MXN</span>
                        </div>
                        <p className="text-xs text-muted-foreground italic">(Explicadas en campo)</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-lg text-foreground">Total a pagar:</span>
                      <span className="text-3xl font-bold text-primary font-display">$1,100 MXN</span>
                    </div>
                  )}
                  <div className="space-y-2 text-sm text-muted-foreground border-t border-border/50 pt-3">
                    {!isJuvenil && (
                      <>
                        <div className="flex justify-between">
                          <span>Kit de Inicio White Lions</span>
                          <span className="text-foreground">Incluido</span>
                        </div>
                        <div className="flex justify-between">
                          <span>30 días de entrenamiento</span>
                          <span className="text-foreground">Incluido</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Garantía de satisfacción</span>
                      <span className="text-primary">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Evaluaciones mensuales</span>
                      <span className="text-primary">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Acceso a app de rendimiento</span>
                      <span className="text-primary">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Planes de crecimiento personalizado</span>
                      <span className="text-primary">✓</span>
                    </div>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="flex items-start gap-3 p-4 bg-card/50 border border-border/50 rounded-xl">
                  <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Garantía de Satisfacción</p>
                    <p className="text-xs text-muted-foreground">
                      Si después de 30 días tu hijo no se divierte más, no se mueve más y no se adapta al entorno White Lions, te devolvemos tu dinero (menos el kit).
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    onClick={prevStep} 
                    variant="outline" 
                    size="lg"
                    className="flex-1"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Atrás
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-[2]" 
                    variant="hero" 
                    size="lg" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Procesando..." : isJuvenil ? "🦁 Inscribir a mi hijo" : "🦁 Iniciar Reto White Lions"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        ) : (
          <div className="py-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-1 font-display uppercase">
                  ¡Bienvenido a White Lions!
                </h3>
                <p className="text-muted-foreground font-body">
                  Tomaste una gran decisión. Tu hijo ya es parte de la familia.
                </p>
              </div>
            </div>

            {submittedData && (
              <div className="bg-muted/30 rounded-xl p-5 space-y-3 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-3">Resumen de tu inscripción</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jugador</span>
                    <span className="font-medium">{submittedData.player_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deporte</span>
                    <span className="font-medium">{submittedData.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría</span>
                    <span className="font-medium">{submittedData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de inicio</span>
                    <span className="font-medium capitalize">
                      {format(submittedData.start_date, "EEEE d 'de' MMMM", { locale: es })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sede</span>
                    <span className="font-medium">{getLocation(submittedData.sport)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground font-semibold">Total</span>
                    <span className="font-bold text-primary">
                      {submittedData.category === "Juvenil A" ? "Inscripción + Mensualidad" : "$1,100 MXN"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-foreground font-medium mb-2">
                📧 Revisa tu correo electrónico
              </p>
              <p className="text-xs text-muted-foreground">
                {submittedData?.category === "Juvenil A" 
                  ? "Te enviamos las instrucciones para completar tu inscripción."
                  : "Te enviamos las instrucciones para completar el pago y recibir tu Kit de Inicio."}
              </p>
            </div>

            <Button onClick={handleClose} variant="outline" size="lg" className="w-full">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeRegistrationModal;
