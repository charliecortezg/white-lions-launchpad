import { Check, X } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const ClientFilter = () => {
  const weLookFor = [
    "Buscan estructura, no solo juegos",
    "Valoran disciplina y constancia",
    "Quieren ver progreso real",
    "Están dispuestas a comprometerse",
  ];

  const weAreNot = [
    "Solo buscan partidos o trofeos",
    "Cambian de actividad cada mes",
    "No respetan reglas ni procesos",
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display uppercase tracking-wide">
              ¿White Lions es para tu familia?
            </h2>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-5xl mx-auto">
          {/* Lo que sí buscamos */}
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="bento-card h-full">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3 font-display uppercase">
                <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </span>
                SÍ es para familias que
              </h3>
              <ul className="space-y-4">
                {weLookFor.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>

          {/* Lo que no somos */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bento-card h-full">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-3 font-display uppercase">
                <span className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                  <X className="w-5 h-5 text-destructive" />
                </span>
                NO es para quienes
              </h3>
              <ul className="space-y-4">
                {weAreNot.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedSection>
        </div>

        {/* Micro-copy final */}
        <AnimatedSection animation="fade-up" delay={300}>
          <div className="text-center mt-12">
            <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
              White Lions no es para todos.{" "}
              <span className="text-foreground font-medium">
                Es para familias que toman en serio el desarrollo de sus hijos.
              </span>
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ClientFilter;
