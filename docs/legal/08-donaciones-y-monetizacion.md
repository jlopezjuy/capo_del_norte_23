# 08 — Auditoría de Donaciones Voluntarias y Promoción de Servicios

## 1. Elementos Implementados (`js/creator_config.js`, `index.html`)
- **Donación voluntaria:** Enlace directo externo `https://mpago.la/1KpZh99` (`target="_blank" rel="noopener noreferrer"`), sin API de cobros integrada, sin montos sugeridos ni cookies de seguimiento.
- **Servicios profesionales:** Tarjeta de contacto de **JLopezJuy** (`Desarrollo de software web, móvil y soluciones empresariales`), con enlace `wa.me/543884537959` (mensaje predefinido) y `mailto:contacto@vendora.ar`.

---

## 2. Evaluación de Riesgos

| Aspecto | Análisis | Riesgo |
|---|---|---|
| **Impacto en propiedad intelectual** | Ni la gratuidad exime de infracción, ni una donación convierte automáticamente un uso lícito en ilícito. Sin embargo, combinar enlaces de pago (`mpago.la`) y promoción comercial de servicios con marcas/escudos/nombres reales sin licencia **agrava la exposición jurídica** al evidenciar un aprovechamiento en un entorno con fin económico o promocional. | **ALTO** mientras coexista con activos reales sin permiso; **BAJO** en Escenario A. |
| **Términos de Mercado Pago y aspecto fiscal (ARCA)** | Un link de pago estándar de Mercado Pago es tratado operativamente y fiscalmente como un cobro/ingreso de cuenta comercial o personal sujeto a regímenes de información ante ARCA (ex AFIP), no como una donación exenta de ONG. **Requiere revisión con contador público** según condición tributaria del titular (Monotributo / Régimen General). | **MEDIO** (revisión contable/fiscal). |
| **Publicidad y asociación con clubes** | El texto actual aclara que es un proyecto independiente, pero mientras el lobby lleve el nombre *"El Lobo Jujeño 23 de Agosto"* junto al botón de servicios y Mercado Pago, un tercero podría alegar aprovechamiento del prestigio del club. | **ALTO** en versión actual; **BAJO** en Escenario A. |
| **Datos personales (Ley 25.326)** | No hay formularios ni captura de datos en el juego. `localStorage` guarda únicamente `{ hidden, matchesCompleted }` de forma local. | **BAJO**. |

---

## 3. Recomendación Provisional
- **No eliminar** la arquitectura de `CreatorConfig` del repositorio, pero **no publicar** los enlaces de donación ni servicios junto a marcas, escudos, estadios o jugadores reales sin autorización.
- Publicar las donaciones y servicios profesionales únicamente sobre el **Escenario A (Independiente)** o sobre un **Escenario C con licencia escrita**.
