import { useState, useCallback, useEffect } from 'react';
import { calculateWLCoefficient, type CalculatorResult, type Location } from '@/lib/wl-calculator';
import { supabase } from '@/integrations/supabase/client';
import CalculatorProgress from '@/components/calculator/CalculatorProgress';
import WelcomeStep from '@/components/calculator/WelcomeStep';
import QuestionnaireStep from '@/components/calculator/QuestionnaireStep';
import ContactStep from '@/components/calculator/ContactStep';
import LoadingScreen from '@/components/calculator/LoadingScreen';
import ResultsStep from '@/components/calculator/ResultsStep';

interface FormData {
  playerName: string;
  age: number | null;
  parentName: string;
  email: string;
  phone: string;
  location: Location | null;
  consent: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

const initialForm: FormData = {
  playerName: '',
  age: null,
  parentName: '',
  email: '',
  phone: '',
  location: null,
  consent: false,
};

export default function CalculadoraDeportiva() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [answers, setAnswers] = useState<Record<string, number | string | null>>({});
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = 'Calculadora de Rendimiento Deportivo · White Lions Academy Mexicali';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute('content', 'Descubre el perfil deportivo de tu hijo en 3 minutos. Coeficiente León personalizado, completamente gratis.');
    }
  }, []);

  const updateForm = useCallback((data: Partial<FormData>) => {
    setForm((prev) => ({ ...prev, ...data }));
  }, []);

  const updateAnswer = useCallback((key: string, value: number | string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);

    const calcResult = calculateWLCoefficient({
      playerName: form.playerName,
      age: form.age!,
      physicalActivityDays: (answers.physicalActivityDays as 1 | 2 | 3 | 4) ?? 1,
      coordination: (answers.coordination as 1 | 2 | 3 | 4 | 5) ?? 1,
      balance: (answers.balance as 1 | 2 | 3 | 4 | 5) ?? 1,
      energyLevel: (answers.energyLevel as 1 | 2 | 3 | 4 | 5) ?? 1,
      footballLove: (answers.footballLove as 1 | 2 | 3 | 4 | 5) ?? 1,
      priorExperience: (answers.priorExperience as 0 | 1 | 2 | 3) ?? 0,
      instructionFollowing: (answers.instructionFollowing as 1 | 2 | 3 | 4 | 5) ?? 1,
      teamwork: (answers.teamwork as 1 | 2 | 3 | 4 | 5) ?? 1,
      persistence: (answers.persistence as 1 | 2 | 3 | 4 | 5) ?? 1,
      parentGoal: (answers.parentGoal as string) ?? '',
      parentName: form.parentName,
      email: form.email,
      phone: form.phone || undefined,
      location: form.location!,
    });

    setResult(calcResult);

    // Send email in background via edge function
    supabase.functions.invoke('send-calculator-email', {
      body: {
        parentName: form.parentName,
        playerName: form.playerName,
        parentEmail: form.email,
        phone: form.phone || null,
        coeficiente: calcResult.coeficiente,
        tier: calcResult.tier,
        age: form.age,
        percentile: calcResult.percentile,
        dimensions: calcResult.dimensions,
        location: form.location,
        parentGoal: (answers.parentGoal as string) ?? '',
        category: calcResult.category,
      },
    }).catch(console.error);

    setStep(4);
  }, [form, answers]);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleRestart = useCallback(() => {
    setForm(initialForm);
    setAnswers({});
    setResult(null);
    setIsLoading(false);
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-lg mx-auto py-8">
        <CalculatorProgress currentStep={step} totalSteps={4} />

        {step === 1 && (
          <WelcomeStep
            playerName={form.playerName}
            age={form.age}
            onUpdate={updateForm}
            onNext={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {step === 2 && (
          <QuestionnaireStep
            playerName={form.playerName}
            answers={answers}
            onUpdate={updateAnswer}
            onNext={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onBack={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {step === 3 && (
          <ContactStep
            playerName={form.playerName}
            parentName={form.parentName}
            email={form.email}
            phone={form.phone}
            location={form.location}
            consent={form.consent}
            onUpdate={updateForm}
            onNext={handleCalculate}
            onBack={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {step === 4 && isLoading && (
          <LoadingScreen
            playerName={form.playerName}
            onComplete={handleLoadingComplete}
          />
        )}

        {step === 4 && !isLoading && result && (
          <ResultsStep
            result={result}
            playerName={form.playerName}
            age={form.age!}
            location={form.location!}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
