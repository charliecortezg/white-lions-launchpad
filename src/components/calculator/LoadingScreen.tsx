import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  playerName: string;
  onComplete: () => void;
}

const MESSAGES = [
  'Analizando el perfil de {name}...',
  'Calculando su Coeficiente León...',
  '¡Listo! Preparando tu reporte...',
];

export default function LoadingScreen({ playerName, onComplete }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setMessageIndex(1), 1000),
      setTimeout(() => setMessageIndex(2), 2000),
      setTimeout(() => onComplete(), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* Animated lion icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-[#F0F6FF] flex items-center justify-center animate-pulse">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" fill="#D4A017" opacity="0.2" />
            <text x="24" y="30" textAnchor="middle" fontSize="24" fill="#1B3A6B">🦁</text>
          </svg>
        </div>
        <div className="absolute inset-0 w-24 h-24 rounded-full border-4 border-[#2E6CC7] border-t-transparent animate-spin" />
      </div>

      {/* Messages */}
      <div className="h-8 flex items-center">
        <p className="text-[#1B3A6B] font-semibold text-center text-lg animate-fade-in" key={messageIndex}>
          {MESSAGES[messageIndex].replace('{name}', playerName)}
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
              i <= messageIndex ? 'bg-[#2E6CC7]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
