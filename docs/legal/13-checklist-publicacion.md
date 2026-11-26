# 13 — Checklist de Publicación Segura (Todos los Canales)

Antes de publicar cualquier versión en producción (Vercel, dominio propio, itch.io o redes sociales), verificar cada ítem:

## A. Código y Paquete Público (`build` / Deploy)
- [ ] El archivo legado `estadio_23_de_agosto_*.html` (con 6 fotos base64) **no** está accesible en la URL pública ni incluido en el build.
- [ ] `DistributionProfile` configurado en `'independent'` (salvo licencias escritas verificadas).
- [ ] Cero nombres de futbolistas y directores técnicos reales en `js/` o `index.html`.
- [ ] Cero referencias no autorizadas a `Gimnasia y Esgrima de Jujuy`, `GYEJ`, `GYE`, `Estadio 23 de Agosto`, `AFA`, `Primera Nacional`, `Copa Argentina`, `LOS CACHORROS` o clubes reales en `index.html`, `manifest.json`, `favicon.svg` y `js/`.
- [ ] Palabra `"oficial"` eliminada de `manifest.json`, `<title>`, `<meta>` y textos de UI.

## B. Canales Externos, SEO y Promoción
- [ ] **Dominio y URL:** Sin marcas de terceros en el dominio ni subdominio.
- [ ] **Metadatos (`<title>`, `og:title`, `og:description`, `manifest.json`):** Reflejan el nombre propio verificado del videojuego independiente.
- [ ] **`favicon.svg` e íconos PWA:** Emblema propio sin siglas de clubes reales.
- [ ] **Capturas compartidas y videos en redes:** Tomadas únicamente sobre la versión limpia (`independent`), sin mostrar escudos ni nombres reales no autorizados.

## C. Legal, Privacidad, Donaciones y Retirada Rápida
- [ ] Sección **Créditos y desarrollo / Aviso Legal** accesible desde el menú principal, indicando titularidad, librerías de terceros (Three.js MIT, Tailwind, Google Fonts), carácter independiente y canal de contacto (`contacto@vendora.ar`).
- [ ] Donación voluntaria (`https://mpago.la/1KpZh99`) y servicios profesionales desacoplados de marcas de terceros, con `target="_blank" rel="noopener noreferrer"`.
- [ ] Procedimiento de **retirada rápida** documentado: ante cualquier reclamo fundado recibido en `contacto@vendora.ar`, retirar o desactivar el activo cuestionado en el repositorio y redespliegue inmediato mientras se verifica la titularidad.
