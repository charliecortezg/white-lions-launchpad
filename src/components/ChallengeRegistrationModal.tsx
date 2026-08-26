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
import { CalendarIcon, CheckCircle2, MapPin, Clock, Gift, Mail, ChevronLeft, ChevronRight } from "lucide-react";
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

// ─── Constants ──────────────────────────────────────────────────────

const SPORT = "Fútbol";
const LOCATION = "Campo Hacienda del Bosque";
const LOCATION_ZONE = "Zona Juventud 2000, Mexicali";
const LOCATION_MAP = "https://share.google/JWKOVbkRTJ8bDJaMU";
// Schedule text per category (no seasonal references)
const getScheduleText = (cat: string): string => {
  if (cat === "Biberón") {
    return "7:30–8:30 PM. Entrena Martes y Jueves.";
  }
  return "7:30–9:00 PM. Entrena Lunes y Miércoles.";
};

// ─── Helpers ────────────────────────────────────────────────────────

const getCategoryFromYear = (birthYear: string | undefined): string => {
  if (!birthYear) return "";
  const y = parseInt(birthYear);
  if (y === 2021 || y === 2022) return "Biberón";
  if (y === 2019 || y === 2020) return "Escuelita";
  if (y === 2017 || y === 2018) return "Estrellita";
  if (y === 2015 || y === 2016) return "Infantil";
  if (y === 2013 || y === 2014) return "Juvenil A";
  return "";
};

const getValidYears = () => {
  // 2022, 2021, ..., 2013
  return Array.from({ length: 10 }, (_, i) => (2022 - i).toString());
};

const getCategories = (birthYear: string | undefined) => {
  const cat = getCategoryFromYear(birthYear);
  return cat ? [cat] : [];
};

const getCategoryDays = (cat: string): number[] | null => {
  if (cat === "Biberón") return [2, 4]; // Martes, Jueves
  if (cat === "Escuelita" || cat === "Estrellita") return [1, 3]; // Lunes, Miércoles
  return null; // Infantil / Juvenil A usan el selector manual
};

const getNextClassDate = (cat: string): Date | null => {
  const days = getCategoryDays(cat);
  if (!days) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i <= 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (days.includes(d.getDay())) return d;
  }
  return null;
};

const getCategorySubtitle = (cat: string): string => {
  if (cat === "Biberón" || cat === "Escuelita")
    return "Ya tenemos un grupo de 8 niños. Buscamos 5 más para completar el grupo (cupo máximo: 13).";
  if (cat === "Estrellita") return "Grupos reducidos. Lugares limitados.";
  if (cat === "Infantil") return "Grupos reducidos. 5 lugares disponibles.";
  if (cat === "Juvenil A")
    return "Programa de fútbol 11 con metodología estructurada. 5 lugares disponibles.";
  return "Selecciona el año de nacimiento para ver la categoría de tu hijo.";
};

const getStepTitles = (cat: string) => [
  { title: "Cuéntanos sobre el jugador", subtitle: getCategorySubtitle(cat) },
  { title: "Tu experiencia White Lions", subtitle: "Esto es lo que vivirá tu hijo durante la clase muestra" },
  { title: "¿Cómo te contactamos?", subtitle: "Usaremos estos datos para coordinar tu clase muestra" },
  {
    title: "Estás a un paso de vivir la experiencia White Lions",
    subtitle: "Confirma la clase muestra de tu hijo. Es gratuita y sin compromiso.",
  },
];

// ─── Component ──────────────────────────────────────────────────────

