# Guía de Dirección de Arte — Pasión de Tribuna 3D (Identidad Albiceleste del Norte)

## 1. Comparación de Estilos y Decisión

| Dirección | Ventajas | Riesgos / Costes | Decisión |
|---|---|---|---|
| **A. Realismo deportivo optimizado** | Fidelidad arquitectónica y fotográfica en materiales. | En WebGL puro sin modelos AAA pesados, personajes realistas caen en *uncanny valley* y consumen demasiada memoria/GPU en navegadores modestos. | Descartada |
| **B. Arcade estilizado puro** | Máxima exageración y expresividad cómica. | Pierde la escala, el anillo de tribunas y el carácter monumental del estadio futbolero del norte argentino. | Descartada |
| **C. Híbrido Realista + Arcade (SELECCIONADA)** | Conserva la **arquitectura reconocible del estadio de tribunas andinas** (Platea oeste con torre de prensa, anillo oval, torres de iluminación LED, cerros jujeños al horizonte) y combina **futbolistas estilizados con silueta atlética expresiva, hinchada viva GPU y 16 celebraciones memorables**. | Exige disciplina de iluminación (`ACESFilmicToneMapping`), paleta controlada y equilibrio cromático para que escenario realista y personajes estilizados convivan en un mismo lenguaje. | **SELECCIONADA** |

---

## 2. Paleta de Colores (Propósito Funcional)

| Rol | Color / Hex | Uso específico |
|---|---|---|
| **Celeste Primario** | `#1EA7FD` / `#0EA5E9` | Camiseta local a bastones, mosaicos de tribuna, acento de jugador activo y VFX de gol local. |
| **Blanco Contraste** | `#F8FAFC` | Bastones albicelestes, tipografía titular, líneas reglamentarias del campo. |
| **Azul Nocturno UI** | `#0B1320` (`rgba(11,19,32,0.92)`) | Superficies sólidas de HUD/Lobby de alto contraste sin *glassmorphism* borroso sobre el campo. |
| **Grafito Técnico** | `#111B2B` / `#0D1626` | Tarjetas secundarias, selectores y controles con borde limpio `1px solid rgba(248,250,252,0.14)`. |
| **Oro Gol / Alerta** | `#FACC15` | Marcador en banner de gol, brazalete de capitán, anillo de caída aérea y destellos de confeti. |
| **Césped Natural** | `#256D3B` / `#2E7D44` | Franjas de corte reales con grano orgánico y desgaste sutil en áreas chicas (se evita verde neón plástico). |
| **Hormigón Tribunas** | `#CBD5E1` / `#94A3B8` | Peldaños arquitectónicos que preservan profundidad tonal bajo `ACESFilmicToneMapping` sin quemarse a blanco plano. |
| **Cerros del Norte** | `#4A3835` / `#8C5A4B` / `#3B2D3D` | Silueta andina perimetral con variación de altura y profundidad atmosférica. |

---

## 3. Tipografía y Reglas de Composición UI

- **Display / Marcador / Dorsales:** `Barlow Condensed` (700/800/900) — fuerte presencia de transmisión deportiva argentina.
- **Interfaz y Lectura:** `Plus Jakarta Sans` (500/600/700) — legibilidad inmediata en 1366×768, 1920×1080 y 390×844.
- **Reloj y Telemetría:** `JetBrains Mono` con `font-variant-numeric: tabular-nums` para evitar saltos horizontales al correr los segundos.
- **Principio Anti-Clutter:**
  - Cero *glow* o degradados decorativos sin propósito funcional.
  - Durante el partido, el HUD ocupa `< 12%` del área visible; la guía de teclas es colapsable (`Teclas`) y se sincroniza automáticamente con el esquema activo (`Clásico PES` o `Moderno WASD`).
  - El banner de gol vive en el tercio superior con ancho controlado (`max-w-2xl`), dejando totalmente despejado el primer plano del goleador, compañeros y tribuna.

---

## 4. Iluminación, Materiales y Tratamiento de Texturas

- **Tone Mapping:** `THREE.ACESFilmicToneMapping` (`toneMappingExposure = 1.02`) para comprimir altas luces en tribunas y torres LED sin perder contraste en el césped.
- **Tres Perfiles de Horario (`StadiumBuilder.setSkyMode`):**
  - **Tarde (`day`):** Sol andino cálido, cielo despejado con nubes suaves, torres apagadas.
  - **Atardecer Jujeño (`sunset`, por defecto):** Sol rasante ámbar-coral, cielo atardecer violeta/dorado, haces volumétricos sutiles en las torres LED.
  - **Noche (`night`):** Cielo estrellado nocturno, focos LED encendidos con haces volumétricos y ventanas de prensa iluminadas.
- **Texturas Procedurales Cacheadas:** Camisetas envolventes `256×128`, rostros con 3 emociones `256×128`, césped `1024×1536`, red de 5 caras con trama, humo radial suave, pantalla LED con desplazamiento real y edificios urbanos instanciados.

---

## 5. Identidad de Marca e Independencia Legal (Escenario A)

El perfil público activo (`js/brand_registry.js`, `DistributionProfile.ACTIVE = 'independent'`) utiliza la identidad independiente **Pasión de Tribuna 3D** (*San Salvador Celeste*, *Estadio de los Cerros*, *Copa del Norte*) validada automáticamente por `node scripts/validate_compliance.mjs`, preservando el espíritu albiceleste del fútbol del norte argentino sin infringir marcas ni derechos de terceros.
