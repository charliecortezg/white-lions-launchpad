import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedSection from "./AnimatedSection";

const FAQNew = () => {
  const faqs = [
    {
      question: "¿Qué es el Reto White Lions de 30 Días?",
      answer: "Es tu primer mes completo como parte de la familia White Lions. No es una prueba ni una clase muestra. Son 30 días de entrenamiento estructurado con todas las herramientas que necesitas: kit de inicio incluido, integración completa al grupo y seguimiento desde el día 1. El costo es de $700 MXN (pago único).",
    },
    {
      question: "¿Qué incluye el Kit de Inicio?",
      answer: "El kit incluye: Camiseta oficial White Lions, calcetas deportivas, espinilleras de entrenamiento y un termo White Lions. Valorado en $300 MXN aproximadamente. Es tuyo desde el momento en que te inscribes al Reto.",
    },
    {
      question: "¿Cómo funciona la garantía?",
      answer: "Si al finalizar los 30 días no ves la organización y estructura que prometemos, te devolvemos tu inversión ($700 MXN) menos el valor del kit que ya te entregamos ($300 MXN). Sin preguntas, sin complicaciones. Así de seguros estamos de lo que ofrecemos.",
    },
    {
      question: "¿Cuánto cuesta continuar después del Reto?",
      answer: "La mensualidad regular después del Reto es de $500 MXN. No hay reinscripción anual ni costos ocultos. Si decides continuar, simplemente pagas la mensualidad y sigues entrenando.",
    },
    {
      question: "¿Mi hijo puede entrar sin experiencia?",
      answer: "¡Por supuesto! Recibimos niños de todos los niveles. Nuestra metodología está diseñada para desarrollar habilidades desde cero. Lo importante es la actitud, el compromiso y las ganas de aprender.",
    },
    {
      question: "¿Qué debe llevar mi hijo al primer día?",
      answer: "Ropa deportiva cómoda, tenis adecuados para el deporte (tacos para fútbol, tenis de cancha para basket), agua y muchas ganas. Nosotros te entregaremos el kit de inicio y proporcionamos los balones de entrenamiento.",
    },
    {
      question: "¿Las academias son mixtas?",
      answer: "Sí, nuestras categorías son mixtas. Creemos en la inclusión y en que niños y niñas pueden desarrollarse juntos en un ambiente de respeto y sana competencia.",
    },
    {
      question: "¿Por qué no ofrecen una clase muestra gratis?",
      answer: "Porque creemos que el deporte no se prueba, se vive. Una sola sesión no te permite ver el verdadero impacto de nuestro sistema. Con el Reto de 30 días, tu hijo experimenta la metodología completa, crea hábitos reales y tú puedes evaluar con certeza si White Lions es lo que buscas. Y si no, tienes nuestra garantía.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4 font-display uppercase tracking-wide">
            Preguntas Frecuentes
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto font-body">
            Todo lo que necesitas saber antes de tomar la decisión.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          <AnimatedSection animation="fade-up" delay={100}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bento-card px-6"
                >
                  <AccordionTrigger className="text-left text-foreground font-medium py-5 hover:no-underline font-body">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 font-body">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default FAQNew;
