# 06 — Auditoría del Estadio 23 de Agosto y Fotografías

## 1. Qué existe realmente en el repositorio

### A. Archivo legado (`estadio_23_de_agosto_*.html`) — Riesgo CRÍTICO
- En la raíz del proyecto permanece el archivo `estadio_23_de_agosto_simulador_3d_de_ubicaciones_y_partido_en_vivo_gimnasia_y_esgrima_de_jujuy.html` (~1,15 MB), que contiene **6 fotografías reales embebidas en base64** (`data:image/png;base64,...` y `data:image/jpeg;base64,...` en líneas 575, 587, 599, 611, 623, 635), incluyendo una vista satelital cenital y fotos de tribunas sin licencia ni atribución documentada.
- **Riesgo:** Reproducción y distribución pública de obras fotográficas protegidas por la **Ley 11.723** sin autorización del fotógrafo o titular de derechos. Además, en `vercel.json` no está excluido del despliegue.

### B. Reconstrucción 3D procedural (`js/stadium_builder.js`) — Riesgo ALTO sin autorización
- Reconstruye en Three.js el estadio utilizando:
  - **Nombre oficial:** `Estadio 23 de Agosto`, `Platea Alta/Baja "Ing. Raúl Ulloa"`, `Tribuna Preferencial "Hugo Fayek Llapur"`, `Popular "Lobo Norte"`, `Popular "Lobo Sur"`, `COPA AMÉRICA 2011`.
  - **Mosaicos y textos distintivos:** `-19 31-`, `G Y E J`, cartel electrónico `GIMNASIA Y ESGRIMA DE JUJUY • ESTADIO 23 DE AGOSTO • 1931 • EL LOBO JUJEÑO • PRIMERA NACIONAL`, y trapos como `LOS CACHORROS`, `JUJUY ES DE GIMNASIA`, `23 DE AGOSTO • MI CASA`.
  - **Entorno urbano:** Calles reales (`Av. El Éxodo`, `Calle Santa Bárbara esq. Humahuaca`, `Calle La Bandera`, `Plazoleta 20 de Junio`) y cerros jujeños estilizados.

---

## 2. Distinción Jurídica y Recomendación
- **Modelar en 3D desde cero no vuelve automáticamente libre de derechos** el uso del nombre comercial/institucional del estadio ni sus signos distintivos (`GYEJ`, `1931`, nombres de tribunas), especialmente considerando que el **Boletín AFA N.º 6606** incluye expresamente los *"estadios"* dentro de los activos licenciados.
- **Acción P0 (Inmediata):**
  1. **Retirar o excluir del paquete público** (`.vercelignore` / archivo de respaldo privado fuera de `public`) el archivo legado `estadio_23_de_agosto_*.html` con las 6 fotos base64.
  2. **Crear variante de estadio original para Escenario A** (ej. *"Estadio del Norte / Monumental de los Cerros"*): conservar la arquitectura de estadio de fútbol argentino con platea, popular, torres LED y paisaje de cerros jujeños (elementos genéricos/geográficos no monopolizables), pero sustituyendo los mosaicos `GYEJ 1931`, el nombre `23 de Agosto`, las denominaciones de tribunas y el trapo `LOS CACHORROS` por textos propios de ficción/cultura futbolera del norte.
