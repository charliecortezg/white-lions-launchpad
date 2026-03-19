import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const WL_BLUE = '#1B3A6B';
const WL_GOLD = '#D4A017';
const WL_LIGHT_BLUE = '#2E6CC7';

const WA_LINK = 'https://wa.me/526864408021?text=Hola%2C+me+interesa+la+evaluación+por+video+IDP+para+mi+hijo%2Fa.+Lo+vi+en+la+calculadora+de+rendimiento+de+White+Lions.';

const steps = [
  {
    icon: '🎥',
    title: 'Graba los ejercicios',
    desc: 'Te enviamos 3 ejercicios específicos adaptados a la edad de tu jugador. Los graba en casa, en el parque, donde sea — con el teléfono está bien.',
    time: '~10 minutos',
  },
  {
    icon: '👁️',
    title: 'Un entrenador evalúa',
    desc: 'Un entrenador certificado de White Lions revisa el video y analiza las 4 dimensiones del perfil: coordinación, energía, conexión con el juego y actitud.',
    time: 'Análisis en 24h',
  },
  {
    icon: '📋',
    title: 'Recibes su Plan de Desarrollo',
    desc: 'El IDP incluye observaciones técnicas, puntos fuertes, áreas de mejora y un plan de ejercicios de 4 semanas. Firmado por su evaluador.',
    time: 'Entrega en 48h',
  },
];

const includes = [
  { icon: '📊', title: 'Coeficiente León actualizado' },
  { icon: '🏃', title: 'Análisis de coordinación y movimiento' },
  { icon: '⚡', title: 'Perfil de energía y vitalidad' },
  { icon: '🧠', title: 'Conexión con el juego' },
  { icon: '💪', title: 'Actitud y carácter' },
  { icon: '📅', title: 'Plan de ejercicios 4 semanas' },
];

const audiences = [
  {
    icon: '🏙️',
    title: 'Familias fuera de Mexicali',
    desc: 'Si no están en Mexicali, la evaluación por video es la forma de acceder a la metodología White Lions desde cualquier ciudad de México o del mundo.',
  },
  {
    icon: '📍',
    title: 'Antes de la clase muestra',
    desc: 'Si están en Mexicali pero quieren conocer el perfil de su jugador antes de venir al campo, el IDP les da ese contexto.',
  },
  {
    icon: '📈',
    title: 'Seguimiento de progreso',
    desc: 'Para jugadores que ya están en la academia, el IDP es una herramienta de seguimiento cada 3 meses para documentar su evolución.',
  },
];

const faqs = [
  {
    q: '¿Cuánto cuesta la evaluación por video?',
    a: 'Estamos definiendo la estructura de precios. Escríbenos por WhatsApp y te damos toda la información actualizada.',
  },
  {
    q: '¿Qué tipo de video necesito grabar?',
    a: 'Te enviamos una guía con 3 ejercicios específicos adaptados a la edad de tu jugador. No necesitas equipo especial — con el teléfono y un espacio abierto es suficiente.',
  },
  {
    q: '¿En cuánto tiempo recibo el IDP?',
    a: 'Máximo 48 horas después de que recibamos el video. Normalmente antes.',
  },
  {
    q: '¿El IDP reemplaza una clase muestra?',
    a: 'No — son complementarios. El IDP te da un análisis técnico a distancia. La clase muestra es la experiencia en campo. Si están en Mexicali, recomendamos ambas.',
  },
];

