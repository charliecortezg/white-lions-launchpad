import { Star } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { useInView } from "@/hooks/useInView";
import { useState, useEffect } from "react";

const CountUpNumber = ({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.5, triggerOnce: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <div ref={ref}>{count}{suffix}</div>;
};

const Testimonials = () => {
  const testimonials = [
    {
      name: "María González",
      role: "Madre de Mateo (9 años)",
      content: "White Lions ha transformado a mi hijo. No solo mejoró su técnica en el fútbol, sino que también aprendió valores fundamentales como el respeto y la disciplina. Los entrenadores son excepcionales.",
      rating: 5
    },
    {
      name: "Roberto Martínez",
      role: "Padre de Sofía (12 años)",
      content: "La metodología europea realmente marca la diferencia. Sofía ha crecido deportivamente de manera increíble y lo mejor es que disfruta cada entrenamiento. Somos una familia White Lions.",
      rating: 5
    },
    {
      name: "Ana Rodríguez",
      role: "Madre de Diego (7 años)",
      content: "Desde el primer día nos sentimos parte de una gran familia. El ambiente es inspirador y la profesionalidad de los entrenadores es notable. Diego está emocionado por cada clase.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <AnimatedSection animation="fade-up" className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Testimonios
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              Lo Que Dicen
              <span className="block text-gold">Nuestras Familias</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              La confianza de padres y jugadores es nuestro mayor logro
            </p>
          </AnimatedSection>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <AnimatedSection 
                key={index}
                animation={index === 1 ? "fade-up" : index === 0 ? "fade-right" : "fade-left"} 
                delay={100 + index * 150}
              >
                <div className="bg-card rounded-2xl p-8 shadow-lg hover:shadow-gold transition-all duration-300 hover:-translate-y-1 h-full">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {testimonial.content}
                  </p>

                  {/* Author */}
                  <div className="border-t border-border pt-4">
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Stats */}
          <AnimatedSection animation="fade-up" delay={400}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 p-8 bg-card rounded-3xl border border-gold/20">
              <div className="text-center">
                <div className="text-4xl font-bold text-gold mb-2">
                  <CountUpNumber end={98} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Satisfacción</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold mb-2">4.9</div>
                <div className="text-sm text-muted-foreground">Calificación</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold mb-2">
                  <CountUpNumber end={300} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Familias</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold mb-2">
                  <CountUpNumber end={15} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Años</div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
