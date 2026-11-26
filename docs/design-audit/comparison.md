# Comparación Visual y Funcional — Antes vs. Después

- **Capturas Antes:** `docs/design-audit/before/` (`01-tv-broadcast-before.png`, `02-pro-camera-before.png`, `03-popular-norte-before.png`)
- **Captura Después:** `docs/design-audit/after/01-gameplay-after.png`

| Aspecto | Antes (Sprint 0) | Después (Sprint 1–7) |
|---|---|---|
| Futbolistas | Cajas simples lisas sin pelo, medias ni botines | Personajes estilizados con camiseta a bastones, dorsal en espalda, pelo, medias, botines y blending de poses |
| Escudos | Monogramas de texto plano en el Lobby | Emblemas vectoriales SVG (`ClubBadges`) para GYE y todos los rivales |
| Hinchada | Bloque saltando sincronizado en CPU | Shader GPU por instancia (`CrowdSystem`) con fases individuales, Ola Celeste y escalado por calidad |
| Celebraciones | Texto en tablero LED + papelitos genéricos | `GoalCelebrationDirector` con 8 festejos contextuales, banner de gol, tótem del Lobo, aro orbital y botón Omitir |
| Game Feel | Sin estela ni vibración de palo | Estela celeste en remates rápidos, micro *camera shake*, remate rápido mejorado y modo Entrenamiento |
| Modos y Ajustes | Solo Lobby y Partido | Lobby + Entrenamiento + Explorar Estadio 3D + Ajustes (Calidad, Volúmenes, Reducir movimiento) |
