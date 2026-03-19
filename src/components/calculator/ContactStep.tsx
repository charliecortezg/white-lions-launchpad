import { useState } from 'react';
import { Check, MapPin, Building2, Plane } from 'lucide-react';
import type { Location } from '@/lib/wl-calculator';

interface ContactStepProps {
  playerName: string;
  parentName: string;
  email: string;
  phone: string;
  location: Location | null;
  consent: boolean;
  onUpdate: (data: Partial<{
    parentName: string;
    email: string;
    phone: string;
    location: Location;
    consent: boolean;
  }>) => void;
  onNext: () => void;
  onBack: () => void;
}

const LOCATIONS: { value: Location; icon: typeof MapPin; label: string }[] = [
  { value: 'mexicali', icon: MapPin, label: 'Mexicali, BC' },
  { value: 'otra_ciudad', icon: Building2, label: 'Otra ciudad de México' },
  { value: 'internacional', icon: Plane, label: 'Fuera de México' },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactStep({
  playerName,
  parentName,
  email,
  phone,
  location,
  consent,
  onUpdate,
  onNext,
  onBack,
}: ContactStepProps) {
  const [shake, setShake] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const emailValid = isValidEmail(email);
  const isValid = parentName.trim().length > 0 && emailValid && location !== null && consent;

  const handleSubmit = () => {
    if (!isValid) {
      setShake(true);
      setEmailTouched(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onNext();
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      <button
        onClick={onBack}
        className="text-[#2E6CC7] text-sm font-medium hover:underline mb-4"
      >
        ← Atrás
      </button>

      <h2 className="text-2xl font-bold text-[#1B3A6B] mb-1">
        Ya casi terminamos 🦁
      </h2>
      <p className="text-gray-500 text-sm mb-2">
        Necesitamos tu correo para enviarte los resultados completos de {playerName}
      </p>
      <p className="text-xs text-gray-400 mb-6 italic">
        No compartimos tu información con nadie. Solo te enviamos el resultado y, si quieres, te contactamos para platicar del siguiente paso.
      </p>

      {/* Parent name */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#1B3A6B] mb-1">
          Tu nombre completo
        </label>
        <input
          type="text"
          placeholder="Nombre y apellido"
          value={parentName}
          onChange={(e) => onUpdate({ parentName: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#2E6CC7] focus:ring-2 focus:ring-[#2E6CC7]/20 outline-none text-gray-900 text-base transition-all"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-[#1B3A6B] mb-1">
          Tu correo electrónico
        </label>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          value={email}
          onBlur={() => setEmailTouched(true)}
          onChange={(e) => onUpdate({ email: e.target.value })}
          className={`w-full h-12 px-4 rounded-xl border-2 outline-none text-gray-900 text-base transition-all ${
            emailTouched && !emailValid && email.length > 0
              ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-gray-200 focus:border-[#2E6CC7] focus:ring-2 focus:ring-[#2E6CC7]/20'
          }`}
        />
        {emailTouched && !emailValid && email.length > 0 && (
          <p className="text-xs text-red-500 mt-1">Ingresa un correo válido</p>
        )}
      </div>

      {/* Phone */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[#1B3A6B] mb-1">
          WhatsApp (opcional)
        </label>
        <input
          type="tel"
          placeholder="+52 686 000 0000"
          value={phone}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          className="w-full h-12 px-4 rounded-xl border-2 border-gray-200 focus:border-[#2E6CC7] focus:ring-2 focus:ring-[#2E6CC7]/20 outline-none text-gray-900 text-base transition-all"
        />
        <p className="text-xs text-gray-400 mt-1">
          Solo para que un entrenador pueda contactarte si lo deseas.
        </p>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[#1B3A6B] mb-2">
          ¿Dónde se encuentran actualmente?
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LOCATIONS.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => onUpdate({ location: value })}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl border-2 transition-all duration-200 text-center ${
                location === value
                  ? 'border-[#2E6CC7] bg-[#F0F6FF] text-[#1B3A6B]'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Consent */}
      <label className="flex items-start gap-3 mb-8 cursor-pointer">
        <button
          onClick={() => onUpdate({ consent: !consent })}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
            consent ? 'border-[#2E6CC7] bg-[#2E6CC7]' : 'border-gray-300'
          }`}
        >
          {consent && <Check className="w-3 h-3 text-white" />}
        </button>
        <span className="text-xs text-gray-500">
          Acepto recibir mi resultado y que White Lions Academy me contacte con información relacionada.
        </span>
      </label>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className={`w-full h-14 rounded-xl font-bold text-base transition-all duration-300 ${
          isValid
            ? 'bg-[#D4A017] text-[#1B3A6B] hover:bg-[#c4930f] shadow-lg active:scale-[0.98]'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        } ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      >
        Ver el resultado de {playerName} →
      </button>
    </div>
  );
}