export default function EvaluacionPorVideo() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Evaluación por Video IDP · White Lions Academy';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Un entrenador White Lions evalúa el video de tu jugador y entrega su Plan de Desarrollo Individual en 48 horas. Desde cualquier ciudad.');
    }
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm font-medium" style={{ color: WL_BLUE }}>
            <ChevronLeft className="w-5 h-5 mr-1" /> Regresar
          </button>
          <div className="text-center">
            <p className="text-xs font-bold tracking-[3px]" style={{ color: WL_BLUE }}>WHITE LIONS</p>
            <p className="text-[9px] tracking-[2px]" style={{ color: WL_GOLD }}>Academy · Mexicali</p>
          </div>
          <div className="w-20" /> {/* spacer */}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* SECTION 1 — Hero */}
        <section className="text-center mb-12">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mb-4"
            style={{ backgroundColor: '#FFFBF0', color: WL_GOLD, border: `1px solid ${WL_GOLD}40` }}
          >
            Próximamente
          </span>
          <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: WL_BLUE }}>
            Evaluación por video IDP
          </h1>
          <p className="text-gray-600 text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Tu hijo juega donde está. Nosotros evaluamos, analizamos y te entregamos su Plan de Desarrollo Individual en 48 horas.
          </p>
          {/* SVG icon */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${WL_LIGHT_BLUE}15` }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={WL_LIGHT_BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 7l-7 5 7 5V7z" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={WL_GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${WL_GOLD}15` }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={WL_GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Cómo funciona */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: WL_BLUE }}>¿Cómo funciona?</h2>
          <div className="md:flex md:items-start md:gap-4">
            {steps.map((step, i) => (
              <div key={i} className="flex md:flex-col md:items-center md:text-center md:flex-1 mb-6 md:mb-0">
                {/* Mobile: left icon + right content */}
                <div className="flex md:flex-col items-start md:items-center w-full">
                  <div className="flex flex-col items-center mr-4 md:mr-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: `${WL_LIGHT_BLUE}12` }}
                    >
                      {step.icon}
                    </div>
                    {/* Vertical dotted line (mobile only) */}
                    {i < steps.length - 1 && (
                      <div className="w-px h-16 border-l-2 border-dashed border-gray-200 md:hidden" />
                    )}
                  </div>
                  <div className="pt-1 md:mt-3">
                    <p className="font-bold text-sm mb-1" style={{ color: WL_BLUE }}>{step.title}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{step.time}</span>
                  </div>
                </div>
                {/* Horizontal dotted line (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block h-px w-full border-t-2 border-dashed border-gray-200 mt-6" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3 — Qué incluye */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: WL_BLUE }}>¿Qué incluye el reporte?</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {includes.map((item, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 text-center">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="text-sm font-medium" style={{ color: WL_BLUE }}>{item.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4 — Para quién es */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: WL_BLUE }}>¿Para quién es?</h2>
          <div className="space-y-3">
            {audiences.map((a, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5">
                <p className="font-bold text-base mb-1" style={{ color: WL_BLUE }}>
                  {a.title} {a.icon}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5 — CTA */}
        <section className="rounded-2xl p-6 md:p-8 mb-12 text-center" style={{ backgroundColor: WL_BLUE }}>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Estamos preparando el sistema de evaluaciones</h2>
          <p className="text-sm text-white/80 mb-6 max-w-md mx-auto leading-relaxed">
            Mientras tanto, escríbenos por WhatsApp y agendamos tu evaluación de forma manual. Mismo proceso, misma calidad, mismos 48 horas.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full md:w-auto md:inline-block text-center py-3.5 px-8 rounded-xl font-bold text-sm transition-all hover:opacity-90"
            style={{ backgroundColor: WL_GOLD, color: WL_BLUE }}
          >
            Solicitar mi evaluación por WhatsApp →
          </a>
          <button
            onClick={() => navigate('/calculadora-deportiva')}
            className="block w-full md:w-auto md:inline-block mt-3 md:mt-0 md:ml-3 text-center py-3.5 px-8 rounded-xl font-bold text-sm border-2 border-white/30 text-white hover:bg-white/10 transition-all"
          >
            Ver la Calculadora de Rendimiento →
          </button>
        </section>

        {/* SECTION 6 — FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: WL_BLUE }}>Preguntas frecuentes</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-gray-200 rounded-xl px-4">
                <AccordionTrigger className="text-sm font-medium text-left py-4" style={{ color: WL_BLUE }}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-600 leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* Footer */}
        <footer className="text-center pb-8">
          <p className="text-xs text-gray-400 mb-3">White Lions Academy · Mexicali, BC · whitelionsacademy.com</p>
          <button
            onClick={() => navigate('/calculadora-deportiva')}
            className="text-sm font-medium hover:underline"
            style={{ color: WL_LIGHT_BLUE }}
          >
            ← Regresar a la Calculadora de Rendimiento
          </button>
        </footer>
      </div>
    </div>
  );
}
