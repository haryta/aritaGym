# Plan: Webapp "Coach de Gimnasio"

Una webapp que actúa como entrenador personal: tú le dices qué días vas al gym,
tu peso, edad y objetivo, y ella te arma la rutina, te muestra cada ejercicio con
su nombre (y el de la máquina) y un video de YouTube de cómo se hace.

---

## 1. Qué debe hacer (funcionalidades)

### 1.1 Perfil del usuario
- Datos: nombre, edad, sexo, peso (kg), estatura (cm), nivel (principiante / intermedio / avanzado).
- Objetivo: perder grasa, ganar músculo, mantener/tonificar, fuerza.
- Cálculos automáticos que se muestran en el perfil:
  - IMC (peso / estatura²).
  - Gasto calórico basal (Mifflin-St Jeor) y calorías de mantenimiento según actividad.
  - Recomendación simple de calorías según el objetivo (déficit / superávit moderado).
- Todo esto alimenta la elección del plan (ver 1.3).

### 1.2 Selector de días
- Calendario semanal con los 7 días; el usuario marca los que va a ir.
- Validación: mínimo 2 días, máximo 6.
- Se muestra en vivo cuál plan le corresponde según el número de días marcados.

### 1.3 Motor de recomendación de plan (el "coach")
Reglas de la primera versión (sin IA, reglas claras y explicables):

| Días por semana | Plan sugerido            | Descripción                                   |
|-----------------|--------------------------|-----------------------------------------------|
| 2               | Full Body A/B            | Todo el cuerpo cada sesión, básicos.          |
| 3               | Full Body A/B/C          | Todo el cuerpo, se rota énfasis.              |
| 4               | Upper / Lower            | Torso – Pierna – Torso – Pierna.              |
| 5               | Push / Pull / Legs + U/L | Empuje, jalón, pierna + torso + pierna.       |
| 6               | Push / Pull / Legs ×2    | PPL dos veces por semana.                     |

Ajustes por perfil:
- **Nivel principiante**: menos ejercicios por sesión (4-5), más máquinas, rangos de 10-15 reps.
- **Objetivo fuerza**: rangos 4-6 reps, más descanso (2-3 min).
- **Objetivo perder grasa**: se agrega bloque final de cardio (10-20 min) y circuitos.
- **Objetivo ganar músculo**: rangos 8-12 reps, 3-4 series, descanso 60-90 s.
- **Edad > 50 o IMC > 30**: se priorizan máquinas y ejercicios de bajo impacto; se marca con aviso para consultar a un médico.

El motor asigna cada día marcado a una sesión del plan en orden (ej. Lun = Push,
Mié = Pull, Vie = Legs) y evita poner dos sesiones de pierna en días consecutivos cuando es posible.

### 1.4 Catálogo de ejercicios
Cada ejercicio tiene:
- Nombre en español (y en inglés, porque así aparecen en YouTube y en las máquinas).
- Máquina o equipo (ej. "Prensa de pierna (Leg Press)", "Polea alta (Lat Pulldown)", "Mancuernas").
- Grupo muscular principal y secundarios.
- Patrón de movimiento (empuje, jalón, sentadilla, bisagra, core).
- Nivel mínimo recomendado.
- `youtubeId`: ID de un video de YouTube que muestra la técnica.
- Instrucciones breves en 3-5 pasos y errores comunes.

Meta inicial: ~60 ejercicios que cubran todos los grupos musculares con opciones de máquina, barra, mancuerna y peso corporal.

### 1.5 Vista de la rutina del día
- Lista de ejercicios con: nombre, máquina, series × repeticiones, descanso.
- Al tocar un ejercicio se abre una tarjeta con el video de YouTube embebido (`youtube-nocookie.com/embed/ID`) y las instrucciones.
- Botón "ver más videos" que abre la búsqueda en YouTube por el nombre del ejercicio (sirve de respaldo si el video curado ya no existe).
- Botón "cambiar ejercicio" que ofrece alternativas del mismo patrón de movimiento (ej. si la máquina está ocupada).

