# Cronologia + Preferiti Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ogni esercizio generato viene salvato automaticamente in localStorage e resta consultabile in una vista Archivio con preferiti, filtri, ricerca, dettaglio completo (grafico incluso) ed eliminazione singola.

**Architecture:** Nuovo modulo `history.js` (`window.ExerciseHistory`) che possiede da solo storage, tetto e potatura; `app.js` lo chiama nel loop di generazione e renderizza la nuova sezione `#archive-view`, riusando template card, chip e badge esistenti.

**Tech Stack:** Vanilla JS (IIFE + globals su `window`, nessun modulo/import), HTML/CSS statici, `node --test` (Node ≥ 20, installato: v26) solo per i test del modulo storage.

**Spec:** `docs/superpowers/specs/2026-07-14-cronologia-preferiti-design.md`

## Global Constraints

- Nessun build step, nessun package.json, nessuna dipendenza esterna nuova: i file sono serviti così come sono.
- Comunicazione tra script solo via globals su `window`; ordine di caricamento in `index.html`: `topics.js`, `graph.js`, `gemini.js`, **`history.js` (nuovo)**, `app.js`.
- Tutto il testo UI in italiano.
- Chiave localStorage: `mathflow_history` (prefisso `mathflow_` come le chiavi esistenti).
- Tetto: **200 voci non preferite**; i preferiti non vengono mai potati.
- `add()` non deve MAI propagare eccezioni: il salvataggio non può far fallire la generazione.
- Si salva l'esercizio **grezzo** com'esce da `GeminiAPI.generateExercise`; `cleanMathHtml` resta responsabilità esclusiva del rendering.
- Ordine livelli hardcoded: `Elementari, Medie, Superiori, Università`.
- Niente bottone PDF nell'archivio; niente note personali; niente "svuota tutto".
- Working directory per tutti i comandi: la root del repo (`/Users/lorenzofaraoni/Documents/Web Apps/Selettore esercizi ripetizioni`).

---

### Task 1: Modulo `history.js` con test Node

**Files:**
- Create: `history.js`
- Test: `tests/history.test.js`

**Interfaces:**
- Consumes: niente (modulo foglia; legge `globalThis.localStorage` e `globalThis.crypto` a ogni chiamata, mai al load — è ciò che rende possibile stubbarli nei test).
- Produces: `window.ExerciseHistory` (e `module.exports` in Node) con:
  - `add(meta, exercise)` → voce creata `{id, savedAt, level, topic, icon, subtype, difficulty, favorite, exercise}` oppure `null` (storage non disponibile o esercizio falsy). `meta = {level, topic, icon, subtype, difficulty}` tutte stringhe.
  - `list()` → array di voci, **più recente prima**.
  - `toggleFavorite(id)` → nuovo stato boolean di `favorite` (false se id inesistente).
  - `remove(id)` → undefined.

- [ ] **Step 1: Scrivi i test (falliranno)**

Crea `tests/history.test.js`:

