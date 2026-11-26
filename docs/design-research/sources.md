# Fuentes Verificables — Investigación de Diseño y Tecnología

Separación explícita entre documentación técnica oficial, charlas de industria y discusiones comunitarias verificadas.

## 1. Documentación Técnica Oficial

| # | Fuente | URL | Fecha de consulta | Aplicabilidad en el proyecto |
|---|---|---|---|---|
| 1 | Three.js Documentation — `InstancedMesh` | https://threejs.org/docs/#api/en/objects/InstancedMesh | 2026-11-25 / 2026-11-26 | Instanciado GPU de hinchada (4.200 fans), gradas ovales, cerros y postes |
| 2 | Three.js Documentation — `WebGLRenderer` & Tone Mapping | https://threejs.org/docs/#api/en/renderers/WebGLRenderer | 2026-11-26 | `ACESFilmicToneMapping`, control de exposición y corrección de whiteout |
| 3 | MDN Web Docs — Web Audio API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API | 2026-11-25 / 2026-11-26 | Mezcla multicapa (`crowd`/`sfx`/`music`), filtros dinámicos y *ducking* |
| 4 | MDN Web Docs — `prefers-reduced-motion` | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | 2026-11-26 | Detección inicial automática de accesibilidad visual |
| 5 | Khronos WebGL — Handling Context Lost | https://www.khronos.org/webgl/wiki/HandlingContextLost | 2026-11-26 | Listeners `webglcontextlost` / `webglcontextrestored` en `GameEngine` |

## 2. Charlas Técnicas y Literatura de Diseño

| # | Fuente | URL | Fecha de consulta | Aplicabilidad en el proyecto |
|---|---|---|---|---|
| 6 | GDC Vault — *Juice It or Lose It* (Martin Jonasson & Petri Purho, 2012) | https://www.gdcvault.com/play/1016487/Juice-it-or-lose-it | 2026-11-25 / 2026-11-26 | Feedback proporcional en pase, remate, red y goles |
| 7 | GDC — *The Art of Screenshake* (Jan Willem Nijman, Vlambeer, 2013) | https://www.gdcvault.com/ | 2026-11-26 | Hit-stop de 36–45ms y micro-shake reservado a impactos clave |
| 8 | *Game Feel: A Game Designer's Guide to Virtual Sensation* (Steve Swink, 2008) | — (Referencia bibliográfica) | 2026-11-26 | Respuesta inmediata de control, curvas de aceleración y claridad espacial |

## 3. Comunidades de Desarrollo y Referencias Conceptuales

| # | Fuente | URL | Fecha de consulta | Aplicabilidad en el proyecto |
|---|---|---|---|---|
| 9 | Three.js Discourse (`discourse.threejs.org`) — Massive Crowd Vertex Shaders & Low-Poly Silhouettes | https://discourse.threejs.org/ | 2026-11-25 / 2026-11-26 | Atributo `aPart` en shader de hinchada, jerarquía modular de futbolistas |
| 10 | Reddit `r/gamedev` & `r/gamedesign` — Arcade Football Game Feel & Celebrations | https://www.reddit.com/r/gamedesign/ | 2026-11-25 / 2026-11-26 | Equilibrio entre espectáculo de gol, ritmo de partido y opción de omitir |
| 11 | Reddit `r/threejs` — Stylized Low-Poly Performance & Texture Budgets | https://www.reddit.com/r/threejs/ | 2026-11-26 | Texturas procedurales cacheadas y reducción de draw calls |
| 12 | Referencias de principios de diseño: *Super Mario Strikers*, *Rocket League*, HUD tipo *Football Manager* | — (Solo principios de diseño; cero assets, nombres o UI copiados) | 2026-11-25 / 2026-11-26 | Encuadres teatrales de gol, replay corto en cámara lenta y lectura clara del HUD |
