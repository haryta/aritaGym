# Coach Gym 🏋️

Webapp personal que funciona como entrenador: eliges los días que vas al gimnasio,
das tu peso, edad, nivel y objetivo, y la app arma tu rutina semanal con el nombre
de cada ejercicio y máquina, series × repeticiones, y un video de YouTube en
español para ver cómo se hace.

Pensada para usarse desde el iPhone como PWA (sin App Store): todos los datos se
guardan en el dispositivo, sin cuentas ni backend.

## Funciones

- **Perfil**: edad, sexo, peso, estatura, nivel y objetivo. Calcula IMC, metabolismo
  basal (Mifflin-St Jeor), calorías de mantenimiento y objetivo, y proteína sugerida.
- **Días**: selector semanal (2 a 6 días). Muestra en vivo qué plan te toca.
- **Plan**: 2-3 días → Cuerpo completo · 4 → Torso/Pierna · 5 → Push/Pull/Legs + Torso/Pierna · 6 → Push/Pull/Legs ×2.
  Se ajusta por nivel (máquinas para principiantes), objetivo (rangos de reps y descansos),
  y edad/IMC (bajo impacto). Evita dos días de pierna seguidos.
- **Sesión de hoy**: video por ejercicio, pasos y errores comunes, registro de peso y
  reps por serie, cronómetro de descanso, cambiar ejercicio si la máquina está ocupada.
- **Ejercicios**: catálogo de 51 ejercicios con buscador y filtro por grupo muscular.
- **Historial**: sesiones guardadas, récords por ejercicio y gráfica de peso corporal.
- **Ajustes** (`/ajustes`): exportar/importar datos en JSON y borrar todo.

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests del motor de recomendación y cálculos
npm run build      # genera dist/ (incluye service worker y manifest PWA)
npm run preview
```

## Publicación (GitHub Pages)

Cada push a la rama principal ejecuta `.github/workflows/deploy.yml`, que corre los
tests, compila con `BASE_PATH=/<repo>/` y publica `dist/` en GitHub Pages:

**https://haryta.github.io/movies/**

Si el workflow no puede activar Pages solo, actívalo una vez en
Settings → Pages → Source: **GitHub Actions**. `dist/404.html` es una copia de
`index.html` para que las rutas de la SPA funcionen al recargar.

## Instalar en iPhone

1. Abre la URL en Safari.
2. Toca Compartir → **Añadir a pantalla de inicio**.
3. Se abre a pantalla completa como una app nativa y funciona sin conexión
   (los videos sí necesitan internet).

## Estructura

```
src/
  domain/      tipos, cálculos, recomendador (lógica pura, con tests)
  data/        catálogo de ejercicios, plantillas de sesión, IDs de videos
  store/       estado global (Zustand + persistencia en localStorage)
  features/    pantallas: Perfil, Días, Plan, Sesión, Ejercicios, Historial, Ajustes
  components/  VideoYoutube, Cronometro, UI base
```

Ver `PLAN.md` para el plan completo y las fases pendientes.