```js
'use strict';
const test = require('node:test');
const assert = require('node:assert');

const ExerciseHistory = require('../history.js');

// Stub minimale di localStorage. maxEntries: se impostato, setItem lancia
// QuotaExceededError quando l'array serializzato supera quel numero di voci.
function makeFakeStorage(maxEntries) {
    const map = new Map();
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => {
            if (maxEntries && JSON.parse(v).length > maxEntries) {
                const err = new Error('quota');
                err.name = 'QuotaExceededError';
                throw err;
            }
            map.set(k, String(v));
        },
        removeItem: (k) => { map.delete(k); }
    };
}

function useStorage(storage) {
    Object.defineProperty(globalThis, 'localStorage', {
        value: storage, configurable: true, writable: true
    });
}

const META = { level: 'Medie', topic: 'Frazioni', icon: '🍕', subtype: 'Somma', difficulty: 'difficile' };
const EXERCISE = { theory: '<p>t</p>', exerciseText: '<p>Calcola 1/2 + 1/3</p>', result: '5/6', solution: '<p>s</p>' };

test('add + list: roundtrip con metadati, più recente prima', () => {
    useStorage(makeFakeStorage());
    const a = ExerciseHistory.add(META, EXERCISE);
    const b = ExerciseHistory.add({ ...META, topic: 'Potenze' }, EXERCISE);
    assert.ok(a.id && b.id && a.id !== b.id, 'id presenti e unici');
    assert.ok(!Number.isNaN(Date.parse(a.savedAt)), 'savedAt è una data ISO');
    const entries = ExerciseHistory.list();
    assert.strictEqual(entries.length, 2);
    assert.strictEqual(entries[0].topic, 'Potenze', 'più recente prima');
    assert.strictEqual(entries[1].topic, 'Frazioni');
    assert.strictEqual(entries[1].level, 'Medie');
    assert.strictEqual(entries[1].subtype, 'Somma');
    assert.strictEqual(entries[1].difficulty, 'difficile');
    assert.strictEqual(entries[1].favorite, false);
    assert.deepStrictEqual(entries[1].exercise, EXERCISE);
});

test('add con esercizio falsy ritorna null e non salva', () => {
    useStorage(makeFakeStorage());
    assert.strictEqual(ExerciseHistory.add(META, null), null);
    assert.strictEqual(ExerciseHistory.list().length, 0);
});

test('toggleFavorite inverte e persiste; id inesistente → false', () => {
    useStorage(makeFakeStorage());
    const e = ExerciseHistory.add(META, EXERCISE);
    assert.strictEqual(ExerciseHistory.toggleFavorite(e.id), true);
    assert.strictEqual(ExerciseHistory.list()[0].favorite, true);
    assert.strictEqual(ExerciseHistory.toggleFavorite(e.id), false);
    assert.strictEqual(ExerciseHistory.list()[0].favorite, false);
    assert.strictEqual(ExerciseHistory.toggleFavorite('non-esiste'), false);
});

test('remove elimina solo la voce indicata', () => {
    useStorage(makeFakeStorage());
    const a = ExerciseHistory.add(META, EXERCISE);
    const b = ExerciseHistory.add(META, EXERCISE);
    ExerciseHistory.remove(a.id);
    const entries = ExerciseHistory.list();
    assert.strictEqual(entries.length, 1);
    assert.strictEqual(entries[0].id, b.id);
    ExerciseHistory.remove('non-esiste'); // non deve lanciare
    assert.strictEqual(ExerciseHistory.list().length, 1);
});

test('potatura: oltre 200 non preferite si eliminano le più vecchie, i preferiti restano', () => {
    useStorage(makeFakeStorage());
    const first = ExerciseHistory.add({ ...META, topic: 'Preferito antico' }, EXERCISE);
    ExerciseHistory.toggleFavorite(first.id);
    for (let i = 0; i < 201; i++) {
        ExerciseHistory.add({ ...META, topic: 'Voce ' + i }, EXERCISE);
    }
    const entries = ExerciseHistory.list();
    const unfavorited = entries.filter(e => !e.favorite);
    assert.strictEqual(unfavorited.length, 200, 'tetto rispettato');
    assert.ok(entries.some(e => e.topic === 'Preferito antico'), 'preferito mai potato');
    assert.ok(!entries.some(e => e.topic === 'Voce 0'), 'la non preferita più vecchia è stata potata');
    assert.ok(entries.some(e => e.topic === 'Voce 200'), 'la più recente c\'è');
});

test('quota esaurita: pota aggressivamente e ritenta senza lanciare', () => {
    useStorage(makeFakeStorage(50));
    for (let i = 0; i < 60; i++) {
        ExerciseHistory.add({ ...META, topic: 'Voce ' + i }, EXERCISE);
    }
    const entries = ExerciseHistory.list();
    assert.ok(entries.length > 0 && entries.length <= 50);
    assert.strictEqual(entries[0].topic, 'Voce 59', 'l\'ultima voce aggiunta è presente');
});

test('storage non disponibile: tutte le API sono no-op sicure', () => {
    useStorage(undefined);
    assert.strictEqual(ExerciseHistory.add(META, EXERCISE), null);
    assert.deepStrictEqual(ExerciseHistory.list(), []);
    assert.strictEqual(ExerciseHistory.toggleFavorite('x'), false);
    ExerciseHistory.remove('x'); // non deve lanciare
});

test('JSON corrotto: si riparte da vuoto e si può salvare di nuovo', () => {
    const storage = makeFakeStorage();
    storage.setItem('mathflow_history', '{non-è-json');
    useStorage(storage);
    assert.deepStrictEqual(ExerciseHistory.list(), []);
    ExerciseHistory.add(META, EXERCISE);
    assert.strictEqual(ExerciseHistory.list().length, 1);
});
```

- [ ] **Step 2: Esegui i test e verifica che falliscano**

Run: `node --test tests/history.test.js`
Expected: FAIL — `Cannot find module '../history.js'`

- [ ] **Step 3: Implementa `history.js`**

Crea `history.js`:

```js
// ===== EXERCISE HISTORY =====
// Archivio in localStorage degli esercizi generati (chiave mathflow_history).
// Possiede da solo tetto, potatura e serializzazione: app.js non tocca mai
// la chiave direttamente. Tutte le API sono no-op sicure se lo storage non
// è disponibile: il salvataggio non deve mai far fallire la generazione.
(function () {
    'use strict';

    const STORAGE_KEY = 'mathflow_history';
    const MAX_UNFAVORITED = 200;

    // Letto a ogni chiamata (mai cachato): consente lo stub nei test Node
    // e gestisce lo storage che sparisce a runtime (navigazione privata).
    function getStorage() {
        try {
            return globalThis.localStorage || null;
        } catch (e) {
            return null;
        }
    }

    // Le voci sono in ordine di inserimento: le più vecchie in testa.
    function load() {
        const storage = getStorage();
        if (!storage) return [];
        try {
            const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    // Mantiene al più `cap` voci non preferite eliminando le più vecchie.
    function pruneToCap(entries, cap) {
        let toDrop = entries.filter(en => !en.favorite).length - cap;
        if (toDrop <= 0) return entries;
        return entries.filter(en => {
            if (en.favorite || toDrop <= 0) return true;
            toDrop--;
            return false;
        });
    }

    // Se la quota è esaurita anche dopo la potatura al tetto, dimezza le
    // non preferite e ritenta (max 2 volte), poi rinuncia in silenzio.
    function persist(entries) {
        const storage = getStorage();
        if (!storage) return false;
        let current = pruneToCap(entries, MAX_UNFAVORITED);
        for (let attempt = 0; attempt <= 2; attempt++) {
            try {
                storage.setItem(STORAGE_KEY, JSON.stringify(current));
                return true;
            } catch (e) {
                const unfavorited = current.filter(en => !en.favorite).length;
                if (unfavorited === 0) break;
                current = pruneToCap(current, Math.floor(unfavorited / 2));
            }
        }
        console.warn('ExerciseHistory: salvataggio fallito, archivio non aggiornato');
        return false;
    }

    function makeId() {
        const c = globalThis.crypto;
        if (c && typeof c.randomUUID === 'function') return c.randomUUID();
        return Date.now() + '-' + Math.random().toString(36).slice(2, 10);
    }

    function add(meta, exercise) {
        if (!exercise) return null;
        const entries = load();
        const entry = {
            id: makeId(),
            savedAt: new Date().toISOString(),
            level: meta.level,
            topic: meta.topic,
            icon: meta.icon,
            subtype: meta.subtype || '',
            difficulty: meta.difficulty,
            favorite: false,
            exercise: exercise
        };
        entries.push(entry);
        return persist(entries) ? entry : null;
    }

    function list() {
        return load().slice().reverse(); // più recente prima
    }

    function toggleFavorite(id) {
        const entries = load();
        const entry = entries.find(en => en.id === id);
        if (!entry) return false;
        entry.favorite = !entry.favorite;
        persist(entries);
        return entry.favorite;
    }

    function remove(id) {
        const entries = load();
        const next = entries.filter(en => en.id !== id);
        if (next.length === entries.length) return;
        persist(next);
    }

    const ExerciseHistory = { add, list, toggleFavorite, remove };

    if (typeof window !== 'undefined') window.ExerciseHistory = ExerciseHistory;
    if (typeof module !== 'undefined' && module.exports) module.exports = ExerciseHistory;
})();
```

