# Sincronizzazione archivio tra dispositivi via GitHub Gist — Design

Data: 2026-07-15
Stato: approvato in brainstorming, in attesa di piano di implementazione

## Obiettivo

L'archivio esercizi (voci + preferiti) si sincronizza automaticamente tra i
dispositivi dell'utente (Mac, iPhone, iPad, N dispositivi) usando un Gist
segreto di GitHub come storage condiviso. Oggi tutto vive nel localStorage
del singolo browser: gli esercizi generati sul Mac non esistono sull'iPhone.

## Decisioni prese (con l'utente)

- **Cosa si sincronizza:** SOLO archivio + preferiti (`mathflow_history` +
  lapidi). La chiave API Groq/OpenRouter e il provider restano
  per-dispositivo: nessun segreto viaggia mai nel gist.
- **Esperienza:** automatica in background (pull all'apertura, push dopo
  ogni mutazione), nessun bottone "sincronizza ora" richiesto.
- **Storage condiviso:** Gist segreto GitHub (approccio scelto tra: Gist /
  Supabase / export-import manuale. Supabase scartato: servizio in più,
  dipendenza SDK, il free tier iberna dopo 1 settimana di inattività.
  Export manuale scartato: non è una vera sync). L'utente ha già un account
  GitHub e l'app usa già l'idioma "incolla una chiave".
- **Setup per dispositivo:** incollare una tantum un token GitHub
  fine-grained con SOLO permesso gist. Nessun gist-id da copiare: i
  dispositivi successivi trovano il gist da soli per nome file.

## Architettura

Nuovo modulo `sync.js` → `window.ExerciseSync`, caricato in `index.html`
tra `history.js` e `app.js`. Ordine script finale:
`topics.js, graph.js, gemini.js, history.js, sync.js, app.js`.

Confini di responsabilità:

- **`history.js`** resta l'unico proprietario dei dati locali. Impara:
  - `updatedAt` per voce (ISO; = `savedAt` alla creazione, aggiornato da
    `toggleFavorite`). Voci pre-esistenti senza `updatedAt`: fallback su
    `savedAt` in lettura (nessuna migrazione).
  - **Lapidi**: `remove(id)` aggiunge `{id, deletedAt}` a una lista
    separata salvata sotto la chiave localStorage `mathflow_tombstones`.
    Le lapidi non vengono mai potate (pesano ~50 byte l'una).
  - `exportState()` → `{version: 1, entries, tombstones}` (entries in
    ordine di inserimento, come su disco).
  - `mergeState(remoteState)` → fonde lo stato remoto nel locale
    (algoritmo sotto), persiste, e ritorna `{localChanged, remoteChanged}`:
    `localChanged` dice ad app.js di ri-renderizzare l'archivio,
    `remoteChanged` dice a sync.js che serve un PATCH del gist.
  - `onDataChanged(callback)` NON serve: è `app.js` a orchestrare.
- **`sync.js`** possiede: token (localStorage `mathflow_github_token`),
  gist id (`mathflow_gist_id`), chiamate a `api.github.com` (CORS ok),
  debounce, stato. API:
  - `isConfigured()` → bool (token presente).
  - `setToken(token)` → valida con una chiamata di prova (GET /gists,
    che verifica anche lo scope); salva o lancia `TOKEN_INVALID`.
  - `disconnect()` → rimuove token e gist id dal dispositivo (i dati
    locali restano intatti).
  - `syncNow()` → pull+merge(+push se il locale ha novità). Ritorna
    una Promise; mai due sync concorrenti (se una è in corso, la
    richiesta si accoda/coalizza).
  - `schedulePush()` → debounce ~3 s, poi `syncNow()`.
  - `onStatus(callback)` → notifiche `{state: 'idle'|'syncing'|'synced'|
    'error', at: Date, message}` per la riga di stato in UI.
- **`app.js`** orchestra: chiama `ExerciseSync.syncNow()` all'avvio e
  `schedulePush()` dopo ogni `add`/`toggleFavorite`/`remove`; ri-renderizza
  l'archivio se `mergeState` ha cambiato qualcosa mentre l'archivio è
  aperto; ospita la UI di setup/stato.

## Formato del gist

Gist **segreto**, un solo file `mathflow-archive.json`:

```json
{
  "version": 1,
  "entries": [ { …voce identica al formato locale, updatedAt incluso… } ],
  "tombstones": [ { "id": "…", "deletedAt": "2026-07-15T10:00:00.000Z" } ]
}
```

`version` per evoluzioni future; leggendo `version > 1` la sync si ferma
con errore "aggiorna l'app" invece di corrompere dati.

### Scoperta/creazione del gist

1. Se `mathflow_gist_id` è in localStorage → usa quello (GET singolo).
2. Altrimenti: `GET /gists` (lista i gist dell'utente, inclusi i segreti,
   paginando fino a 3 pagine da 100) e cerca il primo che contiene il file
   `mathflow-archive.json` → salva l'id.
3. Se non esiste → `POST /gists` (secret, `public: false`) con lo stato
   locale → salva l'id.
4. Gist cancellato a mano (404 sul GET singolo) → si rientra dal punto 2.

## Algoritmo di merge (funzione pura, testabile in Node)

`merge(localState, remoteState)` → `{merged, localChanged, remoteChanged}`

1. `tombstones` = unione per `id` (a parità, `deletedAt` più recente).
2. `entries` = unione per `id`; per gli `id` presenti in entrambi vince
   l'`updatedAt` più recente (fallback `savedAt`; a parità vince il
   locale). Le voci il cui `id` compare nelle lapidi vengono scartate.
