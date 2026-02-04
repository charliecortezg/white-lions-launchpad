import { Smartphone, Activity, Clock, Users } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const ProblemSection = () => {
  const painPoints = [
    { icon: Activity, text: "Que se muevan más" },
    { icon: Clock, text: "Que desarrollen disciplina" },
    { icon: Smartphone, text: "Que salgan de la rutina de pantallas" },
    { icon: Users, text: "Que pertenezcan a un entorno sano" },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6 font-display uppercase tracking-wide leading-tight">
              Hoy no es fácil encontrar una actividad que realmente ayude a tu hijo
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10 font-body">
              Muchos padres buscan algo más que "entretener" a sus hijos.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={100}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
            {painPoints.map((point, index) => (
              <div 
                key={index}
                className="bento-card p-5 text-center"
              >
                <point.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm md:text-base text-foreground font-body font-medium">
                  {point.text}
                </p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200}>
          <p className="text-center text-lg md:text-xl text-primary font-semibold font-body">
            White Lions existe para cubrir exactamente eso.
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default ProblemSection;
