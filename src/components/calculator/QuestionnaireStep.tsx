import { useState } from 'react';
import { Check } from 'lucide-react';

interface QuestionOption {
  label: string;
  value: number;
}

interface Question {
  key: string;
  question: string;
  options: QuestionOption[];
}

interface QuestionnaireStepProps {
  playerName: string;
  answers: Record<string, number | string | null>;
  onUpdate: (key: string, value: number | string) => void;
  onNext: () => void;
  onBack: () => void;
}

const SUB_BLOCKS: { title: string; questions: Question[] }[] = [
  {
    title: 'Movimiento y energía',
    questions: [
      {
        key: 'physicalActivityDays',
        question: '¿Cuántos días a la semana {name} se mueve activamente — corre, juega afuera, hace deporte?',
        options: [
          { label: 'Casi nada, prefiere actividades tranquilas', value: 1 },
          { label: '1 o 2 días a la semana', value: 2 },
          { label: '3 o 4 días a la semana', value: 3 },
          { label: '5 días o más, siempre está en movimiento', value: 4 },
        ],
      },
      {
        key: 'coordination',
        question: '¿Cómo describes la coordinación de {name} al moverse, correr o saltar?',
        options: [
          { label: 'Le cuesta moverse con fluidez todavía', value: 1 },
          { label: 'Movimiento básico, está en desarrollo', value: 2 },
          { label: 'Se mueve bien para su edad', value: 3 },
          { label: 'Muy coordinado, aprende movimientos rápido', value: 4 },
          { label: 'Excepcionalmente ágil — domina su cuerpo', value: 5 },
        ],
      },
      {
        key: 'balance',
        question: '{name} mantiene equilibrio, salta en un pie y usa ambas manos con facilidad?',
        options: [
          { label: 'Le cuesta bastante aún', value: 1 },
          { label: 'Lo hace solo un poco', value: 2 },
          { label: 'Lo hace bien', value: 3 },
          { label: 'Lo hace muy bien', value: 4 },
          { label: 'Lo domina con facilidad', value: 5 },
        ],
      },
    ],
  },
  {
    title: 'Energía y amor por el juego',
    questions: [
      {
        key: 'energyLevel',
        question: '¿Cómo es el nivel de energía de {name} en su día a día?',
        options: [
          { label: 'Tranquilo, prefiere actividades más calmadas', value: 1 },
          { label: 'Moderado, a ratos activo', value: 2 },
          { label: 'Activo la mayor parte del tiempo', value: 3 },
          { label: 'Muy activo, siempre quiere moverse', value: 4 },
          { label: 'Energía desbordante, difícil de parar', value: 5 },
        ],
      },
      {
        key: 'footballLove',
        question: '¿Qué tanto le llama la atención el fútbol a {name}?',
        options: [
          { label: 'No le llama la atención por ahora', value: 1 },
          { label: 'Le da igual, lo haría si se lo proponen', value: 2 },
          { label: 'Le gusta jugar cuando hay oportunidad', value: 3 },
          { label: 'Le encanta, lo busca y lo pide solo', value: 4 },
          { label: 'Es su pasión — piensa en fútbol todo el tiempo', value: 5 },
        ],
      },
      {
        key: 'priorExperience',
        question: '¿Ha practicado fútbol con entrenamiento estructurado antes?',
        options: [
          { label: 'Nunca, sería su primera vez', value: 0 },
          { label: 'Lo ha probado en el recreo o de manera informal', value: 1 },
          { label: 'Ha tomado algunas clases o talleres', value: 2 },
          { label: 'Lleva 1 año o más entrenando regularmente', value: 3 },
        ],
      },
    ],
  },
  {
    title: 'Actitud y carácter',
    questions: [
      {
        key: 'instructionFollowing',
        question: 'Cuando {name} juega o está en actividades grupales, ¿entiende y sigue las instrucciones?',
        options: [
          { label: 'Le cuesta mucho seguir indicaciones', value: 1 },
          { label: 'Las sigue a veces, depende del momento', value: 2 },
          { label: 'Las entiende y las sigue bien', value: 3 },
          { label: 'Las entiende rápido y se adapta con facilidad', value: 4 },
          { label: 'Las anticipa — entiende el \'por qué\' de cada cosa', value: 5 },
        ],
      },
      {
        key: 'teamwork',
        question: '¿Cómo se lleva {name} al jugar con otros niños?',
        options: [
          { label: 'Prefiere jugar solo la mayor parte del tiempo', value: 1 },
          { label: 'Juega con otros si lo incluyen, pero no lo busca', value: 2 },
          { label: 'Disfruta jugar con otros niños', value: 3 },
          { label: 'Le encanta el juego en equipo, lo busca activamente', value: 4 },
          { label: 'Es un conector natural — junta y anima al grupo', value: 5 },
        ],
      },
      {
        key: 'persistence',
        question: 'Cuando algo le resulta difícil o se frustra, ¿qué hace generalmente?',
        options: [
          { label: 'Se rinde o se desanima fácilmente', value: 1 },
          { label: 'Se desanima pero continúa si lo apoyas', value: 2 },
          { label: 'Lo intenta de nuevo por su cuenta', value: 3 },
          { label: 'Se esfuerza más cuando hay un reto', value: 4 },
          { label: 'La dificultad lo motiva — casi nunca se rinde', value: 5 },
        ],
      },
      {
        key: 'parentGoal',
        question: '¿Cuál es tu principal objetivo al acercar a {name} al fútbol?',
        options: [
          { label: 'Que haga ejercicio y se mantenga activo', value: -1 },
          { label: 'Que desarrolle disciplina y valores', value: -2 },
          { label: 'Que haga amigos y socialice', value: -3 },
          { label: 'Que aprenda fútbol de verdad y crezca en el deporte', value: -4 },
          { label: 'Que se divierta y disfrute', value: -5 },
        ],
      },
    ],
  },
];

