# Comparación Visual y Funcional — Antes (`before/`) vs Después (`after/v2-*`)

**Fecha de verificación:** 2026-11-26  
**Capturas Antes:** `docs/design-audit/before/12-baseline-lobby-1920x1080.png`, `13-baseline-gameplay-1366x768.png`, `14-baseline-pro-camera-1366x768.png` (y `01`–`11` históricos).  
**Capturas Después (v2):** `docs/design-audit/after/v2-01-lobby-1920x1080.png` a `v2-11-mobile-celebration-390x844.png`.

---

## 1. Comparativa Directa por Dimensión

| Área | Antes (`before/`) | Después (`after/v2-*`) | Evidencia Real / Impacto |
|---|---|---|---|
| **Iluminación, Tribunas y Césped** | `before/14-baseline-pro-camera-1366x768.png`: gradas y pared de platea totalmente quemadas (`#FFFFFF`), césped verde neón plano, humo en cuadrados duros. | `after/v2-03-gameplay-sunset-1366x768.png`, `v2-04-gameplay-night-1366x768.png`, `v2-05-gameplay-day-away-goal-1366x768.png`: cero whiteout gracias a `ACESFilmicToneMapping`, escalones arquitectónicos nítidos, césped esmeralda natural con desgaste en áreas, haces volumétricos LED en noche y humo radial suave. | **Salto visual radical** en los 3 horarios (`day`, `sunset`, `night`). |
| **Futbolistas 3D y Expresividad** | `before/14`: cajas rígidas `BoxGeometry` con cabeza lisa, dorsal borroso y sin guantes ni gestos reales. | `after/v2-06-pro-players-dugout-1366x768.png`, `v2-07-celebration-sorpresa-1366x768.png`, `v2-11-mobile-celebration-390x844.png`: torso atlético `LatheGeometry`, juntas esféricas, dorsal nítido, brazalete de capitán, botines esculpidos, guantes de arquero, **sonrisa `joy` en goles, cara `shock` y manos a la cabeza en frustración** y 6 peinados. | Personajes inmediatamente carismáticos y reconocibles en primer plano. |
| **Hinchada Viva y Mascota 3D** | Siluetas T sin brazos ni bufandas sobre blanco quemado; calidad baja recortaba al visitante. | `after/v2-07`, `v2-08`, `v2-05`: 4.200 hinchas GPU con **brazos y bufandas a bastones levantadas**, reacción separada local vs visitante (`v2-05`: solo el sector amarillo festeja), **Mascota del Lobo 3D esculpida** saltando detrás del arco y preservación proporcional del visitante en `low` (`312` de `892`). | El estadio transmite vida, color y pasión futbolera real. |
| **16 Celebraciones de Gol** | `after/16` (previo): banner con texto pero jugador quieto solo y 3 conos flotando; `replay`/`flash`/`corner`/`banco` inactivos. | `after/v2-07-celebration-sorpresa-1366x768.png`, `v2-08-celebration-mascot-1366x768.png`, `v2-11-mobile-celebration-390x844.png`: **pelota holográfica orbitando con anillos, holograma 3D cristalino del Lobo, fuentes de chispas, cañón de 180 papelitos, spotlight, deslizamiento de rodillas (`knee_slide`), arquero rival de rodillas agarrándose la cabeza**, compañeros corriendo, banco saltando y replay real con ring buffer de 2.5s. | Cada gol es un evento emocionante, variado y siempre omitible. |
| **Red de Arco, LED y Banda** | Wireframe cerrado tapando la boca del arco, LED congelado, 8 banderines duplicados, bancos vacíos. | Red abierta de 5 caras con deformación elástica (`v2-07`, `v2-08`), LED desplazándose, 4 banderines únicos, **12 suplentes + DT visibles en bancos (`v2-06`)**, 2 jueces de línea y 4 fotógrafos. | Mayor credibilidad deportiva en cada jugada cerca del arco. |
| **UI, Lobby y Móvil** | Lobby mostraba WASD estando en PES; sin Ajustes en Pausa; sin persistencia; sin botón `REGATE` táctil; botones `1–4` visibles en gol visitante. | `after/v2-01`, `v2-02`, `v2-09`, `v2-10`, `v2-11`: Lobby sincronizado PES↔WASD, Ajustes accesibles desde Pausa (`v2-09`), persistencia `localStorage` + `prefers-reduced-motion`, `REGATE` móvil (`v2-10`) y ocultamiento limpio de teclas `1–4` en gol visitante (`v2-05`). | Menor fricción inicial y UX consistente en escritorio y móvil. |
| **Rendimiento (Draw Calls)** | `989` DC (Lobby) / **`1.319` DC (Gameplay)** a `75 FPS`. | **`186` DC (Lobby) / `108–199` DC (Gameplay/Celebración) / `169` DC (Móvil)** a `75–76 FPS` (**-85% draw calls**). | Margen holgado de rendimiento incluso con 4.200 hinchas y VFX completos. |

---

## 2. Problemas Detectados y Corregidos Durante QA v2

1. **Teclas interactivas `1–4` visibles en gol visitante (detectado visualmente en captura intermedia):** En Tailwind CSS, `sm:flex` sobrescribía `.hidden` en `#goal-interactive-keys`. Corregido en `js/goal_celebration_director.js` con `style.display = ctx.isHomeGoal ? '' : 'none'` y verificado visualmente en `after/v2-05-gameplay-day-away-goal-1366x768.png`.
2. **Fugas menores de texto pre-Escenario A:** Limpiados `"¡GANÓ GIMNASIA POR PENALES!"`, `"Volver al Lobby AFA"`, `"EL GRITO DEL LOBO"`, `"MAD"` y `"Copa América 2011"`. `node scripts/validate_compliance.mjs` devuelve `COMPLIANCE PASS` en los 17 archivos públicos.

---

## 3. Verificaciones Automatizadas Ejecutadas (Playwright Chromium — 2026-11-26)

- **Errores de consola JS / WebGL:** `0` errores (`1` aviso esperado de `cdn.tailwindcss.com`).
- **Sintaxis de 14 módulos JS (`node --check`):** `14/14 PASS`.
- **Invariante de marcador único:** Doble llamada a `_handleGoal('home')` durante `GOAL_CELEBRATION` mantiene `scoreHome === 1`.
- **Teclas interactivas `1–4` y `Omitir`:** Cambian entre `grito_gol`, `baile_colectivo`, `director_orquesta` y `celebracion_sorpresa` sin alterar marcador; `skipGoalCelebration()` pone timer en `0` y oculta todos los VFX 3D.
- **Accesibilidad:** `Reducir movimiento` + `Sin flashes` verificados con `shakeOffset = (0,0)`, `flashAlpha = 0`, `timeScale = 1`.
- **Calidad adaptativa:** `low` (`1.050` bowl, `312` visitantes), `medium` (`2.100`), `high` (`3.000`, `892` visitantes).
- **Sectores de tribuna:** `8/8` claves de `tribunaKeys` válidas en `STADIUM_SECTORS`.
- **Limitación honesta pendiente:** No se ejecutaron pruebas en navegadores Firefox, Edge ni Safari en esta máquina automatizada, ni sesiones de playtesting con personas externas (protocolo documentado en `docs/gameplay/game-feel.md`).
