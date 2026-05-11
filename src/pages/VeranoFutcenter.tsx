import { useEffect, useState, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import logo from "@/assets/futcenter-logo.jpg";

const NAVY = "#2D2B6B";
const MAGENTA = "#C4317A";

const STRIPE = {
  mes_completo__completo: "https://buy.stripe.com/eVq5kF7Qd1ZJ0Dd2Uw08g06",
  mes_completo__deposito: "https://buy.stripe.com/14AbJ37Qdawf0Dd1Qs08g05",
  "2_semanas__completo": "https://buy.stripe.com/9B628t6M9fQzdpZbr208g03",
  "2_semanas__deposito": "https://buy.stripe.com/14A4gB0nL0VF2LlamY08g04",
  "1_semana__completo": "https://buy.stripe.com/bJe28t0nLcEnbhR9iU08g00",
};

const PRECIOS: Record<string, string> = {
  mes_completo: "$3,600",
  "2_semanas": "$2,000",
  "1_semana": "$1,000",
  dia_suelto: "$250",
};

const schema = z.object({
  nombre_padre: z.string().trim().min(2, "Requerido").max(100),
  telefono: z.string().trim().min(8, "Teléfono inválido").max(20),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  nombre_jugador: z.string().trim().min(2, "Requerido").max(100),
  edad_jugador: z.coerce.number().int().min(8, "8-11 años").max(11, "8-11 años"),
  grupo: z.enum(["A", "B"], { errorMap: () => ({ message: "Selecciona un grupo" }) }),
  mes_interes: z.enum(["junio", "julio", "agosto"], { errorMap: () => ({ message: "Selecciona un mes" }) }),
  paquete_interes: z.enum(["mes_completo", "2_semanas", "1_semana", "dia_suelto"], { errorMap: () => ({ message: "Selecciona un paquete" }) }),
  forma_pago: z.enum(["completo", "deposito"]).optional(),
}).refine(
  (d) => {
    if (d.paquete_interes === "mes_completo" || d.paquete_interes === "2_semanas") return !!d.forma_pago;
    return true;
  },
  { message: "Elige forma de pago", path: ["forma_pago"] }
);
type FormVals = z.infer<typeof schema>;

const Btn = ({ children, href, onClick, variant = "primary", className = "", type = "button" as const, disabled = false }: any) => {
  const base = "inline-flex items-center justify-center font-bold uppercase tracking-wide px-6 py-4 rounded-lg transition-all text-sm sm:text-base disabled:opacity-50";
  const styles = variant === "primary" ? "text-white hover:opacity-90 shadow-lg" : "bg-white border-2 hover:bg-[#FFF5FA]";
  const inline = variant === "primary" ? { background: NAVY } : { borderColor: MAGENTA, color: MAGENTA };
  if (href)
    return (
      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className={`${base} ${styles} ${className}`} style={inline} onClick={onClick}>
        {children}
      </a>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`} style={inline}>
      {children}
    </button>
  );
};

const Check = () => (
  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill={MAGENTA}>
    <path d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" />
  </svg>
);

export default function VeranoFutcenter() {
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<null | { stripeUrl?: string; paquete: string; forma_pago?: string }>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormVals>({
    resolver: zodResolver(schema),
  });

  const paqueteWatch = watch("paquete_interes");
  const needsFormaPago = paqueteWatch === "mes_completo" || paqueteWatch === "2_semanas";

  useEffect(() => {
    document.title = "Clínica de Verano 2026 · Futcenter Mexicali";
    const m = document.querySelector('meta[name="description"]');
    if (m) m.setAttribute("content", "Clínica de fútbol de verano en Futcenter Mexicali. Niños 8 a 11 años. Lunes a viernes 8AM–1PM. Junio, Julio y Agosto 2026.");
  }, []);

  const preselectAndScroll = (paquete: FormVals["paquete_interes"], forma_pago?: "completo" | "deposito") => {
    setValue("paquete_interes", paquete);
    if (forma_pago) setValue("forma_pago", forma_pago);
    setTimeout(() => {
      document.getElementById("registro")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const onSubmit = async (vals: FormVals) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-verano-lead", {
        body: { ...vals, fuente: "web" },
      });
      if (error) throw error;

      let stripeUrl: string | undefined;
      if (vals.paquete_interes === "1_semana") {
        stripeUrl = STRIPE["1_semana__completo"];
      } else if (vals.paquete_interes === "mes_completo" || vals.paquete_interes === "2_semanas") {
        const key = `${vals.paquete_interes}__${vals.forma_pago}` as keyof typeof STRIPE;
        stripeUrl = STRIPE[key];
      }
      // dia_suelto: no stripe
      setConfirmation({ stripeUrl, paquete: vals.paquete_interes, forma_pago: vals.forma_pago });
      reset();
      setTimeout(() => window.scrollTo({ top: document.getElementById("registro")?.offsetTop ?? 0, behavior: "smooth" }), 50);
    } catch {
      toast({ title: "Hubo un error", description: "Escríbenos al 686 440 8021", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <img src={logo} alt="Futcenter Baja California" className="h-12 w-12 rounded-full object-cover" />
          <a href="#registro" className="px-4 py-2.5 text-white font-bold rounded-lg text-sm sm:text-base shadow" style={{ background: NAVY }}>
            Aparta su lugar →
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="px-4 py-12 sm:py-20 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4 uppercase">
          ¿Tu hijo pasa el verano pegado a la pantalla?
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed">
          Este verano entrenamos fútbol de verdad. Disciplina, confianza y técnica — grupos pequeños, evaluación personalizada y diploma al final.
        </p>
        <Btn href="#registro" className="w-full sm:w-auto">Aparta su lugar ahora →</Btn>
        <p className="mt-6 font-bold" style={{ color: MAGENTA }}>⚡ Solo 15 lugares por grupo</p>
      </section>

      {/* PARA QUIÉN */}
      <section className="px-4 py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 uppercase">¿Para quién es la clínica?</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl border-2 text-center" style={{ borderColor: NAVY }}>
              <div className="text-sm font-bold uppercase mb-2" style={{ color: MAGENTA }}>Grupo A</div>
              <div className="text-2xl font-black" style={{ color: NAVY }}>Niños 8 a 9 años</div>
            </div>
            <div className="bg-white p-6 rounded-xl border-2 text-center" style={{ borderColor: NAVY }}>
              <div className="text-sm font-bold uppercase mb-2" style={{ color: MAGENTA }}>Grupo B</div>
              <div className="text-2xl font-black" style={{ color: NAVY }}>Niños 10 a 11 años</div>
            </div>
          </div>
          <div className="text-center space-y-2 text-base sm:text-lg">
            <p>📍 Futcenter, Mexicali BC</p>
            <p>🗓 Lunes a viernes · 8:00 AM – 1:00 PM</p>
            <p>📅 Junio · Julio · Agosto 2026</p>
          </div>
        </div>
      </section>

      {/* VALUE STACK */}
      <section className="px-4 py-14 text-white" style={{ background: NAVY }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-8 uppercase">No es solo fútbol</h2>
          <ul className="space-y-4 mb-8">
            {[
              "25 horas de cancha — entrenamiento real 5 días/semana",
              "Evaluación inicial + final con indicadores medibles",
              "Workbook individual — se lo lleva a casa",
              "Diploma personalizado al cierre del mes",
              "Grupos de máximo 15 jugadores",
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
              <span className="opacity-80">Entrenador privado 1hr/día × 20 días = <strong>+$8,000 MXN</strong>.</span>
              <br />
              <span className="font-black text-xl sm:text-2xl">La clínica completa: $3,600.</span>
            </p>
          </div>
        </div>
      </section>

      {/* PAQUETES */}
      <section className="px-4 py-14">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-3 uppercase">Elige el paquete de tu hijo</h2>
          <p className="text-center text-gray-600 mb-10 text-sm">Llena el formulario para apartar tu lugar y proceder al pago.</p>
          <div className="grid lg:grid-cols-3 gap-6">

            {/* MES COMPLETO */}
            <div className="relative bg-white rounded-2xl border-2 p-6 shadow-xl flex flex-col" style={{ borderColor: MAGENTA }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 text-white text-xs font-black uppercase rounded-full whitespace-nowrap" style={{ background: MAGENTA }}>
                ⭐ Más Elegido
              </div>
              <h3 className="text-xl font-black mt-2 mb-1" style={{ color: NAVY }}>Mes Completo · 4 semanas</h3>
              <div className="mb-1"><span className="text-gray-400 line-through text-lg">$4,000</span></div>
              <div className="text-4xl font-black mb-1" style={{ color: MAGENTA }}>$3,600 <span className="text-lg">MXN</span></div>
              <p className="text-green-600 font-bold text-sm mb-4">Ahorras $400 pagando completo</p>
              <ul className="space-y-2 mb-6 text-sm flex-1">
                {["20 sesiones", "Evaluación inicial + final", "Workbook", "Diploma", "Reporte STRYK", "Grupos máx. 15 jugadores"].map((i) => (
                  <li key={i} className="flex gap-2"><Check /><span>{i}</span></li>
                ))}
              </ul>
              <Btn onClick={() => preselectAndScroll("mes_completo", "completo")} className="w-full mb-3">Apartar — Pago completo →</Btn>
              <Btn onClick={() => preselectAndScroll("mes_completo", "deposito")} variant="secondary" className="w-full">Apartar con depósito $2,000 →</Btn>
              <p className="text-center text-xs text-gray-500 mt-2">Saldo restante el primer día</p>
            </div>

            {/* 2 SEMANAS */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md flex flex-col">
              <h3 className="text-xl font-black mb-2" style={{ color: NAVY }}>2 Semanas · 10 días</h3>
              <div className="text-4xl font-black mb-4" style={{ color: NAVY }}>$2,000 <span className="text-lg">MXN</span></div>
              <ul className="space-y-2 mb-6 text-sm flex-1">
                {["10 sesiones", "Evaluación", "Workbook", "Diploma"].map((i) => (
                  <li key={i} className="flex gap-2"><Check /><span>{i}</span></li>
                ))}
              </ul>
              <Btn onClick={() => preselectAndScroll("2_semanas", "completo")} className="w-full mb-3">Apartar — Pago completo →</Btn>
              <Btn onClick={() => preselectAndScroll("2_semanas", "deposito")} variant="secondary" className="w-full">Apartar con depósito $1,000 →</Btn>
              <p className="text-center text-xs text-gray-500 mt-2">Saldo restante el primer día</p>
            </div>

            {/* 1 SEMANA */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-md flex flex-col">
              <h3 className="text-xl font-black mb-2" style={{ color: NAVY }}>1 Semana · 5 días</h3>
              <div className="text-4xl font-black mb-4" style={{ color: NAVY }}>$1,000 <span className="text-lg">MXN</span></div>
              <ul className="space-y-2 mb-6 text-sm flex-1">
                {["5 sesiones", "Evaluación de entrada", "Workbook"].map((i) => (
                  <li key={i} className="flex gap-2"><Check /><span>{i}</span></li>
                ))}
              </ul>
              <Btn onClick={() => preselectAndScroll("1_semana")} className="w-full">Apartar lugar — $1,000 →</Btn>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8 max-w-xl mx-auto">
            El depósito aparta el lugar. El saldo se liquida el primer día del curso. Sin depósito no hay lugar garantizado.
          </p>
        </div>
      </section>

      {/* URGENCIA */}
      <section className="px-4 py-14 text-white text-center" style={{ background: NAVY }}>
        <div className="max-w-2xl mx-auto">
          <p className="text-2xl sm:text-3xl font-black mb-2">Junio arranca el 8 de junio.</p>
          <p className="text-lg sm:text-xl mb-8 opacity-90">Los lugares se llenan. No esperes a la última semana.</p>
          <a href="#registro" className="inline-block px-8 py-4 text-white font-bold rounded-lg shadow-lg uppercase tracking-wide" style={{ background: MAGENTA }}>
            Aparta el lugar de tu hijo →
          </a>
        </div>
      </section>

      {/* FORM / CONFIRMACIÓN */}
      <section id="registro" className="px-4 py-14 bg-gray-50">
        <div className="max-w-lg mx-auto">
          {confirmation ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: MAGENTA }}>
                <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-black mb-2" style={{ color: NAVY }}>¡Datos recibidos!</h3>

              {confirmation.stripeUrl ? (
                <>
                  <p className="text-gray-700 mb-6">
                    Último paso: completa el pago de tu paquete <strong>{confirmation.paquete.replace("_", " ")}</strong>
                    {confirmation.forma_pago === "deposito" ? " (depósito)" : ""} para asegurar el lugar.
                  </p>
                  <Btn href={confirmation.stripeUrl} className="w-full mb-3">Continuar al pago →</Btn>
                  <p className="text-xs text-gray-500">Te abrimos Stripe en una nueva pestaña.</p>
                </>
              ) : (
                <p className="text-gray-700 mb-4">
                  Te contactamos por WhatsApp en menos de 24 horas para coordinar el día suelto.
                </p>
              )}

              <button onClick={() => setConfirmation(null)} className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline">
                Registrar otro jugador
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl sm:text-4xl font-black text-center mb-2 uppercase">Aparta el lugar de tu hijo</h2>
              <p className="text-center text-gray-600 mb-8">Llena el formulario. Después continúas al pago.</p>

              <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-2xl shadow-xl space-y-4">
                {[
                  { name: "nombre_padre", label: "Nombre del papá o mamá", type: "text", required: true },
                  { name: "telefono", label: "WhatsApp", type: "tel", placeholder: "686 000 0000", required: true },
                  { name: "email", label: "Correo electrónico (opcional)", type: "email", required: false, placeholder: "tu@correo.com" },
                  { name: "nombre_jugador", label: "Nombre del jugador", type: "text", required: true },
                  { name: "edad_jugador", label: "Edad", type: "number", min: 8, max: 11, required: true },
                ].map((f: any) => (
                  <div key={f.name}>
                    <label className="block text-sm font-bold mb-1" style={{ color: NAVY }}>{f.label}{f.required ? " *" : ""}</label>
                    <input
                      {...register(f.name as any)}
                      type={f.type}
                      min={f.min}
                      max={f.max}
                      placeholder={f.placeholder}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                    />
                    {errors[f.name as keyof FormVals] && <p className="text-xs text-red-600 mt-1">{(errors as any)[f.name].message}</p>}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: NAVY }}>Grupo *</label>
                  <select {...register("grupo")} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white">
                    <option value="">Selecciona...</option>
                    <option value="A">Grupo A — 8 a 9 años</option>
                    <option value="B">Grupo B — 10 a 11 años</option>
                  </select>
                  {errors.grupo && <p className="text-xs text-red-600 mt-1">{errors.grupo.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: NAVY }}>Mes de interés *</label>
                  <select {...register("mes_interes")} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white">
                    <option value="">Selecciona...</option>
                    <option value="junio">Junio (inicia 8 de junio)</option>
                    <option value="julio">Julio (inicia 6 de julio)</option>
                    <option value="agosto">Agosto (inicia 3 de agosto)</option>
                  </select>
                  {errors.mes_interes && <p className="text-xs text-red-600 mt-1">{errors.mes_interes.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: NAVY }}>Paquete *</label>
                  <select {...register("paquete_interes")} className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white">
                    <option value="">Selecciona...</option>
                    <option value="mes_completo">Mes completo — $3,600</option>
                    <option value="2_semanas">2 semanas — $2,000</option>
                    <option value="1_semana">1 semana — $1,000</option>
                    <option value="dia_suelto">Día suelto — $250</option>
                  </select>
                  {errors.paquete_interes && <p className="text-xs text-red-600 mt-1">{errors.paquete_interes.message}</p>}
                </div>

                {needsFormaPago && (
                  <div className="p-4 rounded-lg border-2" style={{ borderColor: MAGENTA, background: "#FFF5FA" }}>
                    <label className="block text-sm font-bold mb-2" style={{ color: NAVY }}>Forma de pago *</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" value="completo" {...register("forma_pago")} className="w-4 h-4" />
                        <span className="text-sm">Pago completo ({PRECIOS[paqueteWatch]})</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input type="radio" value="deposito" {...register("forma_pago")} className="w-4 h-4" />
                        <span className="text-sm">
                          Depósito para apartar ({paqueteWatch === "mes_completo" ? "$2,000" : "$1,000"})
                        </span>
                      </label>
                    </div>
                    {errors.forma_pago && <p className="text-xs text-red-600 mt-2">{errors.forma_pago.message}</p>}
                  </div>
                )}

                <Btn type="submit" className="w-full !mt-6" disabled={submitting}>
                  {submitting ? "Enviando..." : "Continuar al pago →"}
                </Btn>
              </form>
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 py-10 text-center bg-white border-t">
        <img src={logo} alt="Futcenter" className="h-16 w-16 rounded-full object-cover mx-auto mb-3" />
        <p className="text-sm text-gray-600">Futcenter · Mexicali, Baja California</p>
      </footer>
    </div>
  );
}