- [ ] **Step 4: Esegui i test e verifica che passino**

Run: `node --test tests/history.test.js`
Expected: PASS, 8/8 test.

- [ ] **Step 5: Commit**

```bash
git add history.js tests/history.test.js
git commit -m "Add ExerciseHistory localStorage module with pruning and quota fallback"
```

---

### Task 2: Aggancio del salvataggio in `generateExercise`

**Files:**
- Modify: `index.html` (~riga 287, blocco `<script>` finale)
- Modify: `app.js:459-461` (snapshot) e `app.js:490-500` (loop di generazione)

**Interfaces:**
- Consumes: `ExerciseHistory.add(meta, exercise)` dal Task 1; in `app.js` esistono già `apiDifficulty()` (→ nome difficoltà, es. `'difficile'`) e lo snapshot `topic`/`subtype`.
- Produces: ogni esercizio generato con successo (anche in batch parziali e in "Completa i mancanti") viene salvato una e una sola volta.

- [ ] **Step 1: Carica `history.js` in `index.html`**

Nel blocco script in fondo, tra `gemini.js` e `app.js`:

```html
    <script src="gemini.js"></script>
    <script src="history.js"></script>
    <script src="app.js"></script>
```

- [ ] **Step 2: Snapshot della difficoltà in `generateExercise`**

In `app.js` (~riga 459), estendi lo snapshot esistente:

```js
        // Snapshot: la navigazione durante il batch non deve cambiare ciò che generiamo
        const topic = currentTopic;
        const subtype = currentSubtype;
        const difficultyName = apiDifficulty();
```

- [ ] **Step 3: Salva ogni esercizio appena generato**

Sempre in `generateExercise`, subito dopo l'assegnazione `results[i] = await window.GeminiAPI.generateExercise(...)` (dentro il `try` interno, prima del `catch`):

```js
                    results[i] = await window.GeminiAPI.generateExercise(
                        topic.level,
                        topic.topic,
                        topic.graphHint,
                        (statusMsg) => {
                            if (loadingTextEl) loadingTextEl.textContent = prefix + statusMsg;
                            generateText.textContent = statusMsg;
                        },
                        apiDifficulty(),
                        subtype
                    );
                    // Salvataggio dentro il loop: "Completa i mancanti" salva solo
                    // i nuovi, e un batch interrotto conserva i pezzi riusciti
                    window.ExerciseHistory.add({
                        level: topic.level,
                        topic: topic.topic,
                        icon: topic.icon,
                        subtype: subtype,
                        difficulty: difficultyName
                    }, results[i]);
```

- [ ] **Step 4: Verifica sintassi e comportamento nel browser**

Run: `node --check app.js && node --check history.js && echo OK`
Expected: `OK`

Poi verifica end-to-end senza consumare quota API: `python3 -m http.server 8000` dalla root, apri `http://localhost:8000`, e nella console del browser:

```js
localStorage.setItem('mathflow_groq_key', 'chiave-finta');
window.GeminiAPI.generateExercise = async () => ({
    theory: '<p>T</p>', exerciseText: '<p>Prova archivio</p>', result: '42', solution: '<p>S</p>'
});
```

Clicca un argomento qualsiasi (genera 1 esercizio), poi in console:

```js
window.ExerciseHistory.list();
```

Expected: array con 1 voce, `topic` dell'argomento cliccato, `difficulty: 'intermedio'`, `exercise.exerciseText: '<p>Prova archivio</p>'`. Imposta N=3 e rigenera: `list().length` deve diventare 4. **Pulizia finale:** `localStorage.removeItem('mathflow_history'); localStorage.removeItem('mathflow_groq_key');`

