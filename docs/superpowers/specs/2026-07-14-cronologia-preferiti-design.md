# Cronologia + preferiti degli esercizi generati — Design

Data: 2026-07-14
Stato: approvato in brainstorming, in attesa di piano di implementazione

## Obiettivo

Ogni esercizio generato con successo viene salvato automaticamente in
localStorage e resta consultabile in una vista Archivio dedicata, con
preferiti, filtri e ricerca. Oggi ogni esercizio costa una chiamata LLM e
svanisce alla generazione successiva; per l'uso in ripetizioni serve poter
ritrovare gli esercizi usati con uno studente nelle lezioni successive.

Questa feature è la base dei sotto-progetti futuri già discussi (schede
studente, condivisione via link): il modulo di storage va quindi tenuto
isolato e con un'API chiara.

## Decisioni prese (con l'utente)

- **Salvataggio automatico di tutto**: nessun bottone "Salva"; ogni
  esercizio generato con successo finisce in archivio.
- **Tetto di 200 voci non preferite**; i preferiti non vengono mai potati.
- **Vista Archivio dedicata**, aperta da un bottone in navbar; niente
  cronologia contestuale nella pagina argomento (rimandata).
- **Azioni sulle voci**: rivedere l'esercizio completo (grafico incluso),
  stella preferito, eliminazione singola. **Esclusi da questo giro**:
  ri-export PDF dall'archivio, "svuota tutto", note personali.
- **Voci individuali, raggruppate per giorno + argomento** nella lista
  (nessun concetto di "sessione/batch" nel modello dati).
- **Architettura**: modulo dedicato `history.js` (approccio scelto tra:
  modulo dedicato / tutto in app.js / IndexedDB — scartati il secondo
  perché app.js è già a ~1050 righe e il terzo perché asincrono e
  sovradimensionato per <1 MB di dati; localStorage è l'idioma del
  progetto).

## Architettura

Nuovo file `history.js`, caricato in `index.html` **tra `gemini.js` e
`app.js`** (app.js lo consuma). Espone un global, secondo l'idioma del
progetto (un global per responsabilità):

```js
window.ExerciseHistory = {
  add(meta, exercise),   // salva una voce; ritorna la voce creata (o null se storage non disponibile)
  list(),                // tutte le voci, più recente prima
  toggleFavorite(id),    // inverte favorite; ritorna il nuovo stato
  remove(id),            // elimina la voce
};
```

Il modulo possiede da solo: la chiave localStorage, il tetto e la logica di
potatura, la serializzazione. `app.js` non tocca mai la chiave direttamente.

### Modello dati

Chiave localStorage: `mathflow_history` (stesso prefisso `mathflow_` delle
chiavi esistenti). Valore: array JSON di voci, ordine di inserimento
(la più recente in coda; `list()` la restituisce per prima):

```js
{
  id: "…",                     // crypto.randomUUID(); fallback Date.now() + suffisso random
  savedAt: "2026-07-14T18:30:00.000Z",  // ISO UTC
  level: "Superiori",          // copiati dal topic al momento del salvataggio:
  topic: "Equazioni di 2° grado",  // l'archivio sopravvive a rinomini/rimozioni del catalogo
  icon: "🧮",
  subtype: "",                 // "" = "Qualsiasi"
  difficulty: "difficile",     // nome in NAMED_DIFFICULTIES
  favorite: false,
  exercise: {                  // oggetto GREZZO come restituito da GeminiAPI.generateExercise
    theory, exerciseText, result, solution,
    graph                       // opzionale, spec per MathGraph.render
  }
}
```

Si salva l'esercizio **grezzo**: la pulizia (`cleanMathHtml`) resta
responsabilità esclusiva del rendering, così archivio e visualizzazione non
possono divergere se `cleanMathHtml` evolve.

### Potatura e quota

- Dopo ogni `add`, se le voci con `favorite: false` superano 200, si
  eliminano le più vecchie non preferite fino a rientrare nel tetto.
- Se `localStorage.setItem` lancia (`QuotaExceededError` o equivalenti), il
  modulo pota più aggressivamente (dimezza le non preferite più vecchie) e
  ritenta, massimo 2 volte; se fallisce ancora, `console.warn` e rinuncia.
  **Il salvataggio non deve mai far fallire la generazione**: `add` non
  propaga eccezioni.
- localStorage assente/inaccessibile (navigazione privata, storage
  disabilitato): tutte le API diventano no-op sicure (`list()` → `[]`).
- JSON corrotto nella chiave: si riparte da array vuoto (comportamento già
  usato altrove nel progetto per le chiavi API).

## Aggancio al salvataggio (app.js)

Nel loop di `generateExercise` (app.js, ~riga 490), subito dopo
`results[i] = await window.GeminiAPI.generateExercise(...)`:

