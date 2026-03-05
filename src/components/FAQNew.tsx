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
      question: "¿Cómo funciona la clase muestra?",
      answer: "La clase muestra es gratuita y sin compromiso. Tu hijo participa en una sesión real con el grupo, conoce a los entrenadores y vive la metodología White Lions. Tú puedes observar desde la cancha. No necesitas pagar nada ni comprometerte a continuar.",
    },
    {
      question: "¿Qué es el Reto White Lions de 30 Días?",
      answer: "Es una experiencia de integración de 30 días diseñada para que tu hijo conozca nuestra metodología, se adapte al grupo y viva el sistema White Lions desde dentro. El costo es de $700 MXN (inscripción $400 + primera mensualidad $500). Este precio aplica como oferta al iniciar después de la clase muestra. Incluye entrenamientos estructurados, seguimiento formativo y garantía de satisfacción.",
    },
    {
      question: "¿Qué incluye el Reto?",
      answer: "El Reto incluye: entrenamientos dos veces por semana, adaptación progresiva al sistema White Lions, desarrollo de hábitos deportivos, integración al grupo y entrenadores, y una evaluación real de si este sistema es para tu familia. Los partidos oficiales y el kit White Lions se habilitan al finalizar el Reto y completar la inscripción.",
    },
    {
      question: "¿Cómo funciona la garantía?",
      answer: "Si después de 30 días tu hijo no se divierte más, no se mueve más y no se adapta al entorno White Lions, te devolvemos tu dinero. Para procesar el reembolso, solo necesitas completar un breve formulario de retroalimentación que te proporcionaremos. Sin complicaciones.",
    },
    {
      question: "¿La inscripción es anual?",
      answer: "La inscripción de $400 MXN corresponde al ciclo escolar actual (Agosto–Junio). Una vez inscrito, solo pagas la mensualidad de $500 MXN cada mes. No hay costos ocultos ni cargos adicionales.",
    },
    {
      question: "¿Cuánto cuesta continuar después del Reto?",
      answer: "La mensualidad regular después del Reto es de $500 MXN. Es un solo plan, sin complicaciones. Al inscribirte formalmente obtienes acceso a partidos oficiales, el kit White Lions, evaluaciones mensuales y acceso a la plataforma STRYK para seguimiento del progreso.",
    },
    {
      question: "¿Mi hijo puede entrar sin experiencia?",
      answer: "¡Por supuesto! Recibimos niños de todos los niveles. Nuestra metodología está diseñada para desarrollar habilidades desde cero. Lo importante es la actitud, el compromiso y las ganas de aprender.",
    },
    {
      question: "¿Qué debe llevar mi hijo al primer día?",
      answer: "Ropa deportiva cómoda, tacos de fútbol, agua y muchas ganas. Nosotros proporcionamos los balones de entrenamiento.",
    },
    {
      question: "¿Las academias son mixtas?",
      answer: "Sí, nuestras categorías son mixtas. Creemos en la inclusión y en que niños y niñas pueden desarrollarse juntos en un ambiente de respeto y sana competencia.",
    },
    {
      question: "¿Hay categoría para niños de 4-5 años?",
      answer: "Sí, la categoría Biberón está activa para niños de 4-5 años (nacidos en 2020-2021). Los entrenamientos son martes y jueves de 6:00 a 7:00 PM en Hacienda del Bosque. El cupo es limitado a 8 jugadores. Si el cupo está lleno, puedes registrarte en la lista de espera.",
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
