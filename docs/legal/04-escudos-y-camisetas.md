# 04 — Auditoría de Escudos y Camisetas

## 1. Situación Actual en el Código
- **Escudos (`js/club_badges.js`, `favicon.svg`):**
  - `js/club_badges.js:9-16`: Genera SVGs procedurales con las siglas `GYE`, `MAD`, `SMT`, `TEM`, `QUI`, `FER` y sus colores característicos.
  - `js/club_badges.js:69-81`: `getLoboEmblemSvg()` dibuja una silueta geométrica original de lobo celeste, etiquetada `aria-label="El Lobo Jujeño"`.
  - `favicon.svg:9-11`: Escudo celeste y blanco con las siglas `GYE`.
  - **Nota jurídica:** Vectorizar, simplificar o generar por código un emblema que reproduce los colores, disposición y siglas identificatorias de un club real (`GYE`, `MAD`, `SMT`, etc.) **no elimina** el riesgo marcario si genera asociación o confusión con los clubes reales (Ley 22.362).
- **Camisetas (`js/player_renderer.js:88-149`):**
  - Texturas `Canvas2D` procedurales a bastones o banda diagonal, con un escudito genérico sin marcas.
  - **Aspecto positivo:** No existen logos de fabricantes (Nike, Adidas, Kappa, etc.) ni patrocinadores comerciales en ninguna camiseta.
  - **Riesgo residual:** Al combinarse con los nombres reales de los 6 clubes y los 66 futbolistas reales, el uniforme funciona como representación identificable de la indumentaria del club.

---

## 2. Decisión Recomendada por Escenario

| Elemento | Escenario A (Independiente — Publicación Inmediata) | Escenario C (Licenciado) |
|---|---|---|
| **Escudos SVG (`club_badges.js`)** | Sustituir por clubes ficticios del Norte Argentino (ej. `NOR`, `QUE`, `PUN`, `YUN`, `VAL`, `SAL`) con emblemas y nombres 100% propios. | Mantener o actualizar con escudos oficiales provistos bajo contrato por el club/AFA. |
| **`favicon.svg`** | Reemplazar las siglas `GYE` por el ícono del nombre propio verificado del juego. | Usar emblema autorizado. |
| **Camisetas (`player_renderer.js`)** | Mantener texturas procedurales limpias (sin patrocinadores ni fabricantes), asignadas a los equipos ficticios con paletas propias de alto contraste. | Utilizar diseños oficiales autorizados. |
