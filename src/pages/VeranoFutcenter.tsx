import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/futcenter-logo.jpg";

const NAVY = "#2D2B6B";
const MAGENTA = "#C4317A";

// ── Montos por paquete + forma de pago ───────────────────────────────────────
const MONTOS: Record<string, { deposito: number; saldo: number; aTransferir: number }> = {
  mes_completo__completo: { deposito: 3600, saldo: 0,    aTransferir: 3600 },
  mes_completo__deposito: { deposito: 1000, saldo: 3000, aTransferir: 1000 },
  "2_semanas__completo":  { deposito: 1800, saldo: 0,    aTransferir: 1800 },
  "2_semanas__deposito":  { deposito: 1000, saldo: 1000, aTransferir: 1000 },
};

// ── Sedes ─────────────────────────────────────────────────────────────────────
const VENUES = {
  futcenter: {
    label:   "Futcenter",
    aforo:   "Máx. 30 jugadores",
    address: "Calz. Héctor Terán Terán 1496, Desarrollo Urbano, 21380 Mexicali, B.C.",
    mapsUrl: "https://share.google/hqcvkADxgfqMfVHy3",
  },
  city_sports: {
    label:   "City Sports Fut 5",
    aforo:   "Máx. 20 jugadores",
    address: "La Bodega, 21379 Mexicali, B.C.",
    mapsUrl: "https://share.google/cAoI1BORGgjxql8yw",
  },
} as const;

type VenueKey = keyof typeof VENUES;

// ── Schema ───────────────────────────────────────────────────────────────────
const schema = z.object({
  venue:           z.enum(["futcenter", "city_sports"],  { errorMap: () => ({ message: "Selecciona la sede" }) }),
  nombre_padre:    z.string().trim().min(2, "Requerido").max(100),
  telefono:        z.string().trim().min(8, "Teléfono inválido").max(20),
  email:           z.string().email("Email inválido").optional().or(z.literal("")),
  nombre_jugador:  z.string().trim().min(2, "Requerido").max(100),
  edad_jugador:    z.coerce.number().int().min(8, "8-11 años").max(11, "8-11 años"),
  grupo:           z.enum(["A", "B"],                    { errorMap: () => ({ message: "Selecciona un grupo" }) }),
  paquete_interes: z.enum(["mes_completo", "2_semanas"], { errorMap: () => ({ message: "Selecciona un paquete" }) }),
  forma_pago:      z.enum(["completo", "deposito"],      { errorMap: () => ({ message: "Elige forma de pago" }) }),
});