- [ ] **Step 5: Commit**

```bash
git add index.html app.js
git commit -m "Save every generated exercise to history"
```

---

### Task 3: Vista Archivio — scheletro, navigazione, stato vuoto

**Files:**
- Modify: `index.html` (~riga 74 navbar; ~riga 277 dentro `<main>`, dopo la chiusura di `#exercise-view`)
- Modify: `app.js` (~riga 55 refs DOM; `openTopic` ~riga 425; handler nav-levels ~riga 870; `bindEvents` ~riga 1016)
- Modify: `style.css` (in coda)

**Interfaces:**
- Consumes: `ExerciseHistory.list()`; pattern di navigazione esistente (`topicsSection.hidden` / `exerciseView.hidden`).
- Produces: `openArchive()` / `closeArchive()`; `renderArchive()` (versione minima, riscritta nel Task 4); elementi `#archive-view`, `#archive-list`, `#archive-empty`, `#archive-empty-text`, `#archive-btn`, `#archive-back-button`. Nessuna vista può essere visibile insieme a un'altra.

- [ ] **Step 1: Bottone in navbar**

In `index.html`, dentro `.nav-right`, subito **prima** del bottone `#settings-btn`:

```html
                <button class="nav-settings-btn" id="archive-btn" aria-label="Archivio esercizi" title="Archivio esercizi">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
                    </svg>
                </button>
```

(Riusa la classe `nav-settings-btn`: zero CSS nuovo per il bottone.)

- [ ] **Step 2: Sezione archivio**

In `index.html`, dentro `<main>`, dopo `</section>` di `#exercise-view` (prima di `</main>`):

```html
        <!-- Archive View -->
        <section class="archive-view" id="archive-view" hidden>
            <div class="exercise-top-bar">
                <button class="back-button" id="archive-back-button" aria-label="Torna agli argomenti">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    <span>Argomenti</span>
                </button>
            </div>
            <div class="section-header">
                <h2 class="section-title">Archivio esercizi</h2>
                <p class="section-subtitle">Gli esercizi che generi vengono salvati qui automaticamente</p>
            </div>
            <div class="archive-empty" id="archive-empty" hidden>
                <p id="archive-empty-text">📂 Gli esercizi che generi verranno salvati qui automaticamente.</p>
            </div>
            <div class="archive-list" id="archive-list"></div>
        </section>
```

- [ ] **Step 3: CSS base**

In coda a `style.css`:

```css
/* ===== ARCHIVE VIEW ===== */
.archive-view { animation: fadeIn 0.4s ease-out; }

.archive-empty {
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--font-size-lg);
    padding: var(--space-12) var(--space-4);
}
```

- [ ] **Step 4: Navigazione in `app.js`**

Refs DOM (dopo `const difficultyCurrent = ...`, ~riga 55):

```js
    const archiveBtn = document.getElementById('archive-btn');
    const archiveView = document.getElementById('archive-view');
    const archiveBackButton = document.getElementById('archive-back-button');
    const archiveList = document.getElementById('archive-list');
    const archiveEmpty = document.getElementById('archive-empty');
    const archiveEmptyText = document.getElementById('archive-empty-text');
```

Nuove funzioni (vicino a `backToTopics`, ~riga 819):

```js
    // ===== ARCHIVE =====
    function openArchive() {
        topicsSection.hidden = true;
        exerciseView.hidden = true;
        archiveView.hidden = false;
        // Un batch in corso continua in background (come per il cambio argomento)
        currentTopic = null;
        renderArchive();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closeArchive() {
        archiveView.hidden = true;
        topicsSection.hidden = false;
        renderTopicCards();
    }

    // Versione minima: il rendering completo della lista arriva col Task 4
    function renderArchive() {
        const entries = window.ExerciseHistory.list();
        archiveEmpty.hidden = entries.length > 0;
        archiveList.innerHTML = '';
    }
```

In `openTopic` (~riga 425), dopo `topicsSection.hidden = true;` aggiungi:

```js
        archiveView.hidden = true;
```

Nell'handler dei nav-level (~riga 870), dopo `if (currentTopic) backToTopics();` aggiungi:

```js
                if (!archiveView.hidden) closeArchive();
```

In `bindEvents` (vicino a `backButton.addEventListener`, ~riga 1016):

```js
        // Archivio
        archiveBtn.addEventListener('click', openArchive);
        archiveBackButton.addEventListener('click', closeArchive);
```

- [ ] **Step 5: Verifica**

Run: `node --check app.js && echo OK` → Expected: `OK`

Nel browser (server del Task 2 ancora attivo): il bottone orologio apre l'archivio con lo stato vuoto (se `mathflow_history` è stata rimossa); "Argomenti" torna alla home; con un argomento aperto il bottone orologio nasconde la vista esercizio; cliccare un livello in navbar dall'archivio chiude l'archivio; aprire un argomento dalla ricerca mentre l'archivio è aperto mostra SOLO la vista esercizio.

- [ ] **Step 6: Commit**

```bash
git add index.html app.js style.css
git commit -m "Add archive view skeleton with navigation and empty state"
```

---

### Task 4: Lista archivio — raggruppamento, stella, cestino

**Files:**
- Modify: `app.js` (sostituisce `renderArchive` del Task 3, aggiunge helper)
- Modify: `style.css` (in coda)

