# Design: Espansione argomenti, filtri, sotto-tipi e generazione multipla

**Data:** 2026-07-07
**Stato:** approvato in brainstorming, in attesa di review sul documento scritto

## Obiettivo

MathFlow AI viene usata come supporto alle ripetizioni, principalmente per
studenti di Medie e Superiori (biennio e triennio). Il catalogo attuale
(22 argomenti) è troppo povero e la UI non scala oltre ~20 bottoni. Cinque
interventi:

1. Espandere il catalogo argomenti, con espansione massiccia sulle **Superiori**
   e moderata sulle **Medie**. **Elementari e Università restano invariati.**
2. Filtri per **macro-area** sopra la griglia degli argomenti.
3. **Ricerca che filtra live la griglia** (oltre al dropdown esistente).
4. **Sotto-tipi di esercizio** selezionabili dentro l'argomento.
5. Campo **numero di esercizi** da generare in un colpo (default 1, max 10).

Nessuna modifica a `graph.js`: tutti i nuovi argomenti riusano i `graphHint`
esistenti (`linear`, `quadratic`, `trigonometric`, `exponential`, `system`,
`derivative`, `integral`, `bar-chart`, `fraction-pie`, `custom`, `geometry`,
`none`).

## 1. Modello dati (`topics.js`)

Ogni voce di `window.TOPICS` guadagna due campi:

```js
{
  level: 'Superiori',
  topic: 'Parabola',
  icon: '🌉',
  graphHint: 'quadratic',
  area: 'Geometria analitica',            // macro-area per i filtri
  subtypes: ['Vertice e fuoco', 'Retta tangente', 'Parabola per tre punti']
}
```

- `area` — stringa libera ma coerente per livello; usata per generare i chip
  di filtro. Aree previste: **Aritmetica**, **Algebra**, **Geometria**,
  **Geometria analitica**, **Analisi**, **Probabilità e statistica**,
  **Trigonometria**.
- `subtypes` — array di stringhe (3–6 voci), i tipi di esercizio proposti
  quando si apre l'argomento. Può essere vuoto/omesso: in quel caso la UI non
  mostra i chip dei sotto-tipi.
- Anche le voci esistenti ricevono `area` e `subtypes`.

### Catalogo

**Elementari (5, invariati)** — solo aggiunta di `area`/`subtypes` alle voci
esistenti.

**Medie (5 → 13)** — voci esistenti + 8 nuove:

| Argomento | Area | graphHint |
|---|---|---|
| Espressioni Aritmetiche | Aritmetica | none |
| Multipli, Divisori, MCD e mcm | Aritmetica | none |
| Monomi e Polinomi | Algebra | none |
| Teorema di Pitagora | Geometria | geometry |
| Geometria Solida | Geometria | none |
| Piano Cartesiano | Geometria analitica | linear |
| Statistica e Grafici | Probabilità e statistica | bar-chart |
| Probabilità di Base | Probabilità e statistica | bar-chart |

**Superiori (7 → ~32)** — voci esistenti + ~25 nuove, coprendo biennio e
triennio:

*Biennio:*

| Argomento | Area | graphHint |
|---|---|---|
| Radicali | Algebra | none |
| Polinomi e Prodotti Notevoli | Algebra | none |
| Scomposizione in Fattori | Algebra | none |
| Frazioni Algebriche | Algebra | none |
| Equazioni Fratte | Algebra | none |
| Equazioni e Disequazioni con Valore Assoluto | Algebra | custom |
| Sistemi di Disequazioni | Algebra | custom |
| Retta nel Piano Cartesiano | Geometria analitica | linear |
| Geometria Euclidea | Geometria | geometry |
| Statistica Descrittiva | Probabilità e statistica | bar-chart |

*Triennio:*

| Argomento | Area | graphHint |
|---|---|---|
| Parabola | Geometria analitica | quadratic |
| Circonferenza | Geometria analitica | geometry |
| Ellisse e Iperbole | Geometria analitica | none |
| Funzioni e Dominio | Analisi | custom |
| Funzioni Irrazionali | Analisi | custom |
| Goniometria | Trigonometria | trigonometric |
| Equazioni Goniometriche | Trigonometria | trigonometric |
| Equazioni Esponenziali | Analisi | exponential |
| Equazioni Logaritmiche | Analisi | custom |
| Studio di Funzione | Analisi | custom |
| Continuità e Asintoti | Analisi | custom |
| Calcolo Combinatorio | Probabilità e statistica | none |
| Probabilità | Probabilità e statistica | bar-chart |
| Numeri Complessi | Algebra | none |
| Successioni e Progressioni | Analisi | custom |

