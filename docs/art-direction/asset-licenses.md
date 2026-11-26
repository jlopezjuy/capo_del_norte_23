# Licencias de Assets, Recursos y Salvaguardas Legales

## 1. Inventario de Recursos Activos en Producción

| Recurso | Origen / Generación | Licencia / Estado | Ubicación |
|---|---|---|---|
| **Three.js r128** (`three.min.js`) | CDN Cloudflare (`cdnjs`) | MIT License | `index.html` |
| **Tailwind CSS 3.4.17** | CDN (`cdn.tailwindcss.com`) | MIT License | `index.html` |
| **Google Fonts** (`Barlow Condensed`, `Plus Jakarta Sans`, `JetBrains Mono`) | Google Fonts | SIL Open Font License 1.1 | `index.html` |
| **Geometrías 3D (Estadio, Jugadores, Hinchada, Mascota, VFX)** | Generación 100% procedural en JavaScript (Three.js r128) | Código original propio del proyecto | `js/stadium_builder.js`, `js/player_renderer.js`, `js/crowd_system.js`, `js/goal_celebration_director.js` |
| **Texturas 2D (Césped, Camisetas, Rostros, Red, Humo, Cielo, LED, Edificios)** | Generación 100% procedural vía `HTMLCanvasElement` en tiempo de ejecución | Original propio | `js/stadium_builder.js`, `js/player_renderer.js`, `js/game_engine.js` |
| **Emblemas de Clubes y Lobo** | SVG vectoriales originales cacheados en memoria | Originales ficticios (Escenario A independiente) | `js/club_badges.js`, `favicon.svg` |
| **SFX y Ambiente de Estadio** | Síntesis procedural en tiempo real vía Web Audio API | Original propio (cero grabaciones de cánticos reales) | `js/audio_engine.js` |
| **Pista musical `Jujuy_Match_Point.mp3`** | Archivo local incorporado en el repositorio (`1fb09a1`) | **Verificar derechos / licencia antes de distribución comercial** (pista provista por el autor del repo; se puede silenciar vía slider `Música` o reemplazar si no cuenta con licencia libre) | `Jujuy_Match_Point.mp3` |

---

## 2. Cumplimiento Legal Automatizado (Escenario A)

- El script `scripts/validate_compliance.mjs` verifica automáticamente los **17 archivos públicos** (`index.html`, `manifest.json`, `favicon.svg` y `js/*.js`) y confirma:
  1. Cero imágenes raster embebidas en base64 (`data:image/...`).
  2. Exclusión en `.vercelignore` del simulador HTML legado (`estadio_23_de_agosto_simulador_3d_...html`).
  3. Cero uso no autorizado de marcas, nombres oficiales de clubes, torneos reales o jugadores reales en producción pública (`BrandRegistry.DistributionProfile.ACTIVE = 'independent'`).
- Resultado verificado tras el rediseño v2: **`COMPLIANCE PASS: 17 public files verified clean for Escenario A (independent).`**
