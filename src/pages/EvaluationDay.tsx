import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  MapPin, Clock, Users, CalendarCheck, ClipboardCheck, FileText,
  ChevronRight, CheckCircle2, Star, Trophy, Shield, UserCheck
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoWhiteLions from "@/assets/logo-white-lions.png";
import AnimatedSection from "@/components/AnimatedSection";

// ─── Types ──────────────────────────────────────────────────────────

interface EvaluationEvent {
  id: string;
  title: string;
  event_date: string;
  location_name: string;
  address: string;
  maps_url: string | null;
  check_in_time: string;
  start_time: string;
  end_time: string;
}

interface PartnerSchool {
  school_name: string;
}

// ─── Schema ─────────────────────────────────────────────────────────

const registrationSchema = z.object({
  player_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  player_dob: z.string().min(1, "La fecha de nacimiento es requerida"),
  school_name: z.string().min(2, "La escuela es requerida").max(200),
  guardian_full_name: z.string().min(2, "El nombre del tutor debe tener al menos 2 caracteres").max(100),
  guardian_phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos").max(15),
  guardian_email: z.string().email("Ingresa un correo electrónico válido").max(255),
  current_club: z.string().max(100).optional(),
  privacy_accepted: z.boolean().refine(v => v === true, "Debes aceptar el aviso de privacidad"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

// ─── Helpers ────────────────────────────────────────────────────────

const formatEventDate = (dateStr: string) => {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

// ─── Component ──────────────────────────────────────────────────────

const EvaluationDay = () => {
  const [selectedPath, setSelectedPath] = useState<"active" | "external" | null>(null);
  const [event, setEvent] = useState<EvaluationEvent | null>(null);
  const [partnerSchools, setPartnerSchools] = useState<string[]>([]);
  const [isPartner, setIsPartner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [calculatedFee, setCalculatedFee] = useState(300);
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      player_name: "",
      player_dob: "",
      school_name: "",
      guardian_full_name: "",
      guardian_phone: "",
      guardian_email: "",
      current_club: "",
      privacy_accepted: false,
    },
  });

  // Fetch active event + partner schools
  useEffect(() => {
    const fetchData = async () => {
      const [evRes, psRes] = await Promise.all([
        supabase.from("evaluation_events").select("*").eq("is_active", true).limit(1).single(),
        supabase.from("partner_schools").select("school_name").eq("active", true),
      ]);
      if (evRes.data) setEvent(evRes.data as unknown as EvaluationEvent);
      if (psRes.data) setPartnerSchools((psRes.data as unknown as PartnerSchool[]).map(s => s.school_name));
    };
    fetchData();
  }, []);

  // School name watcher for partner detection
  const schoolValue = form.watch("school_name");
  useEffect(() => {
    if (!schoolValue || schoolValue.length < 2) {
      setSchoolSuggestions([]);
      setShowSuggestions(false);
      setIsPartner(false);
      setCalculatedFee(300);
      return;
    }
    const lower = schoolValue.toLowerCase();
    const matches = partnerSchools.filter(s => s.toLowerCase().includes(lower));
    setSchoolSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    const exactMatch = partnerSchools.some(s => s.toLowerCase() === lower);
    setIsPartner(exactMatch);
    setCalculatedFee(exactMatch ? 0 : 300);
  }, [schoolValue, partnerSchools]);

  const selectSchool = (name: string) => {
    form.setValue("school_name", name);
    setShowSuggestions(false);
  };

  const handlePathSelect = (path: "active" | "external") => {
    setSelectedPath(path);
    setTimeout(() => {
      const ref = path === "external" ? formRef : activeRef;
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const onSubmit = async (data: RegistrationForm) => {
    if (!event) return;
    setIsSubmitting(true);
    try {
      const fee = isPartner ? 0 : 300;
      const { error } = await supabase.from("evaluation_event_registrations").insert({
        event_id: event.id,
        player_name: data.player_name.trim(),
        player_dob: data.player_dob,
        school_name: data.school_name.trim(),
        is_partner_school: isPartner,
        current_club: data.current_club?.trim() || null,
        guardian_full_name: data.guardian_full_name.trim(),
        guardian_phone: data.guardian_phone.trim(),
        guardian_email: data.guardian_email.trim().toLowerCase(),
        calculated_fee_mxn: fee,
        payment_status: fee === 0 ? "waived" : "unpaid",
        source: "Landing Evaluaciones WLA",
      } as any);

      if (error) throw error;

      // Send confirmation email
      try {
        await supabase.functions.invoke("send-evaluation-confirmation", {
          body: {
            guardian_name: data.guardian_full_name.trim(),
            guardian_email: data.guardian_email.trim().toLowerCase(),
            player_name: data.player_name.trim(),
            event_title: event.title,
            event_date: formatEventDate(event.event_date),
            location_name: event.location_name,
            address: event.address,
            maps_url: event.maps_url,
            check_in_time: event.check_in_time,
            start_time: event.start_time,
            end_time: event.end_time,
            fee: fee,
            is_partner_school: isPartner,
            school_name: data.school_name.trim(),
          },
        });
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Registration error:", err);
      toast({
        title: "Error al registrar",
        description: "Hubo un problema. Intenta de nuevo o contáctanos por WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground font-body text-sm">Cargando evento...</p>
        </div>
      </div>
    );
  }

  const eventDateFormatted = formatEventDate(event.event_date);

  // ─── Success State ──────────────────────────────────────────────

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
          <div className="container mx-auto px-4 py-3 flex justify-center">
            <img src={logoWhiteLions} alt="White Lions Academies" className="h-10 w-auto" />
          </div>
        </div>
        <div className="pt-24 pb-16 flex items-center justify-center min-h-screen">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                ¡Registro confirmado! 🦁
              </h1>
              <p className="text-muted-foreground font-body">
                Hemos enviado un correo de confirmación con todos los detalles del evento.
              </p>
              <div className="bg-card border border-border/50 rounded-xl p-6 text-left space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-body capitalize">{eventDateFormatted}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-body">{event.location_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground font-body">Check-in: {event.check_in_time} · Inicio: {event.start_time}</span>
                </div>
                {calculatedFee > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-body">
                      💳 Costo: <span className="text-foreground font-semibold">${calculatedFee} MXN</span> — Se paga en campo (tarjeta/transferencia/efectivo)
                    </p>
                  </div>
                )}
                {calculatedFee === 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-green-400 font-body font-semibold">
                      ✅ Sin costo — Escuela aliada White Lions Academies
                    </p>
                  </div>
                )}
              </div>
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-sm text-muted-foreground font-body">
                  📌 Recuerda llegar <strong className="text-foreground">10–15 minutos antes</strong>, con ropa deportiva, tenis y agua.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* SEO */}
      <title>Día de Evaluación WLA | White Lions Academies</title>
      <meta name="description" content="Evento institucional de evaluación para jugadores de fútbol en Mexicali. Mide tu progreso y recibe un reporte personalizado." />

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex justify-center">
          <img src={logoWhiteLions} alt="White Lions Academies" className="h-10 w-auto" />
        </div>
      </div>

      {/* Hero */}
      <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-body font-medium uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              Evento Institucional
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
              Día de Evaluación<br />
              <span className="text-primary">White Lions Academies</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-body max-w-lg mx-auto">
              Un evento institucional para medir progreso y entregar un reporte personalizado.
            </p>
            <p className="text-sm text-primary/80 font-body italic">
              "Aquí no competimos contra otros: competimos contra nuestra versión anterior."
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm text-muted-foreground font-body">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-primary" />
                <span className="capitalize">{eventDateFormatted}</span>
              </div>
              <span className="hidden sm:inline text-border">·</span>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{event.location_name}</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Path Selector */}
      <section className="py-12 sm:py-16 bg-background-alt">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              ¿Quién asiste al evento?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => handlePathSelect("active")}
                className={`group p-6 rounded-xl border-2 transition-all text-left ${
                  selectedPath === "active"
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm uppercase">
                    Jugador Activo
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground font-body mb-3">
                  Ya entrena en White Lions Academies
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-400">
                  Gratis · Sin registro
                </span>
              </button>

              <button
                onClick={() => handlePathSelect("external")}
                className={`group p-6 rounded-xl border-2 transition-all text-left ${
                  selectedPath === "external"
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground text-sm uppercase">
                    Nuevo / Externo
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground font-body mb-3">
                  Quiero que mi hijo participe
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  $300 MXN · Registro requerido
                </span>
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Active Player Path */}
      {selectedPath === "active" && (
        <section ref={activeRef} className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="max-w-xl mx-auto space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                <h3 className="text-xl font-display font-bold text-foreground">
                  Tu participación es gratuita
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Como jugador activo de White Lions Academies, no necesitas registrarte.
                </p>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-6 space-y-4">
                <h4 className="font-display font-bold text-foreground text-sm uppercase">
                  📌 Instrucciones para el día del evento
                </h4>
                <ul className="space-y-3 text-sm text-muted-foreground font-body">
                  <li className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Llega <strong className="text-foreground">10–15 minutos antes</strong> del inicio ({event.check_in_time})</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>Asiste con tu <strong className="text-foreground">uniforme White Lions</strong> completo</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary shrink-0 mt-0.5">💧</span>
                    <span>Trae <strong className="text-foreground">agua o bebida hidratante</strong></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary shrink-0 mt-0.5">⚽</span>
                    <span>No es necesario traer balón, nosotros los proporcionamos</span>
                  </li>
                </ul>
              </div>
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground font-body font-medium">{event.location_name}</span>
                </div>
                <p className="text-xs text-muted-foreground font-body ml-7">{event.address}</p>
                <p className="text-xs text-muted-foreground font-body ml-7 mt-1">
                  {event.start_time} – {event.end_time}
                </p>
                {event.maps_url && (
                  <a
                    href={event.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 ml-7 text-xs text-primary font-body hover:underline"
                  >
                    📍 Ver en Google Maps <ChevronRight className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-xs text-muted-foreground/70 font-body text-center italic">
                ¿Tu hijo ya no está activo o tienes duda? Usa el{" "}
                <button onClick={() => handlePathSelect("external")} className="text-primary underline">
                  registro de externo
                </button>.
              </p>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* External Registration Form */}
      {selectedPath === "external" && (
        <section ref={formRef} className="py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="max-w-lg mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                  Registrar jugador
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Completa los datos para participar en el Día de Evaluación.
                </p>
              </div>

              {/* Fee Banner */}
              <div className={`rounded-xl p-4 text-center text-sm font-body ${
                isPartner
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "bg-primary/10 border border-primary/20 text-primary"
              }`}>
                {isPartner ? (
                  <span>✅ <strong>Escuela aliada</strong> — Participación sin costo</span>
                ) : (
                  <span>💳 <strong>$300 MXN</strong> — Se paga en campo (tarjeta/transferencia/efectivo)</span>
                )}
              </div>

              {/* Event Details (read-only) */}
              <div className="bg-card border border-border/50 rounded-xl p-4 space-y-2">
                <p className="text-xs text-muted-foreground font-body">
                  <strong className="text-foreground">📅 Fecha:</strong>{" "}
                  <span className="capitalize">{eventDateFormatted}</span>
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  <strong className="text-foreground">📍 Sede:</strong> {event.location_name}
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  <strong className="text-foreground">🕐 Horario:</strong> {event.start_time} – {event.end_time} (Check-in: {event.check_in_time})
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Player Name */}
                  <FormField
                    control={form.control}
                    name="player_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-body text-sm">Nombre del jugador *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre completo del jugador"
                            className="bg-card border-border/50 text-foreground font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Player DOB */}
                  <FormField
                    control={form.control}
                    name="player_dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-body text-sm">Fecha de nacimiento *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            className="bg-card border-border/50 text-foreground font-body"
                            max={new Date().toISOString().split("T")[0]}
                            min="2010-01-01"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* School with Autosuggest */}
                  <FormField
                    control={form.control}
                    name="school_name"
                    render={({ field }) => (
                      <FormItem className="relative">
                        <FormLabel className="text-foreground font-body text-sm">Escuela *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre de la escuela"
                            className="bg-card border-border/50 text-foreground font-body"
                            autoComplete="off"
                            {...field}
                            onFocus={() => schoolSuggestions.length > 0 && setShowSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          />
                        </FormControl>
                        {showSuggestions && (
                          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                            {schoolSuggestions.map(s => (
                              <button
                                key={s}
                                type="button"
                                onMouseDown={() => selectSchool(s)}
                                className="w-full px-4 py-2.5 text-left text-sm font-body text-foreground hover:bg-primary/10 flex items-center gap-2"
                              >
                                <span className="text-green-400 text-xs">★ Aliada</span>
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Current Club (optional) */}
                  <FormField
                    control={form.control}
                    name="current_club"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-body text-sm">
                          Club actual <span className="text-muted-foreground">(opcional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Si entrena en otro club"
                            className="bg-card border-border/50 text-foreground font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="border-t border-border/30 pt-4">
                    <p className="text-xs text-muted-foreground font-body mb-3 uppercase tracking-wide font-medium">
                      Datos del padre / tutor
                    </p>
                  </div>

                  {/* Guardian Name */}
                  <FormField
                    control={form.control}
                    name="guardian_full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-body text-sm">Nombre completo del padre/madre/tutor *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nombre completo"
                            className="bg-card border-border/50 text-foreground font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone */}
                  <FormField
                    control={form.control}
                    name="guardian_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-body text-sm">Teléfono *</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="10 dígitos"
                            className="bg-card border-border/50 text-foreground font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="guardian_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-body text-sm">Correo electrónico *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="correo@ejemplo.com"
                            className="bg-card border-border/50 text-foreground font-body"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Privacy */}
                  <FormField
                    control={form.control}
                    name="privacy_accepted"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-xs text-muted-foreground font-body leading-relaxed cursor-pointer">
                          Acepto el aviso de privacidad y autorizo el uso de estos datos para la gestión del evento y comunicaciones relacionadas.
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    variant="gold"
                    size="lg"
                    className="w-full glow-gold text-base py-6"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-background border-t-transparent" />
                        Registrando...
                      </span>
                    ) : (
                      "📋 Registrar jugador"
                    )}
                  </Button>
                </form>
              </Form>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* What's Included */}
      <section className="py-12 sm:py-16 bg-background-alt">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              ¿Qué incluye?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-card border border-border/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground text-sm uppercase">
                  Participación en el evento
                </h3>
                <p className="text-xs text-muted-foreground font-body">
                  Evaluación técnica, física y táctica por los entrenadores WLA.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border/50 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground text-sm uppercase">
                  Reporte personalizado
                </h3>
                <p className="text-xs text-muted-foreground font-body">
                  Recibirás un reporte de evaluación individual 24–48 horas después del evento.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
              ¿Cómo funciona?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Regístrate", desc: "Completa el formulario con los datos del jugador" },
                { step: "2", title: "Asiste al evento", desc: `Llega ${event.check_in_time} al ${event.location_name}` },
                { step: "3", title: "Recibe tu reporte", desc: "Reporte personalizado en 24–48 horas por email" },
              ].map((s, i) => (
                <AnimatedSection key={i} animation="scale" delay={i * 120}>
                  <div className="flex flex-col items-center gap-3 p-5 rounded-xl bg-card border border-border/50 h-full">
                    <span className="w-10 h-10 rounded-full bg-primary/10 text-primary font-display font-bold flex items-center justify-center text-lg">
                      {s.step}
                    </span>
                    <h3 className="font-display font-bold text-foreground text-sm uppercase">{s.title}</h3>
                    <p className="text-xs text-muted-foreground font-body">{s.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <p className="text-sm text-muted-foreground font-body">
              💳 El pago para jugadores nuevos/externos se realiza <strong className="text-foreground">en campo</strong> el día del evento (tarjeta, transferencia o efectivo).
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 bg-background-alt">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fade-up" className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground text-center">
              Preguntas frecuentes
            </h2>
            <div className="space-y-3">
              {[
                {
                  q: "¿Cuánto cuesta?",
                  a: "Para jugadores activos de White Lions Academies es gratis. Para jugadores nuevos o externos, el costo es de $300 MXN, pagado en campo el día del evento. Si tu hijo asiste a una de nuestras escuelas aliadas, la participación es gratuita."
                },
                {
                  q: "¿Qué debe llevar mi hijo?",
                  a: "Ropa deportiva cómoda, tenis adecuados (de preferencia para pasto), agua o bebida hidratante. Nosotros proporcionamos los balones y el espacio."
                },
                {
                  q: "¿Quién puede asistir?",
                  a: "Cualquier jugador de fútbol en edad formativa. Tanto jugadores activos de WLA como externos de cualquier club o escuela."
                },
                {
                  q: "¿Cómo recibo el reporte?",
                  a: "El reporte personalizado se envía por correo electrónico 24–48 horas después del evento a la dirección que registraste."
                },
                {
                  q: "¿Se puede pagar en línea?",
                  a: "No. El pago se realiza únicamente en campo el día del evento. Aceptamos tarjeta, transferencia o efectivo."
                },
                {
                  q: "¿Qué pasa si mi hijo es de escuela aliada?",
                  a: "Si la escuela de tu hijo forma parte de nuestras alianzas, la participación es completamente gratuita. Al escribir el nombre de la escuela en el formulario, el sistema lo detecta automáticamente."
                },
              ].map((faq, i) => (
                <AnimatedSection key={i} animation="fade-up" delay={i * 80}>
                  <div className="bg-card border border-border/50 rounded-xl p-5 space-y-2">
                    <h3 className="text-sm font-display font-bold text-foreground">{faq.q}</h3>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{faq.a}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA Bottom */}
      {selectedPath !== "external" && (
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <AnimatedSection animation="fade-up" className="max-w-md mx-auto text-center space-y-6">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
                ¿Listo para el Día de Evaluación?
              </h2>
              <Button
                variant="gold"
                size="lg"
                onClick={() => handlePathSelect("external")}
                className="glow-gold text-base px-8 py-6"
              >
                📋 Registrar jugador externo
              </Button>
              <p className="text-xs text-muted-foreground font-body">
                ¿Eres jugador activo?{" "}
                <button onClick={() => handlePathSelect("active")} className="text-primary underline">
                  Ver instrucciones
                </button>
              </p>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground font-body">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{event.location_name}, Mexicali</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{event.start_time} – {event.end_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>Fútbol · Todas las edades</span>
            </div>
          </div>
          <p className="text-center text-xs text-muted-foreground/60 mt-4">
            © {new Date().getFullYear()} White Lions Academies. Todos los derechos reservados.
          </p>
          <p className="text-center text-xs text-muted-foreground/40 mt-2">
            Tus datos son tratados de forma confidencial conforme a nuestro aviso de privacidad.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default EvaluationDay;