Tre voci esistenti delle Superiori vengono **assorbite** dalle nuove per
evitare doppioni: "Trigonometria" (coperta da Goniometria + Equazioni
Goniometriche), "Logaritmi ed Esponenziali" (coperta da Equazioni Esponenziali
+ Equazioni Logaritmiche) e "Geometria Analitica" (coperta da Retta, Parabola,
Circonferenza, Ellisse e Iperbole). Le altre quattro (Equazioni di Secondo
Grado, Sistemi di Equazioni, Disequazioni, Limiti) restano e ricevono
`area`/`subtypes`.

**Università (5, invariati)** — solo `area`/`subtypes`.

Ogni argomento (nuovo ed esistente) riceve 3–6 `subtypes` specifici e
didatticamente sensati (es. per "Scomposizione in Fattori": raccoglimento,
differenza di quadrati, trinomio speciale, Ruffini; per "Studio di Funzione":
razionale fratta, irrazionale, esponenziale, logaritmica). La lista completa
viene definita nel piano di implementazione.

## 2. Filtri macro-area (`app.js`, `index.html`, `style.css`)

- Sopra la griglia degli argomenti compare una riga di chip: **Tutti** (default)
  + le aree effettivamente presenti nel livello selezionato, ricavate
  dinamicamente da `TOPICS`.
- Cliccare un chip filtra le card della griglia; il chip attivo è evidenziato.
- Cambiare livello resetta il filtro a "Tutti".
- Con pochi argomenti (Elementari) la riga chip compare comunque, ma con poche
  voci — nessun caso speciale.

## 3. Ricerca che filtra la griglia (`app.js`)

- La barra di ricerca esistente in alto, oltre al dropdown attuale (che resta,
  perché copre il salto cross-livello e l'argomento personalizzato), **filtra
  live le card della griglia** del livello corrente mentre si digita
  (match case-insensitive sul nome dell'argomento).
- Il filtro ricerca si combina in AND con il filtro macro-area attivo.
- Svuotare la ricerca ripristina la griglia (rispettando il chip attivo).

## 4. Sotto-tipi di esercizio (`app.js`, `gemini.js`)

- Nella schermata esercizio, accanto ai controlli di difficoltà, una riga di
  chip: **Qualsiasi** (default) + i `subtypes` dell'argomento corrente.
- Aprire l'argomento genera subito con "Qualsiasi", come oggi.
- Cliccare un chip diverso rigenera immediatamente l'esercizio con quel
  vincolo (stessa UX dei controlli di difficoltà).
- `GeminiAPI.generateExercise` accetta un parametro opzionale `subtype`;
  se presente, il prompt utente aggiunge un'istruzione tipo
  *"L'esercizio deve essere specificamente di questo tipo: …"*.
- Per gli argomenti personalizzati ("Altro" / ricerca) non ci sono sotto-tipi.

## 5. Numero di esercizi (`app.js`, `index.html`, `style.css`)

- Campo numerico accanto ai controlli di difficoltà: default `1`, min 1,
  max 10, sovrascrivibile da tastiera.
- Con N > 1: **N chiamate sequenziali** a `GeminiAPI.generateExercise`
  (riuso integrale di prompt, validazione e retry con backoff esistenti).
  Lo status mostra l'avanzamento ("Esercizio 2 di 5…").
- Gli esercizi vengono renderizzati **impilati e numerati** nella vista
  esercizio; i pannelli (teoria/soluzione/grafico) restano indipendenti per
  ciascuno. I grafici restano lazy (render alla prima espansione del pannello).
- L'**export PDF** include tutti gli esercizi generati.
- I controlli di difficoltà/sotto-tipo con N > 1 rigenerano l'intero batch.

### Gestione errori del batch

- Se una generazione fallisce dopo i retry, si mostrano gli esercizi riusciti
  più un avviso ("Generati 3 esercizi su 5") con un bottone **"Completa i
  mancanti"** che genera solo quelli falliti.
- Se falliscono tutte (es. API key mancante), comportamento identico a oggi
  (`handleError`).

## Fuori scope

- Nessuna modifica a `graph.js` e nessun nuovo tipo di grafico.
- Nessuna cronologia/preferiti, nessuna modalità verifica (possibili sviluppi
  futuri).
- `exercises.js` resta dead code, non viene toccato.

## Test

Non esiste una test suite: verifica manuale servendo la cartella in locale.
Checklist minima: filtri per area su ogni livello, ricerca+filtro combinati,
generazione singola invariata, batch da 3 con successo, batch con fallimento
simulato (disconnettere la rete a metà batch), export PDF di un batch,
sotto-tipo che influenza davvero il testo dell'esercizio.
