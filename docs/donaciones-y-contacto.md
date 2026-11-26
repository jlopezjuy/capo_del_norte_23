# Donaciones Voluntarias, Servicios Profesionales y Créditos — El Lobo Jujeño

## 1. Dónde se integró cada sección

| Sección | Ubicación en la UI | Comportamiento |
|---|---|---|
| **Acceso secundario en Menú Principal** | Barra inferior discreta de `#lobby-overlay` (`index.html`) | Botones `❤️ Apoyar el proyecto`, `💼 ¿Necesitás software?` y `Créditos y desarrollo`, sin competir con `Jugar Partido de la Semana`. |
| **Invitación post-partido (Prioritaria)** | Parte inferior de `#modal-stats` (`#stats-support-card`), activada en `GameEngine._showOverlayModal` | Solo se muestra en `fulltime` (nunca en entretiempo ni durante el partido), en el 1er partido y luego cada 2 partidos completados. Incluye `❤️ Apoyar el juego`, `Seguir jugando` y `Ocultar sugerencias futuras` (persistido en `localStorage`). |
| **Modal de Apoyo y Servicios** | `#modal-support` (`index.html`) | Reúne la tarjeta **¿Te gustó El Lobo Jujeño? 🐺** (Mercado Pago) y la sección profesional **¿Tenés una idea para una aplicación o sistema?** (WhatsApp con mensaje codificado + Correo). |
| **Créditos y desarrollo** | `#modal-credits` (`index.html`) | Accesible permanentemente desde el menú principal. Muestra autoría, contacto profesional, enlace de apoyo, librerías de terceros (Three.js r128 MIT, Tailwind CSS, Google Fonts) y aviso de proyecto independiente. |

---

## 2. Decisiones de Diseño UX/UI
- **Cero interrupciones al gameplay:** Siguiendo el consenso de comunidades indie (`r/gamedev`, `r/IndieDev`), las invitaciones nunca aparecen durante el partido ni bloquean el botón de `Revancha` / `Volver al Lobby`.
- **Enlaces seguros y transparentes:** Todos los enlaces externos usan `target="_blank" rel="noopener noreferrer"`; WhatsApp codifica el mensaje con `encodeURIComponent`; no se usan rastreadores, cookies de seguimiento ni pasarelas de pago complejas.
- **Accesibilidad y responsive:** Soporte completo de teclado (`focus-visible`, cierre con `Escape`), contraste alto sobre grafito (`#0d1626`) y grilla adaptable a `390×844` en móvil.

---

## 3. Cómo modificar datos de contacto o enlace de Mercado Pago
Todo está centralizado en un único archivo: **`js/creator_config.js`**.
Para actualizar cualquier dato, editá el objeto `creatorInfo` y `whatsappMessage`:
```js
const creatorInfo = Object.freeze({
  name: 'Juan Manuel Lopez',
  email: 'contacto@vendora.ar',
  phoneDisplay: '3884537959',
  whatsappNumber: '543884537959',
  donationUrl: 'https://mpago.la/1KpZh99'
});
```
`CreatorConfig.bindCreatorLinks(document)` actualiza automáticamente todos los enlaces (`[data-creator-link]`) y textos (`[data-creator-text]`) de la interfaz.

---

## 4. Pruebas Realizadas (Playwright + `node --check`)
- **Sintaxis:** `node --check js/creator_config.js` y `node --check js/game_engine.js` aprobados sin errores.
- **Validación de enlaces en navegador (`1366×768` y `390×844`):**
  - 3 enlaces de donación verificados con `href="https://mpago.la/1KpZh99"`, `target="_blank"` y `rel="noopener noreferrer"`.
  - 2 enlaces de WhatsApp verificados con `https://wa.me/543884537959?text=...` (`encodeURIComponent` exacto), `target="_blank"` y `rel="noopener noreferrer"`.
  - 2 enlaces de correo verificados con `mailto:contacto@vendora.ar`.
- **Flujo de partido y persistencia:**
  - Confirmado que `halftime` oculta `#stats-support-card` y `fulltime` lo muestra sin bloquear controles.
  - Confirmado que `Ocultar sugerencias futuras` guarda la preferencia en `localStorage` (`lobo_jujeno_support_pref_v1`) y mantiene oculta la tarjeta en partidos siguientes.
  - **0 errores de consola** durante toda la prueba.
- **Capturas:** Guardadas en `docs/design-audit/before/` (`10`–`11`) y `docs/design-audit/after/` (`06`–`10`).
