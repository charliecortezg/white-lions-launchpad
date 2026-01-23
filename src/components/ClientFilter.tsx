import { Check, X } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const ClientFilter = () => {
  const weLookFor = [
    "Niños que quieren divertirse y aprender disciplina",
    "Padres que valoran la puntualidad y la estructura",
    "Atletas que entienden que el esfuerzo vence al talento",
  ];

  const weAreNot = [
    "Guardería sin supervisión",
    "Lugar donde solo juegan los \"cracks\"",
    "Equipo que prioriza trofeos sobre educación",
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Nuestra Filosofía: Formamos Personas a través del Deporte.
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-5xl mx-auto">
          {/* Lo que sí buscamos */}
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-accent/20 h-full">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-accent" />
                </span>
                Lo que SÍ buscamos
              </h3>
              <ul className="space-y-4">
                {weLookFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Lo que no somos */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-card rounded-2xl p-8 shadow-lg border border-border h-full">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive" />
                </span>
                Lo que NO somos
              </h3>
              <ul className="space-y-4">
                {weAreNot.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default ClientFilter;
