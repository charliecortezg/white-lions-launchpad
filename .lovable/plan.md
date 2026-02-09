

# Plan: Pagina de Referidos /wl-friend

## Resumen

Crear una nueva pagina interna en `/wl-friend` con tono personal y cercano, que reutiliza el formulario de registro existente (`ChallengeRegistrationModal`) con un campo adicional "Quien te invito?". Los datos de referido se guardan en la base de datos para trazabilidad.

---

## Cambios en Base de Datos

Agregar 2 columnas a `trial_class_registrations`:

| Columna | Tipo | Default | Nota |
|---------|------|---------|------|
| referral_name | text | NULL | Nombre de quien refirio |
| referral_source | text | NULL | Origen (ej: 'WL-FRIEND') |

Estas columnas son nullable y no afectan registros existentes.

---

## Archivos a Crear

### 1. `src/pages/WLFriend.tsx` — Pagina completa de referidos

Estructura de secciones:

**Hero Section**
- Headline: "Te invitaron a conocer White Lions Academy"
- Subheadline: "Una experiencia formativa de futbol para ninos de 6 a 13 anos en Mexicali."
- Microcopy: "Esta invitacion viene de una familia que ya entrena con nosotros."
- CTA: "Agendar clase muestra gratuita" (abre el modal)

**Seccion "Por que estas aqui?"**
- Texto humano explicando que es una invitacion personal, no una promocion

**Seccion "Que vivira tu hijo?"**
- 4 bullets: metodologia europea, grupos reducidos, disciplina/confianza/diversion, ambiente formativo
- Frase ancla: "Aqui inicia su mejor version."

**Seccion "Como funciona?"**
- 4 pasos visuales: Agenda -> Vive la experiencia -> Conoce el sistema -> Decide sin presion
- Mensaje: "Sin compromiso. Sin presion."

**Seccion Formulario**
- CTA grande que abre el mismo `ChallengeRegistrationModal` pero con props de referido activadas

**Footer operativo**
- Ubicacion, horario, edades
- Sin precios, sin planes, sin kit

---

## Archivos a Modificar

### 2. `src/components/ChallengeRegistrationModal.tsx`

Cambios minimos:

- Agregar props opcionales: `referralSource?: string`
- Agregar campo opcional en el formulario (Step 3 para flujo regular, Step 2 para Biberon):
  - Label: "Quien te invito a White Lions?"
  - Placeholder: "Nombre del jugador o padre de familia"
  - No obligatorio
- Agregar `referral_name` al schema de zod como string opcional
- En el submit regular (`onSubmitRegular`), incluir `referral_name` y `referral_source` en el INSERT/UPDATE a `trial_class_registrations`
- En el submit waitlist (`onSubmitWaitlist`), guardar en el campo `notes` como prefijo (ej: "[Referido por: Juan] ...notas")

### 3. `src/App.tsx`

- Agregar ruta `/wl-friend` apuntando a `WLFriend`

---

## Diseno visual de la pagina

La pagina usa el mismo sistema de diseno (dark theme, colores gold/navy) pero con un tono mas intimo:

- Sin navbar completo (solo logo arriba)
- Sin seccion de precios
- Sin FAQ
- Sin footer completo — solo info operativa
- Fondo oscuro con gradientes sutiles (similar al Hero principal)
- Animaciones suaves con el componente `AnimatedSection` existente

---

## Flujo del usuario

```text
Recibe tarjeta fisica
        |
        v
Visita /wl-friend
        |
        v
Lee contenido personal (30 seg)
        |
        v
Click "Agendar clase muestra gratuita"
        |
        v
Modal de registro (mismo flujo 4 pasos)
  + campo "Quien te invito?" en paso de contacto
  + referral_source = 'WL-FRIEND' automatico
        |
        v
Registro guardado con trazabilidad
```

---

## Lo que NO se modifica

- Flujo de registro existente (4 pasos)
- Logica de Biberon / Juvenil A
- Pagina principal (Index)
- Admin panel
- Edge functions de email (el campo referral se guarda en BD, no cambia el email)
- Precios o menciones de Reto en esta pagina (NO se muestran)