### 1.6 Registro de entrenamientos (progreso)
- Checkbox por serie y campo de peso usado.
- Al terminar: se guarda la sesión con fecha.
- Historial simple: últimas sesiones y peso máximo por ejercicio.
- Gráfica de peso corporal a lo largo del tiempo (el usuario actualiza su peso en el perfil).

### 1.7 Fuera de alcance para la v1 (se pueden agregar después)
- Cuentas con login y sincronización en la nube.
- Plan de alimentación detallado.
- Generación de rutinas con IA (LLM) en lugar de reglas.
- App nativa / notificaciones push.

---

## 2. Stack técnico propuesto

| Capa            | Elección                          | Por qué                                                   |
|-----------------|-----------------------------------|-----------------------------------------------------------|
| Framework       | React 18 + TypeScript + Vite      | Rápido de levantar, tipado ayuda con el catálogo.         |
| Estilos         | Tailwind CSS                      | UI rápida y responsive (se usará mucho desde el celular). |
| Rutas           | React Router                      | Pantallas: Perfil, Días, Plan, Sesión, Historial.         |
| Estado          | Zustand                           | Simple, sin boilerplate.                                  |
| Persistencia    | localStorage (v1) → Supabase (v2) | Sin backend en v1; todo vive en el navegador.             |
| Videos          | iframe de YouTube (nocookie)      | No requiere API key; los IDs van curados en el catálogo.  |
| PWA             | vite-plugin-pwa                   | Instalable en el celular y funciona offline.              |
| Tests           | Vitest + Testing Library          | Para el motor de reglas y los cálculos.                   |
| Deploy          | Vercel o GitHub Pages             | Gratis, deploy automático desde la rama principal.        |

Decisión clave: **v1 sin backend**. Todo (perfil, días, historial) se guarda en el
navegador. Esto permite tener algo usable rápido; la nube se agrega después sin
rehacer la UI porque el estado queda aislado en un store.

---

## 3. Modelo de datos

```ts
type Nivel = 'principiante' | 'intermedio' | 'avanzado';
type Objetivo = 'perder_grasa' | 'ganar_musculo' | 'mantener' | 'fuerza';
type Dia = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';

interface Perfil {
  nombre: string;
  edad: number;
  sexo: 'M' | 'F' | 'otro';
  pesoKg: number;
  estaturaCm: number;
  nivel: Nivel;
  objetivo: Objetivo;
  diasSeleccionados: Dia[];
}

interface Ejercicio {
  id: string;                 // 'leg-press'
  nombre: string;             // 'Prensa de pierna'
  nombreEn: string;           // 'Leg Press'
  maquina: string;            // 'Prensa 45°'
  grupoPrincipal: string;     // 'cuádriceps'
  gruposSecundarios: string[];
  patron: 'empuje_h' | 'empuje_v' | 'jalon_h' | 'jalon_v' | 'sentadilla' | 'bisagra' | 'core' | 'cardio';
  nivelMinimo: Nivel;
  youtubeId: string;
  pasos: string[];
  erroresComunes: string[];
}

interface EjercicioPlanificado {
  ejercicioId: string;
  series: number;
  repsMin: number;
  repsMax: number;
  descansoSeg: number;
}

interface Sesion {          // un "día" del plan, ej. "Push"
  id: string;
  nombre: string;
  ejercicios: EjercicioPlanificado[];
}

interface PlanSemanal {
  tipo: 'full_body' | 'upper_lower' | 'ppl' | 'ppl_ul';
  asignacion: Record<Dia, Sesion | null>;
}

interface RegistroSesion {
  fecha: string;             // ISO
  sesionId: string;
  series: { ejercicioId: string; serie: number; pesoKg: number; reps: number; hecha: boolean }[];
}
```

---

## 4. Pantallas

