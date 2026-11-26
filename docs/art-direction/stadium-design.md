# Diseño del Estadio 23 de Agosto (`js/stadium_builder.js`)

- **Preservación arquitectónica:** Campo reglamentario 105×70m con franjas de corte, Platea Alta «G Y E J» y Baja «-19 31-» («Ing. Raúl Ulloa») con edificio de palcos/prensa de 4 niveles, Tribuna Preferencial «Hugo Fayek Llapur», Populares «Lobo Norte» (con tablero LED dinámico) y «Lobo Sur», 5 torres de iluminación, Av. El Éxodo y cerros jujeños.
- **Horarios:** Tarde (`day`), Atardecer jujeño (`sunset`), Noche (`night`).
- **Iluminación balanceada:** `AmbientLight(0.26)`, `HemisphereLight(0.52)`, `DirectionalLight(0.78)` en `sunset` para evitar sobreexposición en gradas claras.