**Interfaces:**
- Consumes: `ExerciseHistory.list()/toggleFavorite(id)/remove(id)`; `getLevelColor(level)` e `NAMED_LABELS` già in `app.js`; elementi del Task 3.
- Produces: `renderArchive()` completo; helper `stripHtml(html)`, `capitalizeFirst(s)`, `buildArchiveTopicHead(entry)`, `buildArchiveRow(entry, timeFmt)` (il Task 6 aggiungerà il click sulla riga). Classi CSS: `.archive-day-header`, `.archive-topic-group`, `.archive-topic-head`, `.archive-row`, `.archive-row-main`, `.archive-row-meta`, `.archive-row-preview`, `.archive-star`, `.archive-trash`.

- [ ] **Step 1: Helper e rendering della lista**

In `app.js`, sostituisci la `renderArchive` minima del Task 3 con:

```js
    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html || '';
        return tmp.textContent.trim();
    }

    function capitalizeFirst(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    // Intestazione di un gruppo argomento (icona + nome + badge livello).
    // Costruita con createElement: topic può essere testo libero da "Altro".
    function buildArchiveTopicHead(entry) {
        const head = document.createElement('div');
        head.className = 'archive-topic-head';
        const icon = document.createElement('span');
        icon.className = 'archive-topic-icon';
        icon.textContent = entry.icon || '📚';
        const name = document.createElement('span');
        name.textContent = entry.topic;
        const badge = document.createElement('span');
        badge.className = 'archive-level-badge';
        badge.textContent = entry.level;
        const lc = getLevelColor(entry.level);
        badge.style.background = lc.bg;
        badge.style.color = lc.color;
        head.appendChild(icon);
        head.appendChild(name);
        head.appendChild(badge);
        return head;
    }

    function buildArchiveRow(entry, timeFmt) {
        const row = document.createElement('div');
        row.className = 'archive-row';

        const main = document.createElement('button');
        main.type = 'button';
        main.className = 'archive-row-main';

        const metaBits = [];
        if (entry.subtype) metaBits.push(entry.subtype);
        metaBits.push(NAMED_LABELS[entry.difficulty] || entry.difficulty);
        metaBits.push(timeFmt.format(new Date(entry.savedAt)));
        const meta = document.createElement('span');
        meta.className = 'archive-row-meta';
        meta.textContent = metaBits.join(' · ');

        const preview = document.createElement('span');
        preview.className = 'archive-row-preview';
        const text = stripHtml(entry.exercise.exerciseText);
        preview.textContent = text.length > 100 ? text.slice(0, 100) + '…' : text;

        main.appendChild(meta);
        main.appendChild(preview);

        const starBtn = document.createElement('button');
        starBtn.type = 'button';
        starBtn.className = 'archive-star' + (entry.favorite ? ' active' : '');
        starBtn.textContent = entry.favorite ? '★' : '☆';
        starBtn.title = entry.favorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti';
        starBtn.addEventListener('click', () => {
            const fav = window.ExerciseHistory.toggleFavorite(entry.id);
            entry.favorite = fav;
            starBtn.classList.toggle('active', fav);
            starBtn.textContent = fav ? '★' : '☆';
            starBtn.title = fav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti';
        });

        const trashBtn = document.createElement('button');
        trashBtn.type = 'button';
        trashBtn.className = 'archive-trash';
        trashBtn.textContent = '🗑';
        trashBtn.title = 'Elimina esercizio';
        trashBtn.addEventListener('click', () => {
            if (entry.favorite && !confirm('Questo esercizio è tra i preferiti. Eliminarlo?')) return;
            window.ExerciseHistory.remove(entry.id);
            renderArchive();
        });

        row.appendChild(main);
        row.appendChild(starBtn);
        row.appendChild(trashBtn);
        return row;
    }

    function renderArchive() {
        const entries = window.ExerciseHistory.list();
        archiveEmpty.hidden = entries.length > 0;
        archiveList.innerHTML = '';
        if (entries.length === 0) return;

        const dayFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

        let lastDay = null;
        let lastTopicKey = null;
        let topicGroupEl = null;

        entries.forEach(entry => {
            const dayLabel = capitalizeFirst(dayFmt.format(new Date(entry.savedAt)));
            if (dayLabel !== lastDay) {
                const h = document.createElement('h3');
                h.className = 'archive-day-header';
                h.textContent = dayLabel;
                archiveList.appendChild(h);
                lastDay = dayLabel;
                lastTopicKey = null;
            }
            // Voci consecutive dello stesso argomento sotto un'unica intestazione
            const topicKey = entry.level + '|' + entry.topic;
            if (topicKey !== lastTopicKey) {
                topicGroupEl = document.createElement('div');
                topicGroupEl.className = 'archive-topic-group';
                topicGroupEl.appendChild(buildArchiveTopicHead(entry));
                archiveList.appendChild(topicGroupEl);
                lastTopicKey = topicKey;
            }
            topicGroupEl.appendChild(buildArchiveRow(entry, timeFmt));
        });
    }
```

- [ ] **Step 2: CSS della lista**

In coda a `style.css`:

