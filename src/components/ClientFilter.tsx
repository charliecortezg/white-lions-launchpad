import { Check, X } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const ClientFilter = () => {
  const weLookFor = [
    "Familias comprometidas con la formación de sus hijos",
    "Padres que valoran la puntualidad, estructura y disciplina",
    "Niños que quieren pertenecer a algo más grande que ellos",
    "Atletas que entienden que el proceso es más importante que el resultado",
  ];

  const weAreNot = [
    "Un lugar para \"probar a ver si le gusta\"",
    "Una guardería con balones",
    "Un equipo que prioriza trofeos sobre personas",
    "Una academia sin seguimiento ni metodología",
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-display uppercase tracking-wide">
              White Lions es para familias que deciden, no para familias que prueban.
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
              Nuestra filosofía: Formamos personas a través del deporte.
            </p>
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
                Lo que SÍ buscamos
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
                Lo que NO somos
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
      </div>
    </section>
  );
};

export default ClientFilter;
