# Diseño del Estadio 23 de Agosto (`js/stadium_builder.js`)

- **Arquitectura fiel:** Platea Oeste Ulloa con fachada y cabina de transmisión de 4 niveles, Popular Norte/Sur y Preferencial en óvalo celeste y blanco, cerros jujeños y autopista animada.
- **Detalles de cancha:** Césped con franjas de corte contrastadas, banderines de córner celestes, fotógrafos detrás de los arcos, bancos de suplentes y **red de arco deformable dinámicamente** (`deformGoalNet` / `relaxGoalNets`).
- **Iluminación:** 3 modos seleccionables (`day`, `sunset`, `night`) que ajustan cielo, niebla, luces hemisférica/direccional y torres LED.
- **Integridad de escena:** Se eliminó la duplicación de arcos, cercos y bancos en `buildAll`.
