

# Plan: Lista de Espera "Biberon" (4-5 anos)

## Resumen

Agregar una nueva categoria "Biberon (4-5 anos)" al formulario de registro existente. Cuando un padre selecciona un ano de nacimiento 2020 o 2021, el formulario cambia a un flujo separado de **lista de espera** con cupo limitado a 8 espacios. No se agenda clase muestra ni se activa el pipeline regular.

---

## Cambios en Base de Datos

### Nueva tabla: `waitlist_registrations`

| Campo | Tipo | Notas |
|-------|------|-------|
| id | uuid | PK, auto-generado |
| created_at | timestamptz | default now() |
| source | text | default 'web_form' |
| category | text | 'biberon' |
| child_name | text | NOT NULL |
| child_birth_year | int | nullable |
| child_age | int | nullable |
| parent_name | text | NOT NULL |
| parent_whatsapp | text | NOT NULL |
| parent_email | text | nullable |
| school | text | nullable |
| notes | text | nullable |
| status | text | 'accepted' o 'overflow' |
| batch | text | default 'Biberon_Mar_2026_Batch1' |

### Politicas RLS

- **INSERT**: Cualquiera puede insertar (formulario publico)
- **SELECT**: Solo admin y staff
- **UPDATE/DELETE**: Solo admin

---

## Cambios en el Formulario (ChallengeRegistrationModal.tsx)

### 1. Ampliar anos de nacimiento

Agregar 2020 y 2021 al selector de anos (actualmente solo muestra 2012-2019).

### 2. Nueva categoria automatica

Cuando se selecciona 2020 o 2021, la categoria se asigna automaticamente como "Biberon".

### 3. Flujo reducido para Biberon (3 pasos en vez de 4)

Cuando la categoria es Biberon, el formulario cambia a un flujo simplificado:

```text
+------------------+     +------------------+     +------------------+
| Paso 1           | --> | Paso 2           | --> | Paso 3           |
| Datos del Jugador|     | Datos del Tutor  |     | Confirmar Lista  |
| - Nombre         |     | - Nombre tutor   |     | de Espera        |
| - Escuela (opc)  |     | - Email          |     | - Resumen datos  |
| - Ano nacimiento |     | - WhatsApp       |     | - Status          |
| - Categoria auto |     | - Notas (opc)    |     |   (accepted/     |
|                  |     |                  |     |    overflow)     |
+------------------+     +------------------+     +------------------+
```

Se **omite** el paso 2 original (sede, horario, fecha de inicio) porque no hay clase que agendar.

### 4. Banner informativo en Step 1

Cuando se detecta Biberon, mostrar un bloque:

```
"Esta categoria esta por abrir. Registrate a la lista de espera.
Cupo inicial: 8. Inicio: Lunes 2 de Marzo."
```

### 5. Logica de capacidad en el submit

Antes de insertar, contar registros existentes:

```
SELECT count(*) FROM waitlist_registrations
WHERE category = 'biberon'
  AND batch = 'Biberon_Mar_2026_Batch1'
  AND status = 'accepted'
```

- Si count < 8: status = 'accepted'
- Si count >= 8: status = 'overflow'

Como el INSERT publico no puede hacer SELECT (por RLS), esta logica de conteo se implementara mediante una **funcion de base de datos** con `SECURITY DEFINER` que realiza el conteo y la insercion atomicamente.

### 6. Mensajes de confirmacion post-submit

**Si accepted:**
> "!Listo! Estas dentro del cupo inicial (8). Te contactaremos para confirmar tu primer dia (Inicio: Lun 2 Mar)."

**Si overflow:**
> "!Listo! Quedaste en lista de espera. Te contactaremos en cuanto se liberen cupos."

### 7. Titulos de pasos dinamicos

Los titulos del header cambian cuando es Biberon:
- Paso 1: "Cuéntanos sobre el jugador" / "Para ninos de 4-5 anos. Lista de espera."
- Paso 2: "Como te contactamos?" / "Usaremos estos datos para avisarte cuando abra la categoria"
- Paso 3: "Confirmar registro en lista de espera"

---

## Email de Confirmacion (Opcional pero recomendado)

Dado que ya existe infraestructura con Resend, se enviara un email de confirmacion con plantilla diferenciada:

- **Asunto:** "Lista de espera Biberon -- White Lions"
- **Contenido:** Varia segun status (accepted vs overflow)
- Se reutiliza la edge function `send-confirmation` agregando una condicion para detectar cuando es waitlist

---

## Archivos a Modificar/Crear

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| Migracion SQL | Crear | Tabla `waitlist_registrations`, RLS policies, funcion de insercion atomica |
| `src/components/ChallengeRegistrationModal.tsx` | Modificar | Agregar anos 2020-2021, categoria Biberon, flujo de 3 pasos, logica de submit separada, mensajes de confirmacion |
| `supabase/functions/send-confirmation/index.ts` | Modificar | Agregar template de email para waitlist Biberon |

---

## Lo que NO se modifica

- El flujo existente para categorias 6-13 anos (Escuelita, Estrellita, Infantil, Juvenil A) permanece identico
- La tabla `trial_class_registrations` no se toca
- El pipeline de reminders y reactivacion no se afecta
- Los endpoints del admin panel siguen funcionando igual

---

## Validaciones de seguridad

- La funcion de base de datos `SECURITY DEFINER` garantiza conteo atomico de cupos sin exponer datos de otros registros
- RLS en `waitlist_registrations` protege la lectura solo a admin/staff
- Validacion client-side de ano (2020/2021) + validacion server-side en la funcion de insercion