```css
.archive-day-header {
    font-size: var(--font-size-sm);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-tertiary);
    margin: var(--space-8) 0 var(--space-3);
}

.archive-topic-group {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--space-4);
    overflow: hidden;
}

.archive-topic-head {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--color-border);
    font-weight: 700;
    color: var(--color-text-primary);
}

.archive-topic-icon { font-size: var(--font-size-xl); }

.archive-level-badge {
    font-size: var(--font-size-xs);
    font-weight: 600;
    padding: 2px var(--space-2);
    border-radius: var(--radius-full);
    margin-left: var(--space-1);
}

.archive-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    border-bottom: 1px solid var(--color-border);
}
.archive-row:last-child { border-bottom: none; }

.archive-row-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    text-align: left;
    background: none;
    border: none;
    font-family: var(--font-family);
    cursor: pointer;
    padding: var(--space-1) 0;
}

.archive-row-meta {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-tertiary);
}

.archive-row-preview {
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.archive-star,
.archive-trash {
    flex-shrink: 0;
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--font-size-lg);
    line-height: 1;
    padding: var(--space-1);
    transition: transform var(--transition-fast);
}
.archive-star { color: var(--color-text-tertiary); }
.archive-star.active { color: #FF9500; }
.archive-star:hover,
.archive-trash:hover { transform: scale(1.15); }
```

- [ ] **Step 3: Verifica**

Run: `node --check app.js && echo OK` → Expected: `OK`

Nel browser, semina dati in console:

```js
['Frazioni', 'Frazioni', 'Potenze'].forEach((t, i) => window.ExerciseHistory.add(
    { level: 'Medie', topic: t, icon: '🧪', subtype: i === 0 ? 'Somma' : '', difficulty: 'difficile' },
    { theory: '<p>t</p>', exerciseText: '<p>Esercizio <strong>' + i + '</strong> con <em>HTML</em></p>', result: 'r', solution: '<p>s</p>' }
));
```

Apri l'archivio. Expected: un'intestazione giorno (es. "Martedì 14 luglio 2026"), un gruppo "Frazioni" con 2 righe e uno "Potenze" con 1 (le voci sono più-recente-prima: "Potenze" appare per primo); anteprima senza tag HTML; la riga con sotto-tipo mostra "Somma · Difficile · HH:MM". Stella: click → ★ arancione, persiste al reload. Cestino: la riga sparisce; su un preferito chiede conferma. Pulizia: `localStorage.removeItem('mathflow_history')`.

- [ ] **Step 4: Commit**

```bash
git add app.js style.css
git commit -m "Render archive list grouped by day and topic with star and delete"
```

---

### Task 5: Filtri — livello, solo preferiti, ricerca

**Files:**
- Modify: `index.html` (dentro `#archive-view`, tra `.section-header` e `#archive-empty`)
- Modify: `app.js` (refs, stato filtri, `getFilteredArchiveEntries`, `renderArchiveLevelChips`, aggiornamenti a `renderArchive` e `openArchive`, eventi in `bindEvents`)
- Modify: `style.css` (in coda)

**Interfaces:**
- Consumes: `renderArchive()` e `stripHtml(html)` dal Task 4; classe `.area-chip` esistente per i chip.
- Produces: stato `archiveLevel` (`'all'` o nome livello), `archiveFavOnly` (bool), `archiveSearchText` (string); `getFilteredArchiveEntries(all)` → array filtrato in AND; filtri resettati a ogni apertura dell'archivio; `renderArchive()` accetta implicitamente i filtri e distingue "archivio vuoto" da "nessun risultato".

- [ ] **Step 1: Markup filtri**

In `index.html`, dentro `#archive-view`, subito dopo la chiusura di `.section-header`:

```html
            <div class="archive-filters" id="archive-filters" hidden>
                <div class="archive-level-chips" id="archive-level-chips"></div>
                <div class="archive-filter-row">
                    <button type="button" class="area-chip" id="archive-fav-toggle" title="Mostra solo i preferiti">★ Solo preferiti</button>
                    <input type="search" id="archive-search" class="archive-search" placeholder="Cerca nell'archivio..." aria-label="Cerca nell'archivio" autocomplete="off">
                </div>
            </div>
```

- [ ] **Step 2: Stato, filtro e chip in `app.js`**

Refs DOM (dopo quelli del Task 3):

```js
    const archiveFilters = document.getElementById('archive-filters');
    const archiveLevelChips = document.getElementById('archive-level-chips');
    const archiveFavToggle = document.getElementById('archive-fav-toggle');
    const archiveSearch = document.getElementById('archive-search');
```

Stato (vicino a `let lastBatch = []`, ~riga 82):

```js
    let archiveLevel = 'all';
    let archiveFavOnly = false;
    let archiveSearchText = '';
```

Nuove funzioni (prima di `renderArchive`):

```js
    function getFilteredArchiveEntries(all) {
        const q = archiveSearchText.toLowerCase();
        return all.filter(en => {
            if (archiveLevel !== 'all' && en.level !== archiveLevel) return false;
            if (archiveFavOnly && !en.favorite) return false;
            if (q) {
                const hay = (en.topic + ' ' + stripHtml(en.exercise.exerciseText)).toLowerCase();
                if (!hay.includes(q)) return false;
            }
            return true;
        });
    }

    // Chip solo per i livelli effettivamente presenti in archivio
    function renderArchiveLevelChips(all) {
        const levelOrder = ['Elementari', 'Medie', 'Superiori', 'Università'];
        const levels = [...new Set(all.map(en => en.level))]
            .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));
        archiveLevelChips.innerHTML = '';
        const makeChip = (label, value) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'area-chip' + (archiveLevel === value ? ' active' : '');
            btn.textContent = label;
            btn.addEventListener('click', () => {
                archiveLevel = value;
                renderArchive();
            });
            return btn;
        };
        archiveLevelChips.appendChild(makeChip('Tutti', 'all'));
        levels.forEach(l => archiveLevelChips.appendChild(makeChip(l, l)));
    }
```

