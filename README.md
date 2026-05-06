<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/GitHub_Pages-222222?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Pages">
</p>

<h1 align="center">Mini Arcade</h1>

<p align="center">
  <strong>Juegos clasicos directamente en tu navegador.</strong><br>
  Sin descargas, sin registros obligatorios, puro entretenimiento.
</p>

<p align="center">
  <a href="https://mozzvader.github.io/MM3/">🎮 Jugar ahora</a>
</p>

---

## Juegos

### Match 3 💎
Agrupa 3 o mas gemas iguales para sumar puntos. Arrastra las gemas para intercambiarlas y genera cascadas y combos.

| Feature | Detalle |
|---------|---------|
| Niveles | 10 niveles manuales + infinitos con dificultad progresiva |
| Mecanica | Drag & drop con snap |
| Objetivo | Alcanzar el puntaje meta en cada nivel (score acumulativo) |
| Bonus | Cascadas, combos, multiplicadores de puntos |
| Persistencia | Guarda partida y high score en localStorage |

### Memotest 🃏
Pone a prueba tu memoria encontrando los pares de cartas ocultas. Cartas con animacion 3D flip y sistema de estrellas.

| Feature | Detalle |
|---------|---------|
| Dificultades | Facil (4x3), Normal (4x4), Dificil (5x4), Experto (6x4) |
| Cartas | Ratio 2:3 estilo carta de naipes |
| Scoring | Puntos por eficiencia, velocidad y dificultad |
| Estrellas | 0-3 estrellas segun rendimiento |
| Packs | 2 oficiales + packs custom ilimitados |
| Custom cards | Iconos + color solido o imagenes por URL |
| Share packs | Exporta/Importa packs via codigo Base64 |
| Plantilla | Descarga template PNG para disenar cartas |

### Sudoku 🔢
El clasico puzzle numerico. Completa la grilla 9x9 sin repetir numeros en filas, columnas ni cajas 3x3.

| Feature | Detalle |
|---------|---------|
| Generador | Backtracking con solucion unica garantizada |
| Dificultades | Facil (36 huecos), Medio (46), Dificil (54) |
| Controles | Numpad en pantalla + teclado (flechas, 1-9, Delete) |
| Notas | Modo pencil para candidatos en celdas vacias |
| Pistas | Revela la celda correcta (cantidad segun dificultad) |
| Errores | Maximo 3 errores por partida |
| Scoring | Base por dificultad - penalizacion de tiempo, errores y pistas |
| Highlighting | Resalta fila/columna/caja y numeros relacionados |

---

## Estructura del Proyecto

```
MM3/
├── index.html              # Landing page con selector de juegos
├── css/
│   ├── global.css          # Estilos globales (glassmorphism, bg, botones)
│   ├── home.css            # Estilos de la landing + auth + stats modal
│   └── setup.sql           # Schema de Supabase (3 tablas + RLS)
├── js/
│   ├── supabase-client.js  # Inicializacion del cliente Supabase
│   ├── auth.js             # Sistema de autenticacion completo
│   └── home.js             # Logica de la landing + stats
├── match3/
│   ├── index.html          # Pagina del Match 3
│   ├── style.css           # Estilos especificos del Match 3
│   └── game.js             # Motor del juego Match 3
├── memotest/
│   ├── index.html          # Pagina del Memotest
│   ├── style.css           # Estilos especificos del Memotest
│   └── game.js             # Motor del Memotest + Pack Manager
└── sudoku/
    ├── index.html          # Pagina del Sudoku
    ├── style.css           # Estilos especificos del Sudoku
    └── game.js             # Generador + Motor del Sudoku
```

---

## Stack Tecnico

- **Frontend**: HTML5, CSS3, JavaScript vanilla (sin frameworks)
- **Hosting**: GitHub Pages (static site)
- **Auth**: Supabase Auth (Email/Password + Google OAuth)
- **DB**: Supabase (PostgreSQL) — scores globales por juego
- **Estilos**: Glassmorphism con `backdrop-filter`, CSS Grid, CSS custom properties
- **Iconos**: Font Awesome 6.5 (CDN)
- **Persistencia local**: localStorage para high scores y custom packs

---

## Base de Datos

La app incluye un schema SQL listo para ejecutar en Supabase:

```bash
# Ejecutar en SQL Editor de Supabase
cat css/setup.sql
```

**Tablas:**
- `profiles` — datos de usuario (auto-creado al registrarse)
- `game_scores` — puntajes globales por juego (match3, memotest, sudoku)
- `memotest_configs` — packs compartidos por la comunidad (preparado para futuro)

Todas con Row Level Security habilitado.

---

## Autor

**MozzVader** — [GitHub](https://github.com/MozzVader)

---

## Licencia

Este proyecto es de uso personal y educativo.
