import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ValueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valueName: string;
}

const valueDescriptions: Record<string, string> = {
  "Respeto": "En White Lions Academies, el respeto es un pilar central que se construye diariamente a través del entrenamiento, la convivencia y el aprendizaje guiado. No se enseña como un concepto abstracto, sino como un comportamiento visible que se modela en cada ejercicio, en cada interacción y en cada momento de juego. Desde los niveles iniciales como Leoncito hasta los niveles superiores como Estratega, Líder o Leyenda, el respeto se integra en progresiones que ayudan al jugador a comprender que la calidad humana es tan importante como la calidad técnica. En el campo se traduce en escuchar indicaciones, respetar turnos, mantener el autocontrol, saludar, cuidar el material y valorar al rival. En rondos, posesiones y juegos reducidos, reforzamos el respeto al uso del espacio, al compañero con y sin balón y al ritmo colectivo. Enseñamos que respetarse a sí mismo significa comprometerse, esforzarse y honrar su proceso formativo. Aquí, el respeto es acción, hábito y cultura.",
  
  "Unidad": "La unidad en White Lions no es solo trabajar juntos; es formar parte de algo más grande que uno mismo. Desde edades tempranas enseñamos a los jugadores que el equipo es una familia deportiva y que cada uno tiene un rol esencial dentro del sistema. En los niveles formativos, la unidad se desarrolla mediante dinámicas de cooperación, resolución conjunta de retos y construcción de identidad colectiva. A través de rondos cooperativos, tareas grupales y juegos de roles, los jugadores aprenden a comunicarse, apoyarse y confiar en los demás. Técnicamente, la unidad se manifiesta en sincronización ofensiva, ayudas defensivas y comportamientos tácticos compartidos. Emocionalmente, se traduce en acompañamiento, ánimo, empatía y responsabilidad colectiva. En White Lions, la unidad es un proceso pedagógico que integra inteligencia social, cohesión emocional y comprensión táctica. Cada jugador aprende a 'jugar para el equipo', entendiendo que juntos avanzamos más lejos que solos.",
  
  "Disciplina": "En White Lions Academies, la disciplina es un valor que se entrena con la misma intención con la que se entrena la técnica o la táctica. No es castigo ni rigidez, sino una herramienta de crecimiento personal. En todos los niveles de la progresión formativa, la disciplina se presenta como un conjunto de hábitos: puntualidad, cuidado personal, respeto a las tareas, enfoque en los objetivos y constancia. Durante los entrenamientos, reforzamos la disciplina mediante rutinas claras, tareas con roles definidos, tiempos de ejecución y expectativas comunicadas. En lo técnico, la disciplina permite mejorar el control, la orientación corporal, la toma de decisiones y la eficiencia de movimientos. En lo emocional, fomenta resiliencia, autocontrol y capacidad de mantenerse firme incluso en la dificultad. La disciplina es la base que permite que los jugadores alcancen su potencial. Con disciplina, el talento se organiza; sin ella, el talento se desperdicia.",
  
  "Valor": "El valor en White Lions es la capacidad de tomar acción con decisión, aun cuando existe incertidumbre o temor. En el deporte, el valor se traduce en atreverse a intentarlo: driblar, pasar, desmarcarse, tirar, defender, corregir, hablar, pedir el balón. Enseñamos a los jugadores a actuar desde la convicción, no desde el miedo. Desde los niveles iniciales, el valor se integra en ejercicios que requieren iniciativa, intención ofensiva y creatividad. Por ejemplo, duelos 1 vs 1, rondos con presión, toma de decisiones en espacios reducidos y tareas donde cada jugador debe asumir protagonismo. A nivel emocional, el valor implica expresar ideas, pedir ayuda, aceptar correcciones y enfrentar retos sin rendirse. A través de coaching pedagógico, creamos un ambiente donde equivocarse es parte natural del aprendizaje. En White Lions, el valor es actuar con determinación, defender los principios del equipo y avanzar sin detenerse.",
  
  "Resiliencia": "La resiliencia es la capacidad de adaptarse, recuperarse y persistir ante cualquier desafío. En White Lions la entrenamos igual que cualquier habilidad técnica: con progresión, intención y contexto. Desde los niveles iniciales trabajamos la resiliencia en circunstancias que requieren esfuerzo sostenido, repetición consciente y capacidad de recomenzar. Técnicamente, la resiliencia se entrena mediante tareas con presión creciente, adaptaciones continuas, transiciones rápidas y escenarios donde el jugador debe reajustarse. Emocionalmente, acompañamos al deportista para que aprenda a manejar frustración, errores, cansancio y derrotas. A nivel grupal, la resiliencia se expresa cuando el equipo se mantiene unido en la dificultad, reajusta su plan y continúa trabajando con actitud positiva. La resiliencia forma parte de nuestra identidad porque sabemos que en la vida, como en el deporte, lo importante no es no caer, sino levantarse con más fuerza, claridad y propósito."
};

const ValueModal = ({ open, onOpenChange, valueName }: ValueModalProps) => {
  const description = valueDescriptions[valueName] || "En White Lions Academies utilizamos el deporte como un medio pedagógico para inculcar este valor. A través de entrenamientos estructurados, situaciones guiadas y participación activa en comunidad, enseñamos a nuestros jugadores a aplicar este valor dentro y fuera del campo.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto backdrop-blur-xl bg-background/95">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-navy text-center">
            {valueName}
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          <p className="text-muted-foreground leading-relaxed text-justify">
            {description}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValueModal;
