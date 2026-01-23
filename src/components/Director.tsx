import carlosCortezImage from "@/assets/carlos-cortez.png";
import AnimatedSection from "./AnimatedSection";

const Director = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <AnimatedSection animation="fade-up">
              <div className="relative">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-premium">
                  <img 
                    src={carlosCortezImage} 
                    alt="Carlos Cortez - Director White Lions Academy" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground px-6 py-3 rounded-xl shadow-gold">
                  <p className="font-bold text-sm">Fundador & Director</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Content */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="space-y-6">
                <div>
                  <p className="text-accent font-semibold text-sm uppercase tracking-wide mb-2">
                    El Director
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    Carlos Cortez
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Project Manager (PMP) & Emprendedor Deportivo
                  </p>
                </div>

                <blockquote className="border-l-4 border-accent pl-6 py-2">
                  <p className="text-lg text-foreground leading-relaxed italic">
                    "Fundé White Lions para aplicar estructura y metodología profesional al deporte infantil. Aquí no improvisamos: desarrollamos atletas con visión de futuro."
                  </p>
                </blockquote>

                <div className="flex flex-wrap gap-3">
                  <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm">
                    10+ años en gestión
                  </span>
                  <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm">
                    Certificación PMP
                  </span>
                  <span className="bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm">
                    Formación Barça Academy
                  </span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Director;
