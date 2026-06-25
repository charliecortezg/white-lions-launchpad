import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo-white-lions.png";

const GOLD = "#C9A84C";
const BG = "#0a0a0a";

type FormState = {
  categoria: string;
  temporadas_en_wla: string;
  calidad_entrenamiento: number;
  comunicacion_triangulo: number;
  progreso_hijo: number;
  organizacion_general: number;
  nps: number;
  que_le_gusto_al_hijo: string;
  que_valoro_el_padre: string;
  que_no_funciono: string;
  que_no_repetir: string;
  que_cambiaria: string;
  que_le_falta_a_wla: string;
  como_tratar_hijo: string[];
  como_tratar_padre: string[];
};

const initial: FormState = {
  categoria: "",
  temporadas_en_wla: "",
  calidad_entrenamiento: 0,
  comunicacion_triangulo: 0,
  progreso_hijo: 0,
  organizacion_general: 0,
  nps: 0,
  que_le_gusto_al_hijo: "",
  que_valoro_el_padre: "",
  que_no_funciono: "",
  que_no_repetir: "",
  que_cambiaria: "",
  que_le_falta_a_wla: "",
  como_tratar_hijo: [],
  como_tratar_padre: [],
};

const OPCIONES_HIJO = [
  "Que me exijan más, quiero mejorar de verdad",
  "Que me traten como parte de una familia",
  "Que me den más libertad para expresarme",
  "Que celebren más mis logros, aunque sean pequeños",
  "Que me conozcan más como persona, no solo como jugador",
  "Está bien como estamos",
];

const OPCIONES_PADRE = [
  "Más comunicación sobre el progreso de mi hijo",
  "Que lo exijan con respeto y paciencia",
  "Que lo hagan sentir importante dentro del equipo",
  "Que nos incluyan más como familia en el proceso",
  "Que celebren sus avances aunque no sea el mejor",
  "Estamos muy satisfechos como están las cosas",
];

