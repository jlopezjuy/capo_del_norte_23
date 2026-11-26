# Auditoría Visual y Funcional Completa (Estado Inicial — `before/`)

**Fecha:** 2026-11-25  
**Capturas reales:** `docs/design-audit/before/` (`01` a `09` en `1366×768` y `390×844`)  
**Errores de consola iniciales:** 0 errores, 2 advertencias (`cdn.tailwindcss.com` en producción y meta `apple-mobile-web-app-capable` obsoleta).

---

## 1. Inventario Real del Código y Pantallas

| Pantalla / Módulo | Estado Real | Evidencia |
|---|---|---|
| 1–2. Pantalla inicial / Menú principal | Implementado (`#lobby-overlay`) | Tarjeta oscura centrada con blur, ícono genérico de reloj, sin marca propia *El Lobo Jujeño*. |
| 3. Selección de partido | Implementado (`#sel-fixture`) | 6 partidos AFA 2026 en `afa_fixture.js`, con indicador de contraste de camiseta. |
| 4. Selección de jugador / formación | **Ausente** | No existe selector de titular inicial ni vista previa de dorsal/rol en el lobby. |
| 5–8. Estadio, campo, platea, populares | Implementado (`stadium_builder.js`) | Geometría reconocible del 23 de Agosto, pero `buildAll` duplica arcos, cercos y bancos. Entorno urbano con cubos pastel genéricos. |
| 9–12. Jugador en reposo, carrera, conducción, remate | Parcial (`player_renderer.js`) | Cajas rígidas tipo bloque sin rostro ni articulaciones de codo/rodilla; dorsal repetido en las 6 caras del torso. |
| 13–14. Gol y celebración | Parcial (`goal_celebration_director.js`) | 8 presets, pero en cancha los jugadores apenas levantan un brazo y el banner oscuro tapa el centro de la toma. |
| 15. Marcador y HUD | Implementado (`#match-hud`) | Scorebug con rectángulos de color en lugar de escudos SVG; panel de controles grande fijo abajo a la derecha. |
| 16–18. Pausa, Resultado final, Configuraciones | Implementado | Modales funcionales; `volumes.sfx` ignorado en silbato, patada y palo (`audio_engine.js`). |

---

## 2. Evaluación por Criterio (1 a 10)

| Criterio | Puntaje | Evidencia Visual / Técnica | Causa Probable | Impacto | Propuesta Concreta | Prioridad | Costo | Riesgo |
|---|---:|---|---|---|---|---|---|---|
| Calidad visual estadio | 7/10 | `06-gameplay-broadcast-1366x768.png`: buena estructura de tribunas, pero red rígida y edificios pastel planos. | Red `BoxGeometry` wireframe estática y ciudad con bloques sin detalle. | Resta credibilidad al remate y al fondo de cámara. | Deformación dinámica de red al impacto, banderines, fotógrafos, banco animado y tonos urbanos andinos. | Media | Medio | Bajo |
| Legibilidad e UI/HUD | 6/10 | `04-lobby`, `07-goal-banner`: tarjeta de gol tapa el área; scorebug sin escudos SVG; `.btn-tactile` sin CSS. | Estilos rápidos tipo tarjeta genérica con blur. | Ocupa pantalla innecesariamente y pierde identidad futbolera. | Rediseño editorial deportivo celeste/blanco/grafito, escudos SVG en scorebug, banner de gol en tercio superior/inferior sin tapar la acción. | Alta | Medio | Bajo |
| Identidad de marca | 5/10 | Ícono de reloj en lobby, título "Matchday 3D", sin presencia del Lobo Jujeño. | Enfoque técnico inicial de simulador genérico. | No transmite pasión jujeña desde el primer segundo. | Branding **EL LOBO JUJEÑO**, emblema propio, trapos de tribuna y Mascota del Lobo 3D. | Alta | Bajo | Bajo |
| Personajes 3D y siluetas | 3/10 | `07-goal-banner-pro-1366x768.png`: muñecos cúbicos sin ojos, boca, rodillas ni codos; dorsal en el pecho. | `BoxGeometry` aplicado con textura única en las 6 caras. | Pierde personalidad en cámara Pro y celebraciones. | Geometría estilizada con cabeza, rostro expresivo, cuello, cabello variado, dorsal solo en espalda, medias y botines. | Crítica | Medio | Bajo |
| Animaciones | 3/10 | Solo pivote de cadera/hombro; `frustratedTimer` es código muerto. | Sin pose machine expresiva ni reacciones entre compañeros. | Los jugadores parecen robots tras un fallo o gol. | Blending multi-pose (`walk`, `sprint`, `kick`, `header`, `tackle`, `frustrated`, `call_for_pass`, `gk_save_celebrate`, `celebrate`). | Crítica | Medio | Medio |
| Hinchada | 3/10 | `06-gameplay`: cubos dispersos blancos/celestes/negros saltando al unísono. | Cubo 1×1 instanciado con `sin(uTime)` uniforme. | Parece ruido visual de voxels, no personas alentando. | Siluetas humanas instanciadas (torso+cabeza+brazos), bufandas, banderas, trapos jujeños, desincronización y reacción por peligro. | Crítica | Medio | Medio |
| Celebraciones de gol | 4/10 | 8 variantes básicas; solo 1 pose de brazo arriba y banner central grande. | Faltan coreografías, replay y opciones interactivas. | El gol no sorprende ni invita a buscar otro gol. | `GoalCelebrationDirector` con 16 variantes, replay corto cámara lenta, teclas `1–4` opcionales y Mascota del Lobo. | Crítica | Medio | Medio |
| Game Feel | 6/10 | Física sólida a 60 Hz, pero sin curva Magnus, hit-stop ni pases al espacio con error IA. | Motor físico lineal sin efectos de arco/impacto. | Remates planos y poca sensación de impacto. | Efecto Magnus, hit-stop de ~40ms en bombazos, estela mejorada, regate/amague y look-ahead de cámara. | Alta | Medio | Bajo |
| Audio | 5/10 | Ruido rosa + 4 SFX; `volumes.sfx` no se aplica a patada/silbato/palo. | Parámetros de volumen desconectados en `AudioEngine`. | Ajustes de sonido parcialmente rotos y audio repetitivo. | Corregir gain nodes por categoría, añadir capa de reacción/ambiente, música sutil de menú y fanfarria de gol. | Media | Bajo | Bajo |
| Rendimiento | 8/10 | 60 FPS en desktop, aunque duplica mallas en `buildAll`. | Llamadas repetidas en `stadium_builder.js:1265`. | Draw calls desperdiciados en móviles. | Eliminar duplicación, mantener presupuesto < 130 draw calls y exponer telemetría opcional de FPS/draw calls. | Alta | Bajo | Bajo |
