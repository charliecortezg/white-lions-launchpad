import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
} from 'recharts';
import type { CalculatorResult, Location } from '@/lib/wl-calculator';
import ChallengeRegistrationModal from '@/components/ChallengeRegistrationModal';

interface ResultsStepProps {
  result: CalculatorResult;
  playerName: string;
  age: number;
  location: Location;
  onRestart: () => void;
}

function tierColor(tier: string) {
  if (tier === 'León Dorado') return '#D4A017';
  if (tier === 'León Azul') return '#2E6CC7';
  return '#888780';
}

function tierBg(tier: string) {
  if (tier === 'León Dorado') return 'bg-[#FFFBF0]';
  if (tier === 'León Azul') return 'bg-[#F0F6FF]';
  return 'bg-[#F9F9F7]';
}

function tierBadgeBg(tier: string) {
  if (tier === 'León Dorado') return 'bg-[#D4A017] text-[#1B3A6B]';
  if (tier === 'León Azul') return 'bg-[#2E6CC7] text-white';
  return 'bg-[#888780] text-white';
}

function wa(msg: string) {
  return `https://wa.me/526864408021?text=${encodeURIComponent(msg)}`;
}

function DimensionBar({ label, score, color }: { label: string; score: number; color: string }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 200);
    return () => clearTimeout(t);
  }, [score]);

  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ShareModal({ playerName, coeficiente, tier, onClose }: {
  playerName: string; coeficiente: number; tier: string; onClose: () => void;
}) {
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(
    `¡${playerName} obtuvo ${coeficiente} en la Calculadora de Rendimiento de White Lions! Es ${tier}. Descubre el tuyo en whitelionsacademy.com/calculadora-deportiva`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`rounded-xl p-6 text-center mb-4 ${tierBg(tier)}`}>
          <p className="text-xs font-bold tracking-widest text-[#1B3A6B] mb-1">WHITE LIONS</p>
          <p className="text-[10px] text-[#D4A017] tracking-wider mb-4">Academy · Mexicali</p>
          <p className="text-5xl font-bold mb-2" style={{ color: tierColor(tier) }}>{coeficiente}</p>
          <p className="text-sm text-gray-500 mb-2">Coeficiente León de {playerName}</p>
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${tierBadgeBg(tier)}`}>
            🦁 {tier.toUpperCase()}
          </span>
          <p className="text-[10px] text-gray-400 mt-4">
            Calculadora de Rendimiento Deportivo · whitelionsacademy.com
          </p>
        </div>
        <a
          href={shareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 rounded-xl bg-[#25D366] text-white font-bold text-sm hover:bg-[#20bd5a] transition-all"
        >
          Compartir por WhatsApp →
        </a>
        <button onClick={onClose} className="w-full text-center py-2 text-gray-400 text-sm mt-2">
          Cerrar
        </button>
      </div>
    </div>
  );
}

function DisabledGuideButton({ text }: { text: string }) {
  const [showMsg, setShowMsg] = useState(false);
  return (
    <div>
      <button
        onClick={() => setShowMsg(true)}
        className="text-xs text-gray-400 font-medium cursor-not-allowed opacity-60"
      >
        {text}
      </button>
      {showMsg && (
        <p className="text-xs text-[#D4A017] mt-1 animate-in fade-in">
          Próximamente — estamos preparando tu guía personalizada 🦁
        </p>
      )}
    </div>
  );
}

export default function ResultsStep({ result, playerName, age, location, onRestart }: ResultsStepProps) {
  const navigate = useNavigate();
  const [animatedCoef, setAnimatedCoef] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [showTrialModal, setShowTrialModal] = useState(false);

  useEffect(() => {
    let start = 0;
    const end = result.coeficiente;
    const duration = 2000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * end);
      setAnimatedCoef(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [result.coeficiente]);

  const radarData = [
    { subject: 'Coordinación\nFísica', value: result.dimensions.coord },
    { subject: 'Energía y\nVitalidad', value: result.dimensions.energy },
    { subject: 'Conexión\ncon el Juego', value: result.dimensions.conexion },
    { subject: 'Actitud y\nMotivación', value: result.dimensions.actitud },
  ];

  const tc = tierColor(result.tier);
  const tierLabel = result.tier.replace('León ', '');

  const buildCtasMexicali = useCallback(() => {
    const waChat = wa(`Hola, hice la Calculadora de Rendimiento para mi hijo/a y tengo algunas preguntas sobre White Lions Academy.`);

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#1B3A6B]">¿Cuál es el siguiente paso para {playerName}?</h3>
        <p className="text-sm text-gray-500">Como están en Mexicali, tienen acceso directo a la academia.</p>

        {/* Highlighted — Clase muestra opens modal */}
        <div className="border-2 border-[#2E6CC7] rounded-xl p-5 bg-[#F0F6FF] relative">
          <span className="absolute -top-3 left-4 bg-[#2E6CC7] text-white text-xs px-3 py-0.5 rounded-full font-bold">Recomendado</span>
          <p className="text-lg font-bold text-[#1B3A6B] mb-1">🥇 Clase muestra gratuita</p>
          <p className="text-sm text-gray-600 mb-3">1 sesión sin costo, sin compromiso. Ven a conocer el campo y a los entrenadores en Hacienda del Bosque, Mexicali.</p>
          <button onClick={() => setShowTrialModal(true)} className="block w-full text-center py-3 rounded-xl bg-[#1B3A6B] text-white font-bold text-sm hover:bg-[#152d54] transition-all">Agendar clase muestra →</button>
        </div>

        {/* Evaluación por video — navigates to /evaluacion-por-video */}
        <div className="border border-gray-200 rounded-xl p-5">
          <p className="font-bold text-[#1B3A6B] mb-1">📹 Evaluación por video desde casa</p>
          <p className="text-sm text-gray-600 mb-3">Graba a {playerName} realizando 3 ejercicios y recibe un Plan de Desarrollo Individual (IDP) firmado por un entrenador en 48 horas.</p>
          <button onClick={() => navigate('/evaluacion-por-video')} className="block w-full text-center py-3 rounded-xl border-2 border-[#2E6CC7] text-[#2E6CC7] font-bold text-sm hover:bg-[#F0F6FF] transition-all">Solicitar evaluación por video →</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-[#1B3A6B] text-sm mb-1">💬 Habla con un entrenador</p>
            <p className="text-xs text-gray-500 mb-2">Resuelve tus dudas antes de decidir por WhatsApp.</p>
            <a href={waChat} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2E6CC7] font-medium hover:underline">Abrir chat →</a>
          </div>
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-[#1B3A6B] text-sm mb-1">📋 Guía de ejercicios León</p>
            <p className="text-xs text-gray-500 mb-2">Descarga gratis el plan adaptado al nivel {tierLabel}.</p>
            <DisabledGuideButton text="Descargar guía →" />
          </div>
        </div>
      </div>
    );
  }, [playerName, result, tierLabel, navigate]);

  const buildCtasOtraCiudad = useCallback(() => {
    const waCall = wa(`Hola, me gustaría agendar una orientación online de 20 minutos para hablar sobre ${playerName}.`);
    const waChat = wa(`Hola, hice la Calculadora de Rendimiento para mi hijo/a y tengo algunas preguntas. Estamos fuera de Mexicali.`);

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#1B3A6B]">White Lions también llega a donde están</h3>
        <p className="text-sm text-gray-500">Sin importar la ciudad, podemos acompañar el desarrollo de {playerName}.</p>

        <div className="border-2 border-[#2E9E6C] rounded-xl p-5 bg-[#F0FFF5] relative">
          <span className="absolute -top-3 left-4 bg-[#2E9E6C] text-white text-xs px-3 py-0.5 rounded-full font-bold">Recomendado</span>
          <p className="text-lg font-bold text-[#1B3A6B] mb-1">📹 Evaluación por video (IDP)</p>
          <p className="text-sm text-gray-600 mb-3">Graba a {playerName} con los ejercicios que te indicamos y recibe en 48 horas un Plan de Desarrollo Individual personalizado, firmado por un entrenador White Lions.</p>
          <button onClick={() => navigate('/evaluacion-por-video')} className="block w-full text-center py-3 rounded-xl bg-[#2E9E6C] text-white font-bold text-sm hover:bg-[#268a5c] transition-all">Solicitar evaluación por video →</button>
        </div>

        <div className="border border-gray-200 rounded-xl p-5">
          <p className="font-bold text-[#1B3A6B] mb-1">📱 Sesión de orientación online (20 min)</p>
          <p className="text-sm text-gray-600 mb-3">Videollamada gratuita con un entrenador White Lions para guiar el desarrollo de {playerName} desde donde estén.</p>
          <a href={waCall} target="_blank" rel="noopener noreferrer" className="block w-full text-center py-3 rounded-xl border-2 border-[#2E6CC7] text-[#2E6CC7] font-bold text-sm hover:bg-[#F0F6FF] transition-all">Agendar videollamada →</a>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-[#1B3A6B] text-sm mb-1">📋 Plan de ejercicios a distancia</p>
            <p className="text-xs text-gray-500 mb-2">Plan personalizado por edad y nivel {tierLabel}.</p>
            <DisabledGuideButton text="Recibir plan →" />
          </div>
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-[#1B3A6B] text-sm mb-1">💬 Habla con el equipo</p>
            <p className="text-xs text-gray-500 mb-2">Te ayudamos desde donde estés.</p>
            <a href={waChat} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2E6CC7] font-medium hover:underline">Contactar →</a>
          </div>
        </div>
      </div>
    );
  }, [playerName, result, tierLabel, navigate]);

  const buildCtasInternacional = useCallback(() => {
    const waChat = wa(`Hola, hice la Calculadora de Rendimiento para ${playerName} y quisiera más información. Estamos fuera de México.`);

    return (
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#1B3A6B]">El método White Lions no tiene fronteras</h3>
        <p className="text-sm text-gray-500">Trabajamos con jugadores de cualquier parte del mundo a través de evaluaciones y planes de desarrollo a distancia.</p>

        <div className="border-2 border-[#D4A017] rounded-xl p-5 bg-[#FFFBF0] relative">
          <span className="absolute -top-3 left-4 bg-[#D4A017] text-[#1B3A6B] text-xs px-3 py-0.5 rounded-full font-bold">Recomendado</span>
          <p className="text-lg font-bold text-[#1B3A6B] mb-1">📹 Evaluación por video internacional</p>
          <p className="text-sm text-gray-600 mb-3">Graba a {playerName} con los ejercicios que te indicamos y recibe en 48 horas un reporte completo de un entrenador White Lions. Sin importar el país.</p>
          <button onClick={() => navigate('/evaluacion-por-video')} className="block w-full text-center py-3 rounded-xl bg-[#D4A017] text-[#1B3A6B] font-bold text-sm hover:bg-[#c4930f] transition-all">Solicitar evaluación →</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-[#1B3A6B] text-sm mb-1">📋 Guía de desarrollo León</p>
            <p className="text-xs text-gray-500 mb-2">Plan del nivel {tierLabel} para practicar en cualquier parte del mundo.</p>
            <DisabledGuideButton text="Descargar guía gratuita →" />
          </div>
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="font-bold text-[#1B3A6B] text-sm mb-1">💬 Contactar al equipo</p>
            <p className="text-xs text-gray-500 mb-2">Cuéntanos más sobre {playerName}.</p>
            <a href={waChat} target="_blank" rel="noopener noreferrer" className="text-xs text-[#2E6CC7] font-medium hover:underline">Escribir →</a>
          </div>
        </div>
      </div>
    );
  }, [playerName, result, tierLabel, navigate]);

  const percentileHtml = result.percentileText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  return (
    <div className="w-full max-w-lg mx-auto px-4 pb-12">
      {/* Section 1 — Coeficiente */}
      <div className={`rounded-2xl p-8 text-center mb-6 ${tierBg(result.tier)}`}>
        <p className="text-6xl md:text-7xl font-bold mb-2 transition-all" style={{ color: tc }}>
          {animatedCoef}
        </p>
        <p className="text-sm text-gray-500 mb-3">Coeficiente León de {playerName}</p>
        <span className={`inline-block px-6 py-2 rounded-full text-base font-bold ${tierBadgeBg(result.tier)}`}>
          🦁 {result.tier.toUpperCase()}
        </span>
      </div>

      {/* Section 2 — Percentile */}
      <p
        className="text-center text-gray-600 text-sm mb-6 px-2"
        dangerouslySetInnerHTML={{ __html: percentileHtml }}
      />

      {/* Section 3 — Tier description */}
      <div className={`rounded-xl p-5 mb-6 ${tierBg(result.tier)}`}>
        <p className="text-sm text-gray-700 leading-relaxed">{result.tierDescription}</p>
      </div>

      {/* Section 4 — Radar + Bars */}
      <div className="mb-6">
        <div className="h-64 w-full mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 11, fill: '#1B3A6B' }}
              />
              <Radar
                name="Perfil"
                dataKey="value"
                stroke="#2E6CC7"
                fill="#2E6CC7"
                fillOpacity={0.4}
                dot={{ fill: '#D4A017', r: 4 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <DimensionBar label="Coordinación Física" score={result.dimensions.coord} color="#2E6CC7" />
        <DimensionBar label="Energía y Vitalidad" score={result.dimensions.energy} color="#2E9E6C" />
        <DimensionBar label="Conexión con el Juego" score={result.dimensions.conexion} color="#D4A017" />
        <DimensionBar label="Actitud y Motivación" score={result.dimensions.actitud} color="#C05538" />
      </div>

      {/* Section 5 — CTAs by location */}
      <div className="mb-6">
        {location === 'mexicali' && buildCtasMexicali()}
        {location === 'otra_ciudad' && buildCtasOtraCiudad()}
        {location === 'internacional' && buildCtasInternacional()}
      </div>

      {/* Section 6 — Share */}
      <button
        onClick={() => setShowShare(true)}
        className="w-full py-3 rounded-xl border-2 border-[#2E6CC7] text-[#2E6CC7] font-bold text-sm hover:bg-[#F0F6FF] transition-all mb-6"
      >
        Compartir el resultado de {playerName} 📲
      </button>
      {showShare && (
        <ShareModal
          playerName={playerName}
          coeficiente={result.coeficiente}
          tier={result.tier}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Section 7 — Re-evaluation */}
      <div className="rounded-xl p-5 bg-[#FFFBF0] border border-[#D4A017]/20 mb-6 text-center">
        <p className="text-sm text-gray-700 mb-2">
          📅 Vuelve a evaluar a {playerName} en 3 meses para ver su progreso León.
        </p>
        <a
          href="https://whitelionsacademy.com/calculadora-deportiva"
          className="text-sm text-[#2E6CC7] font-medium hover:underline"
        >
          Agendar re-evaluación →
        </a>
      </div>

      {/* Section 8 — Footer */}
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-3 italic">
          Este resultado es una guía formativa, no una evaluación de selección. En White Lions Academy todos los niños tienen un lugar.
        </p>
        <button
          onClick={onRestart}
          className="text-sm text-[#2E6CC7] font-medium hover:underline"
        >
          Hacer la evaluación para otro jugador
        </button>
      </div>

      {/* Trial class modal */}
      <ChallengeRegistrationModal open={showTrialModal} onOpenChange={setShowTrialModal} referralSource="calculadora" />
    </div>
  );
}
