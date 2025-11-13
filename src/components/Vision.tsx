import { Target, TrendingUp, Globe } from "lucide-react";

const Vision = () => {
  const objectives2028 = {
    deportivos: [
      "Alcanzar más de 200 jugadores activos entrenando bajo el Sistema de Niveles White Lions Methodology",
      "Expandir el programa deportivo hacia 4–5 disciplinas nuevas, manteniendo un estándar metodológico y pedagógico común",
      "Desarrollar e implementar la Certificación Oficial White Lions Methodology, aplicada a todos los jugadores y entrenadores activos"
    ],
    comerciales: [
      "Establecer más de 5 sedes activas, distribuidas entre 2 ciudades distintas",
      "Iniciar oficialmente el Modelo de Franquicia White Lions Academies, con un manual operativo y metodológico exportable",
      "Abrir la primera fase de Arenas Multi-Deporte con espacios dedicados a enseñanza, torneos internos y formación integral"
    ],
    operativos: [
      "Lograr que toda la operación del club esté 100% automatizada, incluyendo CRM, asistencias, pagos, inscripciones y reportes",
      "Implementar alianzas estratégicas con instituciones educativas para formación continua del staff deportivo",
      "Integrar un Sistema Automático de Pagos y plataforma de gestión centralizada para todas las sedes"
    ]
  };

  const objectives2030 = {
    deportivos: [
      "Aumentar la huella deportiva a 8–10 disciplinas, con coordinación metodológica transversal",
      "Consolidar más de 400 jugadores activos distribuidos entre varias ciudades",
      "Inaugurar en Mexicali el primer White Lions Performance Hub, especializado en alto rendimiento, análisis, psicología deportiva y prevención"
    ],
    comerciales: [
      "Operar 10+ sedes en diferentes ciudades y países, bajo un modelo homogéneo y auditado",
      "Escalar la red de franquicias White Lions, expandiendo la presencia institucional a diversos territorios",
      "Iniciar operaciones piloto de Centros de Estudio y Certificación Deportiva, integrados al ecosistema White Lions"
    ],
    operativos: [
      "Consolidar un ecosistema automatizado multi-sede con reportes, indicadores y paneles de control en tiempo real",
      "Fortalecer alianzas con instituciones educativas, universidades y centros de investigación deportiva en México y el extranjero",
      "Desarrollar un plan interinstitucional para certificaciones permanentes del staff: Barça Innovation Hub, FIFA Grassroots, Coerver Coaching, NBA/FIBA Coaching"
    ]
  };

  const objectives2035 = {
    deportivos: [
      "Alcanzar una comunidad global de 1,000+ jugadores activos, distribuidos en múltiples países",
      "Ser referente internacional en formación deportiva mediante la expansión formal de White Lions Methodology",
      "Integrar programas avanzados de desarrollo deportivo que unifiquen: análisis de datos, IA aplicada y sistemas de entrenamiento de alto rendimiento"
    ],
    comerciales: [
      "Operar 50+ sedes en más de 20 países, consolidando a White Lions como institución internacional",
      "Establecer la White Lions Global Academy Network, una red de academias afiliadas que utilicen nuestra metodología",
      "Producir, licenciar y escalar cursos, certificaciones y workshops de White Lions Methodology en todo el mundo"
    ],
    operativos: [
      "Contar con un sistema propietario de tecnología deportiva (CRM, análisis, academias), licenciado globalmente",
      "Consolidar alianzas educativas en América, Europa y Medio Oriente para certificaciones, investigación y proyectos deportivos",
      "Ser un referente institucional en formación de entrenadores, con programas anuales, sedes certificadoras y contenido de exportación"
    ]
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gold/10 text-gold text-sm font-semibold px-4 py-2 rounded-full mb-4">
              Visión y Futuro
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
              White Lions Academies
              <span className="block text-gold">2028 - 2035</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nuestro compromiso con la excelencia deportiva y el crecimiento sostenible nos impulsa hacia el futuro
            </p>
          </div>

          {/* 2028 - Consolidación */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Target className="w-8 h-8 text-gold" />
              <h3 className="text-3xl font-bold text-navy">2028 – Consolidación Multiproceso</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Deportivos</h4>
                <ul className="space-y-3">
                  {objectives2028.deportivos.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Comerciales</h4>
                <ul className="space-y-3">
                  {objectives2028.comerciales.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Operativos</h4>
                <ul className="space-y-3">
                  {objectives2028.operativos.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 2030 - Expansión Regional */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 text-gold" />
              <h3 className="text-3xl font-bold text-navy">2030 – Expansión Regional e Institucional</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Deportivos</h4>
                <ul className="space-y-3">
                  {objectives2030.deportivos.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Comerciales</h4>
                <ul className="space-y-3">
                  {objectives2030.comerciales.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Operativos</h4>
                <ul className="space-y-3">
                  {objectives2030.operativos.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 2035 - Institución Global */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <Globe className="w-8 h-8 text-gold" />
              <h3 className="text-3xl font-bold text-navy">2035 – Institución Deportiva Internacional</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Deportivos</h4>
                <ul className="space-y-3">
                  {objectives2035.deportivos.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Comerciales</h4>
                <ul className="space-y-3">
                  {objectives2035.comerciales.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card border-2 border-gold/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                <h4 className="text-xl font-bold text-navy mb-4">Objetivos Operativos</h4>
                <ul className="space-y-3">
                  {objectives2035.operativos.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gold font-bold mt-1">✓</span>
                      <span className="text-sm text-muted-foreground">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Statement */}
          <div className="mt-16 bg-gradient-to-br from-primary to-primary/90 rounded-3xl p-12 text-center shadow-premium">
            <blockquote className="text-3xl md:text-4xl font-light text-primary-foreground italic leading-relaxed mb-4">
              "El futuro se construye hoy"
            </blockquote>
            <p className="text-primary-foreground/90 text-lg max-w-3xl mx-auto">
              Cada entrenamiento, cada valor inculcado y cada jugador formado es un paso hacia nuestra visión de convertirnos en una institución deportiva global de excelencia
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;