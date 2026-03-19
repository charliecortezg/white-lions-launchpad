import { useState } from 'react';

interface WelcomeStepProps {
  playerName: string;
  age: number | null;
  onUpdate: (data: { playerName?: string; age?: number }) => void;
  onNext: () => void;
}

const AGES = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

export default function WelcomeStep({ playerName, age, onUpdate, onNext }: WelcomeStepProps) {
  const [shake, setShake] = useState(false);
  const isValid = playerName.trim().length > 0 && age !== null;

  const handleSubmit = () => {
    if (!isValid) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onNext();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto px-4">
      {/* Logo */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-wider text-[#1B3A6B]">WHITE LIONS</h2>
        <p className="text-sm font-medium text-[#D4A017] tracking-widest">Academy · Mexicali</p>
      </div>

      {/* Soccer SVG */}
      <div className="mb-6">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="38" stroke="#1B3A6B" strokeWidth="2" fill="#F0F6FF" />
          <path d="M40 18L48 28H32L40 18Z" fill="#1B3A6B" />
          <circle cx="40" cy="50" r="12" fill="#D4A017" opacity="0.3" />
          <path d="M34 48L40 38L46 48" stroke="#1B3A6B" strokeWidth="2" strokeLinecap="round" />
          <circle cx="40" cy="50" r="6" stroke="#1B3A6B" strokeWidth="1.5" fill="none" />
          <line x1="40" y1="44" x2="40" y2="56" stroke="#1B3A6B" strokeWidth="1" />
          <line x1="34" y1="50" x2="46" y2="50" stroke="#1B3A6B" strokeWidth="1" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-[#1B3A6B] text-center mb-2">
        Descubre el perfil deportivo de tu hijo
      </h1>
      <p className="text-gray-500 text-center text-sm md:text-base mb-8 max-w-sm">
        Responde 10 preguntas en 3 minutos y recibe su Coeficiente León personalizado — completamente gratis
      </p>

      {/* Name */}
      <div className="w-full mb-6">
        <label className="block text-sm font-semibold text-[#1B3A6B] mb-1">
          ¿Cómo le decimos a tu jugador?
        </label>
        <input
          type="text"
          placeholder="Nombre o apodo"
          maxLength={30}
          value={playerName}
          onChange={(e) => onUpdate({ playerName: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#2E6CC7] focus:ring-2 focus:ring-[#2E6CC7]/20 outline-none text-gray-900 text-base transition-all"
        />
        <p className="text-xs text-gray-400 mt-1">
          Usamos su nombre para personalizar los resultados. Nada más.
        </p>
      </div>

      {/* Age */}
      <div className="w-full mb-8">
        <label className="block text-sm font-semibold text-[#1B3A6B] mb-2">
          ¿Cuántos años tiene?
        </label>
        <div className="grid grid-cols-5 gap-2">
          {AGES.map((a) => (
            <button
              key={a}
              onClick={() => onUpdate({ age: a })}
              className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all duration-200 ${
                age === a
                  ? 'border-[#2E6CC7] bg-[#F0F6FF] text-[#1B3A6B] shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <span className="text-xl font-bold">{a}</span>
              <span className="text-[10px] text-gray-400">años</span>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full h-14 rounded-xl font-bold text-base text-white transition-all duration-300 ${
          isValid
            ? 'bg-[#1B3A6B] hover:bg-[#152d54] shadow-lg hover:shadow-xl active:scale-[0.98]'
            : 'bg-gray-300 cursor-not-allowed'
        } ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      >
        Comenzar evaluación →
      </button>
    </div>
  );
}