const PARENT_GOAL_MAP: Record<number, string> = {
  [-1]: 'Que haga ejercicio y se mantenga activo',
  [-2]: 'Que desarrolle disciplina y valores',
  [-3]: 'Que haga amigos y socialice',
  [-4]: 'Que aprenda fútbol de verdad y crezca en el deporte',
  [-5]: 'Que se divierta y disfrute',
};

export default function QuestionnaireStep({
  playerName,
  answers,
  onUpdate,
  onNext,
  onBack,
}: QuestionnaireStepProps) {
  const [subBlock, setSubBlock] = useState(0);
  const [shake, setShake] = useState(false);
  const [unanswered, setUnanswered] = useState<string[]>([]);
  const block = SUB_BLOCKS[subBlock];

  const allAnswered = block.questions.every((q) => answers[q.key] != null);

  const handleNext = () => {
    if (!allAnswered) {
      setShake(true);
      setUnanswered(block.questions.filter((q) => answers[q.key] == null).map((q) => q.key));
      setTimeout(() => setShake(false), 500);
      return;
    }
    setUnanswered([]);
    if (subBlock < SUB_BLOCKS.length - 1) {
      setSubBlock(subBlock + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNext();
    }
  };

  const handleBack = () => {
    if (subBlock > 0) {
      setSubBlock(subBlock - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  const handleSelect = (key: string, value: number) => {
    if (key === 'parentGoal') {
      onUpdate(key, PARENT_GOAL_MAP[value] || '');
      onUpdate('_parentGoalValue', value);
    } else {
      onUpdate(key, value);
    }
    setUnanswered((prev) => prev.filter((k) => k !== key));
  };

  const isSelected = (key: string, value: number) => {
    if (key === 'parentGoal') {
      return (answers['_parentGoalValue'] as number) === value;
    }
    return answers[key] === value;
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4">
      {/* Sub-progress */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={handleBack}
          className="text-[#2E6CC7] text-sm font-medium hover:underline"
        >
          ← Atrás
        </button>
        <span className="text-sm text-gray-400 font-medium">
          {subBlock + 1} de {SUB_BLOCKS.length}
        </span>
      </div>

      {/* Block title */}
      <div className="bg-[#F0F6FF] rounded-xl px-4 py-3 mb-6">
        <h2 className="text-lg font-bold text-[#1B3A6B]">{block.title}</h2>
      </div>

      {/* Questions */}
      <div className="space-y-8">
        {block.questions.map((q) => (
          <div
            key={q.key}
            className={`transition-all duration-300 ${
              unanswered.includes(q.key) ? 'ring-2 ring-red-300 rounded-xl p-3 -mx-3' : ''
            }`}
          >
            <p className="text-sm font-semibold text-[#1B3A6B] mb-3">
              {q.question.replace(/\{name\}/g, playerName)}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const selected = isSelected(q.key, opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(q.key, opt.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200 flex items-center gap-3 ${
                      selected
                        ? 'border-[#2E6CC7] bg-[#F0F6FF] text-[#1B3A6B] font-medium'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        selected ? 'border-[#2E6CC7] bg-[#2E6CC7]' : 'border-gray-300'
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={handleNext}
        className={`w-full h-14 rounded-xl font-bold text-base text-white mt-8 transition-all duration-300 ${
          allAnswered
            ? 'bg-[#2E6CC7] hover:bg-[#245baf] shadow-lg active:scale-[0.98]'
            : 'bg-gray-300 cursor-not-allowed'
        } ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
      >
        {subBlock < SUB_BLOCKS.length - 1 ? 'Siguiente →' : 'Continuar →'}
      </button>
    </div>
  );
}
