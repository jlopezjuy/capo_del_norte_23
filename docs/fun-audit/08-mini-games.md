# 08 — Minijuego: Desafío del Lobito (`js/arcade_challenge.js`)

## Diseño y Reglas (`ArcadeChallengeManager`)
Modo arcade independiente de **60 segundos** accesible directamente desde el lobby (`#btn-challenge-mode`) sin necesidad de completar un partido entero:
- **Modo `targets` (Blancos):** 3 blancos luminosos móviles/posicionados en el arco norte (`top_corner` 300 pts, `bottom_corner` 200 pts, `center_bonus` 250 pts).
- **Modo `crossbar` (Travesaño):** pegarle al travesaño del arco norte (`y ≈ 2.44`, 400 pts base).
- **Sistema de Combo:** cada acierto consecutivo incrementa el multiplicador (`x1` hasta `x5`); un remate errado (`onMiss()`) reinicia el combo a `x1`.
- **Lobito Arquero:** durante el desafío, Lobito se ubica junto al arco norte en pose `arquero` alentando y reaccionando a los aciertos (`playChallengeHit`).

## Progresión Sana y Medallas (`MEDALS`)
Sin loot boxes, sin rachas diarias, sin timers FOMO ni compras integradas. Todas las medallas se guardan localmente en `localStorage`:
1. `first_goal` — *Primer Grito* (anotar tu primer gol)
2. `sniper_600` — *Francotirador del Norte* (superar 600 puntos en Desafío del Lobito)
3. `crossbar_king` — *Rey del Travesaño* (acertar el travesaño en Desafío del Lobito)
4. `lobito_friend` — *Amigo del Lobito* (presenciar 3 eventos de Lobito)
5. `clean_sheet` — *Valla Invicta* (ganar un partido sin recibir goles)

## Verificación
- Tests unitarios deterministas en `scripts/test_fun_systems.mjs` (scoring, combo `x1 -> x2`, reset por fallo, `crossbar`, desbloqueo de medallas).
- Verificación en navegador Playwright (`docs/fun-audit/after/04-challenge-targets-after.png`, `05-medals-modal-after.png`, `06-mobile-challenge-after.png`).
