import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "¿Mi hijo necesita experiencia previa?",
      answer: "No, en absoluto. White Lions Academies recibe jugadores de todos los niveles. Tenemos categorías desde los 3 años (Biberón) hasta juveniles, y nuestros entrenadores están capacitados para trabajar desde lo más básico hasta niveles avanzados. La clase muestra nos permite evaluar el nivel actual y ubicar al jugador en el grupo más adecuado."
    },
    {
      question: "¿Qué debe llevar mi hijo al entrenamiento?",
      answer: "Para la clase muestra: ropa deportiva cómoda, tenis deportivos, una botella de agua. Una vez inscrito, proporcionamos el uniforme oficial White Lions. Para entrenamientos regulares: uniforme, tenis de fútbol o basketball (según deporte), protección (espinilleras para fútbol), botella de agua y toalla."
    },
    {
      question: "¿Cómo funciona la clase muestra?",
      answer: "La clase muestra es gratuita y sin compromiso. Consiste en una sesión de entrenamiento donde tu hijo participará con su grupo de edad, conocerá a los entrenadores, las instalaciones y la metodología White Lions. Después de la clase, los entrenadores te darán retroalimentación sobre el nivel y recomendaciones de categoría. Puedes agendar directamente en nuestro sitio web o por WhatsApp."
    },
    {
      question: "¿Se paga inscripción?",
      answer: "Sí, tenemos una inscripción anual que incluye: uniforme oficial White Lions (playera, short, medias), evaluación inicial, seguro deportivo, y acceso a eventos especiales de la academia. Las mensualidades son independientes y varían según la categoría y frecuencia de entrenamientos. Te proporcionamos toda la información detallada en tu clase muestra."
    },
    {
      question: "¿Cuántos entrenamientos por semana?",
      answer: "Depende de la categoría. Las categorías más pequeñas (Biberón, Escuelita) entrenan 2-3 veces por semana. Las categorías intermedias y juveniles entrenan 3 veces por semana más partidos los sábados. Nuestro objetivo es mantener un equilibrio entre formación deportiva, desarrollo físico y tiempo para estudios y familia."
    },
    {
      question: "¿Participan en torneos?",
      answer: "Sí, todas nuestras categorías participan en torneos locales y regionales. Además, organizamos torneos internos, festivales deportivos y eventos especiales. Las categorías juveniles compiten en ligas municipales y estatales. La participación en torneos es parte fundamental de la experiencia White Lions."
    },
    {
      question: "¿Tienen programas de basketball?",
      answer: "Sí, además del fútbol ofrecemos programas de basketball con la misma calidad y metodología. Contamos con entrenadores especializados y categorías desde iniciación hasta juveniles. Los entrenamientos se realizan en nuestras instalaciones techadas y también participamos en torneos locales."
    },
    {
      question: "¿Dónde están ubicadas las sedes?",
      answer: "Contamos con instalaciones en Mexicali. La ubicación principal está en [Dirección a definir]. También utilizamos el Complejo Deportivo para categorías juveniles. Durante la clase muestra conocerás las instalaciones que corresponden a la categoría de tu hijo."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Preguntas Frecuentes
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              ¿Tienes Dudas?
            </h2>
            <p className="text-xl text-muted-foreground">
              Aquí respondemos las preguntas más comunes de nuestras familias
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl px-6 hover:border-gold/50 transition-colors"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-gold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 text-center shadow-premium">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
              ¿No encontraste tu respuesta?
            </h3>
            <p className="text-primary-foreground/90 mb-6">
              Contáctanos directamente y con gusto resolveremos todas tus dudas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/526861234567" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-gold text-navy hover:bg-gold/90 h-12 rounded-md px-8 font-semibold transition-smooth shadow-gold"
              >
                💬 WhatsApp
              </a>
              <a 
                href="tel:+526861234567"
                className="inline-flex items-center justify-center gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 h-12 rounded-md px-8 font-semibold transition-smooth"
              >
                📞 Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
