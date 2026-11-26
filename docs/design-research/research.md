# Investigación de Diseño, Game Feel y Optimización Web 3D

**Fecha de consulta:** 2026-11-25  
**Proyecto:** El Lobo Jujeño — Estadio 23 de Agosto 3D (Gimnasia y Esgrima de Jujuy)

---

## 1. Documentación Técnica Oficial (Three.js / WebGL)

### 1.1 GPU Instancing (`THREE.InstancedMesh`) y Vertex Shaders
- **Fuente:** Three.js Documentation (`InstancedMesh`, `InstancedBufferAttribute`)
- **URL:** https://threejs.org/docs/#api/en/objects/InstancedMesh
- **Recomendación principal:** Agrupar miles de espectadores en un único `InstancedMesh` reduce los *draw calls* a 1 por lote. Sin embargo, actualizar matrices en CPU mediante bucles `setMatrixAt()` cada frame genera presión de GC y transferencia CPU→GPU. La animación masiva debe delegarse al **Vertex Shader** (`onBeforeCompile` + atributos por instancia como `aPhase` y uniformes `uTime`, `uExcitement`, `uWavePhase`).
- **Limitación / Cuidado:** `InstancedMesh` comparte un único *bounding box* para frustum culling. Separar en dos mallas (`bowlCrowd` y `plateaCrowd`) evita que el culling falle por completo o procese toda la geometría innecesariamente.
- **Decisión:** **IMPLEMENTAR** — Migrar el salto en bloque de `bowlCrowdMesh` a un shader por instancia (`onBeforeCompile`) para olas por sectores, saltos desfasados y brazos arriba en tiempo real sin costo de CPU.

### 1.2 Overdraw de Fragmentos en Multitudes
- **Fuente:** Comunidad `r/threejs`
- **URL:** https://www.reddit.com/r/threejs/
- **Recomendación principal:** Al acercar la cámara a una multitud densa, el cuello de botella pasa de ser la cantidad de triángulos a ser el *pixel fill-rate / overdraw*. Usar geometrías low-poly limpias sin transparencia innecesaria en los cuerpos del público mantiene 60 FPS incluso en cámaras de tribuna.
- **Decisión:** **IMPLEMENTAR** — Mantener materiales opacos compartidos con `instanceColor` y ajustar la densidad de instancias según perfil gráfico (`Bajo`, `Medio`, `Alto`).

---

## 2. Game Feel y Diseño Arcade Deportivo (Comunidad y GDC)

### 2.1 "Juice It or Lose It" — Cascada Audiovisual
- **Fuente:** GDC Talk — Martin Jonasson & Petri Purho (*Juice It or Lose It*) / GameDeveloper
- **URL:** https://www.youtube.com/watch?v=Fy0aCDmgnxg
- **Recomendación principal:** Una acción mínima del jugador (patear, atajar, convertir) debe disparar una respuesta audiovisual en capas: sonido proporcional a la potencia, estela visual en el balón, micro *screen shake* en impactos fuertes (palo/remate), y reacción exagerada en UI y entorno.
- **Aplicabilidad:** En fútbol arcade, sin *juice* el remate se siente como un cálculo de vectores. Con estela en tiros potentes, deformación de red, vibración sutil al pegar en el palo y festejo explosivo, cada jugada cobra peso físico.
- **Decisión:** **IMPLEMENTAR** — Estela de balón en remates potentes, deformación de red al gol, micro *camera shake* acotado y audio multicapa reactivo.

### 2.2 Legibilidad y Ritmo sobre Simulación Rígida (*Rocket League* & *Super Mario Strikers*)
- **Fuente:** Análisis de diseño arcade deportivo (GDC / GameDev.net / Wikipedia)
- **URL:** https://www.gamedeveloper.com/
- **Recomendación principal:**
  - *Rocket League:* convierte el gol en un evento físico y cinematográfico (explosión, impulso de cámara, replay corto y vuelta rápida al juego sin fricción).
  - *Super Mario Strikers:* personajes con siluetas reconocibles, poses exageradas de festejo/frustración y reglas ágiles que no frenan el ritmo.
- **Limitación:** En navegador, las celebraciones largas aburren si no se pueden omitir o si bloquean el estado.
- **Decisión:** **IMPLEMENTAR** — `GoalCelebrationDirector` con 8+ variantes contextuales cortas (3.5–4.5s), botón/tecla para omitir (`Espacio`/`Enter`) y modo de movimiento reducido accesible.
