import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle, Phone } from "lucide-react";

const FAQ = () => {
  const faqs = [
    { question: "¿A partir de qué edad pueden ingresar los niños?", answer: "Aceptamos niños desde los 6 años en adelante. Tenemos categorías específicas para cada grupo de edad según el deporte seleccionado." },
    { question: "¿Qué necesita mi hijo para la clase muestra?", answer: "Solo necesita ropa cómoda deportiva y muchas ganas de divertirse. Nosotros proporcionamos los balones y todo el equipo necesario para la sesión." },
    { question: "¿Cómo agendo una clase muestra?", answer: "Puedes agendar tu clase muestra únicamente a través del formulario en nuestro sitio web. Solo haz clic en el botón 'Agendar Clase Muestra' y llena el formulario con la información requerida." },
    { question: "¿Cuál es el costo de inscripción y mensualidad?", answer: "La inscripción tiene un costo de $300 MXN. La mensualidad de fútbol es de $450 MXN y la de basketball es de $400 MXN." },
    { question: "¿Cuántos entrenamientos son por semana?", answer: "Nuestros entrenamientos son 2 veces por semana. Para categorías juveniles, el entrenador puede programar hasta 3 sesiones semanales según el nivel y objetivos del equipo." },
    { question: "¿Dónde están ubicadas las sedes?", answer: "Fútbol: Campo Hacienda del Bosque (Av Bosque Almendros S/N, Del Bosque). Basketball: Parque Quinta del Rey III (Residencial Quinta del Rey, 3ra Etapa)." },
    { question: "¿En qué torneos participan?", answer: "Fútbol: Futcenter Liga Menor, Liga Elite, Liga Alianza Kids, Liga Independencia, y Copa CETYS. Basketball: Liga Municipal de Basketball." },
    { question: "¿Qué hace especial a White Lions Academies?", answer: "Combinamos metodología europea certificada (Barça Innovation Hub, Coerver Coaching, FIFA Grassroots) con valores institucionales sólidos. No solo formamos jugadores técnicamente superiores, sino personas íntegras y resilientes." }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">Preguntas Frecuentes</div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">¿Tienes Dudas?<span className="block text-gold">Te Ayudamos</span></h2>
            <p className="text-xl text-muted-foreground">Encuentra respuestas a las preguntas más comunes</p>
          </div>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card border-2 border-gold/20 rounded-2xl px-6 hover:border-gold/50 transition-colors">
                <AccordionTrigger className="text-left text-lg font-semibold text-navy hover:text-gold">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-16 bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-8 md:p-12 text-center shadow-premium">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">¿No encontraste tu respuesta?</h3>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">Nuestro equipo está listo para ayudarte. Contáctanos por WhatsApp o llámanos directamente.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="gold" size="lg" onClick={() => window.open('https://wa.me/526867221036', '_blank')} className="group"><MessageCircle className="w-5 h-5" />WhatsApp</Button>
              <Button variant="hero" size="lg" onClick={() => window.location.href = 'tel:+526867221036'}><Phone className="w-5 h-5" />Llamar Ahora</Button>
            </div>
            <div className="mt-6 text-primary-foreground/80">
              <p className="font-semibold">+52 686 722 1036</p>
              <p className="text-sm">whitelions.admn@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
