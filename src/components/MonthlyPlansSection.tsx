import { Check, Crown, Users, Goal } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "./AnimatedSection";
import { toast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  tagline: string;
  features: string[];
  icon: React.ReactNode;
  highlighted: boolean;
  badge?: string;
}

const monthlyPlans: Plan[] = [
  {
    id: "entrenamiento",
    name: "Entrenamiento",
    price: 500,
    tagline: "Fútbol + App para ganar puntos por esfuerzo",
    features: [
      "Clases de fútbol con metodología White Lions",
      "Acceso a la app para ver puntos de disciplina",
      "Entrenamientos divertidos y estructurados"
    ],
    icon: <Goal className="w-6 h-6" />,
    highlighted: false
  },
  {
    id: "liderazgo",
    name: "Liderazgo",
    price: 675,
    tagline: "Fútbol + App + Escuela para Padres Líderes",
    features: [
      "Todo lo de Entrenamiento",
      "Clase mensual en vivo para papás",
      "Cómo formar el carácter de tus hijos"
    ],
    icon: <Users className="w-6 h-6" />,
    highlighted: false
  },
  {
    id: "elite",
    name: "Elite White Lions",
    price: 700,
    tagline: "La experiencia completa para familias comprometidas",
    features: [
      "Todo lo de Liderazgo",
      "Reporte Especial de comportamiento mensual",
      "Medalla Digital de Honor para papás",
      "Acceso prioritario a eventos especiales"
    ],
    icon: <Crown className="w-6 h-6" />,
    highlighted: true,
    badge: "EL MÁS ELEGIDO"
  }
];

const MonthlyPlansSection = () => {
  const handlePlanSelection = async (planId: string, planName: string) => {
    // TODO: Guardar en Supabase
    console.log("Plan seleccionado:", planId);
    toast({
      title: "Plan seleccionado",
      description: `Has elegido el plan ${planName}. Te contactaremos pronto.`,
    });
  };

  return (
    <section id="monthly-plans" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display uppercase tracking-wide">
              Después del Reto, tú eliges el nivel de compromiso
            </h2>
            <p className="text-muted-foreground font-body max-w-2xl mx-auto">
              El Reto es solo el comienzo. Aquí está cómo continúa la transformación de tu hijo.
            </p>
          </div>
        </AnimatedSection>

        {/* Plans Grid */}
        <AnimatedSection animation="fade-up" delay={100}>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {monthlyPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`
                  relative bento-card flex flex-col
                  ${plan.highlighted 
                    ? 'border-2 border-primary bg-gradient-to-b from-primary/10 to-transparent scale-105 shadow-gold z-10' 
                    : 'border border-border/50'
                  }
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Badge for highlighted plan */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}

                {/* Plan Header */}
                <div className={`text-center ${plan.badge ? 'pt-4' : 'pt-2'}`}>
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                    plan.highlighted ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {plan.icon}
                  </div>
                  <h3 className={`text-lg font-bold uppercase font-display mb-2 ${
                    plan.highlighted ? 'text-primary' : 'text-foreground'
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-body mb-4">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground font-display">${plan.price}</span>
                    <span className="text-sm text-muted-foreground font-body">MXN/mes</span>
                  </div>
                  {plan.highlighted && (
                    <p className="text-xs text-primary mt-1 font-body">
                      Solo $25 más que Liderazgo
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                      <span className="text-sm text-muted-foreground font-body">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handlePlanSelection(plan.id, plan.name)}
                  variant={plan.highlighted ? "hero" : "outline"}
                  className="w-full"
                >
                  Elegir {plan.name}
                </Button>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Micro-copy */}
        <AnimatedSection animation="fade-up" delay={200}>
          <p className="text-center text-sm text-muted-foreground/70 mt-8 font-body">
            Los planes mensuales comienzan después de completar el Reto de 30 días.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default MonthlyPlansSection;
