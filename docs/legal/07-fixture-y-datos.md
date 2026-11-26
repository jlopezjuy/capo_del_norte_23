# 07 — Auditoría de Fixture, Datos Deportivos y Marcas de Competencias

## 1. Situación Actual (`js/afa_fixture.js`, `manifest.json`, `index.html`)
- `js/afa_fixture.js` almacena estáticamente 6 fechas etiquetadas como `"Calendario oficial AFA 2026"` (`Primera Nacional`, `Reducido`, `Copa Argentina`) con rivales, técnicos y planteles reales.
- `manifest.json:4` y `index.html:86` utilizan las expresiones **"fixture oficial AFA"** y **"FECHA AFA • ESTA SEMANA"**.
- **Aspecto positivo:** No realiza *scraping* automático ni consume APIs externas no autorizadas.

---

## 2. Evaluación Jurídica
- **Hechos vs. presentación y marcas:** Los resultados o fechas históricas de partidos son hechos deportivos de conocimiento público; sin embargo:
  1. Utilizar los logotipos o marcas registradas **`AFA`**, **`Primera Nacional`** y **`Copa Argentina`** en un producto de entretenimiento sin licencia genera riesgo de confusión marcaria (Ley 22.362).
  2. Etiquetar el calendario como **"fixture oficial AFA"** sugiere patrocinio, aval o afiliación institucional inexistente (riesgo de publicidad engañosa / competencia desleal).
  3. Si en el futuro se conectara una API o feed de datos deportivos, se deberá respetar sus términos de redistribución, atribución y prohibiciones de *scraping*.

---

## 3. Arquitectura Propuesta para Datos Desacoplados
- En **Escenario A (Independiente):** Reemplazar `AFA_FIXTURE` por una **Liga / Copa del Norte ficticia** con equipos, fechas y escudos originales.
- En **Escenario B (Híbrido/Informativo, solo con validación legal previa):** Implementar un `FixtureProvider` con:
  - Campo de procedencia (`sourceName`, `sourceUrl`, `retrievedAt`).
  - Atribución visible no comercial y **sin marcas visuales ni texto "oficial"**.
  - Aislamiento completo respecto al motor de juego (`GameEngine` consume un contrato genérico `MatchConfig`).