Sostituisci per intero la `renderArchive` del Task 4 con questa versione (cambiano solo le righe iniziali: lettura filtrata, visibilità filtri, testo dello stato vuoto; il loop di raggruppamento è identico ma itera su `entries` filtrate):

```js
    function renderArchive() {
        const all = window.ExerciseHistory.list();
        const entries = getFilteredArchiveEntries(all);
        archiveFilters.hidden = all.length === 0;
        renderArchiveLevelChips(all);
        archiveEmpty.hidden = entries.length > 0;
        archiveEmptyText.textContent = all.length === 0
            ? '📂 Gli esercizi che generi verranno salvati qui automaticamente.'
            : 'Nessun esercizio corrisponde ai filtri.';
        archiveList.innerHTML = '';
        if (entries.length === 0) return;

        const dayFmt = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        const timeFmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

        let lastDay = null;
        let lastTopicKey = null;
        let topicGroupEl = null;

        entries.forEach(entry => {
            const dayLabel = capitalizeFirst(dayFmt.format(new Date(entry.savedAt)));
            if (dayLabel !== lastDay) {
                const h = document.createElement('h3');
                h.className = 'archive-day-header';
                h.textContent = dayLabel;
                archiveList.appendChild(h);
                lastDay = dayLabel;
                lastTopicKey = null;
            }
            // Voci consecutive dello stesso argomento sotto un'unica intestazione
            const topicKey = entry.level + '|' + entry.topic;
            if (topicKey !== lastTopicKey) {
                topicGroupEl = document.createElement('div');
                topicGroupEl.className = 'archive-topic-group';
                topicGroupEl.appendChild(buildArchiveTopicHead(entry));
                archiveList.appendChild(topicGroupEl);
                lastTopicKey = topicKey;
            }
            topicGroupEl.appendChild(buildArchiveRow(entry, timeFmt));
        });
    }
```

In `openArchive`, prima di `renderArchive()`, resetta i filtri (non persistono tra aperture):

```js
        archiveLevel = 'all';
        archiveFavOnly = false;
        archiveFavToggle.classList.remove('active');
        archiveSearch.value = '';
        archiveSearchText = '';
```

In `bindEvents`, dopo gli eventi archivio del Task 3:

```js
        archiveFavToggle.addEventListener('click', () => {
            archiveFavOnly = !archiveFavOnly;
            archiveFavToggle.classList.toggle('active', archiveFavOnly);
            renderArchive();
        });
        archiveSearch.addEventListener('input', (e) => {
            archiveSearchText = e.target.value.trim();
            renderArchive();
        });
```

- [ ] **Step 3: CSS filtri**

In coda a `style.css`:

```css
.archive-filters {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
}

.archive-level-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.archive-filter-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
}

.archive-search {
    flex: 1;
    min-width: 200px;
    padding: var(--space-2) var(--space-4);
    border: 1.5px solid var(--color-border-strong);
    border-radius: var(--radius-full);
    background: var(--color-surface);
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
}
.archive-search:focus { outline: none; border-color: #007AFF; }
```

- [ ] **Step 4: Verifica**

Run: `node --check app.js && echo OK` → Expected: `OK`

Nel browser, semina voci miste in console:

```js
[['Medie','Frazioni'],['Superiori','Derivate'],['Medie','Potenze']].forEach(([lv, t], i) => window.ExerciseHistory.add(
    { level: lv, topic: t, icon: '🧪', subtype: '', difficulty: 'facile' },
    { theory: '<p>t</p>', exerciseText: '<p>Testo ' + t + '</p>', result: 'r', solution: '<p>s</p>' }
));
```

Apri l'archivio. Expected: chip "Tutti / Medie / Superiori"; chip "Medie" → solo Frazioni e Potenze; "★ Solo preferiti" senza preferiti → "Nessun esercizio corrisponde ai filtri"; ricerca "deriv" (con chip "Tutti") → solo Derivate; con archivio svuotato (`localStorage.removeItem('mathflow_history')` + riapertura) i filtri sono nascosti e torna il messaggio 📂; riaprendo l'archivio i filtri ripartono da "Tutti". Pulizia come sopra.

- [ ] **Step 5: Commit**

```bash
git add index.html app.js style.css
git commit -m "Add level, favorites and text filters to archive"
```

---

### Task 6: Dettaglio espandibile con card completa

**Files:**
- Modify: `app.js` (`buildArchiveRow` del Task 4 + nuova `toggleArchiveDetail`)
- Modify: `style.css` (in coda)

**Interfaces:**
- Consumes: `buildExerciseCard(exercise, index, total)` esistente (app.js:720) — con `total = 1` non mostra numerazione, aggancia i toggle dei pannelli e il lazy-render del grafico via `togglePanel`; il template `#exercise-card-template` è raggiungibile via `getElementById` anche se vive nella sezione nascosta.
- Produces: click sulla parte principale della riga → apre/chiude il dettaglio sotto la riga (una sola riga espansa alla volta). Classi CSS: `.archive-detail`, `.archive-row.open`.

