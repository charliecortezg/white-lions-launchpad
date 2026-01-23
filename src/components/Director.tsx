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
                <div className="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-primary/30 shadow-premium">
                  <img 
                    src={carlosCortezImage} 
                    alt="Carlos Cortez - Director White Lions Academy" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-gold">
                  <p className="font-bold text-sm font-display uppercase">Fundador & Director</p>
                </div>
              </div>
            </AnimatedSection>

            {/* Content */}
            <AnimatedSection animation="fade-up" delay={100}>
              <div className="space-y-6">
                <div>
                  <p className="text-primary font-semibold text-sm uppercase tracking-widest mb-2 font-body">
                    El Director
                  </p>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground font-display uppercase">
                    Carlos Cortez
                  </h2>
                  <p className="text-muted-foreground mt-2 font-body">
                    Project Manager (PMP) & Emprendedor Deportivo
                  </p>
                </div>

                <blockquote className="border-l-4 border-primary pl-6 py-2">
                  <p className="text-lg text-foreground leading-relaxed italic font-body">
                    "Fundé White Lions para aplicar estructura y metodología profesional al deporte infantil. Aquí no improvisamos: desarrollamos atletas con visión de futuro."
                  </p>
                </blockquote>

                <div className="flex flex-wrap gap-3">
                  <span className="bg-card border border-border text-muted-foreground px-4 py-2 rounded-full text-sm font-body">
                    10+ años en gestión
                  </span>
                  <span className="bg-card border border-border text-muted-foreground px-4 py-2 rounded-full text-sm font-body">
                    Certificación PMP
                  </span>
                  <span className="bg-card border border-border text-muted-foreground px-4 py-2 rounded-full text-sm font-body">
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