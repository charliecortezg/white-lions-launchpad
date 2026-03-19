interface CalculatorProgressProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ['Tu jugador', 'Su perfil', 'Tus datos', 'Resultado'];

export default function CalculatorProgress({ currentStep }: CalculatorProgressProps) {
  if (currentStep >= 4) return null;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="flex items-center justify-between mb-2">
        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === currentStep;
          const isComplete = stepNum < currentStep;
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isComplete
                    ? 'bg-[#1B3A6B] text-white'
                    : isActive
                    ? 'bg-[#2E6CC7] text-white ring-4 ring-[#2E6CC7]/20'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isComplete ? '✓' : stepNum}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  isActive ? 'text-[#1B3A6B]' : isComplete ? 'text-[#1B3A6B]' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex gap-1 mt-2">
        {STEP_LABELS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
              i + 1 <= currentStep ? 'bg-[#2E6CC7]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
