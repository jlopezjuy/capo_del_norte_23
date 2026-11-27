# 05 — Diseño de Mascota: Lobito

## Identidad y Personalidad
- **Nombre:** Lobito (mascota oficial celeste y blanca de San Salvador Celeste en el Estadio de los Cerros).
- **Tono:** Expresivo, juguetón, torpe con cariño y profundamente jujeño — nunca agresivo ni burlón hacia el jugador.
- **Ubicación base:** Banda norte (`homePos: { x: -8.5, y: 0, z: -55.4 }`), detrás del arco norte, visible en celebraciones, entretiempo, lobby y Desafío del Lobito.

## Rig 3D y Articulación (`js/stadium_builder.js` — `buildWolfMascot`)
Se actualizó `buildWolfMascot()` manteniendo compatibilidad con Three.js r128 (sin `CapsuleGeometry`):
- `bodyPivot`: pivote central para saltos, caídas, giros de 360° y reverencias.
- `headGroup`: cabeza con hocico, orejas articuladas (`earL`, `earR`), cejas expresivas (`browL`, `browR`), mandíbula animable (`jaw`) y accesorio `sunglasses` (anteojos de estrella).
- `armLPivot` / `armRPivot`: brazos articulados con guantes/manos para aplaudir, dirigir la tribuna y tocar el bombo.
- `legLPivot` / `legRPivot`: pivote en cadera para patadas de jueguitos, pasos de carnavalito y caída cómica sentada (`torpe`).
- `scarfL` / `scarfR` y `tailPivot`: bufanda celeste y cola animadas por el ritmo.
- Props opcionales acoplados: `juggleBall` (pelota para jueguitos) y `giantFlag` (bandera gigante celeste y blanca).

## Poses Implementadas (`js/mascot_controller.js` — `MascotController`)
14 poses interpoladas con damping exponencial (`1 - Math.exp(-9 * dt)`):
- `idle`, `run`, `clap`, `celebrate`, `frustrated`, `shock`
- `backflip`, `murga`, `carnavalito`, `jueguitos`, `torpe`, `estrella`, `conductor`, `duelo`, `desfile` / `gigante`, `arquero` (pose de atajada en Desafío del Lobito).
- Escala automática de movimiento cuando `reduceMotion` está activo (`motionScale = 0.35`, sin backflips completos).
