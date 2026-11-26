# 11 — Plan de Acción y Mitigación Priorizado (P0, P1, P2)

---

## P0 — Obligatorio ANTES de publicar la versión pública

1. **Excluir/retirar el archivo legado con fotografías base64**
   - **Problema:** `estadio_23_de_agosto_*.html` contiene 6 fotos reales embebidas sin licencia.
   - **Evidencia:** `data:image/png|jpeg;base64` en líneas 575, 587, 599, 611, 623, 635.
   - **Acción:** Mover fuera de la carpeta desplegable o agregar a `.vercelignore` (manteniendo respaldo privado si se desea, sin borrar sin inventario).
   - **Complejidad:** Baja | **Dependencias:** Ninguna | **Verificación:** Confirmar HTTP 404 en el deploy público.

2. **Reemplazar los 66 futbolistas y 6 entrenadores reales por planteles ficticios**
   - **Problema:** Identificación directa de personas físicas sin consentimiento (Art. 53 CCCN).
   - **Evidencia:** `js/afa_fixture.js:20-285`, `index.html:103, 118, 274, 379`, `js/game_engine.js:637`.
   - **Acción:** Crear un dataset ficticio de equipos y jugadores del Norte Argentino sin similitud fonética con jugadores reales.
   - **Complejidad:** Baja | **Dependencias:** P0.3 | **Verificación:** Búsqueda de cadenas en repo sin apellidos reales.

3. **Renombrar marcas, escudos, estadio, trapos y metadatos al perfil Independiente (Escenario A)**
   - **Problema:** Uso marcario de *"Gimnasia y Esgrima de Jujuy"*, *"El Lobo Jujeño"*, *"Estadio 23 de Agosto"*, *"AFA"*, *"Primera Nacional"*, *"fixture oficial AFA"*, *"GYEJ"*, *"LOS CACHORROS"* junto a donaciones y servicios.
   - **Evidencia:** `index.html`, `manifest.json`, `favicon.svg`, `js/club_badges.js`, `js/stadium_builder.js`, `js/goal_celebration_director.js`, `js/creator_config.js`.
   - **Acción:** Adoptar nombre propio verificado en INPI, clubes/escudos originales, trapos ficticios y estadio inspirado en los cerros del norte sin denominaciones oficiales ni `"oficial"`.
   - **Complejidad:** Media | **Dependencias:** Consulta previa en INPI | **Verificación:** Auditoría visual en Playwright + `rg` de términos restringidos = 0 en build público.

---

## P1 — Protección del Proyecto y Arquitectura Preparada para Licencias

4. **Implementar separación de marcas del motor (`BrandRegistry` + `DistributionProfile`)**
   - **Problema:** Nombres y textos reales están hardcodeados en UI, `stadium_builder.js` y `goal_celebration_director.js`.
   - **Acción:** Introducir `BrandRegistry`, `TeamIdentityProvider`, `AssetLicenseRegistry`, `RightsManifest` y `SafeAssetResolver` para que `DistributionProfile = 'independent'` solo empaquete assets propios en el build público (sin incluir assets restringidos ocultos por un simple flag en el frontend).
   - **Complejidad:** Media | **Dependencias:** P0.2, P0.3.

5. **Validación automatizada en CI y aviso legal accesible**
   - **Problema:** Riesgo de reintroducir accidentalmente marcas o fotos en futuras actualizaciones.
   - **Acción:** Script de validación en CI que verifique el manifiesto de licencias, bloquee base64 de fotos no verificadas o palabras clave restringidas en el build `independent`, y enlace a una sección legal con aviso de independencia, política de privacidad y canal de reclamaciones/retirada rápida.
   - **Complejidad:** Baja-Media | **Dependencias:** P1.4.

---

## P2 — Consolidación Comercial y Gestión de Licencias (Opcional a mediano plazo)

6. **Búsqueda formal y registro de marca propia ante el INPI (Clases 9 y 41)**
   - **Acción:** Consultar en `portaltramites.inpi.gob.ar` con profesional/agente de propiedad industrial y registrar el nombre y logotipo propios del juego.

7. **Revisión contable/fiscal de Mercado Pago (ARCA) y eventual gestión de licencias oficiales**
   - **Acción:** Validar encuadre tributario de los cobros por `mpago.la` con contador público; si se desea avanzar hacia el Escenario C, presentar la nota formal (`solicitud-autorizacion-club.md`) y consultar alcance del Boletín AFA 6606 y FAA con abogado especialista.