3. Ordinamento risultato: per `savedAt` crescente (l'ordine su disco).
4. `localChanged` = il merged differisce dal locale (→ ri-render UI);
   `remoteChanged` = il merged differisce dal remoto (→ serve un PATCH).

Nota conflitto stella: mettere/togliere la stella aggiorna `updatedAt`,
quindi vince l'ultima azione in ordine di tempo, su qualsiasi dispositivo.
Il tetto di 200 non-preferite si applica DOPO il merge (potatura locale
standard di `history.js`), così due archivi da 150 voci convergono a 200
potando le più vecchie ovunque alla sync successiva.

## Trigger di sincronizzazione

- **All'avvio dell'app** (init): `syncNow()` — silenzioso, in background.
- **All'apertura della vista Archivio**: `syncNow()`, con throttle (non
  più di una ogni 60 s) per non martellare l'API aprendo/chiudendo.
- **Dopo ogni mutazione locale** (add nel loop di generazione,
  toggleFavorite, remove): `schedulePush()` (debounce 3 s, coalescente:
  un batch da 10 esercizi produce una sola sync).
- Ogni sync è sempre **pull → merge → push-se-serve** (mai push cieco):
  riduce al minimo la finestra di sovrascrittura tra dispositivi. Il caso
  "due dispositivi scrivono nello stesso secondo" può perdere l'ultimo
  aggiornamento di UN campo stella (non voci: le voci nuove hanno id
  diversi e si sommano alla sync successiva) — accettato per un'app
  mono-utente.

## UI (dentro la vista Archivio)

Sezione "☁️ Sincronizzazione" sotto l'header dell'archivio:

- **Non configurata:** testo breve ("Sincronizza l'archivio tra i tuoi
  dispositivi con un token GitHub"), campo per incollare il token, bottone
  "Attiva", e link che apre
  `https://github.com/settings/personal-access-tokens/new` con istruzioni
  in italiano in 3 righe (nome qualsiasi, scadenza lunga, permesso
  account → Gists → Read and write; nessun accesso ai repo).
- **Configurata:** riga di stato ("✓ Sincronizzato · 12:34" /
  "Sincronizzazione…" / "⚠ Errore: token non valido o scaduto") + bottone
  "Scollega questo dispositivo" (con `confirm`; rimuove token e gist id
  locali, NON tocca il gist né l'archivio locale).
- Token mostrato mai in chiaro dopo il salvataggio.
- Tutti i testi in italiano.

## Errori e casi limite

- **Regola d'oro: la sync non blocca mai l'uso locale.** Senza token,
  offline, GitHub giù, quota API esaurita: l'app funziona identica a oggi
  e riallinea al trigger successivo.
- 401/403 dal token → stato errore "token non valido o scaduto", la sync
  auto si sospende finché l'utente non reincolla un token; l'archivio
  locale resta pienamente usabile.
- Errore di rete → stato errore soft, nessun popup; ritenta al prossimo
  trigger.
- JSON del gist corrotto/illeggibile → trattato come remoto vuoto MA senza
  push distruttivo automatico: stato errore con messaggio; il push
  sovrascrive solo se il remoto era proprio vuoto/nuovo.
- `version` remota > 1 → stop con "aggiorna l'app su questo dispositivo".
- localStorage assente (navigazione privata): `isConfigured()` false,
  sezione sync mostra il setup ma il salvataggio token fallisce con
  messaggio — coerente col comportamento attuale dell'archivio.

## Sicurezza

- Il token ha SOLO lo scope gist (fine-grained: permesso Gists r/w),
  niente accesso ai repository. Vive nel localStorage come le chiavi API
  già oggi. Se trapela, il danno massimo è leggere/scrivere i gist
  dell'utente — mitigato dalla scadenza del token.
- Il gist segreto è non-listato ma NON cifrato: ci vanno solo esercizi di
  matematica. La chiave API LLM non viaggia mai (deciso esplicitamente).

## Cosa NON cambia

- `gemini.js`, `graph.js`, `topics.js`: intoccati.
- Generazione, PDF, filtri archivio: intoccati (a parte i 3 trigger
  `schedulePush()` e il render condizionale post-merge).
- Nessuna dipendenza esterna: `fetch` nativo verso `api.github.com`.

## Verifica

- **Automatica (node --test):** suite completa sulla funzione di merge —
  voci solo locali / solo remote / entrambe, conflitto stella nei due
  versi, lapidi che eliminano da entrambi i lati, lapide + ri-generazione,
  remoto vuoto, remoto corrotto, version sconosciuta, fallback updatedAt
  mancante (voci pre-sync). Più i test esistenti di `history.js` estesi a
  `updatedAt`/lapidi/`exportState`/`mergeState`.
- **Manuale (checklist a 2 dispositivi):** setup token su Mac → gist
  creato; setup su iPhone → gist trovato senza id; esercizio dal Mac
  appare su iPhone alla riapertura; stella da iPhone vince sul Mac;
  eliminazione dal Mac non risorge da iPhone; modalità aereo → l'app
  funziona e riallinea al ritorno della rete; token revocato → stato
  errore chiaro, archivio locale intatto.
