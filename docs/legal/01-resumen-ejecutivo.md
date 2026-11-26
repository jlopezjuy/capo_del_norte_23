# 01 — Resumen Ejecutivo: Auditoría Legal y Publicación Segura

**Proyecto:** *El Lobo Jujeño 3D* (`JuegoGimnasiaJujuy`, rama `develop`)  
**Fecha de auditoría:** 2026-11-26  
**Jurisdicción principal:** República Argentina  
**Advertencia:** Este informe es una **auditoría técnica y de gestión de riesgos**, no un dictamen jurídico definitivo. Las decisiones marcadas como pendientes requieren validación de un abogado argentino especialista en propiedad intelectual y derecho deportivo.

---

## 1. Respuesta Directa: ¿Qué podemos publicar tal como está, qué debemos cambiar y qué necesitamos autorizar?

### ✅ Lo que puede publicarse tal como está (riesgo BAJO, sujeto a mantenimiento)
- **Motor 3D, física, IA, cámaras, sistema de hinchada GPU, celebraciones y audio Web Audio API (`js/game_engine.js`, `physics_engine.js`, `tactical_ai.js`, `crowd_system.js`, `audio_engine.js`):** Código fuente original protegido a favor del desarrollador por la Ley 11.723 (Art. 1).
- **Dependencias técnicas:** Three.js r128 (Licencia MIT), Tailwind CSS CDN y Google Fonts (licencias abiertas compatibles, verificando atribución en Créditos).
- **Preferencias locales (`js/creator_config.js`):** Uso mínimo de `localStorage` (`lobo_jujeno_support_pref_v1`) sin cookies de rastreo ni datos personales identificables.
- **Módulo de servicios profesionales y donaciones (`js/creator_config.js`):** Enlaces explícitos (`https://mpago.la/1KpZh99`, `wa.me`, `mailto:`) **una vez desacoplados** de marcas o nombres deportivos de terceros sin licencia.

### ⚠️ Lo que debemos cambiar ANTES de publicar (Prioridad P0)
1. **Eliminar o excluir del deploy público el archivo legado `estadio_23_de_agosto_*.html`:** Contiene **6 fotografías reales embebidas en base64** (`data:image/png|jpeg;base64,...`) sin licencia ni atribución documentada (riesgo **CRÍTICO** bajo Ley 11.723).
2. **Sustituir los 66 nombres de futbolistas y 6 directores técnicos reales (`js/afa_fixture.js`, `index.html`, `js/game_engine.js`):** Reemplazarlos por planteles ficticios con dorsales y atributos originales (riesgo **CRÍTICO** bajo Art. 53 CCCN y Art. 31 Ley 11.723).
3. **Retirar la palabra `"oficial"` de metadatos y comentarios visibles (`manifest.json:4`, `index.html`):** Evitar cualquier insinuación de afiliación con AFA o Gimnasia y Esgrima de Jujuy.
4. **Separar la identidad del juego (Escenario A Recomendado para lanzamiento inmediato):** Adoptar un nombre propio verificado en INPI (p. ej., evaluar alternativas en `09-nombre-y-marca-del-juego.md`), clubes rivales ficticios, trapos originales sin mencionar agrupaciones reales (`LOS CACHORROS`) ni denominaciones marcarias registradas (`GYEJ`, `GYE`, `Gimnasia y Esgrima de Jujuy`, `Primera Nacional`, `AFA`) mientras no exista autorización escrita.
5. **Desacoplar donaciones y promoción de servicios de marcas de terceros:** Mientras existan elementos reales sin licencia, no publicar el botón de Mercado Pago ni los servicios profesionales asociados a esas marcas.

### 📜 Lo que requiere autorización expresa si se desea conservar (Escenario C)
- Uso marcario o comercial de **"Gimnasia y Esgrima de Jujuy"**, **"El Lobo Jujeño"**, **"GYE" / "GYEJ"**, escudos oficiales, uniformes oficiales y denominación de los clubes rivales.
- Uso de **"AFA"**, **"Primera Nacional"**, **"Copa Argentina"** y **"Estadio 23 de Agosto"** como parte del producto/promoción.
- Nombres e imagen de futbolistas y entrenadores reales (verificando cesiones entre Club, **AFA** según Boletín N.º 6606 del 02/01/2025, y acuerdos colectivos con **FAA**).

---

## 2. Estrategia Recomendada

1. **Publicación inmediata segura (Corto plazo — Escenario A: Independiente):** Implementar la arquitectura de separación de identidades (`BrandRegistry`, `DistributionProfile = 'independent'`) con clubes, escudos, jugadores, trapos y nombre propio verificado, conservando la ambientación cultural del fútbol del norte argentino, las celebraciones y la experiencia arcade.
2. **Gestión de licencias en paralelo (Mediano plazo — Escenario B/C):** Enviar la solicitud formal (`docs/legal/solicitud-autorizacion-club.md`) al Club Atlético Gimnasia y Esgrima de Jujuy y consultar con asesoramiento legal el alcance del Boletín AFA N.º 6606 antes de activar un perfil `licensed`.
