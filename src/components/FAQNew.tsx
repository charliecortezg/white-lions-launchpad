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
      question: "¿Cuánto cuesta la inscripción y el uniforme?",
      answer: "La inscripción es de $300 MXN y es válida de agosto a junio. Incluye registro a torneos y acceso completo a entrenamientos. El uniforme NO es obligatorio desde el día 1. Puedes empezar con ropa deportiva cómoda.",
    },
    {
      question: "¿Mi hijo puede entrar sin experiencia?",
      answer: "¡Claro! Recibimos niños de todos los niveles. Nuestra metodología está diseñada para desarrollar habilidades desde cero. Lo importante es la actitud y las ganas de aprender.",
    },
    {
      question: "¿Qué debe llevar mi hijo al primer día?",
      answer: "Ropa deportiva cómoda, tenis adecuados para el deporte (tacos para fútbol, tenis de cancha para basket), agua y muchas ganas. Nosotros proporcionamos los balones de entrenamiento.",
    },
    {
      question: "¿Las academias son mixtas?",
      answer: "Sí, nuestras categorías son mixtas. Creemos en la inclusión y en que niños y niñas pueden desarrollarse juntos en un ambiente de respeto y sana competencia.",
    },
    {
      question: "¿Qué pasa si no me convence después del Reto de 30 Días?",
      answer: "Si al finalizar el Reto de 30 Días no ves la organización y estructura que prometemos, te devolvemos tu mensualidad completa. Sin preguntas, sin complicaciones.",
    },
  ];

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Resolvemos tus dudas para que tomes la mejor decisión.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          <AnimatedSection animation="fade-up" delay={100}>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-card rounded-xl border border-border px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left text-foreground font-medium py-5 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
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
