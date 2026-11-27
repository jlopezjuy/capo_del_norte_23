# 14 — Verificación y Protocolo de Playtesting

## A. Verificación Automatizada Ejecutada (Real, No Simulada)
1. **Tests deterministas (`node scripts/test_fun_systems.mjs`):**
   - `MascotEventDirector`: bloquea entrada a cancha en `PLAYING`, habilita en `HALFTIME`, cancela inmediatamente al volver a `PLAYING` y respeta `frequency = 'off'`.
   - `ArcadeChallengeManager`: suma `300` pts en `top_corner` (`x1`), `400` pts en `bottom_corner` (`x2`), reinicia combo a `x1` en `onMiss()`, otorga `400` pts en `crossbar` y desbloquea `sniper_600` y `crossbar_king`.
   - `GoalCelebrationDirector`: verifica `noFlash` (`flashAlpha === 0`) y `reduceMotion` (`timeScale === 1`, `shakeOffset.x === 0`).
2. **Build y Cumplimiento Legal:**
   - `npm run build` → `dist/` compilado en `109ms` (`0` errores).
   - `npm run validate` → `COMPLIANCE PASS: 20 public files verified clean for Escenario A (independent)`.
3. **Playwright E2E (`1366x768` y `390x844` sobre `vite preview`):**
   - `pageErrors`: `[]` (`0` excepciones JS en runtime; solo 1 `404` esperado de `/_vercel/insights/script.js` en preview local fuera de Vercel).
   - Verificado: `#sel-difficulty` en `easy`, modal `#modal-medals`, `#btn-challenge-mode` (`PUNTOS 300`, `COMBO x2`, toggle a `crossbar`), píldora `#lobito-event-pill`, festejo con `#btn-skip-celebration`, y `mobileOverflow: false` en `390x844`.
   - Capturas reales guardadas en `docs/fun-audit/after/` (`01` a `06`).

## B. Protocolo Propuesto para Playtesting Humano (Pendiente con Usuarios Reales)
*Nota: No se inventan resultados de pruebas con usuarios.* Para validar con chicos y adultos:
1. **Primera sesión de 5 minutos (sin explicación previa):** observar si encuentran `Desafío del Lobito` y `Modo Sencillo` sin ayuda.
2. **Diversión y sorpresa:** registrar reacciones espontáneas ante `Lobito Murguero`, `Carnavalito` y `Tropiezo Legendario`.
3. **Frustración:** medir cuántos remates hacen falta para el primer gol en `Modo Sencillo` vs `Avanzado`.
