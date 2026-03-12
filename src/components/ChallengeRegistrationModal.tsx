import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { CalendarIcon, CheckCircle2, MapPin, Clock, Gift, Shield, Mail, ChevronLeft, ChevronRight, Baby } from "lucide-react";
import { format, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  player_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  school: z.string().optional(),
  tutor_name: z.string().min(2, "El nombre del tutor debe tener al menos 2 caracteres"),
  tutor_email: z.string().email("Ingresa un correo electrónico válido"),
  contact_phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
  birth_year: z.string().min(4, "Selecciona el año de nacimiento"),
  sport: z.enum(["Fútbol"], {
    required_error: "Selecciona un deporte",
  }).default("Fútbol"),
  category: z.string().min(1, "Selecciona una categoría"),
  start_date: z.date().optional(),
  notes: z.string().optional(),
  referral_name: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ChallengeRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referralSource?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────

const isBiberonYear = (birthYear: string | undefined): boolean => {
  if (!birthYear) return false;
  const year = parseInt(birthYear);
  return year === 2020 || year === 2021;
};

const isJuvenilAYear = (birthYear: string | undefined): boolean => {
  if (!birthYear) return false;
  const year = parseInt(birthYear);
  return year >= 2012 && year <= 2013;
};

const getValidYears = () => {
  // 2021, 2020, 2019, 2018, ..., 2012
  return Array.from({ length: 10 }, (_, i) => (2021 - i).toString());
};

const getCategories = (birthYear: string | undefined) => {
  if (!birthYear) return [];
  const year = parseInt(birthYear);
  if (year >= 2020) return ["Biberón"];
  if (year >= 2018) return ["Escuelita"];
  if (year >= 2016 && year <= 2017) return ["Estrellita"];
  if (year >= 2014 && year <= 2015) return ["Infantil"];
  if (year >= 2012 && year <= 2013) return ["Juvenil A"];
  return [];
};

const isWaitlistCategory = (isBiberon: boolean, isJuvenil: boolean): boolean => {
  return isBiberon || isJuvenil;
};

const getStepTitles = (isJuvenil: boolean, isBiberon: boolean) => {
  if (isBiberon) {
    return [
      { title: "Cuéntanos sobre el jugador", subtitle: "Categoría Biberón (4-5 años). Cupo limitado a 8 jugadores." },
      { title: "¿Cómo te contactamos?", subtitle: "Usaremos estos datos para coordinar el inicio" },
      { title: "Confirmar registro", subtitle: "Revisa los datos antes de enviar" },
    ];
  }
  if (isJuvenil) {
    return [
      { title: "Cuéntanos sobre el jugador", subtitle: "Juvenil A (12-13 años). Estamos abriendo 12 espacios." },
      { title: "¿Cómo te contactamos?", subtitle: "Usaremos estos datos para coordinar el inicio" },
      { title: "Confirmar registro", subtitle: "Revisa los datos antes de enviar" },
    ];
  }
  return [
    {
      title: "Cuéntanos sobre el jugador",
      subtitle: "El Reto está diseñado para niños de 6 a 11 años",
    },
    {
      title: "Tu experiencia White Lions",
      subtitle: "Esto es lo que vivirá tu hijo durante 30 días",
    },
    {
      title: "¿Cómo te contactamos?",
      subtitle: "Usaremos estos datos para coordinar el inicio del Reto",
    },
    {
      title: "Estás a un paso de vivir la experiencia White Lions",
      subtitle: "Agenda la clase muestra de tu hijo. El pago se realiza en campo solo si decides continuar.",
    },
  ];
};

// ─── Component ──────────────────────────────────────────────────────

const ChallengeRegistrationModal = ({ open, onOpenChange, referralSource }: ChallengeRegistrationModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [waitlistResult, setWaitlistResult] = useState<{ status: string; spots_taken: number; capacity: number } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to top on step change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [step]);

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
      setWaitlistResult(null);
    }
  }, [open]);

  const selectedSport = "Fútbol";
  const selectedBirthYear = form.watch("birth_year");

  const isBiberon = isBiberonYear(selectedBirthYear);
  const isJuvenil = isJuvenilAYear(selectedBirthYear);
  const isWaitlist = isWaitlistCategory(isBiberon, isJuvenil);
  const totalSteps = isWaitlist ? 3 : 4;

  const getMinStartDate = () => {
    const today = new Date();
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

  // Step validation — Biberón skips step 2 (location/schedule/date)
  const validateStep = async (currentStep: number): Promise<boolean> => {
    if (isWaitlist) {
      switch (currentStep) {
        case 1: return form.trigger(["player_name", "birth_year", "category"]);
        case 2: return form.trigger(["tutor_name", "tutor_email", "contact_phone"]);
        case 3: return true;
        default: return false;
      }
    }
    switch (currentStep) {
      case 1: return form.trigger(["player_name", "birth_year", "category"]);
      case 2: return form.trigger(["start_date"]);
      case 3: return form.trigger(["tutor_name", "tutor_email", "contact_phone"]);
      case 4: return true;
      default: return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // ─── Submit: Waitlist (Biberón) ───────────────────────────────────
  const onSubmitWaitlist = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const birthYear = parseInt(data.birth_year);
      const waitlistCategory = isBiberon ? 'biberon' : 'juvenil_a';
      const waitlistBatch = isBiberon ? 'Biberon_Mar_2026_Batch1' : 'JuvenilA_2026_Batch1';
      const categoryLabel = isBiberon ? 'Biberón (4-5 años)' : 'Juvenil A (12-13 años)';

      const notesWithReferral = referralSource && data.referral_name
        ? `[Referido por: ${data.referral_name}] ${data.notes || ''}`
        : data.notes || null;

      const { data: result, error } = await supabase.rpc('insert_waitlist_registration', {
        p_child_name: data.player_name,
        p_child_birth_year: birthYear,
        p_child_age: null,
        p_parent_name: data.tutor_name,
        p_parent_whatsapp: data.contact_phone,
        p_parent_email: data.tutor_email,
        p_school: data.school || null,
        p_notes: notesWithReferral,
        p_category: waitlistCategory,
        p_batch: waitlistBatch,
        p_source: referralSource || 'web_form',
      });

      if (error) throw error;

      const rpcResult = result as unknown as { success: boolean; error?: string; status: string; spots_taken: number; capacity: number };

      if (!rpcResult.success) {
        throw new Error(rpcResult.error || 'Error al registrar');
      }

      setWaitlistResult({
        status: rpcResult.status,
        spots_taken: rpcResult.spots_taken,
        capacity: rpcResult.capacity,
      });

      // Send waitlist confirmation email
      try {
        await supabase.functions.invoke('send-confirmation', {
          body: {
            type: 'waitlist',
            player_name: data.player_name,
            tutor_name: data.tutor_name,
            parent_email: data.tutor_email,
            category: categoryLabel,
            waitlist_status: rpcResult.status,
            spots_taken: rpcResult.spots_taken,
            capacity: rpcResult.capacity,
          }
        });
      } catch (emailErr) {
        console.error("Waitlist email error:", emailErr);
      }

      setSubmittedData(data);
      setIsSubmitted(true);
      form.reset();

      toast({
        title: rpcResult.status === 'accepted'
          ? "¡Estás dentro del cupo!"
          : "¡Registrado en lista de espera!",
        description: rpcResult.status === 'accepted'
          ? "Te contactaremos para confirmar tu primer día."
          : "Te avisaremos en cuanto se liberen cupos.",
      });
    } catch (error: any) {
      console.error("Error al guardar waitlist:", error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al procesar tu registro. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Submit: Regular flow (6-13 años) ─────────────────────────────
  const onSubmitRegular = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const location = getLocation(data.sport);
      const schedule = getSchedule(data.sport);
      const formattedDate = data.start_date
        ? format(data.start_date, "EEEE d 'de' MMMM", { locale: es })
        : '';

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
            school: data.school || null,
            comments: data.notes || null,
            status: newStatus,
            attendance_marked_at: null,
            no_show_processed_at: null,
            status_updated_at: new Date().toISOString(),
            ...(referralSource ? { referral_name: data.referral_name || null, referral_source: referralSource } : {}),
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
            school: data.school || null,
            comments: data.notes || null,
            ...(referralSource ? { referral_name: data.referral_name || null, referral_source: referralSource } : {}),
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

  const onSubmit = async (data: FormData) => {
    if (isWaitlist) {
      return onSubmitWaitlist(data);
    }
    return onSubmitRegular(data);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setSubmittedData(null);
    setWaitlistResult(null);
    setStep(1);
    form.reset();
    onOpenChange(false);
  };

  const categories = getCategories(selectedBirthYear);
  const nextAvailableDate = getNextAvailableDate(selectedSport);
  const progressValue = (step / totalSteps) * 100;
  const stepTitles = getStepTitles(isJuvenil, isBiberon);

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent ref={contentRef} className="w-[calc(100vw-2rem)] max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden backdrop-blur-xl bg-background/95">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <span className="sr-only">Cerrar</span>
          ✕
        </button>

        <DialogHeader className="space-y-4">
          <DialogTitle className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground text-center font-display uppercase leading-tight">
            {isBiberon
              ? "🍼 Lista de Espera — Biberón"
              : isJuvenil
                ? "⚽ Lista de Espera — Juvenil A"
                : "🦁 Reto White Lions – 30 Días"}
          </DialogTitle>

          {!isSubmitted && (
            <div className="space-y-3">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Paso {step} de {totalSteps}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalSteps }, (_, i) => (
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
                <h3 className="text-base sm:text-lg font-semibold text-foreground leading-tight">
                  {stepTitles[step - 1].title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stepTitles[step - 1].subtitle}
                </p>
              </div>
            </div>
          )}
        </DialogHeader>

        {!isSubmitted ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">

              {/* ═══ STEP 1: Datos del Jugador (shared) ═══ */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                step === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                {/* Sport Selection */}
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
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escuela <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                      <FormControl>
                        <Input
                          placeholder="¿En qué escuela estudia?"
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
                        {isBiberon
                          ? "Categoría Biberón: para niños de 4-5 años (nacidos en 2020-2021)."
                          : isJuvenil
                            ? "Juvenil A: para jugadores de 12-13 años (nacidos en 2012-2013). Estamos abriendo 12 espacios."
                            : "El Reto está disponible para niños de 6 a 11 años."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Biberón Waitlist Banner */}
                {isBiberon && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Baby className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="font-semibold text-foreground text-sm">
                        🍼 Biberón (4-5 años) — Categoría activa
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Martes y Jueves, 6:00–7:00 PM · Hacienda del Bosque<br />
                      <strong>Cupo máximo: 8 jugadores.</strong> Si el cupo está lleno, quedarás en lista de espera automáticamente.
                    </p>
                  </div>
                )}

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

              {/* ═══ STEP 2 (regular): La Experiencia del Reto ═══ */}
              {!isBiberon && (
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
                          Durante el Reto White Lions tu hijo vivirá:
                        </p>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-start gap-1.5"><span className="text-primary text-xs mt-0.5">✓</span> Entrenamientos dos veces por semana</li>
                          <li className="flex items-start gap-1.5"><span className="text-primary text-xs mt-0.5">✓</span> Adaptación progresiva al sistema White Lions</li>
                          <li className="flex items-start gap-1.5"><span className="text-primary text-xs mt-0.5">✓</span> Desarrollo de hábitos deportivos</li>
                          <li className="flex items-start gap-1.5"><span className="text-primary text-xs mt-0.5">✓</span> Integración al grupo y entrenadores</li>
                          <li className="flex items-start gap-1.5"><span className="text-primary text-xs mt-0.5">✓</span> Evaluación real de si este sistema es para tu familia</li>
                        </ul>
                        <p className="text-[11px] text-muted-foreground/70 mt-2 italic">
                          Los partidos oficiales y el kit White Lions se habilitan únicamente al finalizar el Reto y completar la inscripción.
                        </p>
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

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      size="lg"
                      className="w-full sm:flex-1 order-2 sm:order-1"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Atrás
                    </Button>
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="w-full sm:flex-[2] order-1 sm:order-2"
                      variant="hero"
                      size="lg"
                    >
                      <span className="hidden sm:inline">Quiero apartar mi lugar</span>
                      <span className="sm:hidden">Apartar lugar</span>
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* ═══ Tutor Step (Step 2 for Biberón, Step 3 for regular) ═══ */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                (isBiberon ? step === 2 : step === 3) ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
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
                        {isBiberon
                          ? "Te enviaremos la confirmación de tu registro en la lista de espera."
                          : "Te enviaremos la confirmación con los detalles de la clase muestra."}
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

                {referralSource && (
                  <FormField
                    control={form.control}
                    name="referral_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          ¿Quién te invitó a White Lions?
                          <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre del jugador o padre de familia"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        ¿Algo que debamos saber?
                        <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={isBiberon
                            ? "Ej: Experiencia previa, necesidades especiales..."
                            : "Ej: Experiencia previa, lesiones, necesidades especiales, objetivos del jugador..."}
                          className="min-h-[80px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        {isBiberon
                          ? "Esta información nos ayuda a preparar la categoría."
                          : "Esta información nos ayuda a personalizar la experiencia de tu hijo."}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    onClick={prevStep}
                    variant="outline"
                    size="lg"
                    className="w-full sm:flex-1 order-2 sm:order-1"
                  >
                    <ChevronLeft className="mr-2 h-5 w-5" />
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="w-full sm:flex-[2] order-1 sm:order-2"
                    variant="hero"
                    size="lg"
                  >
                    {isBiberon ? (
                      <>
                        <span className="hidden sm:inline">Confirmar registro</span>
                        <span className="sm:hidden">Confirmar</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Confirmar clase muestra</span>
                        <span className="sm:hidden">Confirmar clase</span>
                      </>
                    )}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* ═══ Biberón Step 3: Confirm Waitlist ═══ */}
              {isBiberon && (
                <div className={cn(
                  "space-y-3 sm:space-y-5 transition-all duration-300 ease-out",
                  step === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
                )}>
                  {/* Summary Card */}
                  <div className="bg-muted/30 rounded-xl p-3 sm:p-5 space-y-3 border border-border/50">
                    <p className="text-sm font-semibold text-foreground mb-2">📋 Resumen de tu registro</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jugador</span>
                        <span className="font-medium">{form.watch("player_name")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Año de nacimiento</span>
                        <span className="font-medium">{form.watch("birth_year")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categoría</span>
                        <span className="font-medium">Biberón (4-5 años)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tutor</span>
                        <span className="font-medium">{form.watch("tutor_name")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">WhatsApp</span>
                        <span className="font-medium">{form.watch("contact_phone")}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-border/50">
                        <span className="text-muted-foreground font-semibold">Inicio estimado</span>
                        <span className="font-bold text-primary">Lun 2 Mar 2026</span>
                      </div>
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 rounded-xl">
                    <span className="text-lg sm:text-xl">💡</span>
                    <div>
                      <p className="font-semibold text-foreground text-xs sm:text-sm mb-0.5 sm:mb-1">Importante</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground break-words">
                        Al registrarte entras a la lista de espera con cupo limitado a 8 espacios.
                        Te contactaremos por WhatsApp para confirmar tu lugar.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1 sm:pt-2">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      size="lg"
                      className="w-full sm:flex-1 order-2 sm:order-1"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:flex-[2] order-1 sm:order-2"
                      variant="gold"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Procesando..." : (
                        <>
                          <span className="hidden sm:inline">🍼 Registrarme en lista de espera</span>
                          <span className="sm:hidden">🍼 Registrarme</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-center text-[11px] sm:text-xs text-muted-foreground break-words">
                    Cupo limitado · 8 espacios · Inicio Marzo 2026
                  </p>
                </div>
              )}

              {/* ═══ Regular Step 4: Agendar Clase Muestra ═══ */}
              {!isBiberon && (
                <div className={cn(
                  "space-y-3 sm:space-y-5 transition-all duration-300 ease-out",
                  step === 4 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
                )}>
                  {/* Sección Informativa */}
                  <div className="bg-muted/30 border border-border/50 rounded-xl p-3 sm:p-5">
                    <p className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                      📋 ¿Qué sigue después de la clase muestra?
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      {isJuvenil
                        ? "Después de la clase muestra, puedes inscribir a tu hijo directamente en White Lions."
                        : "Después de la clase muestra, puedes iniciar el Reto White Lions – 30 días, una experiencia de integración diseñada para que tu hijo conozca nuestra metodología, se adapte al grupo y viva el sistema White Lions desde dentro."}
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {!isJuvenil && (
                        <>
                          <div className="flex items-center gap-1.5">
                            <span className="text-primary text-xs">✓</span>
                            <span className="text-xs">30 días de entrenamiento</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-primary text-xs">✓</span>
                            <span className="text-xs">Metodología europea</span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-primary text-xs">✓</span>
                        <span className="text-xs">Seguimiento formativo</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-primary text-xs">✓</span>
                        <span className="text-xs">Ambiente sano y comunidad real</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-primary text-xs">✓</span>
                        <span className="text-xs">Garantía de satisfacción</span>
                      </div>
                    </div>
                  </div>

                  {/* Nota de Confianza */}
                  <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <span className="text-lg sm:text-xl">💡</span>
                    <div>
                      <p className="font-semibold text-foreground text-xs sm:text-sm mb-0.5 sm:mb-1">Importante</p>
                      <p className="text-[11px] sm:text-xs text-muted-foreground break-words">
                        La clase muestra es gratuita y sin compromiso. El Reto White Lions tiene un costo de inscripción de $500 MXN (ciclo Ago–Jun) + primera mensualidad de $500 MXN, y se paga en campo únicamente si decides continuar después de la experiencia inicial.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1 sm:pt-2">
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      size="lg"
                      className="w-full sm:flex-1 order-2 sm:order-1"
                    >
                      <ChevronLeft className="mr-2 h-5 w-5" />
                      Atrás
                    </Button>
                    <Button
                      type="submit"
                      className="w-full sm:flex-[2] order-1 sm:order-2"
                      variant="gold"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Procesando..." : (
                        <>
                          <span className="hidden sm:inline">📅 Agendar clase muestra</span>
                          <span className="sm:hidden">📅 Agendar clase</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-center text-[11px] sm:text-xs text-muted-foreground break-words">
                    Clase gratuita · Sin compromiso · Cupos limitados
                  </p>
                </div>
              )}
            </form>
          </Form>
        ) : (
          /* ═══ Success Screen ═══ */
          <div className="py-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <div>
                {isBiberon && waitlistResult ? (
                  <>
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 font-display uppercase">
                      {waitlistResult.status === 'accepted'
                        ? "¡Estás dentro del cupo!"
                        : "¡Registrado en lista de espera!"}
                    </h3>
                    <p className="text-muted-foreground font-body text-sm">
                      {waitlistResult.status === 'accepted'
                        ? `¡Listo! Estás dentro del cupo inicial (${waitlistResult.capacity}). Te contactaremos para confirmar tu primer día (Inicio: Lun 2 Mar).`
                        : "¡Listo! Quedaste en lista de espera. Te contactaremos en cuanto se liberen cupos."}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-foreground mb-1 font-display uppercase">
                      ¡Tu clase muestra está agendada!
                    </h3>
                    <p className="text-muted-foreground font-body">
                      {submittedData?.player_name} ya tiene su lugar reservado. Te esperamos en campo.
                    </p>
                  </>
                )}
              </div>
            </div>

            {submittedData && !isBiberon && (
              <div className="bg-muted/30 rounded-xl p-5 space-y-3 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-3">Resumen de tu clase muestra</p>
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
                  {submittedData.start_date && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Fecha</span>
                      <span className="font-medium capitalize text-right max-w-[55%] break-words">
                        {format(submittedData.start_date, "EEEE d 'de' MMMM", { locale: es })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sede</span>
                    <span className="font-medium">{getLocation(submittedData.sport)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground font-semibold">Clase muestra</span>
                    <span className="font-bold text-primary">Gratuita</span>
                  </div>
                </div>
              </div>
            )}

            {submittedData && isBiberon && waitlistResult && (
              <div className="bg-muted/30 rounded-xl p-5 space-y-3 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-3">Resumen de tu registro</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jugador</span>
                    <span className="font-medium">{submittedData.player_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría</span>
                    <span className="font-medium">Biberón (4-5 años)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tutor</span>
                    <span className="font-medium">{submittedData.tutor_name}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/50">
                    <span className="text-muted-foreground font-semibold">Status</span>
                    <span className={cn(
                      "font-bold",
                      waitlistResult.status === 'accepted' ? "text-green-600" : "text-amber-600"
                    )}>
                      {waitlistResult.status === 'accepted' ? "✅ Dentro del cupo" : "⏳ En lista de espera"}
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
                {isBiberon
                  ? "Te enviamos la confirmación de tu registro en la lista de espera."
                  : <>Te enviamos la confirmación con los detalles de la clase muestra.<br />Recuerda llegar 10 minutos antes.</>}
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