1. **Onboarding / Perfil** – formulario en pasos: datos → objetivo → nivel. Muestra IMC y calorías al final.
2. **Mis días** – 7 botones (Lun…Dom). Abajo: "Con 4 días te recomendamos Torso/Pierna".
3. **Mi plan** – vista semanal: cada día con su sesión y los ejercicios resumidos. Botón "Regenerar".
4. **Sesión de hoy** – lista de ejercicios, tarjetas con video, checks por serie, cronómetro de descanso.
5. **Ejercicio (detalle)** – video grande, máquina, pasos, errores comunes, alternativas.
6. **Historial** – sesiones pasadas, récords por ejercicio, gráfica de peso.

Navegación inferior tipo app móvil: Plan · Hoy · Ejercicios · Historial · Perfil.

---

## 5. Estructura del proyecto

```
src/
  app/            router, layout, navegación
  data/
    ejercicios.ts     catálogo (~60 ejercicios con youtubeId)
    plantillas.ts     plantillas de sesión por tipo de plan y nivel
  domain/
    calculos.ts       IMC, TMB, calorías
    recomendador.ts   días + perfil → PlanSemanal
    alternativas.ts   ejercicios sustitutos por patrón
  store/
    perfil.ts, plan.ts, historial.ts   (Zustand + persist)
  features/
    perfil/  dias/  plan/  sesion/  ejercicio/  historial/
  components/
    VideoYoutube.tsx, TarjetaEjercicio.tsx, Cronometro.tsx, ...
tests/
  recomendador.test.ts, calculos.test.ts
```

---

## 6. Fases de implementación

### Fase 0 – Base (1 día)
- Crear proyecto Vite + React + TS, Tailwind, Router, Zustand, Vitest.
- Layout con navegación inferior y páginas vacías.
- Deploy inicial (Vercel) para tener URL desde el principio.

### Fase 1 – Perfil y cálculos (1-2 días)
- Formulario de perfil con validación.
- `calculos.ts` con IMC, TMB y calorías + tests.
- Persistencia en localStorage.

### Fase 2 – Catálogo de ejercicios (2-3 días)
- Definir el tipo `Ejercicio` y cargar ~60 ejercicios.
- Buscar y curar un `youtubeId` por ejercicio (videos cortos de técnica, de preferencia en español).
- Componente `VideoYoutube` con carga diferida (solo carga el iframe al abrir la tarjeta).
- Pantalla "Ejercicios" con buscador y filtros por grupo muscular / máquina.

### Fase 3 – Selector de días + recomendador (2 días)
- UI de días.
- `recomendador.ts`: tabla días → tipo de plan, ajustes por nivel/objetivo/edad/IMC, asignación de sesiones a días.
- Tests con casos: 2, 3, 4, 5, 6 días; principiante vs avanzado; objetivo fuerza vs grasa.
- Pantalla "Mi plan".

### Fase 4 – Sesión de hoy y registro (2-3 días)
- Vista de sesión con checks por serie, peso, cronómetro de descanso.
- Guardar `RegistroSesion` al terminar.
- Botón "cambiar ejercicio" con alternativas.

### Fase 5 – Historial y pulido (1-2 días)
- Historial, récords, gráfica de peso corporal.
- PWA instalable, modo offline.
- Revisión de accesibilidad y uso desde celular.

### Fase 6 – (Opcional, v2)
- Supabase: login y sincronización.
- Integración con YouTube Data API para buscar videos automáticamente.
- Generación de rutinas con un LLM a partir del perfil.

Tiempo estimado total de la v1: **2 a 3 semanas** de trabajo parcial.

---

## 7. Riesgos y decisiones abiertas

- **Videos que dejan de existir**: por eso cada ejercicio tiene también un enlace de búsqueda en YouTube como respaldo.
- **Consejos de salud**: la app da recomendaciones generales, no médicas. Se incluirá un aviso claro, sobre todo cuando la edad o el IMC salgan de rangos normales.
- **Idioma**: la UI en español; nombres de ejercicios en español e inglés para que coincidan con las máquinas del gym y con YouTube.
- **Pendiente de confirmar contigo**:
  1. ¿Solo para ti o para varios usuarios (esto decide cuándo entra el backend)?
  2. ¿Prefieres React o algo más ligero como Svelte/Vue?
  3. ¿Videos en español, inglés, o ambos?
