# 02 — Marco Normativo Vigente en Argentina

**Jurisdicción principal:** República Argentina  
**Nota:** Resumen técnico-legal basado en normativa oficial consultada; no sustituye asesoramiento de un abogado matriculado.

---

## 1. Ley 22.362 — Marcas y Designaciones
- **Fuente oficial:** https://www.argentina.gob.ar/normativa/nacional/18803/actualizacion
- **Principio atributivo (Art. 4):** En Argentina, la propiedad de una marca y el derecho de exclusividad (*ius prohibendi*) se adquieren **únicamente mediante su registro ante el INPI**, no por el mero uso de hecho.
- **Signos protegibles (Art. 1):** Denominaciones, dibujos, emblemas, monogramas, escudos, combinaciones de colores aplicadas a un lugar determinado de los productos o envases, y frases publicitarias con capacidad distintiva.
- **Riesgo de confusión y uso no autorizado:** El titular registrado puede impedir el uso de signos idénticos o confusamente similares para productos o servicios iguales o relacionados (en videojuegos: principalmente **Clase 9** —software/juegos descargables— y **Clase 41** —entretenimiento, juegos en línea, actividades deportivas—).
- **Uso marcario vs. uso informativo/factual:**
  - *Uso marcario (riesgo alto sin licencia):* Utilizar el nombre, apodo o siglas de un club como título del videojuego, logotipo, favicon, dominio o reclamo promocional, generando riesgo de confusión sobre origen o patrocinio.
  - *Uso informativo/referencial:* Citar un hecho o dato objetivo (p. ej., fecha de un partido real) de modo puramente descriptivo, sin sugerir afiliación ni aprovechar el prestigio ajeno. Su límite es estricto y requiere análisis jurídico caso por caso.
- **Consecuencias legales:** Acciones civiles de cese de uso e indemnización por daños y perjuicios, y acciones penales (Art. 31) ante uso comercial fraudulento de marcas registradas.

---

## 2. Ley 11.723 — Régimen Legal de la Propiedad Intelectual
- **Fuente oficial:** https://www.argentina.gob.ar/normativa/nacional/42755/actualizacion
- **Software y videojuegos (Art. 1):** Protege expresamente a los *"programas de computación fuente y objeto"*, así como obras gráficas, música, sonidos, fotografías y obras arquitectónicas.
- **Fotografías (Art. 34 / régimen general):** Las fotografías embebidas en el archivo legado (`estadio_23_de_agosto_*.html`, 6 imágenes base64) están protegidas desde su creación/publicación; su reproducción sin autorización del titular infringe la ley.
- **Retratos y representación de personas (Art. 31):** Prohíbe poner en el comercio el retrato fotográfico o representación de una persona sin su consentimiento expreso.
- **Obras derivadas y modelado 3D:** Modelar desde cero un objeto, escudo o edificio protegido no elimina automáticamente los derechos del autor original si se reproduce la expresión artística o arquitectónica protegida.
- **Gratuidad:** El carácter gratuito o de "homenaje" del videojuego **no exime** de responsabilidad bajo la Ley 11.723 ni la Ley 22.362.

---

## 3. Código Civil y Comercial de la Nación (CCCN) — Art. 53
- **Derecho a la imagen y la voz (Art. 53):** *"Para captar o reproducir la imagen o la voz de una persona, de cualquier modo que se haga, es necesario su consentimiento"*, con excepciones acotadas (actos públicos, interés científico/cultural/educacional prioritario o ejercicio regular de informar).
- **Impacto en el juego:** Un videojuego de entretenimiento (gratuito, con donaciones o asociado a promoción de servicios) **no encuadra** en la excepción informativa ni de interés científico. Representar futbolistas y entrenadores reales por su nombre, dorsal y características identificables requiere consentimiento/cesión expresa.

---

## 4. Ley 25.326 — Protección de Datos Personales
- **Alcance actual en el proyecto:** La aplicación activa (`index.html`, `js/*.js`) es 100% client-side, no recopila nombres, correos, formularios ni analíticas de terceros. Solo almacena en `localStorage` (`lobo_jujeno_support_pref_v1`) dos valores técnicos anónimos (`hidden`, `matchesCompleted`).
- **Conclusión técnica:** En su estado actual no constituye una base de datos de personas identificables sujeta a inscripción ante la AAIP; no obstante, si en el futuro se agregan rankings con nombres, cuentas o telemetría, deberá implementarse consentimiento informado (Art. 5), Política de Privacidad y canales ARCO.
- **Enlaces externos (WhatsApp / Correo):** Cuando el usuario inicia voluntariamente un chat o correo, el tratamiento de esos datos pasa a regirse por la relación directa de consulta y las políticas de WhatsApp/proveedor de correo.

---

## 5. Alcance Territorial (Publicación Web Global)
Al publicarse en la web (ej. Vercel), el juego es accesible fuera de Argentina. En otras jurisdicciones (EE. UU., UE, etc.) rigen normas propias de *trademark*, *right of publicity* (derecho de publicidad de deportistas), *copyright* (DMCA para retirada de contenidos) y privacidad (GDPR si hubiera rastreo). Mantener el Escenario A (activos propios/originales) reduce sustancialmente también la exposición extraterritorial.
