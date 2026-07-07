# Espansione argomenti, filtri, sotto-tipi e batch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Portare il catalogo a ~52 argomenti con macro-aree e sotto-tipi, filtri e ricerca sulla griglia, e generazione di N esercizi in un colpo solo.

**Architecture:** App statica senza build step: 4 script che comunicano via globals su `window` (`TOPICS`, `MathGraph`, `GeminiAPI`, più l'IIFE di `app.js`). Il piano estende `topics.js` (dati), `gemini.js` (parametro `subtype` nel prompt), `app.js` (filtri, ricerca, sotto-tipi, batch, refactor della card esercizio a `<template>` clonabile) e `index.html`/`style.css` (markup e stili). `graph.js` non si tocca.

**Tech Stack:** Vanilla JS (ES6, IIFE, no moduli), HTML, CSS. Nessun test runner: verifica con `node --check` (sintassi), one-liner `node -e` (integrità dati) e checklist manuale nel browser servendo la cartella con `python3 -m http.server 8000`.

**Spec:** `docs/superpowers/specs/2026-07-07-espansione-argomenti-design.md`

## Global Constraints

- Nessuna modifica a `graph.js` e `exercises.js` (quest'ultimo è dead code).
- Nessun build step, nessun modulo/import: gli script comunicano via `window.*`.
- Tutto il testo UI in italiano.
- I livelli sono esattamente `Elementari`, `Medie`, `Superiori`, `Università` (ordinamento hardcoded in più punti).
- I `graphHint` ammessi sono solo quelli già supportati da `graph.js`: `linear`, `quadratic`, `trigonometric`, `exponential`, `system`, `derivative`, `integral`, `bar-chart`, `fraction-pie`, `custom`, `geometry`, `none`.
- Convenzioni HTML matematico invariate (`.fraction`, `.math-formula`, `.math-matrix`, `<sup>`): non toccare `cleanMathHtml` né il formato richiesto all'LLM.
- Il repo è l'unica fonte: lavorare su `main` (progetto personale, single-user), un commit per task.
- In `style.css` gli elementi con `display: flex` di default hanno bisogno di una regola esplicita `X[hidden] { display: none; }` (pattern già usato, es. `style.css:678`): ogni nuovo contenitore flex nascondibile deve averla.

### Correzioni ai `graphHint` della spec

La tabella della spec assegna a 4 argomenti un `graphHint` che il renderer non
può disegnare bene. Il piano usa questi valori (Task 1 aggiorna anche la spec):

| Argomento | Spec | Piano | Motivo |
|---|---|---|---|
| Geometria Solida (Medie) | geometry | none | il renderer geometry supporta solo figure piane |
| Circonferenza | custom | geometry | `custom` disegna funzioni y=f(x); una circonferenza non lo è. `geometry` ha la shape `circle` |
| Ellisse e Iperbole | custom | none | non rappresentabili come y=f(x) |
| Equazioni Logaritmiche | exponential | custom | `exponential` disegna base^x; con `custom` l'LLM può passare `Math.log(x)` |

---

### Task 1: Nuovo catalogo in `topics.js`

**Files:**
- Modify: `topics.js` (riscrittura completa)
- Modify: `docs/superpowers/specs/2026-07-07-espansione-argomenti-design.md` (tabella graphHint)

**Interfaces:**
- Consumes: niente.
- Produces: `window.TOPICS`: array di `{ level: string, topic: string, icon: string, graphHint: string, area: string, subtypes: string[] }`. Conteggi: Elementari 5, Medie 13, Superiori 29, Università 5 (totale 52). I task successivi leggono `t.area` e `t.subtypes`.

- [ ] **Step 1: Riscrivere `topics.js` con il catalogo completo**

Sostituire l'intero contenuto di `topics.js` con:

```js
/**
 * MathFlow AI — Topic Definitions
 * Lists all available math topics grouped by educational level.
 * Ogni voce: { level, topic, icon, graphHint, area, subtypes }
 * - area: macro-area usata dai chip di filtro sopra la griglia
 * - subtypes: tipi di esercizio proposti quando si apre l'argomento
 */

window.TOPICS = [
    // ===== ELEMENTARI =====
    { level: 'Elementari', topic: 'Addizioni e Sottrazioni', icon: '➕', graphHint: 'bar-chart', area: 'Aritmetica',
      subtypes: ['Addizioni in colonna', 'Sottrazioni in colonna', 'Calcolo mentale', 'Problemi con le operazioni'] },
    { level: 'Elementari', topic: 'Moltiplicazioni e Divisioni', icon: '✖️', graphHint: 'bar-chart', area: 'Aritmetica',
      subtypes: ['Moltiplicazioni in colonna', 'Divisioni con resto', 'Tabelline', 'Problemi con le operazioni'] },
    { level: 'Elementari', topic: 'Frazioni', icon: '🍕', graphHint: 'fraction-pie', area: 'Aritmetica',
      subtypes: ['Riconoscere frazioni', 'Frazioni equivalenti', 'Confronto tra frazioni', 'Frazione di una quantità'] },
    { level: 'Elementari', topic: 'Geometria Base', icon: '📐', graphHint: 'geometry', area: 'Geometria',
      subtypes: ['Perimetri', 'Aree', 'Riconoscere le figure', 'Problemi con disegno'] },
    { level: 'Elementari', topic: 'Problemi con le Misure', icon: '📏', graphHint: 'bar-chart', area: 'Aritmetica',
      subtypes: ['Lunghezze', 'Pesi e capacità', 'Tempo e denaro', 'Equivalenze'] },

    // ===== MEDIE =====
    { level: 'Medie', topic: 'Espressioni Aritmetiche', icon: '🧮', graphHint: 'none', area: 'Aritmetica',
      subtypes: ['Con numeri naturali', 'Con frazioni', 'Con potenze', 'Con parentesi annidate'] },
    { level: 'Medie', topic: 'Multipli, Divisori, MCD e mcm', icon: '🧩', graphHint: 'none', area: 'Aritmetica',
      subtypes: ['Criteri di divisibilità', 'Scomposizione in fattori primi', 'Calcolo di MCD e mcm', 'Problemi con MCD e mcm'] },
    { level: 'Medie', topic: 'Potenze e Radici', icon: '🔋', graphHint: 'exponential', area: 'Aritmetica',
      subtypes: ['Proprietà delle potenze', 'Espressioni con potenze', 'Radici quadrate', 'Notazione scientifica'] },
    { level: 'Medie', topic: 'Numeri Relativi', icon: '🔄', graphHint: 'bar-chart', area: 'Aritmetica',
      subtypes: ['Somma algebrica', 'Moltiplicazione e divisione', 'Espressioni con i relativi', 'Problemi con i relativi'] },
    { level: 'Medie', topic: 'Proporzioni e Percentuali', icon: '📊', graphHint: 'bar-chart', area: 'Aritmetica',
      subtypes: ['Proporzioni', 'Percentuali', 'Sconti e aumenti', 'Problemi del tre semplice'] },
    { level: 'Medie', topic: 'Monomi e Polinomi', icon: '🔤', graphHint: 'none', area: 'Algebra',
      subtypes: ['Operazioni con monomi', 'Somma di polinomi', 'Prodotto di polinomi', 'Espressioni letterali'] },
    { level: 'Medie', topic: 'Equazioni di Primo Grado', icon: '🔢', graphHint: 'linear', area: 'Algebra',
      subtypes: ['Equazioni intere', 'Equazioni con frazioni', 'Problemi con equazioni', 'Verifica della soluzione'] },
    { level: 'Medie', topic: 'Geometria Piana', icon: '📏', graphHint: 'geometry', area: 'Geometria',
      subtypes: ['Triangoli', 'Quadrilateri', 'Circonferenza e cerchio', 'Problemi con le aree'] },
    { level: 'Medie', topic: 'Teorema di Pitagora', icon: '🔺', graphHint: 'geometry', area: 'Geometria',
      subtypes: ['Calcolo dell\'ipotenusa', 'Calcolo di un cateto', 'Applicazioni alle figure piane', 'Problemi reali'] },
    { level: 'Medie', topic: 'Geometria Solida', icon: '🧊', graphHint: 'none', area: 'Geometria',
      subtypes: ['Volumi', 'Superfici', 'Prismi e cilindri', 'Problemi con i solidi'] },
    { level: 'Medie', topic: 'Piano Cartesiano', icon: '📍', graphHint: 'linear', area: 'Geometria analitica',
      subtypes: ['Punti e coordinate', 'Distanza tra due punti', 'Punto medio', 'Perimetri e aree nel piano'] },
    { level: 'Medie', topic: 'Statistica e Grafici', icon: '📊', graphHint: 'bar-chart', area: 'Probabilità e statistica',
      subtypes: ['Media, moda e mediana', 'Lettura di grafici', 'Tabelle di frequenza', 'Problemi con dati'] },
    { level: 'Medie', topic: 'Probabilità di Base', icon: '🎲', graphHint: 'bar-chart', area: 'Probabilità e statistica',
      subtypes: ['Probabilità semplice', 'Eventi complementari', 'Probabilità con dadi e carte', 'Problemi di probabilità'] },

    // ===== SUPERIORI (biennio) =====
    { level: 'Superiori', topic: 'Radicali', icon: '√', graphHint: 'none', area: 'Algebra',
      subtypes: ['Semplificazione', 'Operazioni con radicali', 'Razionalizzazione', 'Potenze con esponente frazionario'] },
    { level: 'Superiori', topic: 'Polinomi e Prodotti Notevoli', icon: '🧮', graphHint: 'none', area: 'Algebra',
      subtypes: ['Quadrato di binomio', 'Cubo di binomio', 'Somma per differenza', 'Divisione tra polinomi', 'Regola di Ruffini'] },
    { level: 'Superiori', topic: 'Scomposizione in Fattori', icon: '🧩', graphHint: 'none', area: 'Algebra',
      subtypes: ['Raccoglimento totale e parziale', 'Differenza di quadrati', 'Trinomio speciale', 'Somma e differenza di cubi', 'Scomposizione con Ruffini'] },
    { level: 'Superiori', topic: 'Frazioni Algebriche', icon: '➗', graphHint: 'none', area: 'Algebra',
      subtypes: ['Semplificazione', 'Operazioni', 'Espressioni', 'Condizioni di esistenza'] },
    { level: 'Superiori', topic: 'Equazioni Fratte', icon: '🔣', graphHint: 'none', area: 'Algebra',
      subtypes: ['Di primo grado', 'Di secondo grado', 'Con parametro', 'Problemi con equazioni fratte'] },
    { level: 'Superiori', topic: 'Equazioni di Secondo Grado', icon: '📈', graphHint: 'quadratic', area: 'Algebra',
      subtypes: ['Complete', 'Spurie e pure', 'Con parametro', 'Somma e prodotto delle radici', 'Problemi di secondo grado'] },
    { level: 'Superiori', topic: 'Sistemi di Equazioni', icon: '🔀', graphHint: 'system', area: 'Algebra',
      subtypes: ['Metodo di sostituzione', 'Metodo di riduzione', 'Metodo di Cramer', 'Sistemi fratti', 'Problemi con sistemi'] },
    { level: 'Superiori', topic: 'Disequazioni', icon: '⚖️', graphHint: 'quadratic', area: 'Algebra',
      subtypes: ['Di primo grado', 'Di secondo grado', 'Fratte', 'Di grado superiore'] },
    { level: 'Superiori', topic: 'Sistemi di Disequazioni', icon: '⛓️', graphHint: 'custom', area: 'Algebra',
      subtypes: ['Di primo grado', 'Di secondo grado', 'Fratte', 'Con condizioni di esistenza'] },
    { level: 'Superiori', topic: 'Equazioni e Disequazioni con Valore Assoluto', icon: '|x|', graphHint: 'custom', area: 'Algebra',
      subtypes: ['Equazioni elementari', 'Disequazioni elementari', 'Con due valori assoluti', 'Miste'] },
    { level: 'Superiori', topic: 'Retta nel Piano Cartesiano', icon: '📏', graphHint: 'linear', area: 'Geometria analitica',
      subtypes: ['Equazione della retta', 'Rette parallele e perpendicolari', 'Distanza punto-retta', 'Fasci di rette', 'Problemi con triangoli'] },
    { level: 'Superiori', topic: 'Geometria Euclidea', icon: '📐', graphHint: 'geometry', area: 'Geometria',
      subtypes: ['Criteri di congruenza', 'Teoremi sui triangoli', 'Parallelogrammi', 'Circonferenza e corde', 'Similitudine'] },
    { level: 'Superiori', topic: 'Statistica Descrittiva', icon: '📊', graphHint: 'bar-chart', area: 'Probabilità e statistica',
      subtypes: ['Media, varianza e scarto quadratico', 'Frequenze e istogrammi', 'Mediana e quartili', 'Problemi con dati reali'] },

    // ===== SUPERIORI (triennio) =====
    { level: 'Superiori', topic: 'Parabola', icon: '🌉', graphHint: 'quadratic', area: 'Geometria analitica',
      subtypes: ['Vertice, fuoco e direttrice', 'Parabola per tre punti', 'Rette tangenti', 'Problemi con la parabola'] },
    { level: 'Superiori', topic: 'Circonferenza', icon: '⭕', graphHint: 'geometry', area: 'Geometria analitica',
      subtypes: ['Equazione della circonferenza', 'Centro e raggio', 'Rette tangenti', 'Circonferenza per tre punti'] },
    { level: 'Superiori', topic: 'Ellisse e Iperbole', icon: '🪐', graphHint: 'none', area: 'Geometria analitica',
      subtypes: ['Equazione canonica dell\'ellisse', 'Equazione canonica dell\'iperbole', 'Eccentricità', 'Rette tangenti'] },
    { level: 'Superiori', topic: 'Funzioni e Dominio', icon: 'ƒ', graphHint: 'custom', area: 'Analisi',
      subtypes: ['Dominio di funzioni razionali', 'Dominio con radici', 'Dominio con logaritmi', 'Funzioni pari e dispari', 'Composizione di funzioni'] },
    { level: 'Superiori', topic: 'Funzioni Irrazionali', icon: '√x', graphHint: 'custom', area: 'Analisi',
      subtypes: ['Equazioni irrazionali', 'Disequazioni irrazionali', 'Dominio e segno', 'Grafici con radici'] },
    { level: 'Superiori', topic: 'Goniometria', icon: '🌀', graphHint: 'trigonometric', area: 'Trigonometria',
      subtypes: ['Angoli e radianti', 'Funzioni goniometriche', 'Archi associati', 'Formule di addizione', 'Formule di duplicazione e bisezione'] },
    { level: 'Superiori', topic: 'Equazioni Goniometriche', icon: '〰️', graphHint: 'trigonometric', area: 'Trigonometria',
      subtypes: ['Elementari', 'Riconducibili a elementari', 'Lineari in seno e coseno', 'Omogenee di secondo grado', 'Disequazioni goniometriche'] },
    { level: 'Superiori', topic: 'Equazioni Esponenziali', icon: '🚀', graphHint: 'exponential', area: 'Analisi',
      subtypes: ['Con la stessa base', 'Con sostituzione', 'Disequazioni esponenziali', 'Problemi di crescita e decadimento'] },
    { level: 'Superiori', topic: 'Equazioni Logaritmiche', icon: '📉', graphHint: 'custom', area: 'Analisi',
      subtypes: ['Proprietà dei logaritmi', 'Equazioni logaritmiche', 'Disequazioni logaritmiche', 'Cambio di base'] },
    { level: 'Superiori', topic: 'Limiti', icon: '♾️', graphHint: 'custom', area: 'Analisi',
      subtypes: ['Forme indeterminate', 'Limiti notevoli', 'Limiti con confronto', 'Definizione e verifica'] },
    { level: 'Superiori', topic: 'Continuità e Asintoti', icon: '🛤️', graphHint: 'custom', area: 'Analisi',
      subtypes: ['Asintoti orizzontali e verticali', 'Asintoti obliqui', 'Punti di discontinuità', 'Continuità con parametro'] },
    { level: 'Superiori', topic: 'Studio di Funzione', icon: '🔬', graphHint: 'custom', area: 'Analisi',
      subtypes: ['Razionale fratta', 'Irrazionale', 'Esponenziale', 'Logaritmica', 'Con valore assoluto'] },
    { level: 'Superiori', topic: 'Successioni e Progressioni', icon: '🪜', graphHint: 'custom', area: 'Analisi',
      subtypes: ['Progressioni aritmetiche', 'Progressioni geometriche', 'Limiti di successioni', 'Principio di induzione'] },
    { level: 'Superiori', topic: 'Calcolo Combinatorio', icon: '🃏', graphHint: 'none', area: 'Probabilità e statistica',
      subtypes: ['Permutazioni', 'Disposizioni', 'Combinazioni', 'Binomio di Newton', 'Problemi misti'] },
    { level: 'Superiori', topic: 'Probabilità', icon: '🎲', graphHint: 'bar-chart', area: 'Probabilità e statistica',
      subtypes: ['Probabilità classica', 'Probabilità composta', 'Probabilità condizionata', 'Teorema di Bayes', 'Variabili aleatorie discrete'] },
    { level: 'Superiori', topic: 'Numeri Complessi', icon: 'ℂ', graphHint: 'none', area: 'Algebra',
      subtypes: ['Forma algebrica', 'Forma trigonometrica', 'Potenze e radici', 'Equazioni in campo complesso'] },

    // ===== UNIVERSITÀ =====
    { level: 'Università', topic: 'Derivate', icon: '𝑓\'', graphHint: 'derivative', area: 'Analisi',
      subtypes: ['Derivate fondamentali', 'Regole di derivazione', 'Derivata di funzione composta', 'Retta tangente', 'Problemi di massimo e minimo'] },
    { level: 'Università', topic: 'Integrali', icon: '∫', graphHint: 'integral', area: 'Analisi',
      subtypes: ['Integrali immediati', 'Per sostituzione', 'Per parti', 'Funzioni razionali fratte', 'Integrali definiti e aree'] },
    { level: 'Università', topic: 'Equazioni Differenziali', icon: '📝', graphHint: 'custom', area: 'Analisi',
      subtypes: ['A variabili separabili', 'Lineari del primo ordine', 'Lineari del secondo ordine omogenee', 'Problemi di Cauchy'] },
    { level: 'Università', topic: 'Algebra Lineare', icon: '🔢', graphHint: 'none', area: 'Algebra',
      subtypes: ['Matrici e operazioni', 'Determinanti', 'Sistemi lineari', 'Autovalori e autovettori', 'Spazi vettoriali'] },
    { level: 'Università', topic: 'Serie e Successioni', icon: '∑', graphHint: 'custom', area: 'Analisi',
      subtypes: ['Serie geometriche', 'Criteri di convergenza', 'Serie a segni alterni', 'Serie di potenze'] },
];
```

- [ ] **Step 2: Validare il catalogo con Node**

Run (dalla root del progetto):

```bash
node -e "
global.window = {};
require('./topics.js');
const T = global.window.TOPICS;
const counts = {};
T.forEach(t => counts[t.level] = (counts[t.level] || 0) + 1);
console.log('counts:', counts, 'total:', T.length);
const hints = new Set(['linear','quadratic','trigonometric','exponential','system','derivative','integral','bar-chart','fraction-pie','custom','geometry','none']);
const areas = new Set(['Aritmetica','Algebra','Geometria','Geometria analitica','Trigonometria','Analisi','Probabilità e statistica']);
const bad = T.filter(t => !t.topic || !t.icon || !hints.has(t.graphHint) || !areas.has(t.area) || !Array.isArray(t.subtypes) || t.subtypes.length < 3);
const dupes = T.map(t => t.level + '|' + t.topic).filter((v, i, a) => a.indexOf(v) !== i);
console.log('bad:', bad.map(t => t.topic), 'dupes:', dupes);
process.exit(bad.length || dupes.length ? 1 : 0);
"
```

Expected output:
```
counts: { Elementari: 5, Medie: 13, Superiori: 29, 'Università': 5 } total: 52
bad: [] dupes: []
```

- [ ] **Step 3: Aggiornare la tabella graphHint nella spec**

Nella spec `docs/superpowers/specs/2026-07-07-espansione-argomenti-design.md` correggere le 4 righe di tabella secondo la tabella "Correzioni ai graphHint" in cima a questo piano (Geometria Solida → `none`, Circonferenza → `geometry`, Ellisse e Iperbole → `none`, Equazioni Logaritmiche → `custom`).

- [ ] **Step 4: Verifica manuale rapida nel browser**

Run: `python3 -m http.server 8000` e aprire `http://localhost:8000`.
Expected: la griglia mostra i nuovi argomenti (l'app ignora `area`/`subtypes` per ora, nessun errore in console); cliccando "Superiori" si contano 29 card + la card "Altro".

- [ ] **Step 5: Commit**

```bash
git add topics.js docs/superpowers/specs/2026-07-07-espansione-argomenti-design.md
git commit -m "Expand topic catalog to 52 entries with area and subtypes"
```

---

### Task 2: Parametro `subtype` in `gemini.js`

**Files:**
- Modify: `gemini.js:65-104` (`buildSystemPrompt`), `gemini.js:176-201` (`generateExercise`)

**Interfaces:**
- Consumes: niente.
- Produces: `GeminiAPI.generateExercise(level, topic, graphHint, onStatus, difficulty = 'medio', subtype = '')` — il sesto parametro è una stringa; vuota = nessun vincolo. I task 6 e 7 la passano da `app.js`.

- [ ] **Step 1: Estendere `buildSystemPrompt` con il sotto-tipo**

In `gemini.js`, cambiare la firma alla riga 65 da:

```js
    function buildSystemPrompt(level, topic, graphHint, difficulty) {
```

a:

```js
    function buildSystemPrompt(level, topic, graphHint, difficulty, subtype) {
```

Subito dopo la riga `const difficultyNote = ...` (riga 76) aggiungere:

```js
        const subtypeNote = subtype
            ? `\nTipo di esercizio richiesto: "${subtype}". L'esercizio DEVE essere specificamente di questo tipo, restando nell'ambito dell'argomento "${topic}".`
            : '';
```

e nel template string del prompt cambiare la riga:

```
Livello di difficoltà: ${difficultyNote}
```

in:

```
Livello di difficoltà: ${difficultyNote}${subtypeNote}
```

- [ ] **Step 2: Estendere `generateExercise`**

Cambiare la firma alla riga 176 da:

```js
    async function generateExercise(level, topic, graphHint, onStatus, difficulty = 'medio') {
```

a:

```js
    async function generateExercise(level, topic, graphHint, onStatus, difficulty = 'medio', subtype = '') {
```

Cambiare la costruzione del system prompt (riga 184) in:

```js
        const systemPrompt = buildSystemPrompt(level, topic, graphHint, difficulty, subtype);
```

Cambiare il messaggio utente (riga 195) da:

```js
                    content: `Genera un esercizio di "${topic}" per il livello "${level}". Rispondi SOLO con JSON valido.`
```

a:

```js
                    content: `Genera un esercizio di "${topic}"${subtype ? ` (tipo: ${subtype})` : ''} per il livello "${level}". Rispondi SOLO con JSON valido.`
```

- [ ] **Step 3: Verificare la sintassi**

Run: `node --check gemini.js`
Expected: nessun output (exit 0).

- [ ] **Step 4: Verificare la retrocompatibilità del prompt**

Run:

```bash
node -e "
global.window = {};
global.localStorage = { getItem: () => null, setItem: () => {} };
require('./gemini.js');
console.log(typeof global.window.GeminiAPI.generateExercise);
"
```

Expected output: `function`

(la chiamata a 5 argomenti resta valida: `subtype` ha default `''` e con stringa vuota il prompt è identico a prima).

- [ ] **Step 5: Commit**

```bash
git add gemini.js
git commit -m "Accept optional exercise subtype in LLM prompt"
```

---

### Task 3: Filtri macro-area sopra la griglia

**Files:**
- Modify: `index.html:110-116` (sezione topics)
- Modify: `app.js` (refs, stato, `getFilteredTopics`, `renderTopicCards`, nav livelli, `init`)
- Modify: `style.css` (nuovo blocco stili in fondo al file)

**Interfaces:**
- Consumes: `t.area` da Task 1.
- Produces: stato `currentArea` (string, `'all'` = nessun filtro); `getFilteredTopics(levelFilter, textFilter, areaFilter)` con terzo parametro; funzione `renderAreaFilters()`. Il Task 4 riusa la firma a 3 parametri.

- [ ] **Step 1: Aggiungere il contenitore dei chip in `index.html`**

In `index.html`, dentro `<section class="topics-section" ...>`, subito dopo il div `.section-header` (riga 114, dopo `</div>`), aggiungere:

```html
            <div class="area-filters" id="area-filters" hidden></div>
```

- [ ] **Step 2: Stato, refs e filtro area in `app.js`**

Aggiungere il ref DOM dopo la riga `const topicsGrid = ...` (riga 19):

```js
    const areaFilters = document.getElementById('area-filters');
```

Aggiungere lo stato dopo `let currentLevel = 'all';` (riga 74):

```js
    let currentArea = 'all';
```

Aggiungere la costante d'ordinamento dopo `const MAX_DIFFICULTY = ...` (riga 70):

```js
    // Ordine fisso delle macro-aree nei chip di filtro
    const AREA_ORDER = ['Aritmetica', 'Algebra', 'Geometria', 'Geometria analitica', 'Trigonometria', 'Analisi', 'Probabilità e statistica'];
```

Sostituire `getFilteredTopics` (righe 156-165) con:

```js
    function getFilteredTopics(levelFilter, textFilter, areaFilter) {
        return topics.filter(t => {
            if (levelFilter && levelFilter !== 'all' && t.level !== levelFilter) return false;
            if (areaFilter && areaFilter !== 'all' && t.area !== areaFilter) return false;
            if (textFilter) {
                const q = textFilter.toLowerCase();
                return t.topic.toLowerCase().includes(q) || t.level.toLowerCase().includes(q);
            }
            return true;
        });
    }
```

(la chiamata esistente in `buildDropdown` — `getFilteredTopics('all', filter)` — resta valida: `areaFilter` undefined non filtra. Il dropdown di ricerca ignora volutamente il filtro area.)

- [ ] **Step 3: Renderizzare i chip**

Aggiungere subito prima di `function renderTopicCards()` (riga 168):

```js
    // ===== AREA FILTER CHIPS =====
    function renderAreaFilters() {
        const levelTopics = topics.filter(t => currentLevel === 'all' || t.level === currentLevel);
        const areas = [...new Set(levelTopics.map(t => t.area).filter(Boolean))]
            .sort((a, b) => AREA_ORDER.indexOf(a) - AREA_ORDER.indexOf(b));

        areaFilters.innerHTML = '';
        areaFilters.hidden = areas.length === 0;
        if (areas.length === 0) return;

        const makeChip = (label, value) => {
            const btn = document.createElement('button');
            btn.className = 'area-chip' + (currentArea === value ? ' active' : '');
            btn.type = 'button';
            btn.textContent = label;
            btn.addEventListener('click', () => {
                if (currentArea === value) return;
                currentArea = value;
                renderAreaFilters();
                renderTopicCards();
            });
            return btn;
        };

        areaFilters.appendChild(makeChip('Tutte', 'all'));
        areas.forEach(a => areaFilters.appendChild(makeChip(a, a)));
    }
```

In `renderTopicCards` cambiare la prima riga (riga 169) da:

```js
        const filtered = getFilteredTopics(currentLevel);
```

a:

```js
        const filtered = getFilteredTopics(currentLevel, '', currentArea);
```

e aggiornare il messaggio "nessun risultato" (riga 177) da `Prova a cambiare il livello selezionato` a `Prova a cambiare livello, area o testo di ricerca`.

- [ ] **Step 4: Reset del filtro al cambio livello e init**

Nel listener dei `navLevelBtns` (righe 711-719), dopo `currentLevel = btn.dataset.level;` aggiungere:

```js
                currentArea = 'all';
                renderAreaFilters();
```

In `init()` (riga 88), prima di `renderTopicCards();` aggiungere:

```js
        renderAreaFilters();
```

- [ ] **Step 5: Stili dei chip**

In fondo a `style.css` aggiungere:

```css
/* ===== AREA FILTER CHIPS ===== */
.area-filters {
    display: flex; flex-wrap: wrap; justify-content: center;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
}

.area-filters[hidden] { display: none; }

.area-chip {
    padding: var(--space-2) var(--space-4);
    border: 1.5px solid var(--color-border-strong);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    font-family: var(--font-family);
    font-size: var(--font-size-xs); font-weight: 600;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.area-chip:hover:not(.active) {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text-primary);
}

.area-chip.active {
    background: #007AFF;
    border-color: #007AFF;
    color: white;
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.35);
}
```

- [ ] **Step 6: Verifica sintassi e manuale**

Run: `node --check app.js` → nessun output.

Browser (`python3 -m http.server 8000`):
1. Livello "Superiori" → chip: Tutte, Algebra, Geometria, Geometria analitica, Trigonometria, Analisi, Probabilità e statistica.
2. Clic su "Algebra" → restano solo le card di area Algebra + la card "Altro"; il chip è evidenziato.
3. Cambiare livello → il filtro torna su "Tutte".
4. Livello "Tutti" → i chip mostrano tutte le aree presenti nel catalogo.

- [ ] **Step 7: Commit**

```bash
git add index.html app.js style.css
git commit -m "Add macro-area filter chips above topic grid"
```

---

### Task 4: La ricerca filtra live la griglia

**Files:**
- Modify: `app.js` (stato, `renderTopicCards`, listener di `searchInput`/`searchClear`)

**Interfaces:**
- Consumes: `getFilteredTopics(levelFilter, textFilter, areaFilter)` da Task 3.
- Produces: stato `currentSearchText` (string, '' = nessun filtro), combinato in AND con `currentArea` dentro `renderTopicCards`.

- [ ] **Step 1: Stato e filtro testo**

In `app.js` aggiungere dopo `let currentArea = 'all';`:

```js
    let currentSearchText = '';
```

In `renderTopicCards` cambiare:

```js
        const filtered = getFilteredTopics(currentLevel, '', currentArea);
```

in:

```js
        const filtered = getFilteredTopics(currentLevel, currentSearchText, currentArea);
```

- [ ] **Step 2: Aggiornare i listener della ricerca**

Nel listener `searchInput.addEventListener('input', ...)` (righe 690-695), dopo `searchClear.hidden = val.length === 0;` aggiungere:

```js
            currentSearchText = val;
            renderTopicCards();
```

Nel listener `searchClear.addEventListener('click', ...)` (righe 700-705), dopo `searchClear.hidden = true;` aggiungere:

```js
            currentSearchText = '';
            renderTopicCards();
```

(il dropdown esistente resta invariato: continua a cercare su tutti i livelli e a offrire l'argomento personalizzato.)

- [ ] **Step 3: Verifica sintassi e manuale**

Run: `node --check app.js` → nessun output.

Browser:
1. Digitare "equaz" → la griglia mostra solo gli argomenti con "equaz" nel nome (più la card "Altro"); il dropdown continua a comparire.
2. Con livello "Superiori" + chip "Algebra" + testo "fratte" → restano solo le voci di algebra delle Superiori che contengono "fratte".
3. Clic sulla X della ricerca → griglia ripristinata (rispettando livello e area attivi).

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "Filter topic grid live while typing in search"
```

---

### Task 5: Refactor della card esercizio a template clonabile

Prerequisito per il batch (Task 7): oggi la card è un blocco statico con ID
fissi; serve poterne renderizzare N. Un unico percorso di rendering: anche il
singolo esercizio passa da `showExercises([exercise])`.

**Files:**
- Modify: `index.html:171-251` (sostituire l'`<article id="exercise-card">` statico)
- Modify: `app.js` (refs, `showLoading`, `showExercise`→`showExercises`, `buildExerciseCard`, `togglePanel`, `handleError`, export PDF, listener)
- Modify: `style.css:798` (`#graph-canvas` → `.graph-canvas`) + nuovi stili

**Interfaces:**
- Consumes: niente di nuovo.
- Produces: `showExercises(results)` dove `results` è `Array<exercise|null>` (i null vengono saltati; usato dal Task 7); `buildExerciseCard(exercise, index, total)` che ritorna un DocumentFragment; contenitore `#exercise-cards`; template `#exercise-card-template`. La barra `#difficulty-adjust` esce dalla card e diventa un'istanza unica sotto il contenitore.

- [ ] **Step 1: Sostituire la card statica in `index.html`**

Sostituire l'intero blocco `<!-- Exercise Card --> <article class="exercise-card" id="exercise-card" hidden> ... </article>` (righe 171-251) con:

```html
            <!-- Exercise Cards (una card per esercizio generato) -->
            <div class="exercise-cards" id="exercise-cards" hidden></div>

            <!-- Difficulty adjust (istanza unica sotto tutte le card) -->
            <div class="difficulty-adjust" id="difficulty-adjust" hidden>
                <span class="difficulty-adjust-label">Difficoltà adatta a te?</span>
                <div class="difficulty-adjust-btns">
                    <button class="difficulty-adjust-btn" id="easier-btn" data-step="-1">
                        <span>😌</span> Più facile
                    </button>
                    <span class="difficulty-adjust-current" id="difficulty-current">Intermedio</span>
                    <button class="difficulty-adjust-btn" id="harder-btn" data-step="1">
                        <span>🔥</span> Più difficile
                    </button>
                </div>
            </div>

            <template id="exercise-card-template">
                <article class="exercise-card">
                    <p class="exercise-number" hidden></p>

                    <!-- Theory -->
                    <div class="exercise-section">
                        <button class="section-toggle theory-toggle" aria-expanded="false">
                            <div class="toggle-left">
                                <span class="toggle-icon">📖</span>
                                <span class="toggle-label">Cosa serve sapere</span>
                            </div>
                            <span class="toggle-subtitle">La teoria necessaria</span>
                            <svg class="toggle-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div class="section-panel" role="region" hidden>
                            <div class="panel-content theory-content"></div>
                        </div>
                    </div>

                    <!-- Exercise Text + Result -->
                    <div class="exercise-section exercise-text-section">
                        <div class="exercise-text-header">
                            <span class="toggle-icon">✏️</span>
                            <h3>Esercizio</h3>
                        </div>
                        <div class="exercise-text-body"></div>
                        <div class="exercise-result">
                            <span class="result-label">Risultato:</span>
                            <div class="result-value"></div>
                        </div>
                    </div>

                    <!-- Solution -->
                    <div class="exercise-section">
                        <button class="section-toggle solution-toggle" aria-expanded="false">
                            <div class="toggle-left">
                                <span class="toggle-icon">🧮</span>
                                <span class="toggle-label">Svolgimento completo</span>
                            </div>
                            <span class="toggle-subtitle">Vedi passo per passo</span>
                            <svg class="toggle-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div class="section-panel" role="region" hidden>
                            <div class="panel-content solution-content"></div>
                        </div>
                    </div>

                    <!-- Graph -->
                    <div class="exercise-section graph-section">
                        <button class="section-toggle graph-toggle" aria-expanded="false">
                            <div class="toggle-left">
                                <span class="toggle-icon">📊</span>
                                <span class="toggle-label">Visualizza grafico</span>
                            </div>
                            <span class="toggle-subtitle">Rappresentazione visiva</span>
                            <svg class="toggle-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </button>
                        <div class="section-panel" role="region" hidden>
                            <div class="panel-content">
                                <div class="graph-container">
                                    <canvas class="graph-canvas" width="700" height="450"></canvas>
                                    <span class="graph-hint">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                                        Scorri per zoom · Trascina per spostarti · Doppio clic per reset
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </template>
```

- [ ] **Step 2: Aggiornare i refs DOM in `app.js`**

Rimuovere i refs statici (righe 40-50):

```js
    const theoryToggle = document.getElementById('theory-toggle');
    const theoryPanel = document.getElementById('theory-panel');
    const theoryContent = document.getElementById('theory-content');
    const exerciseTextBody = document.getElementById('exercise-text-body');
    const resultValue = document.getElementById('result-value');
    const solutionToggle = document.getElementById('solution-toggle');
    const solutionPanel = document.getElementById('solution-panel');
    const solutionContent = document.getElementById('solution-content');
    const graphToggle = document.getElementById('graph-toggle');
    const graphPanel = document.getElementById('graph-panel');
    const graphCanvas = document.getElementById('graph-canvas');
```

e rimuovere `const exerciseCard = document.getElementById('exercise-card');` (riga 38). Al loro posto:

```js
    const exerciseCards = document.getElementById('exercise-cards');
    const cardTemplate = document.getElementById('exercise-card-template');
    const difficultyAdjust = document.getElementById('difficulty-adjust');
```

- [ ] **Step 3: Nuovo rendering delle card**

Sostituire per intero `showExercise` (righe 592-625) con:

```js
    function buildExerciseCard(exercise, index, total) {
        const frag = cardTemplate.content.cloneNode(true);
        const card = frag.querySelector('.exercise-card');

        if (total > 1) {
            const num = card.querySelector('.exercise-number');
            num.hidden = false;
            num.textContent = `Esercizio ${index + 1} di ${total}`;
        }

        card.querySelector('.theory-content').innerHTML = cleanMathHtml(exercise.theory) || '<p>Teoria non disponibile.</p>';
        card.querySelector('.exercise-text-body').innerHTML = cleanMathHtml(exercise.exerciseText) || '<p>Esercizio non disponibile.</p>';
        card.querySelector('.result-value').innerHTML = cleanMathHtml(exercise.result) || '—';
        card.querySelector('.solution-content').innerHTML = cleanMathHtml(exercise.solution) || '<p>Svolgimento non disponibile.</p>';

        const graphSection = card.querySelector('.graph-section');
        const graphToggleEl = card.querySelector('.graph-toggle');
        if (exercise.graph && exercise.graph.type) {
            // Render lazy: il grafico viene disegnato alla prima apertura del pannello
            graphToggleEl._graphData = exercise.graph;
            graphToggleEl._canvas = card.querySelector('.graph-canvas');
        } else {
            graphSection.hidden = true;
        }

        card.querySelectorAll('.section-toggle').forEach(btn => {
            const panel = btn.nextElementSibling;
            btn.addEventListener('click', () => togglePanel(btn, panel));
        });

        return frag;
    }

    function showExercises(results) {
        loadingState.hidden = true;
        errorState.hidden = true;
        exerciseCards.hidden = false;
        if (difficultyAdjust) difficultyAdjust.hidden = false;
        if (pdfBtn) pdfBtn.hidden = false;

        updateDifficultyAdjust();

        exerciseCards.innerHTML = '';
        const total = results.length;
        results.forEach((ex, i) => {
            if (!ex) return;
            exerciseCards.appendChild(buildExerciseCard(ex, i, total));
        });

        exerciseCards.style.animation = 'none';
        void exerciseCards.offsetWidth;
        exerciseCards.style.animation = 'fadeIn 0.4s ease-out';
    }
```

Nel `try` di `generateExercise` (riga 409) cambiare `showExercise(exercise);` in `showExercises([exercise]);`.

- [ ] **Step 4: `togglePanel`, `showLoading`, `handleError`**

Sostituire `togglePanel` (righe 645-658) con:

```js
    function togglePanel(toggleBtn, panel) {
        const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
            collapsePanel(toggleBtn, panel);
        } else {
            expandPanel(toggleBtn, panel);
            // Pannello grafico: disegna sul canvas della propria card
            if (toggleBtn._graphData && toggleBtn._canvas) {
                setTimeout(() => {
                    window.MathGraph.render(toggleBtn._canvas, toggleBtn._graphData);
                }, 150);
            }
        }
    }
```

In `showLoading` (righe 424-429) sostituire `exerciseCard.hidden = true;` con:

```js
        exerciseCards.hidden = true;
        if (difficultyAdjust) difficultyAdjust.hidden = true;
```

In `handleError` (riga 630) sostituire `exerciseCard.hidden = true;` con:

```js
        exerciseCards.hidden = true;
        if (difficultyAdjust) difficultyAdjust.hidden = true;
```

- [ ] **Step 5: Aggiornare l'export PDF e i listener**

Nel listener di `pdfBtn` (righe 748-855):

1. Sostituire il blocco "Expand all panels for PDF" (righe 753-760) con:

```js
                // Espandi tutti i pannelli di tutte le card e disegna i grafici
                exerciseCards.querySelectorAll('.section-toggle').forEach(toggle => {
                    const panel = toggle.nextElementSibling;
                    if (panel && panel.hidden) {
                        toggle.setAttribute('aria-expanded', 'true');
                        panel.hidden = false;
                    }
                    if (toggle._graphData && toggle._canvas) {
                        window.MathGraph.render(toggle._canvas, toggle._graphData);
                    }
                });
```

2. Cambiare `const element = document.getElementById('exercise-card');` (riga 762) in `const element = document.getElementById('exercise-cards');`
3. Nell'`onclone` cambiare `const card = clonedDoc.getElementById('exercise-card');` (riga 778) in `const card = clonedDoc.getElementById('exercise-cards');`

In `bindEvents` rimuovere i tre listener statici dei toggle (righe 863-866):

```js
        // Toggles
        theoryToggle.addEventListener('click', () => togglePanel(theoryToggle, theoryPanel));
        solutionToggle.addEventListener('click', () => togglePanel(solutionToggle, solutionPanel));
        graphToggle.addEventListener('click', () => togglePanel(graphToggle, graphPanel));
```

(il wiring avviene ora in `buildExerciseCard`). Cambiare inoltre (righe 860-861):

```js
        generateBtn.addEventListener('click', generateExercise);
        retryBtn.addEventListener('click', generateExercise);
```

in:

```js
        generateBtn.addEventListener('click', () => generateExercise());
        retryBtn.addEventListener('click', () => generateExercise());
```

(evita che l'oggetto evento venga passato come argomento: dal Task 7 `generateExercise` avrà un parametro.)

- [ ] **Step 6: Aggiornare `style.css`**

Alla riga 798 cambiare il selettore `#graph-canvas {` in `.graph-canvas {`.

In fondo al file aggiungere:

```css
/* ===== EXERCISE CARDS (batch) ===== */
.exercise-cards {
    display: flex; flex-direction: column;
    gap: var(--space-8);
}

.exercise-cards[hidden] { display: none; }

.difficulty-adjust[hidden] { display: none; }

.exercise-number {
    font-size: var(--font-size-sm); font-weight: 700;
    color: var(--color-text-secondary);
    text-transform: uppercase; letter-spacing: 0.05em;
}
```

- [ ] **Step 7: Verifica sintassi e manuale**

Run: `node --check app.js` → nessun output.

Browser (con API key configurata):
1. Aprire un argomento → l'esercizio si genera e si mostra come prima.
2. Espandere Teoria, Svolgimento, Grafico → il grafico si disegna (zoom/pan funzionanti sui tipi interattivi).
3. La barra "Difficoltà adatta a te?" compare sotto la card e rigenera al clic.
4. "Genera nuovo esercizio" e "Riprova" (dopo un errore simulato staccando la rete) funzionano.
5. Export PDF → il PDF contiene teoria, esercizio, risultato, svolgimento e grafico disegnato.
6. Tornare agli argomenti e riaprire un altro topic → nessun residuo della card precedente.

- [ ] **Step 8: Commit**

```bash
git add index.html app.js style.css
git commit -m "Render exercise cards from a template to support multiple cards"
```

---

### Task 6: Chip dei sotto-tipi nella schermata esercizio

**Files:**
- Modify: `index.html` (riga dopo `#exercise-header`, righe 146-152)
- Modify: `app.js` (refs, stato `currentSubtype`, `renderSubtypeChips`, `openTopic`, chiamata API)
- Modify: `style.css` (stili chip sotto-tipo)

**Interfaces:**
- Consumes: `t.subtypes` da Task 1; parametro `subtype` di `GeminiAPI.generateExercise` da Task 2.
- Produces: stato `currentSubtype` (string, `''` = "Qualsiasi"), passato come sesto argomento a `generateExercise`. Il Task 7 lo conserva nella riscrittura della funzione.

- [ ] **Step 1: Markup della barra sotto-tipi**

In `index.html`, subito dopo la chiusura del div `#exercise-header` (riga 152, `</div>`), aggiungere:

```html
            <!-- Subtype chips -->
            <div class="subtype-bar" id="subtype-bar" hidden>
                <span class="subtype-label">Tipo di esercizio:</span>
                <div class="subtype-chips" id="subtype-chips"></div>
            </div>
```

- [ ] **Step 2: Stato, refs e rendering in `app.js`**

Refs (vicino agli altri refs della exercise view):

```js
    const subtypeBar = document.getElementById('subtype-bar');
    const subtypeChips = document.getElementById('subtype-chips');
```

Stato (dopo `let currentSearchText = '';`):

```js
    let currentSubtype = ''; // '' = "Qualsiasi"
```

Aggiungere prima di `openTopic`:

```js
    // ===== SUBTYPE CHIPS =====
    function renderSubtypeChips() {
        const subtypes = (currentTopic && currentTopic.subtypes) || [];
        subtypeBar.hidden = subtypes.length === 0;
        subtypeChips.innerHTML = '';
        if (subtypes.length === 0) return;

        const makeChip = (label, value) => {
            const btn = document.createElement('button');
            btn.className = 'subtype-chip' + (currentSubtype === value ? ' active' : '');
            btn.type = 'button';
            btn.textContent = label;
            btn.addEventListener('click', () => {
                if (isGenerating || currentSubtype === value) return;
                currentSubtype = value;
                renderSubtypeChips();
                generateExercise();
            });
            return btn;
        };

        subtypeChips.appendChild(makeChip('Qualsiasi', ''));
        subtypes.forEach(s => subtypeChips.appendChild(makeChip(s, s)));
    }
```

In `openTopic`, dopo `currentTopic = topicObj;` aggiungere:

```js
        currentSubtype = '';
        renderSubtypeChips();
```

(gli argomenti personalizzati di "Altro"/ricerca non hanno `subtypes` → la barra resta nascosta.)

- [ ] **Step 3: Passare il sotto-tipo all'API**

In `generateExercise`, nella chiamata `window.GeminiAPI.generateExercise(...)`, aggiungere `currentSubtype` come sesto argomento dopo `apiDifficulty()`:

```js
            const exercise = await window.GeminiAPI.generateExercise(
                currentTopic.level,
                currentTopic.topic,
                currentTopic.graphHint,
                (statusMsg) => {
                    if (loadingTextEl) loadingTextEl.textContent = statusMsg;
                    generateText.textContent = statusMsg;
                },
                apiDifficulty(),
                currentSubtype
            );
```

- [ ] **Step 4: Stili**

In fondo a `style.css` aggiungere:

```css
/* ===== SUBTYPE CHIPS ===== */
.subtype-bar {
    display: flex; align-items: center; flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--color-bg);
    border: 1px dashed var(--color-border);
    border-radius: var(--radius-lg);
}

.subtype-bar[hidden] { display: none; }

.subtype-label {
    font-size: var(--font-size-sm); font-weight: 600;
    color: var(--color-text-secondary);
    white-space: nowrap;
}

.subtype-chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }

.subtype-chip {
    padding: var(--space-1) var(--space-3);
    border: 1.5px solid var(--color-border-strong);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    font-family: var(--font-family);
    font-size: var(--font-size-xs); font-weight: 600;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.subtype-chip:hover:not(.active) {
    background: rgba(0, 0, 0, 0.05);
    color: var(--color-text-primary);
}

.subtype-chip.active {
    background: #AF52DE;
    border-color: #AF52DE;
    color: white;
    box-shadow: 0 2px 8px rgba(175, 82, 222, 0.35);
}
```

- [ ] **Step 5: Verifica sintassi e manuale**

Run: `node --check app.js` → nessun output.

Browser:
1. Aprire "Equazioni di Secondo Grado" → sotto l'header compare "Tipo di esercizio:" con Qualsiasi (attivo) + i 5 sotto-tipi; la generazione parte subito.
2. Cliccare "Spurie e pure" → rigenera; l'esercizio prodotto è coerente col sotto-tipo (controllare il testo).
3. Cambiare argomento → il sotto-tipo torna su "Qualsiasi".
4. Aprire un argomento da "Altro" → la barra dei sotto-tipi non compare.

- [ ] **Step 6: Commit**

```bash
git add index.html app.js style.css
git commit -m "Add per-topic exercise subtype chips"
```

---

### Task 7: Generazione batch di N esercizi

**Files:**
- Modify: `index.html` (campo N nella top bar; banner batch prima di `#exercise-cards`)
- Modify: `app.js` (refs, `getExerciseCount`, riscrittura di `generateExercise`, `updateBatchWarning`, `showLoading`, listener)
- Modify: `style.css` (stili campo N e banner)

**Interfaces:**
- Consumes: `showExercises(Array<exercise|null>)` da Task 5; `currentSubtype` da Task 6; firma API da Task 2.
- Produces: `generateExercise(onlyMissing?: boolean)`; stato `lastBatch: Array<exercise|null>`; input `#count-input` (1..10).

- [ ] **Step 1: Markup**

In `index.html`, dentro `<div class="top-bar-actions">` (riga 133), prima del bottone `#generate-btn`, aggiungere:

```html
                    <label class="count-field" title="Quanti esercizi generare in un colpo">
                        <span class="count-label">N.</span>
                        <input type="number" id="count-input" class="count-input" min="1" max="10" step="1" value="1" inputmode="numeric" aria-label="Numero di esercizi da generare">
                    </label>
```

Subito prima di `<div class="exercise-cards" id="exercise-cards" hidden></div>` aggiungere:

```html
            <!-- Batch warning (generazioni parziali) -->
            <div class="batch-warning" id="batch-warning" hidden>
                <span class="batch-warning-text" id="batch-warning-text"></span>
                <button class="retry-btn" id="complete-batch-btn">Completa i mancanti</button>
            </div>
```

- [ ] **Step 2: Refs e lettura del conteggio in `app.js`**

Refs (vicino a `generateBtn`):

```js
    const countInput = document.getElementById('count-input');
    const batchWarning = document.getElementById('batch-warning');
    const batchWarningText = document.getElementById('batch-warning-text');
    const completeBatchBtn = document.getElementById('complete-batch-btn');
```

Stato (dopo `let currentSubtype = '';`):

```js
    let lastBatch = []; // esercizi dell'ultimo batch (null = generazione fallita)
```

Aggiungere prima di `generateExercise`:

```js
    function getExerciseCount() {
        const n = parseInt(countInput.value, 10);
        if (isNaN(n) || n < 1) return 1;
        return Math.min(n, 10);
    }
```

- [ ] **Step 3: Riscrivere `generateExercise` con il loop sequenziale**

Sostituire per intero `generateExercise` con:

```js
    async function generateExercise(onlyMissing) {
        if (isGenerating || !currentTopic) return;
        isGenerating = true;

        showLoading();

        generateBtn.disabled = true;
        generateText.textContent = 'Generazione in corso...';
        generateSpinner.hidden = false;
        generateIcon.hidden = true;

        const loadingTextEl = loadingState.querySelector('.loading-text');

        // onlyMissing: riusa l'ultimo batch e rigenera solo i falliti (null)
        const results = onlyMissing === true && lastBatch.length > 0
            ? lastBatch.slice()
            : new Array(getExerciseCount()).fill(null);
        const total = results.length;
        let lastError = null;

        try {
            for (let i = 0; i < total; i++) {
                if (results[i]) continue;
                const prefix = total > 1 ? `Esercizio ${i + 1} di ${total} — ` : '';
                if (loadingTextEl) loadingTextEl.textContent = `${prefix}Groq sta creando il tuo esercizio...`;
                try {
                    results[i] = await window.GeminiAPI.generateExercise(
                        currentTopic.level,
                        currentTopic.topic,
                        currentTopic.graphHint,
                        (statusMsg) => {
                            if (loadingTextEl) loadingTextEl.textContent = prefix + statusMsg;
                            generateText.textContent = statusMsg;
                        },
                        apiDifficulty(),
                        currentSubtype
                    );
                } catch (error) {
                    console.error(`Generation error (esercizio ${i + 1} di ${total}):`, error);
                    lastError = error;
                    // Senza chiave valida fallirebbero tutti: inutile continuare
                    if (error.message === 'API_KEY_MISSING' || error.message === 'API_KEY_INVALID') {
                        throw error;
                    }
                }
            }

            lastBatch = results;

            if (results.every(r => !r)) {
                throw lastError || new Error('Si è verificato un errore. Riprova.');
            }

            showExercises(results);
            updateBatchWarning(results);
        } catch (error) {
            console.error('Generation error:', error);
            handleError(error);
        } finally {
            isGenerating = false;
            generateBtn.disabled = false;
            generateText.textContent = 'Genera nuovo esercizio';
            generateSpinner.hidden = true;
            generateIcon.hidden = false;
            if (loadingTextEl) loadingTextEl.textContent = 'Groq sta creando il tuo esercizio...';
        }
    }

    function updateBatchWarning(results) {
        const missing = results.filter(r => !r).length;
        batchWarning.hidden = missing === 0;
        if (missing > 0) {
            const ok = results.length - missing;
            batchWarningText.textContent = `Generati ${ok} esercizi su ${results.length}. Alcuni non sono riusciti (probabile limite API).`;
        }
    }
```

In `showLoading` aggiungere:

```js
        batchWarning.hidden = true;
```

- [ ] **Step 4: Listener**

In `bindEvents` aggiungere:

```js
        // Batch
        completeBatchBtn.addEventListener('click', () => generateExercise(true));
        countInput.addEventListener('change', () => {
            countInput.value = String(getExerciseCount());
        });
```

(nota: `generateBtn`/`retryBtn` chiamano già `() => generateExercise()` dal Task 5, quindi partono sempre con un batch pulito; anche i controlli di difficoltà e i chip sotto-tipo chiamano `generateExercise()` senza argomenti e rigenerano l'intero batch.)

- [ ] **Step 5: Stili**

In fondo a `style.css` aggiungere:

```css
/* ===== COUNT FIELD ===== */
.count-field {
    display: inline-flex; align-items: center;
    gap: 6px;
    padding: 4px 4px 4px var(--space-3);
    border: 1.5px solid var(--color-border-strong);
    border-radius: var(--radius-full);
    background: var(--color-bg);
}

.count-label {
    font-size: var(--font-size-xs); font-weight: 700;
    color: var(--color-text-secondary);
}

.count-input {
    width: 52px;
    padding: var(--space-1) var(--space-2);
    border: none;
    border-radius: var(--radius-full);
    background: var(--color-surface);
    font-family: var(--font-family);
    font-size: var(--font-size-sm); font-weight: 600;
    text-align: center;
    color: var(--color-text-primary);
}

/* ===== BATCH WARNING ===== */
.batch-warning {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: var(--space-3);
    margin-bottom: var(--space-4);
    padding: var(--space-3) var(--space-5);
    background: rgba(255, 149, 0, 0.08);
    border: 1px solid rgba(255, 149, 0, 0.35);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-sm); font-weight: 600;
    color: #C93400;
}

.batch-warning[hidden] { display: none; }
```

- [ ] **Step 6: Verifica sintassi e manuale**

Run: `node --check app.js` → nessun output.

Browser:
1. N=1 (default) → comportamento identico a prima.
2. N=3, aprire un argomento → status "Esercizio 1 di 3…", poi 2 e 3; alla fine 3 card numerate "Esercizio 1 di 3" ecc., ognuna con i propri pannelli e grafico indipendenti.
3. Con N=3: staccare la rete dopo il primo esercizio → alla fine compaiono le card riuscite + banner "Generati 1 esercizi su 3…" con "Completa i mancanti"; riattivare la rete e cliccarlo → genera solo i 2 mancanti.
4. Export PDF con 3 card → il PDF le contiene tutte con pannelli espansi e grafici.
5. Inserire 0 o 99 nel campo N e uscire dal campo → il valore viene riportato in [1, 10].
6. Cambiare difficoltà o sotto-tipo con N=3 → rigenera l'intero batch di 3.

- [ ] **Step 7: Commit**

```bash
git add index.html app.js style.css
git commit -m "Generate N exercises per run with partial-failure recovery"
```

---

## Verifica finale (dopo tutti i task)

Checklist della spec, tutta nel browser servito con `python3 -m http.server 8000`:

- [ ] Filtri per area funzionanti su ogni livello; reset al cambio livello.
- [ ] Ricerca + filtro area combinati in AND sulla griglia; il dropdown continua a funzionare (salto cross-livello e argomento personalizzato).
- [ ] Generazione singola invariata (N=1).
- [ ] Batch da 3 con successo; batch con fallimento simulato (rete staccata a metà) → banner + "Completa i mancanti".
- [ ] Export PDF di un batch completo.
- [ ] Il sotto-tipo scelto influenza davvero il testo dell'esercizio generato.
- [ ] Nessun errore in console in tutto il flusso.
