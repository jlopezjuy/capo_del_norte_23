# 05 — Auditoría de Futbolistas, Entrenadores y Derechos de Imagen

## 1. Hallazgos Reales en el Código
El archivo `js/afa_fixture.js` (y referencias en `index.html`, `js/match_state.js`, `js/game_engine.js`) contiene:
- **11 futbolistas reales de Gimnasia y Esgrima de Jujuy** con su apellido/inicial y número de dorsal real (`#1 M. Álvarez`, `#4 D. Minervino`, `#2 J. Varela`, `#6 G. Cosaro`, `#3 E. Endrizzi`, `#5 H. Soria`, `#8 F. Maidana`, `#10 J. P. Córdoba`, `#7 C. Menéndez`, `#9 O. Bianchi`, `#11 F. Molina`) + DT `Hernán Pellerano`.
- **55 futbolistas reales y 5 directores técnicos de clubes rivales** (`Deportivo Madryn` / `Luis García`, `San Martín (T)` / `Diego Flores`, `Temperley` / `Aníbal Biggeri`, `Quilmes` / `Sergio Rondina`, `Ferro Carril Oeste` / `Aníbal Ruiz`).
- **Representación visual (`js/player_renderer.js`):** Modelos 3D estilizados con texturas faciales genéricas (`5` tonos de piel por número de dorsal) y sin clonación de voz ni fotografías.

---

## 2. Evaluación Jurídica (Art. 53 CCCN y Art. 31 Ley 11.723)
- Aunque los rostros 3D son estilizados y genéricos, **la combinación de nombre real + dorsal + club real + posición** identifica inequívocamente a cada persona física dentro de un producto de entretenimiento.
- Bajo el **Art. 53 CCCN**, la reproducción del nombre e imagen/identidad con fines de entretenimiento o comerciales exige **consentimiento expreso**, salvo excepciones taxativas que no aplican a un videojuego arcade.
- En el fútbol profesional argentino, los derechos de imagen colectivos involucran además los convenios de **Futbolistas Argentinos Agremiados (FAA)** y las cesiones previstas en el **Boletín AFA N.º 6606**.
- **Riesgo estimado:** **CRÍTICO / ALTO** para publicación pública sin cesión documentada.

---

## 3. Plan de Mitigación Concreto
- **Acción P0 (Antes de publicar):** Reemplazar los **66 nombres de jugadores** y **6 directores técnicos** en `js/afa_fixture.js` (y las menciones en `index.html` y `js/game_engine.js:637`) por **personajes 100% ficticios** con nombres originales y atributos propios, sin usar deformaciones fonéticas deliberadas de jugadores reales (p. ej., evitar parodias tipo "M. Álvares" o "O. Bianqui").
- **Escenario Licenciado:** Solo habilitar nombres reales mediante un `TeamIdentityProvider` separado si se obtienen autorizaciones válidas de FAA / AFA / titulares correspondientes.