```js
window.ExerciseHistory.add({
  level: topic.level, topic: topic.topic, icon: topic.icon,
  subtype, difficulty: difficultyName   // snapshot, vedi sotto
}, results[i]);
```

usando lo **snapshot** `topic`/`subtype` catturato a inizio funzione (non lo
stato corrente, che può cambiare durante il batch). Salvare dentro il loop —
e non a fine batch — copre senza logica extra:

- **"Completa i mancanti"** (`onlyMissing`): rigenera solo gli slot `null`,
  quindi si salvano solo i nuovi esercizi, senza duplicare quelli già
  archiviati nel giro precedente.
- **Batch interrotto a metà** (errore chiave, rate limit, cambio argomento):
  i pezzi riusciti sono comunque già salvati.

La difficoltà salvata è il nome della difficoltà **al momento dello
snapshot** (da catturare insieme a topic/subtype a inizio funzione, perché
i bottoni più facile/più difficile possono cambiarla durante il batch).

## UI Archivio

### Navigazione

- Nuovo bottone in navbar accanto all'ingranaggio (`#settings-btn`), icona
  archivio/orologio, `aria-label` e `title` in italiano ("Archivio
  esercizi").
- Nuova sezione `#archive-view` in `index.html`, fratello di
  `#topics-section` e `#exercise-view`. Navigazione con lo stesso pattern
  esistente: aprire l'archivio nasconde le altre sezioni; "Torna agli
  argomenti" (stesso stile del back button esistente) torna alla home.
  Aprire l'archivio mentre si è nella vista esercizio è consentito e non
  interrompe un'eventuale generazione in corso (il batch continua in
  background, com'è già per il cambio argomento).

### Lista

- Voci raggruppate per **giorno** (intestazione tipo "Lunedì 14 luglio",
  formattata con `Intl.DateTimeFormat('it-IT', …)`); dentro il giorno, le
  voci consecutive dello stesso argomento stanno sotto un'unica etichetta
  argomento (icona + nome + badge livello con gli stili badge esistenti).
- Ogni riga: sotto-tipo (se presente), difficoltà, ora (HH:MM), anteprima
  del testo dell'esercizio (HTML strippato via elemento temporaneo +
  `textContent`, troncato a ~100 caratteri), stella (toggle immediato,
  ripersiste subito) e cestino.
- Cestino: eliminazione immediata per le voci normali; `confirm()` solo se
  la voce è preferita.

### Filtri

In testa alla lista, riusando i pattern esistenti (chip dei filtri area,
search box):

- Chip di livello: Tutti / Elementari / Medie / Superiori / Università
  (mostrare solo i livelli presenti in archivio).
- Toggle "Solo preferiti ★".
- Ricerca testuale live su argomento + testo esercizio (case-insensitive).

I filtri si combinano in AND. Stato dei filtri non persistito: si riparte
da "Tutti" a ogni apertura.

### Dettaglio

Click sulla riga → la voce si espande in un pannello nella stessa vista,
che riusa `#exercise-card-template` e la **stessa funzione di rendering**
delle card correnti (estratta/riusata da `showExercises`, incluso il lazy
rendering del grafico via `MathGraph.render` alla prima espansione del
pannello grafico). Il bottone PDF globale resta nascosto nell'archivio.

### Stati vuoti

- Archivio vuoto: messaggio amichevole ("Gli esercizi che generi verranno
  salvati qui automaticamente").
- Filtri senza risultati: "Nessun esercizio corrisponde ai filtri".

## Cosa NON cambia

- `gemini.js`, `graph.js`, `topics.js`: nessuna modifica.
- Flusso di generazione, PDF, sotto-tipi, difficoltà: invariati a parte le
  3-4 righe di aggancio in `generateExercise`.
- Nessuna nuova dipendenza esterna.

## Verifica (manuale, non esiste test suite)

1. Generazione singola → voce in archivio con argomento, difficoltà, ora
   corrette.
2. Batch da 3 → 3 voci sotto la stessa etichetta argomento/giorno.
3. Batch con fallimento parziale + "Completa i mancanti" → nessun
   duplicato: totale voci = esercizi effettivamente generati.
4. Stella e cestino: persistono dopo reload; cestino su preferito chiede
   conferma.
5. Filtri livello + preferiti + ricerca combinati.
6. Dettaglio: esercizio identico alla visualizzazione originale, grafico
   ri-renderizzato correttamente all'espansione.
7. Potatura: da console, popolare >200 voci finte → le più vecchie non
   preferite spariscono, i preferiti restano.
8. Navigazione privata (Safari): l'app funziona, archivio in stato vuoto,
   nessun errore in console che blocchi la generazione.