- [ ] **Step 1: Espansione in `app.js`**

Nuova funzione (dopo `buildArchiveRow`):

```js
    // Una sola riga espansa alla volta; il dettaglio riusa la card completa
    // (pannelli richiudibili e grafico lazy inclusi, come nella vista esercizio)
    function toggleArchiveDetail(row, entry) {
        const existing = row.nextElementSibling;
        if (existing && existing.classList.contains('archive-detail')) {
            existing.remove();
            row.classList.remove('open');
            return;
        }
        const openDetail = archiveList.querySelector('.archive-detail');
        if (openDetail) {
            openDetail.previousElementSibling.classList.remove('open');
            openDetail.remove();
        }
        const detail = document.createElement('div');
        detail.className = 'archive-detail';
        detail.appendChild(buildExerciseCard(entry.exercise, 0, 1));
        row.insertAdjacentElement('afterend', detail);
        row.classList.add('open');
    }
```

In `buildArchiveRow`, subito dopo `main.appendChild(preview);`, aggiungi il listener:

```js
        main.title = 'Mostra esercizio completo';
        main.addEventListener('click', () => toggleArchiveDetail(row, entry));
```

- [ ] **Step 2: CSS dettaglio**

In coda a `style.css`:

```css
.archive-row.open { background: rgba(0, 122, 255, 0.04); }

.archive-detail {
    padding: var(--space-2) var(--space-4) var(--space-4);
    border-bottom: 1px solid var(--color-border);
}
.archive-detail:last-child { border-bottom: none; }
.archive-detail .exercise-card { margin: 0; }
```

- [ ] **Step 3: Verifica**

Run: `node --check app.js && echo OK` → Expected: `OK`

Nel browser, semina una voce CON grafico:

```js
window.ExerciseHistory.add(
    { level: 'Superiori', topic: 'Parabola', icon: '📈', subtype: '', difficulty: 'intermedio' },
    { theory: '<p>Teoria della parabola</p>', exerciseText: '<p>Studia y = x² − 4</p>', result: 'V(0, −4)',
      solution: '<p>Passo 1…</p>', graph: { type: 'quadratic', a: 1, b: 0, c: -4 } }
);
```

Apri l'archivio, clicca la riga. Expected: card completa con "Cosa serve sapere", testo, risultato, "Svolgimento completo" e "Visualizza grafico"; espandendo il pannello grafico la parabola viene disegnata sul canvas; click di nuovo sulla riga → dettaglio chiuso; aprendo un'altra riga la precedente si richiude; stella e cestino continuano a funzionare senza aprire il dettaglio. Pulizia: `localStorage.removeItem('mathflow_history')`.

- [ ] **Step 4: Commit**

```bash
git add app.js style.css
git commit -m "Expand archive rows into full exercise card with graph"
```

---

### Task 7: Verifica finale (checklist dello spec)

**Files:**
- Nessuna modifica prevista (solo fix se la checklist trova problemi).

**Interfaces:**
- Consumes: tutto quanto sopra.
- Produces: conferma che i punti 1–8 della sezione "Verifica" dello spec passano.

- [ ] **Step 1: Test automatici e sintassi**

Run: `node --test tests/history.test.js && node --check app.js && node --check history.js && echo TUTTO-OK`
Expected: 8/8 PASS, poi `TUTTO-OK`

- [ ] **Step 2: Potatura oltre il tetto (punto 7 dello spec)**

Nel browser (archivio vuoto), in console:

```js
(function () {
    for (let i = 0; i < 205; i++) {
        const e = window.ExerciseHistory.add(
            { level: 'Medie', topic: 'Test potatura', icon: '🧪', subtype: '', difficulty: 'facile' },
            { theory: '<p>t</p>', exerciseText: '<p>Esercizio ' + i + '</p>', result: String(i), solution: '<p>s</p>' }
        );
        if (i < 2 && e) window.ExerciseHistory.toggleFavorite(e.id);
    }
    console.log('totale:', window.ExerciseHistory.list().length,
        'preferite:', window.ExerciseHistory.list().filter(x => x.favorite).length);
})();
```

Expected: `totale: 202 preferite: 2` (200 non preferite + 2 preferite; "Esercizio 0" e "Esercizio 1" sono le preferite sopravvissute). Pulizia: `localStorage.removeItem('mathflow_history')`.

- [ ] **Step 3: Checklist manuale con generazione reale**

Con la VERA chiave API dell'utente (quella già nel browser dell'utente — questo punto lo esegue l'utente se l'implementatore non ha una chiave):

1. Generazione singola → voce in archivio con argomento, difficoltà e ora corrette.
2. Batch da 3 → 3 voci sotto la stessa etichetta argomento/giorno.
3. Fallimento parziale + "Completa i mancanti" → nessun duplicato (totale voci = esercizi effettivamente generati).
4. Stella e cestino persistono al reload; cestino su preferito chiede conferma.
5. Filtri livello + preferiti + ricerca combinati.
6. Dettaglio identico alla visualizzazione originale, grafico incluso.
7. (già fatto allo Step 2)
8. Finestra privata di Safari: l'app funziona, archivio vuoto, nessun errore bloccante in console.

- [ ] **Step 4: Commit di eventuali fix**

Se la checklist ha richiesto correzioni:

```bash
git add -A
git commit -m "Fix issues found during archive verification"
```