type FormVals = z.infer<typeof schema>;

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Btn = ({
  children, href, onClick, variant = "primary",
  className = "", type = "button" as const, disabled = false,
}: any) => {
  const base = "inline-flex items-center justify-center font-bold uppercase tracking-wide px-6 py-4 rounded-lg transition-all text-sm sm:text-base disabled:opacity-50";
  const styles = variant === "primary"
    ? "text-white hover:opacity-90 shadow-lg"
    : "bg-white border-2 hover:bg-[#FFF5FA]";
  const inline = variant === "primary"
    ? { background: NAVY }
    : { borderColor: MAGENTA, color: MAGENTA };
  if (href)
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer"
        className={`${base} ${styles} ${className}`} style={inline} onClick={onClick}>
        {children}
      </a>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${styles} ${className}`} style={inline}>
      {children}
    </button>
  );
};

const Check = () => (
  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill={MAGENTA}>
    <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
  </svg>
);

const MapPin = () => (
  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────
export default function VeranoFutcenter() {
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<null | {
    nombre_jugador: string;
    paquete: "mes_completo" | "2_semanas";
    forma_pago: "completo" | "deposito";
    venue: VenueKey;
  }>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } =
    useForm<FormVals>({ resolver: zodResolver(schema) });

  const paqueteWatch = watch("paquete_interes");
  const venueWatch   = watch("venue") as VenueKey | undefined;

  useEffect(() => {
    document.title = "Clínica de Verano 2026 · Mexicali · 20 jul – 14 ago";
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute("content",
      "Clínica de fútbol de verano en Mexicali. Futcenter y City Sports Fut 5. Niños 8-11 años. Lun-Vie 8AM–1PM. 20 julio – 14 agosto 2026."
    );
  }, []);

  const preselectAndScroll = (
    paquete: FormVals["paquete_interes"],
    forma_pago: "completo" | "deposito"
  ) => {
    setValue("paquete_interes", paquete);
    setValue("forma_pago", forma_pago);
    setTimeout(() =>
      document.getElementById("registro")?.scrollIntoView({ behavior: "smooth", block: "start" })
    , 50);
  };

  const onSubmit = async (vals: FormVals) => {
    setSubmitting(true);
    try {
      const key = `${vals.paquete_interes}__${vals.forma_pago}`;
      const m = MONTOS[key];

      const { data, error } = await supabase.functions.invoke("send-verano-lead", {
        body: {
          ...vals,
          mes_interes: "julio_agosto",
          fuente: "web",
          deposito_monto: m?.deposito ?? null,
          saldo_monto:    m?.saldo ?? null,
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error ?? "Error desconocido");

      setConfirmation({
        nombre_jugador: vals.nombre_jugador,
        paquete:    vals.paquete_interes,
        forma_pago: vals.forma_pago,
        venue:      vals.venue as VenueKey,
      });
      reset();
      setTimeout(() =>
        window.scrollTo({ top: document.getElementById("registro")?.offsetTop ?? 0, behavior: "smooth" })
      , 50);
    } catch (err: any) {
      toast({
        title: "No se pudo guardar tu registro",
        description: String(err?.message || "Escríbenos al 686 440 8021"),
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="Clínica de Verano 2026" className="h-12 w-12 rounded-full object-cover" />
          <a href="#registro"
            className="px-4 py-2.5 text-white font-bold rounded-lg text-sm sm:text-base shadow"
            style={{ background: NAVY }}>
            Aparta su lugar →
          </a>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="px-4 py-12 sm:py-20 text-center max-w-3xl mx-auto">
        <div className="inline-block px-3 py-1 rounded-full text-sm font-bold mb-4 uppercase tracking-wide"
          style={{ background: "#FFF0F7", color: MAGENTA }}>
          20 julio – 14 agosto · Mexicali
        </div>
        <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4 uppercase">
          ¿Tu hijo pasa el verano pegado a la pantalla?
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed">
          Este verano entrenamos fútbol de verdad. Disciplina, confianza y técnica —
          grupos pequeños, evaluación personalizada y diploma al final.
        </p>
        <Btn href="#registro" className="w-full sm:w-auto">Aparta su lugar ahora →</Btn>
        <p className="mt-6 font-bold" style={{ color: MAGENTA }}>
          ⚡ Cupo limitado — dos sedes en Mexicali
        </p>
      </section>

      {/* ── PARA QUIÉN ── */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 uppercase">
            ¿Para quién es la clínica?
          </h2>

          {/* Grupos */}
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            <div className="bg-white p-6 rounded-xl border-2 text-center" style={{ borderColor: NAVY }}>
              <div className="text-sm font-bold uppercase mb-2" style={{ color: MAGENTA }}>Grupo A</div>
              <div className="text-2xl font-black" style={{ color: NAVY }}>Niños 8 a 9 años</div>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 text-center" style={{ borderColor: NAVY }}>
              <div className="text-sm font-bold uppercase mb-2" style={{ color: MAGENTA }}>Grupo B</div>
              <div className="text-2xl font-black" style={{ color: NAVY }}>Niños 10 a 11 años</div>
            </div>
          </div>

          {/* Sedes */}
          <h3 className="text-lg font-black uppercase text-center mb-4" style={{ color: NAVY }}>
            Dos sedes disponibles
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {(Object.entries(VENUES) as [VenueKey, typeof VENUES[VenueKey]][]).map(([key, v], i) => (
              <div key={key} className="bg-white p-5 rounded-xl border-2 border-gray-200">
                <div className="text-xs font-bold uppercase mb-1" style={{ color: MAGENTA }}>
                  Sede {i + 1}
                </div>
                <div className="text-xl font-black mb-3" style={{ color: NAVY }}>{v.label}</div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>📅 <span className="font-semibold">20 jul – 14 ago 2026</span></p>
                  <p>⏰ Lun–Vie · 8:00 AM – 1:00 PM</p>
                  <p>👥 {v.aforo}</p>
                  <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-1.5 font-medium hover:underline mt-1"
                    style={{ color: MAGENTA }}>
                    <MapPin />
                    <span>{v.address}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STACK ── */}
      <section className="px-4 py-14 text-white" style={{ background: NAVY }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 uppercase">No es solo fútbol</h2>
          <ul className="space-y-4 mb-8">
            {[
              "25 horas de cancha — entrenamiento real 5 días/semana",
              "Evaluación inicial + final con indicadores medibles",
              "Workbook individual — se lo lleva a casa",
              "Diploma personalizado al cierre del mes",
              "Cupo limitado — atención personalizada garantizada",
              "El único programa en Mexicali que documenta el progreso semana a semana",
            ].map((t) => (
              <li key={t} className="flex gap-3 items-start">
                <Check />
                <span className="text-base sm:text-lg">{t}</span>
              </li>
            ))}
          </ul>
          <div className="bg-white/10 border border-white/20 rounded-xl p-5 text-center">
            <p className="text-base sm:text-lg leading-relaxed">
              <span className="opacity-80">
                Entrenador privado 1hr/día × 20 días = <strong>+$8,000 MXN</strong>.
              </span>
              <br />
              <span className="font-black text-xl sm:text-2xl">La clínica completa: $3,600.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── PAQUETES ── */}
      <section className="px-4 py-14">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3 uppercase">
            Elige el paquete
          </h2>
          <p className="text-center text-gray-600 mb-10 text-sm">
            Llena el formulario para apartar el lugar.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">

            {/* MES COMPLETO */}
            <div className="relative bg-white rounded-2xl border-2 p-6 shadow-xl flex flex-col"
              style={{ borderColor: MAGENTA }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white text-xs font-black uppercase rounded-full whitespace-nowrap"
                style={{ background: MAGENTA }}>
                ⭐ Más Elegido
              </div>
              <h3 className="text-xl font-black mt-2 mb-1" style={{ color: NAVY }}>
                Mes Completo · 4 semanas
              </h3>
              <div className="mb-1">
                <span className="text-gray-400 line-through text-lg">$4,000</span>
              </div>
              <div className="text-4xl font-black mb-1" style={{ color: MAGENTA }}>
                $3,600 <span className="text-lg">MXN</span>
              </div>
              <p className="text-green-600 font-bold text-sm mb-4">Ahorras $400 pagando completo</p>
              <ul className="space-y-2 mb-6 text-sm flex-1">
                {[
                  "20 sesiones · 5 días/semana",
                  "Evaluación inicial + final",
                  "Workbook del jugador",
                  "Diploma + Reporte STRYK",
                  "Cupo garantizado",
                ].map((i) => (
                  <li key={i} className="flex gap-2"><Check /><span>{i}</span></li>
                ))}
              </ul>
              <Btn onClick={() => preselectAndScroll("mes_completo", "completo")} className="w-full mb-3">
                Pago completo $3,600 →
              </Btn>
              <Btn onClick={() => preselectAndScroll("mes_completo", "deposito")} variant="secondary" className="w-full">
                Apartar con depósito $1,000 →
              </Btn>
              <p className="text-center text-xs text-gray-500 mt-2">Saldo $3,000 el primer día</p>
            </div>

            {/* 2 SEMANAS */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md flex flex-col">
              <h3 className="text-xl font-black mt-2 mb-1" style={{ color: NAVY }}>
                2 Semanas · 10 días
              </h3>
              <div className="mb-1">
                <span className="text-gray-400 line-through text-lg">$2,000</span>
              </div>
              <div className="text-4xl font-black mb-1" style={{ color: NAVY }}>
                $1,800 <span className="text-lg">MXN</span>
              </div>
              <p className="text-green-600 font-bold text-sm mb-4">Ahorras $200 pagando completo</p>
              <ul className="space-y-2 mb-6 text-sm flex-1">
                {[
                  "10 sesiones · 5 días/semana",
                  "Evaluación de entrada",
                  "Workbook del jugador",
                  "Diploma de participación",
                ].map((i) => (
                  <li key={i} className="flex gap-2"><Check /><span>{i}</span></li>
                ))}
              </ul>
              <Btn onClick={() => preselectAndScroll("2_semanas", "completo")} className="w-full mb-3">
                Pago completo $1,800 →
              </Btn>
              <Btn onClick={() => preselectAndScroll("2_semanas", "deposito")} variant="secondary" className="w-full">
                Apartar con depósito $1,000 →
              </Btn>
              <p className="text-center text-xs text-gray-500 mt-2">Saldo $1,000 el primer día</p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8 max-w-xl mx-auto">
            El depósito aparta el lugar. El saldo se liquida el primer día del curso.
            Sin depósito no hay lugar garantizado.
          </p>
        </div>
      </section>

      {/* ── URGENCIA ── */}
      <section className="px-4 py-14 text-white text-center" style={{ background: NAVY }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-2xl sm:text-3xl font-black mb-3">
            El programa arranca el 20 de julio.
          </p>
          <p className="text-lg sm:text-xl mb-8 opacity-90">
            Los lugares se llenan. No esperes a la última semana.
          </p>
          <a href="#registro"
            className="inline-block px-8 py-4 text-white font-bold rounded-lg shadow-lg uppercase tracking-wide"
            style={{ background: MAGENTA }}>
            Aparta el lugar de tu hijo →
          </a>
        </div>
      </section>

      {/* ── FORM / CONFIRMACIÓN ── */}
      <section id="registro" className="px-4 py-14 bg-gray-50">
        <div className="max-w-lg mx-auto">
          {confirmation ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: MAGENTA }}>
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-2" style={{ color: NAVY }}>¡Datos recibidos!</h3>

              {/* Confirmación de sede */}
              {confirmation.venue && VENUES[confirmation.venue] && (
                <a href={VENUES[confirmation.venue].mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 mb-5 p-3 rounded-lg bg-gray-50 text-sm hover:bg-gray-100 transition-colors"
                  style={{ color: MAGENTA }}>
                  <MapPin />
                  <span className="font-semibold">{VENUES[confirmation.venue].label}</span>
                  <span className="text-gray-500">· {VENUES[confirmation.venue].address}</span>
                </a>
              )}

              {confirmation.stripeUrl ? (
                <>
                  <p className="text-gray-700 mb-6">
                    Último paso: completa tu pago para asegurar el lugar.
                  </p>
                  <Btn onClick={() => { window.location.href = confirmation.stripeUrl!; }} className="w-full">
                    Completar pago →
                  </Btn>
                </>
              ) : (
                <p className="text-gray-700 mb-4">
                  Te contactamos por WhatsApp en menos de 24 horas para completar
                  tu pago y confirmar el lugar.
                </p>
              )}

              <button onClick={() => setConfirmation(null)}
                className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline">
                Registrar otro jugador
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-black text-center mb-2 uppercase">
                Aparta el lugar de tu hijo
              </h2>
              <p className="text-center text-gray-600 mb-8">
                Llena el formulario. Después continúas al pago.
              </p>

              <form ref={formRef} onSubmit={handleSubmit(onSubmit)}
                className="bg-white p-6 rounded-2xl shadow-xl space-y-5">

                {/* ── SEDE ── */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: NAVY }}>Sede *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(VENUES) as [VenueKey, typeof VENUES[VenueKey]][]).map(([key, v]) => (
                      <label key={key}
                        className={`flex flex-col cursor-pointer border-2 rounded-xl p-3 transition-all ${
                          venueWatch === key
                            ? "border-[#2D2B6B] bg-[#EAF0FB]"
                            : "border-gray-200 hover:border-gray-400"
                        }`}>
                        <input type="radio" value={key} {...register("venue")} className="sr-only" />
                        <span className="font-bold text-sm" style={{ color: NAVY }}>{v.label}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{v.aforo}</span>
                      </label>
                    ))}
                  </div>

                  {/* Dirección dinámica al seleccionar sede */}
                  {venueWatch && VENUES[venueWatch] && (
                    <a href={VENUES[venueWatch].mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-start gap-1.5 mt-2 text-xs font-medium hover:underline"
                      style={{ color: MAGENTA }}>
                      <MapPin />
                      <span>{VENUES[venueWatch].address}</span>
                    </a>
                  )}
                  {errors.venue && (
                    <p className="text-xs text-red-600 mt-1">{errors.venue.message}</p>
                  )}
                </div>

                {/* ── CAMPOS PERSONALES ── */}
                {[
                  { name: "nombre_padre",   label: "Nombre del papá o mamá",        type: "text",   required: true },
                  { name: "telefono",        label: "WhatsApp",                       type: "tel",    required: true,  placeholder: "686 000 0000" },
                  { name: "email",           label: "Correo electrónico (opcional)",  type: "email",  required: false, placeholder: "tu@correo.com" },
                  { name: "nombre_jugador", label: "Nombre del jugador",             type: "text",   required: true },
                  { name: "edad_jugador",   label: "Edad",                           type: "number", required: true, min: 8, max: 11 },
                ].map((f: any) => (
                  <div key={f.name}>
                    <label className="block text-sm font-bold mb-1" style={{ color: NAVY }}>
                      {f.label}{f.required ? " *" : ""}
                    </label>
                    <input
                      {...register(f.name as any)}
                      type={f.type} min={f.min} max={f.max} placeholder={f.placeholder}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                    {errors[f.name as keyof FormVals] && (
                      <p className="text-xs text-red-600 mt-1">{(errors as any)[f.name].message}</p>
                    )}
                  </div>
                ))}

                {/* ── GRUPO ── */}
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: NAVY }}>Grupo *</label>
                  <select {...register("grupo")}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white">
                    <option value="">Selecciona...</option>
                    <option value="A">Grupo A — 8 a 9 años</option>
                    <option value="B">Grupo B — 10 a 11 años</option>
                  </select>
                  {errors.grupo && (
                    <p className="text-xs text-red-600 mt-1">{errors.grupo.message}</p>
                  )}
                </div>

                {/* ── PAQUETE (radio cards) ── */}
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: NAVY }}>Paquete *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "mes_completo", label: "Mes completo", sub: "4 semanas · $3,600" },
                      { value: "2_semanas",    label: "2 Semanas",    sub: "10 días · $1,800"  },
                    ] as const).map((p) => (
                      <label key={p.value}
                        className={`flex flex-col cursor-pointer border-2 rounded-xl p-3 transition-all ${
                          paqueteWatch === p.value
                            ? "border-[#C4317A] bg-[#FFF5FA]"
                            : "border-gray-200 hover:border-gray-400"
                        }`}>
                        <input type="radio" value={p.value} {...register("paquete_interes")} className="sr-only" />
                        <span className="font-bold text-sm" style={{ color: NAVY }}>{p.label}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{p.sub}</span>
                      </label>
                    ))}
                  </div>
                  {errors.paquete_interes && (
                    <p className="text-xs text-red-600 mt-1">{errors.paquete_interes.message}</p>
                  )}
                </div>

                {/* ── FORMA DE PAGO ── */}
                <div className="p-4 rounded-xl border-2" style={{ borderColor: MAGENTA, background: "#FFF5FA" }}>
                  <label className="block text-sm font-bold mb-2" style={{ color: NAVY }}>
                    Forma de pago *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" value="completo" {...register("forma_pago")} className="w-4 h-4" />
                      <span className="text-sm">
                        Pago completo —{" "}
                        {paqueteWatch === "mes_completo" ? "$3,600"
                          : paqueteWatch === "2_semanas" ? "$1,800"
                          : "—"}
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" value="deposito" {...register("forma_pago")} className="w-4 h-4" />
                      <span className="text-sm">
                        Depósito para apartar —{" "}
                        {paqueteWatch === "mes_completo" ? "$2,000"
                          : paqueteWatch === "2_semanas" ? "$1,000"
                          : "—"}
                      </span>
                    </label>
                  </div>
                  {errors.forma_pago && (
                    <p className="text-xs text-red-600 mt-2">{errors.forma_pago.message}</p>
                  )}
                </div>

                <Btn type="submit" className="w-full !mt-2" disabled={submitting}>
                  {submitting ? "Enviando..." : "Continuar al pago →"}
                </Btn>
              </form>
            </>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-4 py-10 text-center bg-white border-t">
        <img src={logo} alt="Clínica de Verano 2026" className="h-16 w-16 rounded-full object-cover mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-1">Clínica de Verano 2026 · Mexicali, Baja California</p>
        <p className="text-sm text-gray-500">Futcenter · City Sports Fut 5</p>
      </footer>

    </div>
  );
}
