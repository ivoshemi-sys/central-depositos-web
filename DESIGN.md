# DESIGN.md — Central de Depósitos

Dirección **Carbon / Institucional** (base IBM Design Language, adaptada). Objetivo: moderno, confiable, institucional, limpio. El verde de marca deja de ser el color dominante y pasa a ser **señalador de dato** (<5% de superficie).

## 1. Tema visual y atmósfera
Infraestructura seria renderizada como página web. Papel cálido y grafito, rejilla estricta de 8px, hairlines en vez de sombras, rectángulos sin redondear. La tipografía IBM Plex (Sans light en display, Mono en datos) da autoridad sin gritar. Todo lo que es medida o número se setea como dato en mono — coherente con un negocio donde todo es m³, niveles y precios. Frase-guía: *"un depósito serio, no un panfleto"*.

## 2. Paleta y roles
```css
--ink:      #161616;  /* grafito — texto, nav, footer, secciones oscuras */
--ink-rgb:  22,22,22;
--steel:    #393939;  /* acero — superficies oscuras secundarias, bordes en dark */
--gray-70:  #525252;  /* texto secundario sobre papel */
--gray-50:  #8d8d8d;  /* texto terciario, labels */
--line:     #d8d5cc;  /* hairline sobre papel (cálido, no gris de sistema) */
--paper:    #f4f2ec;  /* fondo de página (papel cálido) */
--paper-2:  #eae7dd;  /* superficie alterna / cards */
--white:    #ffffff;
--accent:   #c2d919;  /* verde marca — SOLO dato/nav activo/números clave */
--accent-rgb: 194,217,25;
--accent-ink:#5c6a08; /* verde oscuro para texto sobre papel (contraste AA) */
/* estado */
--ok:#3f8f4f; --warn:#b8860b; --err:#b3261e;
```
Neutros cálidos a propósito (papel con leve tinte, no gris azulado). Contraste verificado AA: `--ink` sobre `--paper` y `--gray-70` sobre `--paper`; el verde puro nunca se usa como texto sobre papel (para texto verde va `--accent-ink`).

## 3. Tipografía
```
@import IBM Plex Sans (300,400,600,700) + IBM Plex Mono (400,500)
```
| Rol | Familia | Tamaño | Peso | Notas |
|---|---|---|---|---|
| Display / Hero | IBM Plex Sans | clamp(2.4rem,5vw,4rem) | 300 | ligero a tamaño grande = gravedad corporativa |
| H2 sección | IBM Plex Sans | clamp(1.6rem,3vw,2.3rem) | 400 | |
| H3 / card | IBM Plex Sans | 1.2rem | 600 | |
| Body | IBM Plex Sans | 1rem | 400 | line-height 1.55 |
| Label / eyebrow | IBM Plex Mono | .74rem | 500 | uppercase, letter-spacing .12em |
| Dato / precio / medida | IBM Plex Mono | var | 500 | tabular-nums |
Prohibido: peso 700 en display, letter-spacing en títulos grandes, Poppins/Inter (los del sitio viejo).

## 4. Componentes (estados)
- **Botón primario:** fondo `--ink`, texto blanco, **radio 0**, padding .9em 1.6em, peso 600. Hover: fondo #000. Focus: outline 2px `--accent`. Active: translateY(1px).
- **Botón secundario:** transparente, borde 1px `--ink`, texto `--ink`. Hover: fondo `--ink`/texto blanco.
- **Botón acento (solo CTA de reserva):** fondo `--accent`, texto `--ink`, radio 0. Hover: brillo -6%.
- **Card/tile:** fondo `--white` o `--paper-2`, **sin sombra**, hairline 1px `--line`, radio 0. Hover (si es link): fondo shift a `--paper-2` + flecha.
- **Input:** fondo `--paper-2`, **solo borde inferior** 1px `--line` (patrón Carbon), radio 0. Focus: borde inferior 2px `--accent`. Label mono 12px uppercase.
- **Nav link:** mono-ish sans 600 .9rem, `--gray-70`. Activo: `--ink` + subrayado 2px `--accent` (único uso cromático en nav).
- **Tag/chip:** fondo `--paper-2`, borde 1px `--line`, radio 0, mono .78rem.
- **Dato destacado (stat):** número en Mono grande, color `--accent`; label debajo en `--gray-50`.

## 5. Layout
Grilla base 8px. Contenedor máx 1120px. Secciones separadas por **cambio de fondo** (papel → papel-2 → grafito) y hairlines, no por sombras. Alineación a la izquierda, whitespace generoso, reglas finas que hacen eco de la grilla de bauleras. Spacing: 8/16/24/32/48/64/96.

## 6. Profundidad
Plano. Jerarquía por color de fondo (papel → papel-2 → grafito), no por sombra. Sombra reservada SOLO a elementos flotantes reales (dropdown del estimador, sticky de precio). Foco: outline 2px `--accent`.

## 7. Motion — L1 (preciso, institucional)
Hover suave (.15s ease) en botones/cards/nav. Reveal de entrada sutil (fade+translateY 8px) por sección vía IntersectionObserver. Contador de precio anima al cambiar de opción. **Nada de parallax, cursores custom ni 3D** — institucional ≠ animado. `prefers-reduced-motion`: desactiva reveals y transiciones.

## 8. Do's & Don'ts
**Do:** radio 0 en botones/inputs/cards; IBM Plex Sans 300 en display; Mono para todo número/medida/precio; profundidad por capas de fondo; verde solo en dato/nav-activo/CTA-reserva; hairlines cálidos; íconos SVG de línea (stroke 1.5).
**Don't:** ❌ emoji como ícono; ❌ sombras blandas en cards; ❌ verde como color de fondo o de grandes áreas; ❌ Poppins/Inter; ❌ foto de stock (solo fotos reales del depósito); ❌ bordes redondeados; ❌ segundo color de acento; ❌ peso 700 en títulos; ❌ gradientes.

## 9. Responsive
Breakpoints: 600 / 920 / 1080. Nav → hamburguesa <920. Touch targets ≥44px. Grids 4→2→1. Sin overflow horizontal <600. Diagramas e imágenes `max-width:100%`. El flujo de reserva y el estimador: un paso por pantalla en mobile, botones grandes.