const ChallengeRegistrationModal = ({ open, onOpenChange, referralSource }: ChallengeRegistrationModalProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!open) setStep(1);
  }, [open]);

  const selectedBirthYear = form.watch("birth_year");
  const selectedCategory = form.watch("category") || getCategoryFromYear(selectedBirthYear);
  const totalSteps = 4;

  // Auto-fill fixed date when applicable
  useEffect(() => {
    const cat = getCategoryFromYear(selectedBirthYear);
    if (cat && isFixedDateCategory(cat)) {
      const d = getFixedDate(cat);
      if (d) form.setValue("start_date", d);
    }
  }, [selectedBirthYear, form]);

  const getMinStartDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  const isValidDate = (date: Date) => {
    const day = getDay(date);
    if (date < getMinStartDate()) return false;
    return day === 1 || day === 3; // Lun / Mié
  };

  const getNextAvailableDate = (): Date | undefined => {
    const startDate = getMinStartDate();
    for (let i = 0; i <= 14; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      if ([1, 3].includes(getDay(d))) return d;
    }
    return undefined;
  };

  const normalizeEmail = (e: string) => e.toLowerCase().trim();
  const normalizePhone = (p: string) => p.replace(/[^0-9]/g, '');

  const validateStep = async (currentStep: number): Promise<boolean> => {
    switch (currentStep) {
      case 1: return form.trigger(["player_name", "birth_year", "category"]);
      case 2: return form.trigger(["start_date"]);
      case 3: return form.trigger(["tutor_name", "tutor_email", "contact_phone"]);
      case 4: return true;
      default: return false;
    }
  };

  const nextStep = async () => {
    const ok = await validateStep(step);
    if (ok && step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const schedule = SUMMER_SCHEDULE_TEXT;
      const formattedDate = data.start_date
        ? format(data.start_date, "EEEE d 'de' MMMM", { locale: es })
        : '';

      const emailNormalized = normalizeEmail(data.tutor_email);
      const phoneNormalized = normalizePhone(data.contact_phone);

      // Read UTM params from sessionStorage (captured on site load)
      const readUtm = (k: string): string | null => {
        try {
          const v = sessionStorage.getItem(k);
          return v && v.length > 0 ? v : null;
        } catch { return null; }
      };
      const utmFields = {
        utm_source: readUtm('utm_source'),
        utm_campaign: readUtm('utm_campaign'),
        utm_content: readUtm('utm_content'),
        utm_medium: readUtm('utm_medium'),
      };


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

      if (searchError) console.warn("Search error:", searchError);

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
            preferred_location: LOCATION,
            preferred_schedule: `${formattedDate} - ${schedule}`,
            school: data.school || null,
            comments: data.notes || null,
            status: newStatus,
            attendance_marked_at: null,
            no_show_processed_at: null,
            status_updated_at: new Date().toISOString(),
            ...(referralSource ? { referral_name: data.referral_name || null, referral_source: referralSource } : {}),
            ...utmFields,

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
            preferred_location: LOCATION,
            preferred_schedule: `${formattedDate} - ${schedule}`,
            school: data.school || null,
            comments: data.notes || null,
            ...(referralSource ? { referral_name: data.referral_name || null, referral_source: referralSource } : {}),
            ...utmFields,
          }]);
        if (insertError) throw insertError;
      }

      // Fire Meta Pixel Lead event (secondary, must never block registration)
      try {
        if (typeof (window as any).fbq === 'function') {
          (window as any).fbq('track', 'Lead');
        }
      } catch (fbqErr) {
        console.warn('fbq Lead event failed:', fbqErr);
      }


      try {
        await supabase.functions.invoke('send-confirmation', {
          body: {
            player_name: data.player_name,
            tutor_name: data.tutor_name,
            parent_email: data.tutor_email,
            sport: SPORT,
            category: data.category,
            trial_date: formattedDate,
            location: LOCATION,
            location_zone: LOCATION_ZONE,
            location_map: LOCATION_MAP,
            schedule: "7:30 PM (horario de verano de julio)",
          }
        });
      } catch (emailErr) {
        console.error("Email function error:", emailErr);
      }

      setSubmittedData(data);
      setIsSubmitted(true);
      form.reset();

      toast({
        title: isUpdate ? "¡Inscripción actualizada!" : "¡Tu clase muestra está agendada!",
        description: isUpdate
          ? "Hemos actualizado tu inscripción con la nueva fecha."
          : "Te enviamos un correo con los detalles.",
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
  const nextAvailableDate = getNextAvailableDate();
  const progressValue = (step / totalSteps) * 100;
  const stepTitles = getStepTitles(selectedCategory);
  const currentCat = selectedCategory;
  const fixedDate = isFixedDateCategory(currentCat) ? getFixedDate(currentCat) : null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent ref={contentRef} className="w-[calc(100vw-2rem)] max-w-[600px] max-h-[90vh] overflow-y-auto overflow-x-hidden backdrop-blur-xl bg-background/95">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <span className="sr-only">Cerrar</span>
          ✕
        </button>

        <DialogHeader className="space-y-4">
          <DialogTitle className="text-lg sm:text-2xl md:text-3xl font-bold text-foreground text-center font-display uppercase leading-tight">
            🦁 Clase muestra gratuita
          </DialogTitle>

          {!isSubmitted && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Paso {step} de {totalSteps}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div key={i} className={cn("w-2 h-2 rounded-full transition-all duration-300", i + 1 <= step ? "bg-primary" : "bg-muted")} />
                  ))}
                </div>
              </div>
              <Progress value={progressValue} className="h-2" />
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

              {/* ═══ STEP 1 ═══ */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                step === 1 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                <div className="bg-primary/10 border-2 border-primary rounded-xl p-4 text-center">
                  <span className="text-3xl block mb-1">⚽</span>
                  <span className="font-semibold text-foreground">Fútbol</span>
                  <span className="text-xs text-muted-foreground block">Campo Hacienda del Bosque</span>
                </div>

                <FormField control={form.control} name="player_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Jugador</FormLabel>
                    <FormControl><Input placeholder="Nombre completo del jugador" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="school" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Escuela <span className="text-muted-foreground font-normal">(opcional)</span></FormLabel>
                    <FormControl><Input placeholder="¿En qué escuela estudia?" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="birth_year" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año de Nacimiento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Selecciona el año" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {getValidYears().map((year) => (<SelectItem key={year} value={year}>{year}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <FormDescription className="text-xs">
                      Categorías 2013–2022 (4 a 13 años). Fútbol · Campo Hacienda del Bosque.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                {categories.length > 0 && (
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-12"><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <Button type="button" onClick={nextStep} className="w-full" variant="hero" size="lg">
                  Continuar <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* ═══ STEP 2 — Fecha ═══ */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                step === 2 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                <div className="bg-muted/30 rounded-xl p-5 space-y-4 border border-border/50">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">{LOCATION}</p>
                      <p className="text-sm text-muted-foreground">{LOCATION_ZONE}</p>
                      <a href={LOCATION_MAP} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">Ver en Google Maps</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">{SUMMER_SCHEDULE_TEXT}</p>
                  </div>
                </div>

                {fixedDate ? (
                  <div className="bg-primary/10 border-2 border-primary/40 rounded-xl p-5 text-center space-y-2">
                    <p className="text-sm text-muted-foreground font-body">Tu clase muestra</p>
                    <p className="text-lg font-bold text-foreground font-display capitalize">
                      {format(fixedDate, "EEEE d 'de' MMMM", { locale: es })}, 7:30 PM
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {LOCATION} · Arranque del nuevo ciclo deportivo
                    </p>
                  </div>
                ) : (
                  <FormField control={form.control} name="start_date" render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha de tu clase muestra</FormLabel>
                      <p className="text-xs text-muted-foreground -mt-1 mb-1">
                        Ya estamos entrenando. Elige el día de tu clase muestra esta semana.
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className={cn("w-full h-12 pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                              {field.value
                                ? format(field.value, "EEEE, d 'de' MMMM", { locale: es })
                                : <span>Selecciona una fecha</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => !isValidDate(d)} initialFocus className="pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-muted-foreground">Solo puedes seleccionar lunes y miércoles</p>
                        {nextAvailableDate && !field.value && (
                          <button type="button" onClick={() => field.onChange(nextAvailableDate)} className="text-xs text-primary hover:text-primary/80 underline text-left w-fit">
                            Próxima fecha: {format(nextAvailableDate, "EEEE d 'de' MMMM", { locale: es })}
                          </button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="button" onClick={prevStep} variant="outline" size="lg" className="w-full sm:flex-1 order-2 sm:order-1">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Atrás
                  </Button>
                  <Button type="button" onClick={nextStep} className="w-full sm:flex-[2] order-1 sm:order-2" variant="hero" size="lg">
                    Continuar <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* ═══ STEP 3 — Tutor ═══ */}
              <div className={cn(
                "space-y-5 transition-all duration-300 ease-out",
                step === 3 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                <FormField control={form.control} name="tutor_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Tutor</FormLabel>
                    <FormControl><Input placeholder="Nombre completo del tutor" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="tutor_email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico del Tutor</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="email" placeholder="correo@ejemplo.com" className="pl-10 h-12" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Te enviaremos la confirmación con los detalles de la clase muestra.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contact_phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de Contacto (WhatsApp)</FormLabel>
                    <FormControl><Input type="tel" placeholder="686 123 4567" className="h-12" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {referralSource && (
                  <FormField control={form.control} name="referral_name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>¿Quién te invitó a White Lions? <span className="text-muted-foreground font-normal ml-1">(opcional)</span></FormLabel>
                      <FormControl><Input placeholder="Nombre del jugador o padre de familia" className="h-12" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Algo que debamos saber? <span className="text-muted-foreground font-normal ml-1">(opcional)</span></FormLabel>
                    <FormControl><Textarea placeholder="Ej: Experiencia previa, lesiones, necesidades especiales..." className="min-h-[80px] resize-none" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button type="button" onClick={prevStep} variant="outline" size="lg" className="w-full sm:flex-1 order-2 sm:order-1">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Atrás
                  </Button>
                  <Button type="button" onClick={nextStep} className="w-full sm:flex-[2] order-1 sm:order-2" variant="hero" size="lg">
                    Continuar <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* ═══ STEP 4 — Confirmar ═══ */}
              <div className={cn(
                "space-y-3 sm:space-y-5 transition-all duration-300 ease-out",
                step === 4 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 hidden"
              )}>
                <div className="bg-muted/30 border border-border/50 rounded-xl p-3 sm:p-5">
                  <p className="font-semibold text-foreground mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                    <Gift className="w-4 h-4 text-primary" /> Tu clase muestra
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Jugador</span><span className="font-medium">{form.watch("player_name")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Categoría</span><span className="font-medium">{form.watch("category")}</span></div>
                    {form.watch("start_date") && (
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">Fecha</span>
                        <span className="font-medium capitalize text-right max-w-[55%] break-words">
                          {format(form.watch("start_date") as Date, "EEEE d 'de' MMMM", { locale: es })}, 7:30 PM
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between"><span className="text-muted-foreground">Sede</span><span className="font-medium text-right max-w-[55%]">{LOCATION}</span></div>
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <span className="text-lg sm:text-xl">💡</span>
                  <div>
                    <p className="font-semibold text-foreground text-xs sm:text-sm mb-0.5 sm:mb-1">Importante</p>
                    <p className="text-[11px] sm:text-xs text-muted-foreground break-words">
                      La clase muestra es gratuita y sin compromiso. Entrenamos en campo natural de tierra: recomendamos tenis deportivos o tacos multitaco, ropa cómoda y botella de agua. Llegar 10 minutos antes.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-1 sm:pt-2">
                  <Button type="button" onClick={prevStep} variant="outline" size="lg" className="w-full sm:flex-1 order-2 sm:order-1">
                    <ChevronLeft className="mr-2 h-5 w-5" /> Atrás
                  </Button>
                  <Button type="submit" className="w-full sm:flex-[2] order-1 sm:order-2" variant="gold" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? "Procesando..." : (<>
                      <span className="hidden sm:inline">📅 Agendar clase muestra</span>
                      <span className="sm:hidden">📅 Agendar clase</span>
                    </>)}
                  </Button>
                </div>
                <p className="text-center text-[11px] sm:text-xs text-muted-foreground break-words">
                  Clase gratuita · Sin compromiso · Lugares limitados
                </p>
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
                  ¡Tu clase muestra está agendada!
                </h3>
                <p className="text-muted-foreground font-body">
                  {submittedData?.player_name} ya tiene su lugar reservado. Te esperamos en campo.
                </p>
              </div>
            </div>

            {submittedData && (
              <div className="bg-muted/30 rounded-xl p-5 space-y-3 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-3">Resumen</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Jugador</span><span className="font-medium">{submittedData.player_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Categoría</span><span className="font-medium">{submittedData.category}</span></div>
                  {submittedData.start_date && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Fecha</span>
                      <span className="font-medium capitalize text-right max-w-[55%] break-words">
                        {format(submittedData.start_date, "EEEE d 'de' MMMM", { locale: es })}, 7:30 PM
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between"><span className="text-muted-foreground">Sede</span><span className="font-medium text-right max-w-[55%]">{LOCATION}</span></div>
                  <div className="flex justify-between pt-2 border-t border-border/50"><span className="text-muted-foreground font-semibold">Clase muestra</span><span className="font-bold text-primary">Gratuita</span></div>
                </div>
              </div>
            )}

            <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-center">
              <p className="text-sm text-foreground font-medium mb-2">📧 Revisa tu correo electrónico</p>
              <p className="text-xs text-muted-foreground">
                Te enviamos la confirmación con los detalles de la clase muestra.<br />Recuerda llegar 10 minutos antes.
              </p>
            </div>

            <Button onClick={handleClose} variant="outline" size="lg" className="w-full">Cerrar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeRegistrationModal;
