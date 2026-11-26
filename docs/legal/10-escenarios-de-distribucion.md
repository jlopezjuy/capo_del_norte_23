# 10 — Modalidades y Escenarios de Distribución

## 1. Comparativa de los Tres Escenarios

| Criterio | Escenario A: Independiente (100% Original) | Escenario B: Informativo / Híbrido | Escenario C: Licenciado Oficial |
|---|---|---|---|
| **Contenido** | Nombre propio verificado, clubes/jugadores/escudos ficticios, estadio original inspirado en el norte argentino, audio/VFX propios. | Motor y gameplay 100% originales (clubes/jugadores ficticios), más sección separada con datos factuales del calendario con atribución. | Activos oficiales (escudos, nombres, estadio, camisetas, plantel) solo tras firma de acuerdos escritos. |
| **Riesgo legal** | **BAJO** (no existe riesgo cero absoluto, pero se eliminan conflictos directos con Ley 22.362, Art. 53 CCCN y Boletín AFA 6606). | **MEDIO** (la frontera entre uso informativo y aprovechamiento comercial requiere revisión jurídica, especialmente habiendo donaciones/servicios). | **BAJO** si los contratos cubren todo; **CRÍTICO** si falta un titular (ej. AFA vs Club vs FAA). |
| **Costo probable** | Mínimo (solo tiempo de refactorización y eventual tasa oficial INPI si se registra marca propia). | Bajo en desarrollo; requiere revisión legal puntual. | Desconocido / potencialmente elevado (no se inventan tarifas; depende de negociación con AFA, club y FAA). |
| **Complejidad técnica** | Baja-media (implementar `BrandRegistry` + dataset ficticio). | Media (agregar `FixtureProvider` con procedencia y sin marcas). | Alta (gestión contractual, vencimientos y validación estricta de assets). |
| **Publicación inmediata** | **SÍ** (viable tras ejecutar tareas P0). | Condicionada a revisión jurídica. | **NO** (bloqueada hasta obtener firmas). |
| **Dependencia de terceros** | Mínima (solo librerías open-source MIT/CDN). | Media (fuente de datos de calendario). | Máxima (club, AFA, FAA, renovación y límites de uso). |
| **Potencial comercial** | Alto y flexible (permite donaciones, promoción profesional, itch.io, mobile/PWA y expansión sin restricciones). | Medio (restricciones si la fuente prohíbe uso comercial). | Alto en reconocimiento local, pero sujeto a regalías o límites de monetización contractuales. |

---

## 2. Estrategia Recomendada

**Adoptar el Escenario A (Independiente) para el lanzamiento público inmediato**, implementando la arquitectura desacoplada (`BrandRegistry` / `DistributionProfile`) para que:
1. El juego sea divertido, jujeño en espíritu y libre para recibir donaciones voluntarias o promocionar tus servicios de software.
2. El código quede preparado para activar un **Escenario C (Licenciado)** en el futuro únicamente si se obtienen autorizaciones escritas válidas mediante la solicitud formal (`solicitud-autorizacion-club.md`).