function CheckboxList({
  options,
  values,
  onToggle,
}: {
  options: string[];
  values: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => {
        const active = values.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className="flex items-start gap-3 text-left rounded-lg transition-all active:scale-[0.99]"
            style={{
              padding: "12px 14px",
              backgroundColor: active ? "rgba(201,168,76,0.12)" : "#161616",
              border: `1px solid ${active ? GOLD : "#2a2a2a"}`,
              color: "#fff",
              minHeight: 48,
            }}
          >
            <span
              aria-hidden
              className="flex items-center justify-center shrink-0"
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                border: `1.5px solid ${active ? GOLD : "#555"}`,
                backgroundColor: active ? GOLD : "transparent",
                color: "#0a0a0a",
                marginTop: 2,
              }}
            >
              {active && (
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              )}
            </span>
            <span className="text-sm sm:text-base leading-snug">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

const DRIVE_URL =
  "https://drive.google.com/drive/folders/1Cz8KaZYNhrN7FP6bKHcdMiHEUyUVX3s1";
const WHATSAPP_URL =
  "https://wa.me/526864408021?text=Hola%2C%20quiero%20enviar%20mi%20video%20testimonio%20de%20la%20temporada%2025-26";
const GOOGLE_REVIEW_URL = "#google-review";

function Stars({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm sm:text-base text-white/90">{label}</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= value;
          return (
            <button
              key={n}
              type="button"
              aria-label={`${n} estrellas`}
              onClick={() => onChange(n)}
              className="flex items-center justify-center transition-transform active:scale-90"
              style={{
                width: 44,
                height: 44,
                color: active ? GOLD : "#3a3a3a",
              }}
            >
              <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NpsScale({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm sm:text-base text-white/90">
        ¿Qué tan probable es que recomiendes White Lions a otra familia?
      </p>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              className="rounded-md font-semibold transition-all active:scale-95"
              style={{
                minHeight: 44,
                backgroundColor: active ? GOLD : "transparent",
                color: active ? "#0a0a0a" : "#fff",
                border: `1px solid ${active ? GOLD : "#3a3a3a"}`,
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-white/50">
        <span>Poco probable</span>
        <span>Con toda seguridad</span>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        backgroundColor: GOLD,
        color: "#0a0a0a",
        padding: "16px 20px",
        fontSize: 16,
      }}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  children,
  href,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const base = {
    border: `1.5px solid ${GOLD}`,
    color: GOLD,
    padding: "14px 20px",
    fontSize: 15,
  };
  const cls =
    "w-full rounded-lg font-semibold transition-all active:scale-[0.98] inline-flex items-center justify-center";
  if (href)
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} style={base}>
        {children}
      </a>
    );
  return (
    <button type="button" onClick={onClick} className={cls} style={base}>
      {children}
    </button>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm sm:text-base text-white/90">{children}</label>;
}

const inputStyle: React.CSSProperties = {
  backgroundColor: "#111",
  border: "1px solid #2a2a2a",
  color: "#fff",
  padding: "12px 14px",
  borderRadius: 8,
  fontSize: 15,
  width: "100%",
  outline: "none",
};

export default function Feedback() {
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleIn = (key: "como_tratar_hijo" | "como_tratar_padre", value: string) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }));

  const canContinue = useMemo(() => {
    switch (step) {
      case 1:
        return !!form.categoria && !!form.temporadas_en_wla;
      case 2:
        return (
          form.calidad_entrenamiento > 0 &&
          form.comunicacion_triangulo > 0 &&
          form.progreso_hijo > 0 &&
          form.organizacion_general > 0 &&
          form.nps > 0
        );
      case 3:
        return (
          form.que_le_gusto_al_hijo.trim().length > 0 &&
          form.que_valoro_el_padre.trim().length > 0
        );
      case 4:
        return true;
      case 5:
        return form.que_cambiaria.trim().length > 0;
      case 6:
        return true;
      default:
        return true;
    }
  }, [step, form]);

  const goNext = () => {
    setAnimKey((k) => k + 1);
    setStep((s) => s + 1);
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    const { error } = await supabase.from("season_feedback").insert({
      categoria: form.categoria,
      temporadas_en_wla: form.temporadas_en_wla,
      nps: form.nps,
      calidad_entrenamiento: form.calidad_entrenamiento,
      comunicacion_triangulo: form.comunicacion_triangulo,
      progreso_hijo: form.progreso_hijo,
      organizacion_general: form.organizacion_general,
      que_le_gusto_al_hijo: form.que_le_gusto_al_hijo.trim(),
      que_valoro_el_padre: form.que_valoro_el_padre.trim(),
      que_no_funciono: form.que_no_funciono.trim() || null,
      que_no_repetir: form.que_no_repetir.trim() || null,
      que_cambiaria: form.que_cambiaria.trim(),
      que_le_falta_a_wla: form.que_le_falta_a_wla.trim() || null,
      como_tratar_hijo: form.como_tratar_hijo.length > 0 ? form.como_tratar_hijo : null,
      como_tratar_padre: form.como_tratar_padre.length > 0 ? form.como_tratar_padre : null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("No se pudo enviar: " + error.message);
      return;
    }
    setDone(true);
  };

  return (
    <main
      style={{ backgroundColor: BG, minHeight: "100dvh" }}
      className="w-full text-white px-4 py-8 sm:py-12"
    >
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .block-anim { animation: fadeSlideUp 400ms ease-in-out both; }
        textarea:focus, select:focus, input:focus { border-color: ${GOLD} !important; }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 560 }}>
        <header className="flex flex-col items-center text-center gap-4 mb-8">
          <img
            src={logo}
            alt="White Lions Academy"
            style={{ width: 96, height: "auto" }}
          />
          {!done && (
            <>
              <h1
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: GOLD }}
              >
                Evaluación de Temporada 25–26
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                Tu opinión construye la siguiente temporada.
              </p>
            </>
          )}
        </header>

        {done ? (
          <section className="flex flex-col gap-6 items-center text-center">
            <div
              className="rounded-2xl p-6 sm:p-8"
              style={{ border: `1px solid ${GOLD}`, backgroundColor: "#111" }}
            >
              <p className="text-lg sm:text-xl leading-relaxed">
                ¡Gracias por esta temporada! 🦁
                <br />
                Tu opinión ya está con nosotros.
                <br />
                Nos vemos en el ciclo 26–27.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <OutlineButton href={DRIVE_URL}>
                Subir video a la carpeta 📂
              </OutlineButton>
              <OutlineButton href={WHATSAPP_URL}>
                Enviar por WhatsApp 📲
              </OutlineButton>
              <OutlineButton href={GOOGLE_REVIEW_URL}>
                Dejar reseña en Google ⭐
              </OutlineButton>
            </div>
          </section>
        ) : (
          <section
            key={animKey}
            className="block-anim flex flex-col gap-6 rounded-2xl p-5 sm:p-8"
            style={{ backgroundColor: "#111", border: "1px solid #1f1f1f" }}
          >
            {step === 1 && (
              <>
                <h2 className="text-xl font-semibold" style={{ color: GOLD }}>
                  Cuéntanos sobre tu hijo
                </h2>
                <Field>
                  <Label>Categoría</Label>
                  <select
                    style={inputStyle}
                    value={form.categoria}
                    onChange={(e) => set("categoria", e.target.value)}
                  >
                    <option value="">Selecciona…</option>
                    <option>Biberón (4–5 años)</option>
                    <option>Escuelita (6–7 años)</option>
                    <option>Categoría 8–9 años</option>
                    <option>Categoría 10–11 años</option>
                    <option>Juvenil A (12–13 años)</option>
                  </select>
                </Field>
                <Field>
                  <Label>¿Cuántas temporadas llevan con White Lions?</Label>
                  <select
                    style={inputStyle}
                    value={form.temporadas_en_wla}
                    onChange={(e) => set("temporadas_en_wla", e.target.value)}
                  >
                    <option value="">Selecciona…</option>
                    <option>Esta es la primera</option>
                    <option>2 temporadas</option>
                    <option>3 o más temporadas</option>
                  </select>
                </Field>
                <PrimaryButton onClick={goNext} disabled={!canContinue}>
                  Continuar →
                </PrimaryButton>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-xl font-semibold" style={{ color: GOLD }}>
                  ¿Cómo calificarías esta temporada?
                </h2>
                <Stars
                  label="Calidad del entrenamiento"
                  value={form.calidad_entrenamiento}
                  onChange={(n) => set("calidad_entrenamiento", n)}
                />
                <Stars
                  label="Comunicación del triángulo deportivo (familia, entrenador, club)"
                  value={form.comunicacion_triangulo}
                  onChange={(n) => set("comunicacion_triangulo", n)}
                />
                <Stars
                  label="Progreso que viste en tu hijo"
                  value={form.progreso_hijo}
                  onChange={(n) => set("progreso_hijo", n)}
                />
                <Stars
                  label="Organización general (horarios, eventos, información)"
                  value={form.organizacion_general}
                  onChange={(n) => set("organizacion_general", n)}
                />
                <div
                  className="h-px w-full"
                  style={{ backgroundColor: "#2a2a2a" }}
                />
                <NpsScale value={form.nps} onChange={(n) => set("nps", n)} />
                <PrimaryButton onClick={goNext} disabled={!canContinue}>
                  Continuar →
                </PrimaryButton>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-xl font-semibold" style={{ color: GOLD }}>
                  Lo que funcionó 🦁
                </h2>
                <Field>
                  <Label>
                    ¿Qué fue lo que más le gustó a tu hijo de esta temporada?
                  </Label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                    value={form.que_le_gusto_al_hijo}
                    onChange={(e) => set("que_le_gusto_al_hijo", e.target.value)}
                  />
                </Field>
                <Field>
                  <Label>
                    ¿Qué fue lo que más valoraste tú como padre o madre?
                  </Label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                    value={form.que_valoro_el_padre}
                    onChange={(e) => set("que_valoro_el_padre", e.target.value)}
                  />
                </Field>
                <PrimaryButton onClick={goNext} disabled={!canContinue}>
                  Continuar →
                </PrimaryButton>
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="text-xl font-semibold" style={{ color: GOLD }}>
                  Lo que podemos mejorar
                </h2>
                <Field>
                  <Label>
                    ¿Hubo algo que te generó frustración o decepción esta
                    temporada?
                  </Label>
                  <textarea
                    placeholder="Si no hubo nada, puedes dejarlo vacío"
                    style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                    value={form.que_no_funciono}
                    onChange={(e) => set("que_no_funciono", e.target.value)}
                  />
                </Field>
                <Field>
                  <Label>
                    ¿Hay algo que hicimos este año que prefieres que NO
                    repitamos?
                  </Label>
                  <textarea
                    placeholder="Si no hay nada, puedes continuar"
                    style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                    value={form.que_no_repetir}
                    onChange={(e) => set("que_no_repetir", e.target.value)}
                  />
                </Field>
                <PrimaryButton onClick={goNext}>Continuar →</PrimaryButton>
              </>
            )}

            {step === 5 && (
              <>
                <h2 className="text-xl font-semibold" style={{ color: GOLD }}>
                  La próxima temporada
                </h2>
                <Field>
                  <Label>
                    Si pudieras cambiar una sola cosa de White Lions para el
                    ciclo 26–27, ¿qué sería?
                  </Label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                    value={form.que_cambiaria}
                    onChange={(e) => set("que_cambiaria", e.target.value)}
                  />
                </Field>
                <Field>
                  <Label>
                    ¿Qué te gustaría que ofreciéramos que todavía no tenemos?
                  </Label>
                  <textarea
                    style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
                    value={form.que_le_falta_a_wla}
                    onChange={(e) => set("que_le_falta_a_wla", e.target.value)}
                  />
                </Field>
                <PrimaryButton onClick={goNext} disabled={!canContinue}>
                  Continuar →
                </PrimaryButton>
              </>
            )}

            {step === 6 && (
              <>
                <h2 className="text-xl font-semibold" style={{ color: GOLD }}>
                  ¿Nos regalas un momento más?
                </h2>

                <div className="flex flex-col gap-3">
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    Si quieres compartir cómo fue la experiencia de tu hijo esta
                    temporada, súbelo directo a nuestra carpeta o mándanoslo por
                    WhatsApp. No tiene que ser perfecto — solo auténtico. 🦁
                  </p>
                  <OutlineButton href={DRIVE_URL}>
                    Subir video a la carpeta 📂
                  </OutlineButton>
                  <OutlineButton href={WHATSAPP_URL}>
                    Enviar por WhatsApp 📲
                  </OutlineButton>
                </div>

                <div
                  className="h-px w-full"
                  style={{ backgroundColor: "#2a2a2a" }}
                />

                <div className="flex flex-col gap-3">
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    Tu reseña en Google ayuda a otras familias a encontrarnos.
                  </p>
                  <OutlineButton href={GOOGLE_REVIEW_URL}>
                    Dejar reseña en Google ⭐
                  </OutlineButton>
                </div>

                <div
                  className="h-px w-full"
                  style={{ backgroundColor: "#2a2a2a" }}
                />

                <PrimaryButton onClick={submit} disabled={submitting}>
                  {submitting ? "Enviando…" : "Enviar evaluación 🦁"}
                </PrimaryButton>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
