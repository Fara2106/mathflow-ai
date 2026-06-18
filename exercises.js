// ============================================================
// EXERCISES DATABASE - Selettore Esercizi Ripetizioni
// Tutti i contenuti sono in italiano.
// ============================================================

window.EXERCISES_DATA = [

  // =====================================================
  //  ELEMENTARI
  // =====================================================

  // --- Addizioni e Sottrazioni ---
  {
    id: 'add-1',
    level: 'Elementari',
    topic: 'Addizioni e Sottrazioni',
    topicIcon: '➕',
    theory: '<h3>Addizioni e Sottrazioni</h3><p>L\'<strong>addizione</strong> è l\'operazione che unisce due o più quantità. Il simbolo è <strong>+</strong>. I numeri che sommiamo si chiamano <strong>addendi</strong> e il risultato si chiama <strong>somma</strong>.</p><p>La <strong>sottrazione</strong> è l\'operazione inversa dell\'addizione. Il simbolo è <strong>−</strong>. Il primo numero si chiama <strong>minuendo</strong>, il secondo <strong>sottraendo</strong> e il risultato <strong>differenza</strong> (o resto).</p><p><strong>Proprietà dell\'addizione:</strong></p><ul><li><strong>Commutativa:</strong> l\'ordine degli addendi non cambia la somma → 3 + 5 = 5 + 3</li><li><strong>Associativa:</strong> si possono raggruppare gli addendi → (2 + 3) + 4 = 2 + (3 + 4)</li><li><strong>Elemento neutro:</strong> aggiungere 0 non cambia il numero → 7 + 0 = 7</li></ul><p><strong>Suggerimento:</strong> Per le addizioni in colonna, ricorda di incolonnare bene le unità sotto le unità, le decine sotto le decine, ecc.</p>',
    exerciseText: '<p>Calcola il risultato delle seguenti operazioni:</p><p class="math-formula">234 + 158 = ?</p>',
    result: '<p class="math-formula">234 + 158 = 392</p>',
    solution: '<p><strong>Passo 1:</strong> Sommiamo le unità: 4 + 8 = 12. Scriviamo 2 e riportiamo 1.</p><p><strong>Passo 2:</strong> Sommiamo le decine: 3 + 5 + 1 (riporto) = 9.</p><p><strong>Passo 3:</strong> Sommiamo le centinaia: 2 + 1 = 3.</p><p><strong>Risultato:</strong></p><p class="math-formula">234 + 158 = 392</p>',
    graph: { type: 'bar-chart', config: { labels: ['Primo numero', 'Secondo numero', 'Somma'], values: [234, 158, 392], colors: ['#4CAF50', '#2196F3', '#FF9800'] } }
  },
  {
    id: 'add-2',
    level: 'Elementari',
    topic: 'Addizioni e Sottrazioni',
    topicIcon: '➕',
    theory: '<h3>Addizioni e Sottrazioni</h3><p>L\'<strong>addizione</strong> è l\'operazione che unisce due o più quantità. Il simbolo è <strong>+</strong>. I numeri che sommiamo si chiamano <strong>addendi</strong> e il risultato si chiama <strong>somma</strong>.</p><p>La <strong>sottrazione</strong> è l\'operazione inversa dell\'addizione. Il simbolo è <strong>−</strong>. Il primo numero si chiama <strong>minuendo</strong>, il secondo <strong>sottraendo</strong> e il risultato <strong>differenza</strong> (o resto).</p><p><strong>Proprietà dell\'addizione:</strong></p><ul><li><strong>Commutativa:</strong> l\'ordine degli addendi non cambia la somma → 3 + 5 = 5 + 3</li><li><strong>Associativa:</strong> si possono raggruppare gli addendi → (2 + 3) + 4 = 2 + (3 + 4)</li><li><strong>Elemento neutro:</strong> aggiungere 0 non cambia il numero → 7 + 0 = 7</li></ul><p><strong>Nella sottrazione</strong> l\'ordine conta! 8 − 3 ≠ 3 − 8. Se il sottraendo è più grande del minuendo, il risultato è negativo.</p>',
    exerciseText: '<p>Calcola il risultato della seguente sottrazione:</p><p class="math-formula">503 − 287 = ?</p>',
    result: '<p class="math-formula">503 − 287 = 216</p>',
    solution: '<p><strong>Passo 1:</strong> Unità: 3 − 7 non si può fare, prendiamo in prestito 1 decina → 13 − 7 = 6.</p><p><strong>Passo 2:</strong> Decine: 0 − 1 (prestito) = −1, non si può. Prendiamo in prestito 1 centinaia → 10 − 1 − 8 = 1.</p><p><strong>Passo 3:</strong> Centinaia: 5 − 1 (prestito) − 2 = 2.</p><p><strong>Risultato:</strong></p><p class="math-formula">503 − 287 = 216</p>',
    graph: { type: 'bar-chart', config: { labels: ['Minuendo', 'Sottraendo', 'Differenza'], values: [503, 287, 216], colors: ['#4CAF50', '#f44336', '#FF9800'] } }
  },
  {
    id: 'add-3',
    level: 'Elementari',
    topic: 'Addizioni e Sottrazioni',
    topicIcon: '➕',
    theory: '<h3>Addizioni e Sottrazioni</h3><p>L\'<strong>addizione</strong> è l\'operazione che unisce due o più quantità. Il simbolo è <strong>+</strong>. I numeri che sommiamo si chiamano <strong>addendi</strong> e il risultato si chiama <strong>somma</strong>.</p><p>La <strong>sottrazione</strong> è l\'operazione inversa dell\'addizione. Il simbolo è <strong>−</strong>.</p><p><strong>Addizioni con più addendi:</strong> Quando dobbiamo sommare tre o più numeri, possiamo procedere da sinistra a destra oppure raggruppare i numeri che insieme fanno cifre tonde (multipli di 10).</p><p><strong>Esempio:</strong> 17 + 23 + 8 → conviene fare prima 17 + 23 = 40 e poi 40 + 8 = 48.</p>',
    exerciseText: '<p>Marco ha 45 figurine. Ne riceve 28 dal suo amico e poi ne regala 13. Quante figurine ha ora Marco?</p>',
    result: '<p class="math-formula">45 + 28 − 13 = 60 figurine</p>',
    solution: '<p><strong>Passo 1:</strong> Marco parte con 45 figurine.</p><p><strong>Passo 2:</strong> Ne riceve 28, quindi facciamo un\'addizione: 45 + 28 = 73.</p><p><strong>Passo 3:</strong> Ne regala 13, quindi facciamo una sottrazione: 73 − 13 = 60.</p><p><strong>Risposta:</strong> Marco ha <strong>60 figurine</strong>.</p>',
    graph: { type: 'bar-chart', config: { labels: ['Iniziali', 'Ricevute', 'Regalate', 'Finali'], values: [45, 28, 13, 60], colors: ['#4CAF50', '#2196F3', '#f44336', '#FF9800'] } }
  },

  // --- Moltiplicazioni e Divisioni ---
  {
    id: 'mol-1',
    level: 'Elementari',
    topic: 'Moltiplicazioni e Divisioni',
    topicIcon: '✖️',
    theory: '<h3>Moltiplicazioni e Divisioni</h3><p>La <strong>moltiplicazione</strong> è un\'addizione ripetuta. Il simbolo è <strong>×</strong>. I numeri che moltiplichiamo si chiamano <strong>fattori</strong> e il risultato si chiama <strong>prodotto</strong>.</p><p><strong>Esempio:</strong> 4 × 3 significa \"4 ripetuto 3 volte\" → 4 + 4 + 4 = 12</p><p><strong>Proprietà della moltiplicazione:</strong></p><ul><li><strong>Commutativa:</strong> 3 × 5 = 5 × 3</li><li><strong>Associativa:</strong> (2 × 3) × 4 = 2 × (3 × 4)</li><li><strong>Elemento neutro:</strong> qualsiasi numero × 1 = quel numero</li><li><strong>Elemento assorbente:</strong> qualsiasi numero × 0 = 0</li><li><strong>Distributiva:</strong> 3 × (4 + 2) = 3 × 4 + 3 × 2</li></ul><p>La <strong>divisione</strong> è l\'operazione inversa della moltiplicazione. Il simbolo è <strong>÷</strong> o <strong>:</strong>.</p>',
    exerciseText: '<p>Calcola il seguente prodotto:</p><p class="math-formula">24 × 15 = ?</p>',
    result: '<p class="math-formula">24 × 15 = 360</p>',
    solution: '<p><strong>Passo 1:</strong> Scomponiamo 15 = 10 + 5 (proprietà distributiva).</p><p><strong>Passo 2:</strong> 24 × 10 = 240</p><p><strong>Passo 3:</strong> 24 × 5 = 120</p><p><strong>Passo 4:</strong> 240 + 120 = 360</p><p><strong>Risultato:</strong></p><p class="math-formula">24 × 15 = 360</p>',
    graph: { type: 'bar-chart', config: { labels: ['24 × 10', '24 × 5', 'Prodotto totale'], values: [240, 120, 360], colors: ['#4CAF50', '#2196F3', '#FF9800'] } }
  },
  {
    id: 'mol-2',
    level: 'Elementari',
    topic: 'Moltiplicazioni e Divisioni',
    topicIcon: '✖️',
    theory: '<h3>Moltiplicazioni e Divisioni</h3><p>La <strong>moltiplicazione</strong> è un\'addizione ripetuta. La <strong>divisione</strong> è l\'operazione inversa della moltiplicazione.</p><p>Nella divisione: il numero da dividere si chiama <strong>dividendo</strong>, il numero per cui si divide si chiama <strong>divisore</strong>, il risultato si chiama <strong>quoziente</strong>.</p><p>Se la divisione non è esatta, c\'è anche un <strong>resto</strong>.</p><p><strong>Regola fondamentale:</strong> dividendo = divisore × quoziente + resto</p><p><strong>Attenzione:</strong> Non si può mai dividere per 0!</p>',
    exerciseText: '<p>Esegui la seguente divisione e indica quoziente e resto:</p><p class="math-formula">156 ÷ 7 = ?</p>',
    result: '<p class="math-formula">156 ÷ 7 = 22 con resto 2</p>',
    solution: '<p><strong>Passo 1:</strong> Quante volte il 7 sta nel 15? → 7 × 2 = 14, ci sta 2 volte. Resto: 15 − 14 = 1.</p><p><strong>Passo 2:</strong> Abbassiamo il 6: otteniamo 16.</p><p><strong>Passo 3:</strong> Quante volte il 7 sta nel 16? → 7 × 2 = 14, ci sta 2 volte. Resto: 16 − 14 = 2.</p><p><strong>Verifica:</strong> 7 × 22 + 2 = 154 + 2 = 156 ✓</p><p><strong>Risultato:</strong> Quoziente = 22, Resto = 2</p>',
    graph: { type: 'bar-chart', config: { labels: ['Dividendo', 'Divisore × Quoziente', 'Resto'], values: [156, 154, 2], colors: ['#4CAF50', '#2196F3', '#f44336'] } }
  },
  {
    id: 'mol-3',
    level: 'Elementari',
    topic: 'Moltiplicazioni e Divisioni',
    topicIcon: '✖️',
    theory: '<h3>Moltiplicazioni e Divisioni</h3><p>La <strong>moltiplicazione</strong> è un\'addizione ripetuta. La <strong>divisione</strong> è l\'operazione inversa della moltiplicazione.</p><p><strong>Problemi con moltiplicazioni e divisioni:</strong> Leggere bene il testo e capire se devo ripetere (moltiplicare) o distribuire (dividere).</p><p><strong>Parole chiave per la moltiplicazione:</strong> \"ciascuno\", \"ogni\", \"per\", \"il doppio\", \"il triplo\".</p><p><strong>Parole chiave per la divisione:</strong> \"dividi\", \"distribuisci\", \"ripartisci\", \"la metà\", \"un terzo\".</p>',
    exerciseText: '<p>Una pasticceria prepara 12 scatole di biscotti. Ogni scatola contiene 8 biscotti. Quanti biscotti sono stati preparati in tutto?</p>',
    result: '<p class="math-formula">12 × 8 = 96 biscotti</p>',
    solution: '<p><strong>Passo 1:</strong> Individuiamo i dati: 12 scatole, 8 biscotti per scatola.</p><p><strong>Passo 2:</strong> \"Ogni scatola contiene\" → dobbiamo moltiplicare.</p><p><strong>Passo 3:</strong> 12 × 8 = 96</p><p><strong>Risposta:</strong> In tutto sono stati preparati <strong>96 biscotti</strong>.</p>',
    graph: { type: 'bar-chart', config: { labels: ['Scatole', 'Biscotti per scatola', 'Totale biscotti'], values: [12, 8, 96], colors: ['#9C27B0', '#4CAF50', '#FF9800'] } }
  },

  // --- Frazioni ---
  {
    id: 'fra-1',
    level: 'Elementari',
    topic: 'Frazioni',
    topicIcon: '🍕',
    theory: '<h3>Le Frazioni</h3><p>Una <strong>frazione</strong> è un modo per rappresentare una parte di un intero. Si scrive come:</p><p class="math-formula"><span class="fraction"><span class="num">numeratore</span><span class="den">denominatore</span></span></p><p>Il <strong>numeratore</strong> (sopra) indica quante parti prendiamo. Il <strong>denominatore</strong> (sotto) indica in quante parti uguali è diviso l\'intero.</p><p><strong>Esempio:</strong> <span class="fraction"><span class="num">3</span><span class="den">4</span></span> significa che dividiamo qualcosa in 4 parti uguali e ne prendiamo 3.</p><p><strong>Tipi di frazioni:</strong></p><ul><li><strong>Propria:</strong> numeratore &lt; denominatore (es. <span class="fraction"><span class="num">2</span><span class="den">5</span></span>)</li><li><strong>Impropria:</strong> numeratore &gt; denominatore (es. <span class="fraction"><span class="num">7</span><span class="den">3</span></span>)</li><li><strong>Apparente:</strong> numeratore è multiplo del denominatore (es. <span class="fraction"><span class="num">6</span><span class="den">3</span></span> = 2)</li></ul>',
    exerciseText: '<p>Una pizza viene tagliata in 8 fette uguali. Marco ne mangia 3 fette. Quale frazione della pizza ha mangiato Marco?</p>',
    result: '<p class="math-formula"><span class="fraction"><span class="num">3</span><span class="den">8</span></span></p>',
    solution: '<p><strong>Passo 1:</strong> La pizza è divisa in 8 fette uguali → il denominatore è 8.</p><p><strong>Passo 2:</strong> Marco mangia 3 fette → il numeratore è 3.</p><p><strong>Passo 3:</strong> La frazione è <span class="fraction"><span class="num">3</span><span class="den">8</span></span></p><p>Marco ha mangiato <strong>tre ottavi</strong> della pizza.</p>',
    graph: { type: 'fraction-pie', config: { numerator: 3, denominator: 8 } }
  },
  {
    id: 'fra-2',
    level: 'Elementari',
    topic: 'Frazioni',
    topicIcon: '🍕',
    theory: '<h3>Le Frazioni</h3><p>Una <strong>frazione</strong> rappresenta una parte di un intero.</p><p><strong>Frazioni equivalenti:</strong> Due frazioni sono equivalenti se rappresentano la stessa quantità. Per ottenere una frazione equivalente, moltiplica (o dividi) numeratore e denominatore per lo stesso numero.</p><p><strong>Esempio:</strong> <span class="fraction"><span class="num">1</span><span class="den">2</span></span> = <span class="fraction"><span class="num">2</span><span class="den">4</span></span> = <span class="fraction"><span class="num">3</span><span class="den">6</span></span></p><p><strong>Ridurre ai minimi termini:</strong> Dividi numeratore e denominatore per il loro M.C.D. (Massimo Comun Divisore).</p>',
    exerciseText: '<p>Riduci ai minimi termini la seguente frazione:</p><p class="math-formula"><span class="fraction"><span class="num">12</span><span class="den">18</span></span></p>',
    result: '<p class="math-formula"><span class="fraction"><span class="num">2</span><span class="den">3</span></span></p>',
    solution: '<p><strong>Passo 1:</strong> Troviamo il M.C.D. di 12 e 18.</p><p>Divisori di 12: 1, 2, 3, 4, 6, 12</p><p>Divisori di 18: 1, 2, 3, 6, 9, 18</p><p>M.C.D. = 6</p><p><strong>Passo 2:</strong> Dividiamo numeratore e denominatore per 6:</p><p class="math-formula"><span class="fraction"><span class="num">12 ÷ 6</span><span class="den">18 ÷ 6</span></span> = <span class="fraction"><span class="num">2</span><span class="den">3</span></span></p>',
    graph: { type: 'fraction-pie', config: { numerator: 2, denominator: 3 } }
  },
  {
    id: 'fra-3',
    level: 'Elementari',
    topic: 'Frazioni',
    topicIcon: '🍕',
    theory: '<h3>Le Frazioni</h3><p><strong>Somma di frazioni con lo stesso denominatore:</strong> Si sommano i numeratori e si mantiene il denominatore.</p><p class="math-formula"><span class="fraction"><span class="num">a</span><span class="den">c</span></span> + <span class="fraction"><span class="num">b</span><span class="den">c</span></span> = <span class="fraction"><span class="num">a + b</span><span class="den">c</span></span></p><p><strong>Somma di frazioni con denominatore diverso:</strong> Bisogna prima trovare il m.c.m. (minimo comune multiplo) dei denominatori, poi ridurre le frazioni allo stesso denominatore e infine sommare i numeratori.</p>',
    exerciseText: '<p>Calcola la somma:</p><p class="math-formula"><span class="fraction"><span class="num">2</span><span class="den">5</span></span> + <span class="fraction"><span class="num">1</span><span class="den">5</span></span> = ?</p>',
    result: '<p class="math-formula"><span class="fraction"><span class="num">3</span><span class="den">5</span></span></p>',
    solution: '<p><strong>Passo 1:</strong> Le frazioni hanno lo stesso denominatore (5), quindi sommiamo solo i numeratori.</p><p><strong>Passo 2:</strong> 2 + 1 = 3</p><p><strong>Passo 3:</strong> Il risultato è:</p><p class="math-formula"><span class="fraction"><span class="num">2</span><span class="den">5</span></span> + <span class="fraction"><span class="num">1</span><span class="den">5</span></span> = <span class="fraction"><span class="num">3</span><span class="den">5</span></span></p>',
    graph: { type: 'fraction-pie', config: { numerator: 3, denominator: 5 } }
  },

  // --- Geometria Base ---
  {
    id: 'geo-el-1',
    level: 'Elementari',
    topic: 'Geometria Base',
    topicIcon: '📐',
    theory: '<h3>Geometria Base: il Perimetro</h3><p>Il <strong>perimetro</strong> è la misura del contorno di una figura, cioè la somma delle lunghezze di tutti i suoi lati.</p><p><strong>Formule principali:</strong></p><ul><li><strong>Quadrato:</strong> P = 4 × l (l = lato)</li><li><strong>Rettangolo:</strong> P = 2 × (b + h) (b = base, h = altezza)</li><li><strong>Triangolo:</strong> P = l₁ + l₂ + l₃ (somma dei tre lati)</li></ul><p>Il perimetro si misura in unità di lunghezza: cm, m, km, ecc.</p>',
    exerciseText: '<p>Calcola il perimetro di un rettangolo con base 12 cm e altezza 7 cm.</p>',
    result: '<p class="math-formula">P = 38 cm</p>',
    solution: '<p><strong>Passo 1:</strong> Scriviamo la formula del perimetro del rettangolo:</p><p class="math-formula">P = 2 × (b + h)</p><p><strong>Passo 2:</strong> Sostituiamo i valori: b = 12 cm, h = 7 cm</p><p class="math-formula">P = 2 × (12 + 7) = 2 × 19 = 38 cm</p>',
    graph: null
  },
  {
    id: 'geo-el-2',
    level: 'Elementari',
    topic: 'Geometria Base',
    topicIcon: '📐',
    theory: '<h3>Geometria Base: l\'Area</h3><p>L\'<strong>area</strong> è la misura della superficie di una figura piana.</p><p><strong>Formule principali:</strong></p><ul><li><strong>Quadrato:</strong> A = l × l = l²</li><li><strong>Rettangolo:</strong> A = b × h</li><li><strong>Triangolo:</strong> A = (b × h) ÷ 2</li></ul><p>L\'area si misura in unità di superficie: cm², m², km², ecc.</p>',
    exerciseText: '<p>Calcola l\'area di un quadrato con il lato di 9 cm.</p>',
    result: '<p class="math-formula">A = 81 cm²</p>',
    solution: '<p><strong>Passo 1:</strong> Scriviamo la formula dell\'area del quadrato:</p><p class="math-formula">A = l × l = l²</p><p><strong>Passo 2:</strong> Sostituiamo: l = 9 cm</p><p class="math-formula">A = 9 × 9 = 81 cm²</p>',
    graph: null
  },
  {
    id: 'geo-el-3',
    level: 'Elementari',
    topic: 'Geometria Base',
    topicIcon: '📐',
    theory: '<h3>Geometria Base: il Triangolo</h3><p>Il <strong>triangolo</strong> è un poligono con tre lati e tre angoli.</p><p><strong>Area del triangolo:</strong></p><p class="math-formula">A = (base × altezza) ÷ 2</p><p>L\'<strong>altezza</strong> è il segmento perpendicolare che va da un vertice al lato opposto (la base).</p><p><strong>Classificazione per i lati:</strong></p><ul><li><strong>Equilatero:</strong> 3 lati uguali</li><li><strong>Isoscele:</strong> 2 lati uguali</li><li><strong>Scaleno:</strong> tutti i lati diversi</li></ul>',
    exerciseText: '<p>Calcola l\'area di un triangolo con base 10 cm e altezza 6 cm.</p>',
    result: '<p class="math-formula">A = 30 cm²</p>',
    solution: '<p><strong>Passo 1:</strong> Scriviamo la formula dell\'area del triangolo:</p><p class="math-formula">A = (b × h) ÷ 2</p><p><strong>Passo 2:</strong> Sostituiamo: b = 10 cm, h = 6 cm</p><p class="math-formula">A = (10 × 6) ÷ 2 = 60 ÷ 2 = 30 cm²</p>',
    graph: null
  },

  // =====================================================
  //  MEDIE
  // =====================================================

  // --- Equazioni di Primo Grado ---
  {
    id: 'eq1-1',
    level: 'Medie',
    topic: 'Equazioni di Primo Grado',
    topicIcon: '🔢',
    theory: '<h3>Equazioni di Primo Grado</h3><p>Un\'<strong>equazione di primo grado</strong> è un\'uguaglianza con un\'incognita (di solito <em>x</em>) che compare al massimo con esponente 1.</p><p><strong>Forma generale:</strong></p><p class="math-formula">ax + b = 0</p><p>dove <em>a</em> ≠ 0.</p><p><strong>Principi di equivalenza:</strong></p><ul><li><strong>Primo principio:</strong> Aggiungendo o sottraendo lo stesso numero a entrambi i membri, l\'equazione non cambia.</li><li><strong>Secondo principio:</strong> Moltiplicando o dividendo entrambi i membri per lo stesso numero (≠ 0), l\'equazione non cambia.</li></ul><p><strong>Regola pratica:</strong> Quando spostiamo un termine dall\'altra parte del segno =, cambiamo il suo segno.</p><p><strong>Soluzione:</strong> x = −b/a</p>',
    exerciseText: '<p>Risolvi la seguente equazione:</p><p class="math-formula">3x + 7 = 22</p>',
    result: '<p class="math-formula">x = 5</p>',
    solution: '<p><strong>Passo 1:</strong> Spostiamo il 7 a destra cambiando segno:</p><p class="math-formula">3x = 22 − 7</p><p class="math-formula">3x = 15</p><p><strong>Passo 2:</strong> Dividiamo entrambi i membri per 3:</p><p class="math-formula">x = 15 ÷ 3 = 5</p><p><strong>Verifica:</strong> 3(5) + 7 = 15 + 7 = 22 ✓</p>',
    graph: { type: 'linear', config: { slope: 3, intercept: -15, xRange: [-10, 10] } }
  },
  {
    id: 'eq1-2',
    level: 'Medie',
    topic: 'Equazioni di Primo Grado',
    topicIcon: '🔢',
    theory: '<h3>Equazioni di Primo Grado</h3><p>Un\'<strong>equazione di primo grado</strong> è un\'uguaglianza con un\'incognita che compare al massimo con esponente 1.</p><p><strong>Equazioni con l\'incognita in entrambi i membri:</strong></p><p>Quando la <em>x</em> appare sia a sinistra che a destra del segno =, bisogna raccogliere tutti i termini con <em>x</em> da un lato e tutti i numeri dall\'altro.</p><p><strong>Procedimento:</strong></p><ol><li>Sposta tutti i termini con <em>x</em> a sinistra</li><li>Sposta tutti i numeri a destra</li><li>Semplifica</li><li>Dividi per il coefficiente di <em>x</em></li></ol>',
    exerciseText: '<p>Risolvi la seguente equazione:</p><p class="math-formula">5x − 3 = 2x + 9</p>',
    result: '<p class="math-formula">x = 4</p>',
    solution: '<p><strong>Passo 1:</strong> Portiamo i termini con <em>x</em> a sinistra e i numeri a destra:</p><p class="math-formula">5x − 2x = 9 + 3</p><p><strong>Passo 2:</strong> Semplifichiamo:</p><p class="math-formula">3x = 12</p><p><strong>Passo 3:</strong> Dividiamo per 3:</p><p class="math-formula">x = 4</p><p><strong>Verifica:</strong> 5(4) − 3 = 20 − 3 = 17 e 2(4) + 9 = 8 + 9 = 17 ✓</p>',
    graph: { type: 'linear', config: { slope: 3, intercept: -12, xRange: [-10, 10] } }
  },
  {
    id: 'eq1-3',
    level: 'Medie',
    topic: 'Equazioni di Primo Grado',
    topicIcon: '🔢',
    theory: '<h3>Equazioni di Primo Grado</h3><p>Un\'<strong>equazione di primo grado</strong> è un\'uguaglianza con un\'incognita che compare al massimo con esponente 1.</p><p><strong>Equazioni con parentesi e frazioni:</strong></p><p>Quando un\'equazione contiene parentesi, bisogna prima sviluppare i prodotti. Quando contiene frazioni, si può moltiplicare tutto per il m.c.m. dei denominatori per eliminare le frazioni.</p>',
    exerciseText: '<p>Risolvi la seguente equazione:</p><p class="math-formula">2(x + 4) − 3 = x + 11</p>',
    result: '<p class="math-formula">x = 6</p>',
    solution: '<p><strong>Passo 1:</strong> Sviluppiamo la parentesi:</p><p class="math-formula">2x + 8 − 3 = x + 11</p><p><strong>Passo 2:</strong> Semplifichiamo a sinistra:</p><p class="math-formula">2x + 5 = x + 11</p><p><strong>Passo 3:</strong> Portiamo la <em>x</em> a sinistra e i numeri a destra:</p><p class="math-formula">2x − x = 11 − 5</p><p class="math-formula">x = 6</p><p><strong>Verifica:</strong> 2(6 + 4) − 3 = 2(10) − 3 = 20 − 3 = 17 e 6 + 11 = 17 ✓</p>',
    graph: { type: 'linear', config: { slope: 1, intercept: -6, xRange: [-10, 10] } }
  },

  // --- Proporzioni e Percentuali ---
  {
    id: 'prop-1',
    level: 'Medie',
    topic: 'Proporzioni e Percentuali',
    topicIcon: '📊',
    theory: '<h3>Proporzioni e Percentuali</h3><p>Una <strong>proporzione</strong> è un\'uguaglianza tra due rapporti:</p><p class="math-formula">a : b = c : d</p><p>Si legge \"a sta a b come c sta a d\". I termini <em>a</em> e <em>d</em> si chiamano <strong>estremi</strong>, <em>b</em> e <em>c</em> si chiamano <strong>medi</strong>.</p><p><strong>Proprietà fondamentale:</strong> Il prodotto dei medi è uguale al prodotto degli estremi:</p><p class="math-formula">a × d = b × c</p><p><strong>La percentuale</strong> è una proporzione speciale dove il secondo rapporto ha denominatore 100:</p><p class="math-formula">parte : intero = percentuale : 100</p>',
    exerciseText: '<p>Trova il termine incognito nella seguente proporzione:</p><p class="math-formula">4 : 6 = x : 15</p>',
    result: '<p class="math-formula">x = 10</p>',
    solution: '<p><strong>Passo 1:</strong> Applichiamo la proprietà fondamentale (prodotto dei mezzi = prodotto degli estremi):</p><p class="math-formula">6 × x = 4 × 15</p><p><strong>Passo 2:</strong> Calcoliamo:</p><p class="math-formula">6x = 60</p><p><strong>Passo 3:</strong> Dividiamo per 6:</p><p class="math-formula">x = 60 ÷ 6 = 10</p><p><strong>Verifica:</strong> 4 : 6 = 10 : 15 → 4/6 = 2/3 e 10/15 = 2/3 ✓</p>',
    graph: { type: 'bar-chart', config: { labels: ['4', '6', '10', '15'], values: [4, 6, 10, 15], colors: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'] } }
  },
  {
    id: 'prop-2',
    level: 'Medie',
    topic: 'Proporzioni e Percentuali',
    topicIcon: '📊',
    theory: '<h3>Proporzioni e Percentuali</h3><p>La <strong>percentuale</strong> indica quante parti su 100. Il simbolo è <strong>%</strong>.</p><p><strong>Per calcolare la percentuale di un numero:</strong></p><p class="math-formula">Percentuale = (Numero × Tasso%) ÷ 100</p><p><strong>Esempio:</strong> Il 25% di 200 = (200 × 25) ÷ 100 = 50</p><p><strong>Problemi tipici:</strong></p><ul><li>Trovare la percentuale di un numero</li><li>Trovare il numero dato la percentuale</li><li>Trovare la percentuale tra due numeri</li></ul>',
    exerciseText: '<p>In una classe di 30 alunni, il 40% ha preso un voto superiore a 8. Quanti alunni hanno preso più di 8?</p>',
    result: '<p class="math-formula">12 alunni</p>',
    solution: '<p><strong>Passo 1:</strong> Dobbiamo calcolare il 40% di 30.</p><p><strong>Passo 2:</strong> Applichiamo la formula:</p><p class="math-formula">(30 × 40) ÷ 100 = 1200 ÷ 100 = 12</p><p><strong>Risposta:</strong> <strong>12 alunni</strong> hanno preso un voto superiore a 8.</p>',
    graph: { type: 'bar-chart', config: { labels: ['Totale alunni', 'Voto > 8 (40%)', 'Voto ≤ 8 (60%)'], values: [30, 12, 18], colors: ['#607D8B', '#4CAF50', '#FF9800'] } }
  },
  {
    id: 'prop-3',
    level: 'Medie',
    topic: 'Proporzioni e Percentuali',
    topicIcon: '📊',
    theory: '<h3>Proporzioni e Percentuali</h3><p><strong>Sconto e prezzo scontato:</strong></p><p>Quando un prodotto ha uno sconto, il prezzo finale si calcola così:</p><p class="math-formula">Sconto = (Prezzo × Percentuale sconto) ÷ 100</p><p class="math-formula">Prezzo scontato = Prezzo − Sconto</p><p><strong>Formula diretta:</strong></p><p class="math-formula">Prezzo scontato = Prezzo × (100 − Sconto%) ÷ 100</p>',
    exerciseText: '<p>Un paio di scarpe costa 80 €. Se c\'è uno sconto del 15%, qual è il prezzo scontato?</p>',
    result: '<p class="math-formula">Prezzo scontato = 68 €</p>',
    solution: '<p><strong>Passo 1:</strong> Calcoliamo lo sconto:</p><p class="math-formula">Sconto = (80 × 15) ÷ 100 = 1200 ÷ 100 = 12 €</p><p><strong>Passo 2:</strong> Calcoliamo il prezzo scontato:</p><p class="math-formula">Prezzo scontato = 80 − 12 = 68 €</p>',
    graph: { type: 'bar-chart', config: { labels: ['Prezzo originale', 'Sconto (15%)', 'Prezzo scontato'], values: [80, 12, 68], colors: ['#2196F3', '#f44336', '#4CAF50'] } }
  },

  // --- Geometria Piana ---
  {
    id: 'geop-1',
    level: 'Medie',
    topic: 'Geometria Piana',
    topicIcon: '📏',
    theory: '<h3>Geometria Piana</h3><p><strong>Il Teorema di Pitagora:</strong></p><p>In un <strong>triangolo rettangolo</strong>, il quadrato dell\'ipotenusa è uguale alla somma dei quadrati dei cateti:</p><p class="math-formula">c² = a² + b²</p><p>dove <em>c</em> è l\'ipotenusa (il lato opposto all\'angolo retto) e <em>a</em>, <em>b</em> sono i cateti.</p><p><strong>Per trovare un cateto:</strong></p><p class="math-formula">a = √(c² − b²)</p><p><strong>Terne pitagoriche famose:</strong> (3, 4, 5), (5, 12, 13), (8, 15, 17)</p>',
    exerciseText: '<p>Un triangolo rettangolo ha i cateti di 6 cm e 8 cm. Calcola l\'ipotenusa.</p>',
    result: '<p class="math-formula">c = 10 cm</p>',
    solution: '<p><strong>Passo 1:</strong> Applichiamo il Teorema di Pitagora:</p><p class="math-formula">c² = a² + b²</p><p><strong>Passo 2:</strong> Sostituiamo:</p><p class="math-formula">c² = 6² + 8² = 36 + 64 = 100</p><p><strong>Passo 3:</strong> Estraiamo la radice quadrata:</p><p class="math-formula">c = √100 = 10 cm</p><p><strong>Nota:</strong> (6, 8, 10) è un multiplo della terna pitagorica (3, 4, 5).</p>',
    graph: null
  },
  {
    id: 'geop-2',
    level: 'Medie',
    topic: 'Geometria Piana',
    topicIcon: '📏',
    theory: '<h3>Geometria Piana: il Cerchio</h3><p>Il <strong>cerchio</strong> è la parte di piano delimitata da una circonferenza.</p><p><strong>Formule:</strong></p><ul><li><strong>Circonferenza:</strong> C = 2πr = πd</li><li><strong>Area del cerchio:</strong> A = πr²</li></ul><p>dove <em>r</em> è il raggio, <em>d</em> è il diametro (d = 2r) e <em>π</em> ≈ 3,14.</p>',
    exerciseText: '<p>Calcola la circonferenza e l\'area di un cerchio con raggio r = 7 cm. (Usa π ≈ 3,14)</p>',
    result: '<p class="math-formula">C ≈ 43,96 cm &nbsp;&nbsp; A ≈ 153,86 cm²</p>',
    solution: '<p><strong>Circonferenza:</strong></p><p class="math-formula">C = 2 × π × r = 2 × 3,14 × 7 = 43,96 cm</p><p><strong>Area:</strong></p><p class="math-formula">A = π × r² = 3,14 × 7² = 3,14 × 49 = 153,86 cm²</p>',
    graph: null
  },
  {
    id: 'geop-3',
    level: 'Medie',
    topic: 'Geometria Piana',
    topicIcon: '📏',
    theory: '<h3>Geometria Piana: il Trapezio</h3><p>Il <strong>trapezio</strong> è un quadrilatero con due lati paralleli chiamati <strong>basi</strong> (base maggiore B e base minore b).</p><p><strong>Area del trapezio:</strong></p><p class="math-formula">A = <span class="fraction"><span class="num">(B + b) × h</span><span class="den">2</span></span></p><p>dove <em>h</em> è l\'altezza (distanza tra le due basi).</p>',
    exerciseText: '<p>Calcola l\'area di un trapezio con base maggiore B = 14 cm, base minore b = 8 cm e altezza h = 5 cm.</p>',
    result: '<p class="math-formula">A = 55 cm²</p>',
    solution: '<p><strong>Passo 1:</strong> Scriviamo la formula:</p><p class="math-formula">A = (B + b) × h ÷ 2</p><p><strong>Passo 2:</strong> Sostituiamo:</p><p class="math-formula">A = (14 + 8) × 5 ÷ 2 = 22 × 5 ÷ 2 = 110 ÷ 2 = 55 cm²</p>',
    graph: null
  },

  // --- Potenze e Radici ---
  {
    id: 'pot-1',
    level: 'Medie',
    topic: 'Potenze e Radici',
    topicIcon: '🔋',
    theory: '<h3>Potenze e Radici</h3><p>La <strong>potenza</strong> è una moltiplicazione ripetuta:</p><p class="math-formula">a<sup>n</sup> = a × a × a × ... (n volte)</p><p>dove <em>a</em> è la <strong>base</strong> e <em>n</em> è l\'<strong>esponente</strong>.</p><p><strong>Proprietà delle potenze:</strong></p><ul><li>a<sup>m</sup> × a<sup>n</sup> = a<sup>m+n</sup> (stessa base → somma esponenti)</li><li>a<sup>m</sup> ÷ a<sup>n</sup> = a<sup>m−n</sup> (stessa base → differenza esponenti)</li><li>(a<sup>m</sup>)<sup>n</sup> = a<sup>m×n</sup> (potenza di potenza → prodotto esponenti)</li><li>a<sup>0</sup> = 1 (qualsiasi numero elevato a 0 è 1, tranne 0<sup>0</sup>)</li><li>a<sup>1</sup> = a</li></ul><p>La <strong>radice quadrata</strong> è l\'operazione inversa della potenza con esponente 2: √a = b significa b² = a.</p>',
    exerciseText: '<p>Semplifica la seguente espressione con le potenze:</p><p class="math-formula">2<sup>3</sup> × 2<sup>4</sup> ÷ 2<sup>5</sup> = ?</p>',
    result: '<p class="math-formula">2<sup>2</sup> = 4</p>',
    solution: '<p><strong>Passo 1:</strong> Applichiamo la proprietà del prodotto di potenze con stessa base:</p><p class="math-formula">2<sup>3</sup> × 2<sup>4</sup> = 2<sup>3+4</sup> = 2<sup>7</sup></p><p><strong>Passo 2:</strong> Applichiamo la proprietà del quoziente:</p><p class="math-formula">2<sup>7</sup> ÷ 2<sup>5</sup> = 2<sup>7−5</sup> = 2<sup>2</sup></p><p><strong>Passo 3:</strong> Calcoliamo:</p><p class="math-formula">2<sup>2</sup> = 4</p>',
    graph: { type: 'exponential', config: { base: 2, xRange: [-3, 5] } }
  },
  {
    id: 'pot-2',
    level: 'Medie',
    topic: 'Potenze e Radici',
    topicIcon: '🔋',
    theory: '<h3>Potenze e Radici</h3><p>La <strong>radice quadrata</strong> √a è il numero che, moltiplicato per se stesso, dà <em>a</em>.</p><p><strong>Proprietà delle radici:</strong></p><ul><li>√(a × b) = √a × √b</li><li>√(a ÷ b) = √a ÷ √b</li><li>√(a²) = |a|</li></ul><p><strong>Radici quadrate da ricordare:</strong> √1 = 1, √4 = 2, √9 = 3, √16 = 4, √25 = 5, √36 = 6, √49 = 7, √64 = 8, √81 = 9, √100 = 10</p>',
    exerciseText: '<p>Calcola il valore della seguente espressione:</p><p class="math-formula">√144 + √81 − √25 = ?</p>',
    result: '<p class="math-formula">12 + 9 − 5 = 16</p>',
    solution: '<p><strong>Passo 1:</strong> Calcoliamo ogni radice separatamente:</p><p class="math-formula">√144 = 12 (perché 12 × 12 = 144)</p><p class="math-formula">√81 = 9 (perché 9 × 9 = 81)</p><p class="math-formula">√25 = 5 (perché 5 × 5 = 25)</p><p><strong>Passo 2:</strong> Sommiamo e sottraiamo:</p><p class="math-formula">12 + 9 − 5 = 16</p>',
    graph: { type: 'exponential', config: { base: 2, xRange: [-3, 5] } }
  },
  {
    id: 'pot-3',
    level: 'Medie',
    topic: 'Potenze e Radici',
    topicIcon: '🔋',
    theory: '<h3>Potenze e Radici</h3><p><strong>Notazione scientifica:</strong></p><p>Un numero in notazione scientifica si scrive come:</p><p class="math-formula">a × 10<sup>n</sup></p><p>dove 1 ≤ a < 10 e <em>n</em> è un intero.</p><p><strong>Esempi:</strong></p><ul><li>3.500 = 3,5 × 10<sup>3</sup></li><li>0,0042 = 4,2 × 10<sup>−3</sup></li></ul>',
    exerciseText: '<p>Scrivi in notazione scientifica il numero:</p><p class="math-formula">72.000.000</p>',
    result: '<p class="math-formula">7,2 × 10<sup>7</sup></p>',
    solution: '<p><strong>Passo 1:</strong> Spostiamo la virgola dopo la prima cifra significativa:</p><p class="math-formula">72.000.000 → 7,2</p><p><strong>Passo 2:</strong> Contiamo di quante posizioni abbiamo spostato la virgola: 7 posizioni verso sinistra.</p><p><strong>Passo 3:</strong> Scriviamo il risultato:</p><p class="math-formula">7,2 × 10<sup>7</sup></p>',
    graph: { type: 'exponential', config: { base: 10, xRange: [-1, 4] } }
  },

  // =====================================================
  //  SUPERIORI
  // =====================================================

  // --- Equazioni di Secondo Grado ---
  {
    id: 'eq2-1',
    level: 'Superiori',
    topic: 'Equazioni di Secondo Grado',
    topicIcon: '📈',
    theory: '<h3>Equazioni di Secondo Grado</h3><p>Un\'equazione di secondo grado ha la forma generale:</p><p class="math-formula">ax² + bx + c = 0</p><p>dove a ≠ 0. Per risolverla si usa la <strong>formula risolutiva</strong>:</p><p class="math-formula">x = (−b ± √(b² − 4ac)) / 2a</p><p>Il <strong>discriminante</strong> Δ = b² − 4ac determina il numero di soluzioni:</p><ul><li>Δ &gt; 0 → due soluzioni reali distinte</li><li>Δ = 0 → una soluzione reale doppia</li><li>Δ &lt; 0 → nessuna soluzione reale</li></ul><p><strong>Relazioni di Viète:</strong> Se x₁ e x₂ sono le soluzioni, allora:</p><ul><li>x₁ + x₂ = −b/a</li><li>x₁ · x₂ = c/a</li></ul>',
    exerciseText: '<p>Risolvi la seguente equazione di secondo grado:</p><p class="math-formula">x² − 5x + 6 = 0</p>',
    result: '<p class="math-formula">x₁ = 2, &nbsp; x₂ = 3</p>',
    solution: '<p><strong>Passo 1:</strong> Identifichiamo i coefficienti: a = 1, b = −5, c = 6</p><p><strong>Passo 2:</strong> Calcoliamo il discriminante:</p><p class="math-formula">Δ = (−5)² − 4(1)(6) = 25 − 24 = 1</p><p><strong>Passo 3:</strong> Applichiamo la formula risolutiva:</p><p class="math-formula">x = (5 ± √1) / 2 = (5 ± 1) / 2</p><p><strong>Passo 4:</strong> Le due soluzioni sono:</p><p class="math-formula">x₁ = (5 − 1) / 2 = 2</p><p class="math-formula">x₂ = (5 + 1) / 2 = 3</p>',
    graph: { type: 'quadratic', config: { a: 1, b: -5, c: 6, xRange: [-2, 7] } }
  },
  {
    id: 'eq2-2',
    level: 'Superiori',
    topic: 'Equazioni di Secondo Grado',
    topicIcon: '📈',
    theory: '<h3>Equazioni di Secondo Grado</h3><p>Un\'equazione di secondo grado ha la forma generale:</p><p class="math-formula">ax² + bx + c = 0</p><p>dove a ≠ 0. Per risolverla si usa la <strong>formula risolutiva</strong>:</p><p class="math-formula">x = (−b ± √(b² − 4ac)) / 2a</p><p>Il <strong>discriminante</strong> Δ = b² − 4ac determina il numero di soluzioni.</p><p><strong>Equazioni di secondo grado pure</strong> (b = 0): ax² + c = 0 → x² = −c/a. Ha soluzioni reali solo se −c/a ≥ 0.</p><p><strong>Equazioni di secondo grado spurie</strong> (c = 0): ax² + bx = 0 → x(ax + b) = 0. Una soluzione è sempre x = 0.</p>',
    exerciseText: '<p>Risolvi la seguente equazione di secondo grado:</p><p class="math-formula">2x² + 3x − 2 = 0</p>',
    result: '<p class="math-formula">x₁ = <span class="fraction"><span class="num">1</span><span class="den">2</span></span>, &nbsp; x₂ = −2</p>',
    solution: '<p><strong>Passo 1:</strong> Identifichiamo: a = 2, b = 3, c = −2</p><p><strong>Passo 2:</strong> Discriminante:</p><p class="math-formula">Δ = 3² − 4(2)(−2) = 9 + 16 = 25</p><p><strong>Passo 3:</strong> Formula risolutiva:</p><p class="math-formula">x = (−3 ± √25) / (2·2) = (−3 ± 5) / 4</p><p><strong>Passo 4:</strong></p><p class="math-formula">x₁ = (−3 + 5) / 4 = 2/4 = 1/2</p><p class="math-formula">x₂ = (−3 − 5) / 4 = −8/4 = −2</p>',
    graph: { type: 'quadratic', config: { a: 2, b: 3, c: -2, xRange: [-4, 3] } }
  },
  {
    id: 'eq2-3',
    level: 'Superiori',
    topic: 'Equazioni di Secondo Grado',
    topicIcon: '📈',
    theory: '<h3>Equazioni di Secondo Grado</h3><p>Un\'equazione di secondo grado ha la forma generale:</p><p class="math-formula">ax² + bx + c = 0</p><p><strong>Caso Δ = 0 (discriminante nullo):</strong></p><p>Quando Δ = 0, l\'equazione ha una <strong>soluzione doppia</strong>:</p><p class="math-formula">x = −b / 2a</p><p>Graficamente, la parabola è <strong>tangente</strong> all\'asse x.</p>',
    exerciseText: '<p>Risolvi la seguente equazione di secondo grado:</p><p class="math-formula">x² − 6x + 9 = 0</p>',
    result: '<p class="math-formula">x = 3 (soluzione doppia)</p>',
    solution: '<p><strong>Passo 1:</strong> Identifichiamo: a = 1, b = −6, c = 9</p><p><strong>Passo 2:</strong> Discriminante:</p><p class="math-formula">Δ = (−6)² − 4(1)(9) = 36 − 36 = 0</p><p><strong>Passo 3:</strong> Essendo Δ = 0, c\'è una soluzione doppia:</p><p class="math-formula">x = −(−6) / (2·1) = 6/2 = 3</p><p><strong>Nota:</strong> L\'equazione si può scrivere come (x − 3)² = 0, che conferma la soluzione doppia x = 3.</p>',
    graph: { type: 'quadratic', config: { a: 1, b: -6, c: 9, xRange: [-1, 7] } }
  },

  // --- Sistemi di Equazioni ---
  {
    id: 'sis-1',
    level: 'Superiori',
    topic: 'Sistemi di Equazioni',
    topicIcon: '🔀',
    theory: '<h3>Sistemi di Equazioni</h3><p>Un <strong>sistema di equazioni lineari</strong> è un insieme di equazioni che devono essere soddisfatte contemporaneamente.</p><p><strong>Metodi di risoluzione:</strong></p><ul><li><strong>Sostituzione:</strong> Si ricava un\'incognita da un\'equazione e si sostituisce nell\'altra.</li><li><strong>Addizione/sottrazione (riduzione):</strong> Si sommano o sottraggono le equazioni per eliminare un\'incognita.</li><li><strong>Confronto:</strong> Si ricava la stessa incognita da entrambe le equazioni e si uguagliano.</li><li><strong>Cramer:</strong> Si usano i determinanti (per sistemi 2×2).</li></ul><p><strong>Interpretazione grafica:</strong> La soluzione è il punto di intersezione delle due rette.</p>',
    exerciseText: '<p>Risolvi il seguente sistema di equazioni:</p><p class="math-formula">⎧ 2x + y = 7<br>⎩ x − y = 2</p>',
    result: '<p class="math-formula">x = 3, &nbsp; y = 1</p>',
    solution: '<p><strong>Metodo per addizione:</strong></p><p><strong>Passo 1:</strong> Sommiamo le due equazioni membro a membro:</p><p class="math-formula">(2x + y) + (x − y) = 7 + 2</p><p class="math-formula">3x = 9</p><p class="math-formula">x = 3</p><p><strong>Passo 2:</strong> Sostituiamo x = 3 nella seconda equazione:</p><p class="math-formula">3 − y = 2 → y = 1</p><p><strong>Verifica:</strong> 2(3) + 1 = 7 ✓ e 3 − 1 = 2 ✓</p>',
    graph: { type: 'system', config: { eq1: { slope: -2, intercept: 7 }, eq2: { slope: 1, intercept: -2 }, xRange: [-5, 8] } }
  },
  {
    id: 'sis-2',
    level: 'Superiori',
    topic: 'Sistemi di Equazioni',
    topicIcon: '🔀',
    theory: '<h3>Sistemi di Equazioni</h3><p>Un <strong>sistema di equazioni lineari</strong> è un insieme di equazioni che devono essere soddisfatte contemporaneamente.</p><p><strong>Metodo di sostituzione:</strong></p><ol><li>Isola una variabile in una delle equazioni</li><li>Sostituisci l\'espressione trovata nell\'altra equazione</li><li>Risolvi l\'equazione in una sola incognita</li><li>Trova il valore dell\'altra variabile</li></ol>',
    exerciseText: '<p>Risolvi il seguente sistema con il metodo di sostituzione:</p><p class="math-formula">⎧ y = 2x − 1<br>⎩ 3x + y = 14</p>',
    result: '<p class="math-formula">x = 3, &nbsp; y = 5</p>',
    solution: '<p><strong>Passo 1:</strong> Dalla prima equazione sappiamo che y = 2x − 1.</p><p><strong>Passo 2:</strong> Sostituiamo nella seconda equazione:</p><p class="math-formula">3x + (2x − 1) = 14</p><p class="math-formula">5x − 1 = 14</p><p class="math-formula">5x = 15</p><p class="math-formula">x = 3</p><p><strong>Passo 3:</strong> Troviamo y:</p><p class="math-formula">y = 2(3) − 1 = 6 − 1 = 5</p><p><strong>Verifica:</strong> y = 2(3) − 1 = 5 ✓ e 3(3) + 5 = 14 ✓</p>',
    graph: { type: 'system', config: { eq1: { slope: 2, intercept: -1 }, eq2: { slope: -3, intercept: 14 }, xRange: [-5, 8] } }
  },
  {
    id: 'sis-3',
    level: 'Superiori',
    topic: 'Sistemi di Equazioni',
    topicIcon: '🔀',
    theory: '<h3>Sistemi di Equazioni</h3><p><strong>Metodo di Cramer</strong> (per sistemi 2×2):</p><p>Dato il sistema ax + by = e e cx + dy = f, le soluzioni sono:</p><p class="math-formula">D = ad − bc (determinante della matrice dei coefficienti)</p><p class="math-formula">x = (ed − bf) / D</p><p class="math-formula">y = (af − ec) / D</p><p>Il sistema ha soluzione unica se D ≠ 0.</p>',
    exerciseText: '<p>Risolvi il seguente sistema con il metodo di Cramer:</p><p class="math-formula">⎧ 4x − 3y = 11<br>⎩ 2x + 5y = 1</p>',
    result: '<p class="math-formula">x = 2, &nbsp; y = −<span class="fraction"><span class="num">3</span><span class="den">5</span></span> → x = <span class="fraction"><span class="num">58</span><span class="den">26</span></span>, y = −<span class="fraction"><span class="num">18</span><span class="den">26</span></span></p>',
    solution: '<p><strong>Passo 1:</strong> Calcoliamo il determinante D:</p><p class="math-formula">D = (4)(5) − (−3)(2) = 20 + 6 = 26</p><p><strong>Passo 2:</strong> Calcoliamo x:</p><p class="math-formula">Dₓ = (11)(5) − (−3)(1) = 55 + 3 = 58</p><p class="math-formula">x = 58 / 26 = 29/13</p><p><strong>Passo 3:</strong> Calcoliamo y:</p><p class="math-formula">Dᵧ = (4)(1) − (11)(2) = 4 − 22 = −18</p><p class="math-formula">y = −18 / 26 = −9/13</p>',
    graph: { type: 'system', config: { eq1: { slope: 4/3, intercept: -11/3 }, eq2: { slope: -2/5, intercept: 1/5 }, xRange: [-5, 8] } }
  },

  // --- Trigonometria ---
  {
    id: 'trig-1',
    level: 'Superiori',
    topic: 'Trigonometria',
    topicIcon: '📐',
    theory: '<h3>Trigonometria</h3><p>La trigonometria studia le relazioni tra angoli e lati dei triangoli.</p><p><strong>Funzioni trigonometriche fondamentali</strong> (in un triangolo rettangolo):</p><ul><li><strong>sin(α)</strong> = cateto opposto / ipotenusa</li><li><strong>cos(α)</strong> = cateto adiacente / ipotenusa</li><li><strong>tan(α)</strong> = cateto opposto / cateto adiacente = sin(α) / cos(α)</li></ul><p><strong>Identità fondamentale:</strong></p><p class="math-formula">sin²(α) + cos²(α) = 1</p><p><strong>Valori notevoli:</strong></p><ul><li>sin(30°) = 1/2, &nbsp; cos(30°) = √3/2, &nbsp; tan(30°) = √3/3</li><li>sin(45°) = √2/2, &nbsp; cos(45°) = √2/2, &nbsp; tan(45°) = 1</li><li>sin(60°) = √3/2, &nbsp; cos(60°) = 1/2, &nbsp; tan(60°) = √3</li></ul>',
    exerciseText: '<p>Calcola il valore dell\'espressione:</p><p class="math-formula">sin²(30°) + cos²(60°) + tan(45°)</p>',
    result: '<p class="math-formula"><span class="fraction"><span class="num">1</span><span class="den">4</span></span> + <span class="fraction"><span class="num">1</span><span class="den">4</span></span> + 1 = <span class="fraction"><span class="num">3</span><span class="den">2</span></span></p>',
    solution: '<p><strong>Passo 1:</strong> Sostituiamo i valori notevoli:</p><p class="math-formula">sin(30°) = 1/2 → sin²(30°) = (1/2)² = 1/4</p><p class="math-formula">cos(60°) = 1/2 → cos²(60°) = (1/2)² = 1/4</p><p class="math-formula">tan(45°) = 1</p><p><strong>Passo 2:</strong> Sommiamo:</p><p class="math-formula">1/4 + 1/4 + 1 = 2/4 + 1 = 1/2 + 1 = 3/2</p>',
    graph: { type: 'trigonometric', config: { func: 'sin', amplitude: 1, period: 1, phase: 0, xRange: [-2 * Math.PI, 2 * Math.PI] } }
  },
  {
    id: 'trig-2',
    level: 'Superiori',
    topic: 'Trigonometria',
    topicIcon: '📐',
    theory: '<h3>Trigonometria: Equazioni Goniometriche</h3><p>Un\'<strong>equazione goniometrica</strong> è un\'equazione che contiene funzioni trigonometriche dell\'incognita.</p><p><strong>Equazioni elementari:</strong></p><ul><li>sin(x) = k → x = arcsin(k) + 2kπ oppure x = π − arcsin(k) + 2kπ</li><li>cos(x) = k → x = ± arccos(k) + 2kπ</li><li>tan(x) = k → x = arctan(k) + kπ</li></ul><p><strong>Attenzione:</strong> Le funzioni trigonometriche sono periodiche, quindi le soluzioni sono infinite (a meno che non sia specificato un intervallo).</p>',
    exerciseText: '<p>Risolvi l\'equazione goniometrica nell\'intervallo [0, 2π):</p><p class="math-formula">2sin(x) − 1 = 0</p>',
    result: '<p class="math-formula">x = π/6, &nbsp; x = 5π/6</p>',
    solution: '<p><strong>Passo 1:</strong> Isoliamo sin(x):</p><p class="math-formula">2sin(x) = 1</p><p class="math-formula">sin(x) = 1/2</p><p><strong>Passo 2:</strong> Cerchiamo gli angoli nell\'intervallo [0, 2π) per cui il seno vale 1/2:</p><p class="math-formula">x₁ = π/6 (30°) — primo quadrante</p><p class="math-formula">x₂ = π − π/6 = 5π/6 (150°) — secondo quadrante</p><p>(Il seno è positivo nel I e II quadrante)</p>',
    graph: { type: 'trigonometric', config: { func: 'sin', amplitude: 2, period: 1, phase: 0, xRange: [-2 * Math.PI, 2 * Math.PI] } }
  },
  {
    id: 'trig-3',
    level: 'Superiori',
    topic: 'Trigonometria',
    topicIcon: '📐',
    theory: '<h3>Trigonometria: Formule di Addizione</h3><p>Le <strong>formule di addizione e sottrazione</strong> permettono di calcolare le funzioni trigonometriche di somme e differenze di angoli:</p><ul><li>sin(α ± β) = sin(α)cos(β) ± cos(α)sin(β)</li><li>cos(α ± β) = cos(α)cos(β) ∓ sin(α)sin(β)</li></ul><p><strong>Formule di duplicazione:</strong></p><ul><li>sin(2α) = 2sin(α)cos(α)</li><li>cos(2α) = cos²(α) − sin²(α) = 2cos²(α) − 1 = 1 − 2sin²(α)</li></ul>',
    exerciseText: '<p>Calcola il valore di sin(75°) usando le formule di addizione.</p><p><em>Suggerimento: 75° = 45° + 30°</em></p>',
    result: '<p class="math-formula">sin(75°) = (√6 + √2) / 4</p>',
    solution: '<p><strong>Passo 1:</strong> Scriviamo 75° = 45° + 30° e applichiamo la formula:</p><p class="math-formula">sin(75°) = sin(45° + 30°)</p><p class="math-formula">= sin(45°)cos(30°) + cos(45°)sin(30°)</p><p><strong>Passo 2:</strong> Sostituiamo i valori notevoli:</p><p class="math-formula">= (√2/2)(√3/2) + (√2/2)(1/2)</p><p class="math-formula">= √6/4 + √2/4</p><p class="math-formula">= (√6 + √2) / 4</p><p><strong>Valore approssimato:</strong> ≈ 0,9659</p>',
    graph: { type: 'trigonometric', config: { func: 'sin', amplitude: 1, period: 1, phase: 0, xRange: [-2 * Math.PI, 2 * Math.PI] } }
  },

  // --- Logaritmi ed Esponenziali ---
  {
    id: 'log-1',
    level: 'Superiori',
    topic: 'Logaritmi ed Esponenziali',
    topicIcon: '📉',
    theory: '<h3>Logaritmi ed Esponenziali</h3><p>Il <strong>logaritmo</strong> è l\'operazione inversa dell\'esponenziale:</p><p class="math-formula">log<sub>a</sub>(b) = c &nbsp; ⟺ &nbsp; a<sup>c</sup> = b</p><p>dove <em>a</em> &gt; 0, <em>a</em> ≠ 1 e <em>b</em> &gt; 0.</p><p><strong>Proprietà dei logaritmi:</strong></p><ul><li>log<sub>a</sub>(x · y) = log<sub>a</sub>(x) + log<sub>a</sub>(y)</li><li>log<sub>a</sub>(x / y) = log<sub>a</sub>(x) − log<sub>a</sub>(y)</li><li>log<sub>a</sub>(x<sup>n</sup>) = n · log<sub>a</sub>(x)</li><li>log<sub>a</sub>(a) = 1</li><li>log<sub>a</sub>(1) = 0</li></ul><p><strong>Cambio di base:</strong></p><p class="math-formula">log<sub>a</sub>(b) = log<sub>c</sub>(b) / log<sub>c</sub>(a)</p>',
    exerciseText: '<p>Calcola il valore della seguente espressione:</p><p class="math-formula">log<sub>2</sub>(8) + log<sub>3</sub>(27) − log<sub>5</sub>(25)</p>',
    result: '<p class="math-formula">3 + 3 − 2 = 4</p>',
    solution: '<p><strong>Passo 1:</strong> Calcoliamo ogni logaritmo:</p><p class="math-formula">log<sub>2</sub>(8) = log<sub>2</sub>(2³) = 3</p><p class="math-formula">log<sub>3</sub>(27) = log<sub>3</sub>(3³) = 3</p><p class="math-formula">log<sub>5</sub>(25) = log<sub>5</sub>(5²) = 2</p><p><strong>Passo 2:</strong> Sommiamo:</p><p class="math-formula">3 + 3 − 2 = 4</p>',
    graph: { type: 'exponential', config: { base: 2, xRange: [-2, 5] } }
  },
  {
    id: 'log-2',
    level: 'Superiori',
    topic: 'Logaritmi ed Esponenziali',
    topicIcon: '📉',
    theory: '<h3>Logaritmi ed Esponenziali</h3><p><strong>Equazioni esponenziali:</strong> Sono equazioni in cui l\'incognita è all\'esponente.</p><p><strong>Metodo di risoluzione:</strong></p><ol><li>Se possibile, riconduci i due membri alla stessa base: a<sup>f(x)</sup> = a<sup>g(x)</sup> → f(x) = g(x)</li><li>Altrimenti, applica il logaritmo a entrambi i membri</li></ol><p><strong>Equazioni logaritmiche:</strong> Sono equazioni che contengono logaritmi dell\'incognita. Si risolvono usando le proprietà dei logaritmi e poi verificando le condizioni di esistenza (argomento > 0).</p>',
    exerciseText: '<p>Risolvi l\'equazione esponenziale:</p><p class="math-formula">3<sup>2x−1</sup> = 27</p>',
    result: '<p class="math-formula">x = 2</p>',
    solution: '<p><strong>Passo 1:</strong> Scriviamo 27 come potenza di 3:</p><p class="math-formula">27 = 3³</p><p><strong>Passo 2:</strong> L\'equazione diventa:</p><p class="math-formula">3<sup>2x−1</sup> = 3³</p><p><strong>Passo 3:</strong> Stessa base → uguagliamo gli esponenti:</p><p class="math-formula">2x − 1 = 3</p><p class="math-formula">2x = 4</p><p class="math-formula">x = 2</p><p><strong>Verifica:</strong> 3<sup>2(2)−1</sup> = 3<sup>3</sup> = 27 ✓</p>',
    graph: { type: 'exponential', config: { base: 3, xRange: [-2, 4] } }
  },
  {
    id: 'log-3',
    level: 'Superiori',
    topic: 'Logaritmi ed Esponenziali',
    topicIcon: '📉',
    theory: '<h3>Logaritmi ed Esponenziali</h3><p><strong>Equazioni logaritmiche:</strong> Contengono logaritmi dell\'incognita.</p><p><strong>Regole fondamentali:</strong></p><ul><li>log<sub>a</sub>(x) = k ⟺ x = a<sup>k</sup></li><li>log<sub>a</sub>(f(x)) = log<sub>a</sub>(g(x)) ⟺ f(x) = g(x) (con f(x) > 0 e g(x) > 0)</li></ul><p><strong>Condizioni di esistenza (C.E.):</strong> L\'argomento del logaritmo deve essere strettamente positivo.</p>',
    exerciseText: '<p>Risolvi l\'equazione logaritmica:</p><p class="math-formula">log<sub>2</sub>(x + 3) = 4</p>',
    result: '<p class="math-formula">x = 13</p>',
    solution: '<p><strong>Passo 1:</strong> C.E.: x + 3 > 0 → x > −3</p><p><strong>Passo 2:</strong> Convertiamo dalla forma logaritmica a quella esponenziale:</p><p class="math-formula">log<sub>2</sub>(x + 3) = 4 &nbsp; ⟺ &nbsp; x + 3 = 2<sup>4</sup></p><p><strong>Passo 3:</strong> Calcoliamo:</p><p class="math-formula">x + 3 = 16</p><p class="math-formula">x = 13</p><p><strong>Verifica C.E.:</strong> 13 > −3 ✓</p><p><strong>Verifica:</strong> log<sub>2</sub>(13 + 3) = log<sub>2</sub>(16) = log<sub>2</sub>(2<sup>4</sup>) = 4 ✓</p>',
    graph: { type: 'exponential', config: { base: 2, xRange: [-3, 6] } }
  },

  // --- Limiti ---
  {
    id: 'lim-1',
    level: 'Superiori',
    topic: 'Limiti',
    topicIcon: '♾️',
    theory: '<h3>Limiti</h3><p>Il <strong>limite</strong> descrive il valore a cui tende una funzione quando la variabile si avvicina a un certo punto.</p><p class="math-formula">lim<sub>x→c</sub> f(x) = L</p><p>significa che f(x) si avvicina a L quando x si avvicina a c.</p><p><strong>Limiti fondamentali:</strong></p><ul><li>lim<sub>x→0</sub> sin(x)/x = 1</li><li>lim<sub>x→∞</sub> (1 + 1/x)<sup>x</sup> = e</li><li>lim<sub>x→0</sub> (e<sup>x</sup> − 1)/x = 1</li><li>lim<sub>x→0</sub> ln(1 + x)/x = 1</li></ul><p><strong>Forme indeterminate:</strong> 0/0, ∞/∞, ∞ − ∞, 0 · ∞, 1<sup>∞</sup>, 0<sup>0</sup>, ∞<sup>0</sup></p>',
    exerciseText: '<p>Calcola il seguente limite:</p><p class="math-formula">lim<sub>x→2</sub> (x² − 4) / (x − 2)</p>',
    result: '<p class="math-formula">lim<sub>x→2</sub> (x² − 4) / (x − 2) = 4</p>',
    solution: '<p><strong>Passo 1:</strong> Sostituendo x = 2 otteniamo la forma indeterminata 0/0.</p><p><strong>Passo 2:</strong> Scomponiamo il numeratore (differenza di quadrati):</p><p class="math-formula">x² − 4 = (x − 2)(x + 2)</p><p><strong>Passo 3:</strong> Semplifichiamo:</p><p class="math-formula">(x − 2)(x + 2) / (x − 2) = x + 2</p><p><strong>Passo 4:</strong> Calcoliamo il limite della funzione semplificata:</p><p class="math-formula">lim<sub>x→2</sub> (x + 2) = 2 + 2 = 4</p>',
    graph: { type: 'custom', config: { func: '(x*x - 4) / (x - 2)', xRange: [-3, 6] } }
  },
  {
    id: 'lim-2',
    level: 'Superiori',
    topic: 'Limiti',
    topicIcon: '♾️',
    theory: '<h3>Limiti</h3><p><strong>Limiti all\'infinito:</strong></p><p>Quando x → ∞, il comportamento di una funzione razionale (rapporto di polinomi) dipende dal grado del numeratore (n) e del denominatore (m):</p><ul><li>n &lt; m → il limite è 0</li><li>n = m → il limite è il rapporto dei coefficienti direttivi</li><li>n &gt; m → il limite è ±∞</li></ul>',
    exerciseText: '<p>Calcola il seguente limite:</p><p class="math-formula">lim<sub>x→+∞</sub> (3x² + 2x − 1) / (x² − 5)</p>',
    result: '<p class="math-formula">lim<sub>x→+∞</sub> (3x² + 2x − 1) / (x² − 5) = 3</p>',
    solution: '<p><strong>Passo 1:</strong> Numeratore e denominatore hanno lo stesso grado (2).</p><p><strong>Passo 2:</strong> Dividiamo numeratore e denominatore per x²:</p><p class="math-formula">lim<sub>x→+∞</sub> (3 + 2/x − 1/x²) / (1 − 5/x²)</p><p><strong>Passo 3:</strong> Per x → +∞, i termini 2/x, 1/x², 5/x² tendono a 0:</p><p class="math-formula">= (3 + 0 − 0) / (1 − 0) = 3/1 = 3</p>',
    graph: { type: 'custom', config: { func: '(3*x*x + 2*x - 1) / (x*x - 5)', xRange: [-10, 10] } }
  },
  {
    id: 'lim-3',
    level: 'Superiori',
    topic: 'Limiti',
    topicIcon: '♾️',
    theory: '<h3>Limiti</h3><p><strong>Limite notevole fondamentale:</strong></p><p class="math-formula">lim<sub>x→0</sub> sin(x) / x = 1</p><p>Questo limite è fondamentale in analisi e viene usato per risolvere molti altri limiti.</p><p><strong>Limiti notevoli derivati:</strong></p><ul><li>lim<sub>x→0</sub> (1 − cos(x)) / x² = 1/2</li><li>lim<sub>x→0</sub> tan(x) / x = 1</li><li>lim<sub>x→0</sub> arcsin(x) / x = 1</li></ul>',
    exerciseText: '<p>Calcola il seguente limite:</p><p class="math-formula">lim<sub>x→0</sub> sin(3x) / x</p>',
    result: '<p class="math-formula">lim<sub>x→0</sub> sin(3x) / x = 3</p>',
    solution: '<p><strong>Passo 1:</strong> Moltiplichiamo e dividiamo per 3:</p><p class="math-formula">lim<sub>x→0</sub> sin(3x) / x = lim<sub>x→0</sub> 3 · sin(3x) / (3x)</p><p><strong>Passo 2:</strong> Poniamo t = 3x. Quando x → 0, anche t → 0:</p><p class="math-formula">= 3 · lim<sub>t→0</sub> sin(t) / t</p><p><strong>Passo 3:</strong> Applichiamo il limite notevole sin(t)/t → 1:</p><p class="math-formula">= 3 · 1 = 3</p>',
    graph: { type: 'custom', config: { func: 'Math.sin(3*x) / x', xRange: [-5, 5] } }
  },

  // =====================================================
  //  UNIVERSITÀ
  // =====================================================

  // --- Derivate ---
  {
    id: 'der-1',
    level: 'Università',
    topic: 'Derivate',
    topicIcon: '𝑓\'',
    theory: '<h3>Derivate</h3><p>La <strong>derivata</strong> di una funzione f(x) misura il tasso di variazione istantaneo della funzione. Geometricamente, rappresenta la pendenza della retta tangente al grafico nel punto.</p><p class="math-formula">f\'(x) = lim<sub>h→0</sub> [f(x+h) − f(x)] / h</p><p><strong>Derivate fondamentali:</strong></p><ul><li>(x<sup>n</sup>)\' = n · x<sup>n−1</sup></li><li>(sin x)\' = cos x</li><li>(cos x)\' = −sin x</li><li>(e<sup>x</sup>)\' = e<sup>x</sup></li><li>(ln x)\' = 1/x</li></ul><p><strong>Regole di derivazione:</strong></p><ul><li><strong>Somma:</strong> [f(x) + g(x)]\' = f\'(x) + g\'(x)</li><li><strong>Prodotto:</strong> [f(x) · g(x)]\' = f\'(x) · g(x) + f(x) · g\'(x)</li><li><strong>Quoziente:</strong> [f(x)/g(x)]\' = [f\'(x)g(x) − f(x)g\'(x)] / [g(x)]²</li><li><strong>Catena:</strong> [f(g(x))]\' = f\'(g(x)) · g\'(x)</li></ul>',
    exerciseText: '<p>Calcola la derivata della seguente funzione:</p><p class="math-formula">f(x) = 3x<sup>4</sup> − 2x² + 5x − 7</p>',
    result: '<p class="math-formula">f\'(x) = 12x³ − 4x + 5</p>',
    solution: '<p><strong>Passo 1:</strong> Deriviamo termine per termine:</p><p class="math-formula">(3x<sup>4</sup>)\' = 3 · 4x<sup>3</sup> = 12x³</p><p class="math-formula">(−2x²)\' = −2 · 2x = −4x</p><p class="math-formula">(5x)\' = 5</p><p class="math-formula">(−7)\' = 0</p><p><strong>Passo 2:</strong> Sommiamo:</p><p class="math-formula">f\'(x) = 12x³ − 4x + 5</p>',
    graph: { type: 'derivative', config: { func: '3*x*x*x*x - 2*x*x + 5*x - 7', derivative: '12*x*x*x - 4*x + 5', xRange: [-3, 3] } }
  },
  {
    id: 'der-2',
    level: 'Università',
    topic: 'Derivate',
    topicIcon: '𝑓\'',
    theory: '<h3>Derivate</h3><p>La <strong>regola del prodotto</strong> (o di Leibniz):</p><p class="math-formula">[f(x) · g(x)]\' = f\'(x) · g(x) + f(x) · g\'(x)</p><p>La <strong>regola della catena</strong> (o di composizione):</p><p class="math-formula">[f(g(x))]\' = f\'(g(x)) · g\'(x)</p><p><strong>Esempio:</strong> (sin(2x))\' = cos(2x) · 2 = 2cos(2x)</p>',
    exerciseText: '<p>Calcola la derivata della seguente funzione:</p><p class="math-formula">f(x) = x² · sin(x)</p>',
    result: '<p class="math-formula">f\'(x) = 2x·sin(x) + x²·cos(x)</p>',
    solution: '<p><strong>Passo 1:</strong> Applichiamo la regola del prodotto con f(x) = x² e g(x) = sin(x):</p><p class="math-formula">[x² · sin(x)]\' = (x²)\' · sin(x) + x² · (sin(x))\'</p><p><strong>Passo 2:</strong> Calcoliamo le singole derivate:</p><p class="math-formula">(x²)\' = 2x</p><p class="math-formula">(sin(x))\' = cos(x)</p><p><strong>Passo 3:</strong> Sostituiamo:</p><p class="math-formula">f\'(x) = 2x · sin(x) + x² · cos(x)</p>',
    graph: { type: 'derivative', config: { func: 'x*x*Math.sin(x)', derivative: '2*x*Math.sin(x)+x*x*Math.cos(x)', xRange: [-6, 6] } }
  },
  {
    id: 'der-3',
    level: 'Università',
    topic: 'Derivate',
    topicIcon: '𝑓\'',
    theory: '<h3>Derivate</h3><p><strong>Regola del quoziente:</strong></p><p class="math-formula">[f(x)/g(x)]\' = [f\'(x)·g(x) − f(x)·g\'(x)] / [g(x)]²</p><p><strong>Derivata di funzioni composte con e<sup>x</sup>:</strong></p><p class="math-formula">(e<sup>f(x)</sup>)\' = e<sup>f(x)</sup> · f\'(x)</p><p><strong>Derivata di ln:</strong></p><p class="math-formula">(ln(f(x)))\' = f\'(x) / f(x)</p>',
    exerciseText: '<p>Calcola la derivata della seguente funzione:</p><p class="math-formula">f(x) = e<sup>2x</sup> · ln(x)</p>',
    result: '<p class="math-formula">f\'(x) = e<sup>2x</sup> · (2·ln(x) + 1/x)</p>',
    solution: '<p><strong>Passo 1:</strong> Applichiamo la regola del prodotto:</p><p class="math-formula">[e<sup>2x</sup> · ln(x)]\' = (e<sup>2x</sup>)\' · ln(x) + e<sup>2x</sup> · (ln(x))\'</p><p><strong>Passo 2:</strong> Derivate singole:</p><p class="math-formula">(e<sup>2x</sup>)\' = 2e<sup>2x</sup> (regola della catena)</p><p class="math-formula">(ln(x))\' = 1/x</p><p><strong>Passo 3:</strong> Sostituiamo:</p><p class="math-formula">f\'(x) = 2e<sup>2x</sup> · ln(x) + e<sup>2x</sup> · (1/x)</p><p><strong>Passo 4:</strong> Raccogliamo e<sup>2x</sup>:</p><p class="math-formula">f\'(x) = e<sup>2x</sup> · (2ln(x) + 1/x)</p>',
    graph: { type: 'derivative', config: { func: 'Math.exp(2*x)*Math.log(x)', derivative: 'Math.exp(2*x)*(2*Math.log(x)+1/x)', xRange: [0.1, 3] } }
  },

  // --- Integrali ---
  {
    id: 'int-1',
    level: 'Università',
    topic: 'Integrali',
    topicIcon: '∫',
    theory: '<h3>Integrali</h3><p>L\'<strong>integrale</strong> è l\'operazione inversa della derivata.</p><p><strong>Integrale indefinito:</strong></p><p class="math-formula">∫ f(x) dx = F(x) + C</p><p>dove F(x) è una <strong>primitiva</strong> di f(x), cioè F\'(x) = f(x), e C è la costante di integrazione.</p><p><strong>Integrali fondamentali:</strong></p><ul><li>∫ x<sup>n</sup> dx = x<sup>n+1</sup>/(n+1) + C &nbsp; (n ≠ −1)</li><li>∫ 1/x dx = ln|x| + C</li><li>∫ e<sup>x</sup> dx = e<sup>x</sup> + C</li><li>∫ sin(x) dx = −cos(x) + C</li><li>∫ cos(x) dx = sin(x) + C</li></ul><p><strong>Integrale definito</strong> (Teorema di Torricelli-Barrow):</p><p class="math-formula">∫<sub>a</sub><sup>b</sup> f(x) dx = F(b) − F(a)</p>',
    exerciseText: '<p>Calcola il seguente integrale definito:</p><p class="math-formula">∫<sub>0</sub><sup>2</sup> (3x² + 2x) dx</p>',
    result: '<p class="math-formula">∫<sub>0</sub><sup>2</sup> (3x² + 2x) dx = 12</p>',
    solution: '<p><strong>Passo 1:</strong> Troviamo la primitiva:</p><p class="math-formula">∫ (3x² + 2x) dx = 3 · x³/3 + 2 · x²/2 + C = x³ + x² + C</p><p><strong>Passo 2:</strong> Applichiamo il Teorema di Torricelli-Barrow:</p><p class="math-formula">F(2) − F(0) = (2³ + 2²) − (0³ + 0²)</p><p class="math-formula">= (8 + 4) − (0 + 0)</p><p class="math-formula">= 12</p>',
    graph: { type: 'integral', config: { func: '3*x*x + 2*x', a: 0, b: 2, xRange: [-1, 3] } }
  },
  {
    id: 'int-2',
    level: 'Università',
    topic: 'Integrali',
    topicIcon: '∫',
    theory: '<h3>Integrali</h3><p><strong>Integrazione per sostituzione:</strong></p><p>Se l\'integranda è del tipo f(g(x)) · g\'(x), poniamo t = g(x) e dt = g\'(x) dx:</p><p class="math-formula">∫ f(g(x)) · g\'(x) dx = ∫ f(t) dt</p><p><strong>Integrazione per parti:</strong></p><p class="math-formula">∫ f(x) · g\'(x) dx = f(x) · g(x) − ∫ f\'(x) · g(x) dx</p><p>Regola mnemonica <strong>LIATE</strong> per scegliere f(x): Logaritmi, Inverse trig., Algebriche, Trigonometriche, Esponenziali.</p>',
    exerciseText: '<p>Calcola l\'integrale indefinito:</p><p class="math-formula">∫ x · e<sup>x</sup> dx</p>',
    result: '<p class="math-formula">∫ x · e<sup>x</sup> dx = e<sup>x</sup>(x − 1) + C</p>',
    solution: '<p><strong>Passo 1:</strong> Usiamo l\'integrazione per parti. Scegliamo:</p><p class="math-formula">f(x) = x → f\'(x) = 1</p><p class="math-formula">g\'(x) = e<sup>x</sup> → g(x) = e<sup>x</sup></p><p><strong>Passo 2:</strong> Applichiamo la formula:</p><p class="math-formula">∫ x · e<sup>x</sup> dx = x · e<sup>x</sup> − ∫ 1 · e<sup>x</sup> dx</p><p class="math-formula">= x · e<sup>x</sup> − e<sup>x</sup> + C</p><p><strong>Passo 3:</strong> Raccogliamo:</p><p class="math-formula">= e<sup>x</sup>(x − 1) + C</p>',
    graph: { type: 'integral', config: { func: 'x * Math.exp(x)', a: 0, b: 2, xRange: [-3, 3] } }
  },
  {
    id: 'int-3',
    level: 'Università',
    topic: 'Integrali',
    topicIcon: '∫',
    theory: '<h3>Integrali</h3><p><strong>Integrali di funzioni razionali fratte:</strong></p><p>Per integrare una funzione del tipo P(x)/Q(x):</p><ol><li>Se grado(P) ≥ grado(Q), eseguire la divisione tra polinomi</li><li>Fattorizzare il denominatore Q(x)</li><li>Scomporre in fratti semplici</li><li>Integrare ciascun fratto semplice</li></ol><p><strong>Formule utili:</strong></p><ul><li>∫ 1/(x − a) dx = ln|x − a| + C</li><li>∫ 1/(x² + a²) dx = (1/a) arctan(x/a) + C</li></ul>',
    exerciseText: '<p>Calcola l\'integrale definito:</p><p class="math-formula">∫<sub>1</sub><sup>e</sup> (1/x) dx</p>',
    result: '<p class="math-formula">∫<sub>1</sub><sup>e</sup> (1/x) dx = 1</p>',
    solution: '<p><strong>Passo 1:</strong> La primitiva di 1/x è ln|x|:</p><p class="math-formula">∫ (1/x) dx = ln|x| + C</p><p><strong>Passo 2:</strong> Applichiamo Torricelli-Barrow:</p><p class="math-formula">[ln|x|]<sub>1</sub><sup>e</sup> = ln(e) − ln(1)</p><p class="math-formula">= 1 − 0 = 1</p>',
    graph: { type: 'integral', config: { func: '1/x', a: 1, b: Math.E, xRange: [0.1, 4] } }
  },

  // --- Equazioni Differenziali ---
  {
    id: 'eqdiff-1',
    level: 'Università',
    topic: 'Equazioni Differenziali',
    topicIcon: '📝',
    theory: '<h3>Equazioni Differenziali Ordinarie (EDO)</h3><p>Un\'<strong>equazione differenziale</strong> è un\'equazione che contiene una funzione incognita y(x) e le sue derivate.</p><p><strong>EDO del primo ordine a variabili separabili:</strong></p><p class="math-formula">y\' = f(x) · g(y)</p><p>Si risolve separando le variabili:</p><p class="math-formula">dy/g(y) = f(x) dx</p><p>e integrando entrambi i membri.</p><p><strong>EDO lineari del primo ordine:</strong></p><p class="math-formula">y\' + P(x)·y = Q(x)</p><p>Si risolvono con il fattore integrante μ(x) = e<sup>∫P(x)dx</sup>.</p>',
    exerciseText: '<p>Risolvi l\'equazione differenziale a variabili separabili:</p><p class="math-formula">y\' = 2xy &nbsp;&nbsp; con y(0) = 3</p>',
    result: '<p class="math-formula">y = 3e<sup>x²</sup></p>',
    solution: '<p><strong>Passo 1:</strong> Separiamo le variabili (assumendo y ≠ 0):</p><p class="math-formula">dy/y = 2x dx</p><p><strong>Passo 2:</strong> Integriamo entrambi i membri:</p><p class="math-formula">∫ dy/y = ∫ 2x dx</p><p class="math-formula">ln|y| = x² + C</p><p><strong>Passo 3:</strong> Risolviamo per y:</p><p class="math-formula">y = e<sup>x² + C</sup> = e<sup>C</sup> · e<sup>x²</sup> = A · e<sup>x²</sup></p><p><strong>Passo 4:</strong> Applichiamo la condizione iniziale y(0) = 3:</p><p class="math-formula">3 = A · e<sup>0</sup> = A → A = 3</p><p><strong>Soluzione:</strong></p><p class="math-formula">y = 3e<sup>x²</sup></p>',
    graph: { type: 'custom', config: { func: '3*Math.exp(x*x)', xRange: [-2, 2] } }
  },
  {
    id: 'eqdiff-2',
    level: 'Università',
    topic: 'Equazioni Differenziali',
    topicIcon: '📝',
    theory: '<h3>Equazioni Differenziali Ordinarie (EDO)</h3><p><strong>EDO lineari del secondo ordine a coefficienti costanti:</strong></p><p class="math-formula">ay\'\' + by\' + cy = 0</p><p>Si cerca la soluzione nella forma y = e<sup>rx</sup>, ottenendo l\'<strong>equazione caratteristica</strong>:</p><p class="math-formula">ar² + br + c = 0</p><p><strong>Casi:</strong></p><ul><li>Δ &gt; 0: due radici reali r₁, r₂ → y = C₁e<sup>r₁x</sup> + C₂e<sup>r₂x</sup></li><li>Δ = 0: radice doppia r → y = (C₁ + C₂x)e<sup>rx</sup></li><li>Δ &lt; 0: radici complesse α ± iβ → y = e<sup>αx</sup>(C₁cos(βx) + C₂sin(βx))</li></ul>',
    exerciseText: '<p>Risolvi l\'equazione differenziale del secondo ordine:</p><p class="math-formula">y\'\' − 5y\' + 6y = 0</p>',
    result: '<p class="math-formula">y = C₁e<sup>2x</sup> + C₂e<sup>3x</sup></p>',
    solution: '<p><strong>Passo 1:</strong> Scriviamo l\'equazione caratteristica:</p><p class="math-formula">r² − 5r + 6 = 0</p><p><strong>Passo 2:</strong> Risolviamo (Δ = 25 − 24 = 1 &gt; 0):</p><p class="math-formula">r = (5 ± 1) / 2</p><p class="math-formula">r₁ = 2, &nbsp; r₂ = 3</p><p><strong>Passo 3:</strong> La soluzione generale è:</p><p class="math-formula">y = C₁e<sup>2x</sup> + C₂e<sup>3x</sup></p><p>dove C₁ e C₂ sono costanti arbitrarie.</p>',
    graph: { type: 'custom', config: { func: 'Math.exp(2*x) + Math.exp(3*x)', xRange: [-2, 2] } }
  },
  {
    id: 'eqdiff-3',
    level: 'Università',
    topic: 'Equazioni Differenziali',
    topicIcon: '📝',
    theory: '<h3>Equazioni Differenziali Ordinarie (EDO)</h3><p><strong>EDO lineari del primo ordine:</strong></p><p class="math-formula">y\' + P(x)·y = Q(x)</p><p><strong>Metodo del fattore integrante:</strong></p><ol><li>Calcoliamo μ(x) = e<sup>∫P(x)dx</sup></li><li>Moltiplichiamo l\'equazione per μ(x)</li><li>Il membro sinistro diventa d/dx[μ(x)·y]</li><li>Integriamo entrambi i membri</li></ol>',
    exerciseText: '<p>Risolvi l\'equazione differenziale:</p><p class="math-formula">y\' + y = e<sup>x</sup></p>',
    result: '<p class="math-formula">y = <span class="fraction"><span class="num">e<sup>x</sup></span><span class="den">2</span></span> + Ce<sup>−x</sup></p>',
    solution: '<p><strong>Passo 1:</strong> Identifichiamo P(x) = 1 e Q(x) = e<sup>x</sup>.</p><p><strong>Passo 2:</strong> Calcoliamo il fattore integrante:</p><p class="math-formula">μ(x) = e<sup>∫1 dx</sup> = e<sup>x</sup></p><p><strong>Passo 3:</strong> Moltiplichiamo l\'equazione per e<sup>x</sup>:</p><p class="math-formula">e<sup>x</sup>y\' + e<sup>x</sup>y = e<sup>2x</sup></p><p class="math-formula">d/dx[e<sup>x</sup>·y] = e<sup>2x</sup></p><p><strong>Passo 4:</strong> Integriamo:</p><p class="math-formula">e<sup>x</sup>·y = ∫ e<sup>2x</sup> dx = e<sup>2x</sup>/2 + C</p><p><strong>Passo 5:</strong> Dividiamo per e<sup>x</sup>:</p><p class="math-formula">y = e<sup>x</sup>/2 + Ce<sup>−x</sup></p>',
    graph: { type: 'custom', config: { func: 'Math.exp(x)/2 + Math.exp(-x)', xRange: [-3, 3] } }
  },

  // --- Algebra Lineare ---
  {
    id: 'alin-1',
    level: 'Università',
    topic: 'Algebra Lineare',
    topicIcon: '🔢',
    theory: '<h3>Algebra Lineare: Matrici e Determinanti</h3><p>Una <strong>matrice</strong> è una tabella rettangolare di numeri disposti in righe e colonne.</p><p>Una matrice con <em>m</em> righe e <em>n</em> colonne si dice di dimensione m×n.</p><p><strong>Determinante di una matrice 2×2:</strong></p><p class="math-formula">det(A) = |a b; c d| = ad − bc</p><p><strong>Determinante di una matrice 3×3</strong> (regola di Sarrus o sviluppo di Laplace).</p><p><strong>Proprietà del determinante:</strong></p><ul><li>Se det(A) ≠ 0, la matrice è <strong>invertibile</strong></li><li>Se det(A) = 0, la matrice è <strong>singolare</strong></li><li>det(A·B) = det(A) · det(B)</li><li>det(A<sup>T</sup>) = det(A)</li></ul>',
    exerciseText: '<p>Calcola il determinante della seguente matrice:</p><p class="math-formula">A = | 3 &nbsp; 1 |<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 2 &nbsp; 4 |</p>',
    result: '<p class="math-formula">det(A) = 10</p>',
    solution: '<p><strong>Passo 1:</strong> Applichiamo la formula per il determinante 2×2:</p><p class="math-formula">det(A) = ad − bc</p><p><strong>Passo 2:</strong> Sostituiamo: a = 3, b = 1, c = 2, d = 4</p><p class="math-formula">det(A) = (3)(4) − (1)(2) = 12 − 2 = 10</p><p>Poiché det(A) ≠ 0, la matrice è invertibile.</p>',
    graph: null
  },
  {
    id: 'alin-2',
    level: 'Università',
    topic: 'Algebra Lineare',
    topicIcon: '🔢',
    theory: '<h3>Algebra Lineare: Prodotto di Matrici</h3><p>Il <strong>prodotto</strong> di due matrici A (m×n) e B (n×p) è una matrice C (m×p) il cui elemento c<sub>ij</sub> è dato da:</p><p class="math-formula">c<sub>ij</sub> = Σ<sub>k=1</sub><sup>n</sup> a<sub>ik</sub> · b<sub>kj</sub></p><p>In pratica, l\'elemento nella riga i e colonna j è la somma dei prodotti degli elementi della riga i di A per gli elementi della colonna j di B.</p><p><strong>Attenzione:</strong> Il prodotto di matrici NON è commutativo: A·B ≠ B·A in generale.</p><p><strong>Condizione:</strong> Il numero di colonne di A deve essere uguale al numero di righe di B.</p>',
    exerciseText: '<p>Calcola il prodotto delle seguenti matrici:</p><p class="math-formula">A = | 1 &nbsp; 2 | &nbsp;&nbsp; B = | 5 &nbsp; 6 |<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 3 &nbsp; 4 | &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 7 &nbsp; 8 |</p>',
    result: '<p class="math-formula">A·B = | 19 &nbsp; 22 |<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 43 &nbsp; 50 |</p>',
    solution: '<p><strong>Passo 1:</strong> Calcoliamo ogni elemento di C = A·B:</p><p class="math-formula">c₁₁ = 1·5 + 2·7 = 5 + 14 = 19</p><p class="math-formula">c₁₂ = 1·6 + 2·8 = 6 + 16 = 22</p><p class="math-formula">c₂₁ = 3·5 + 4·7 = 15 + 28 = 43</p><p class="math-formula">c₂₂ = 3·6 + 4·8 = 18 + 32 = 50</p><p><strong>Risultato:</strong></p><p class="math-formula">A·B = | 19 &nbsp; 22 |<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 43 &nbsp; 50 |</p>',
    graph: null
  },
  {
    id: 'alin-3',
    level: 'Università',
    topic: 'Algebra Lineare',
    topicIcon: '🔢',
    theory: '<h3>Algebra Lineare: Autovalori e Autovettori</h3><p>Dato un operatore lineare (matrice quadrata A), un vettore <strong>v</strong> ≠ <strong>0</strong> è un <strong>autovettore</strong> di A se esiste uno scalare λ tale che:</p><p class="math-formula">A·<strong>v</strong> = λ·<strong>v</strong></p><p>Lo scalare λ è l\'<strong>autovalore</strong> associato.</p><p><strong>Per trovare gli autovalori:</strong> Si risolve l\'<strong>equazione caratteristica</strong>:</p><p class="math-formula">det(A − λI) = 0</p><p>dove I è la matrice identità.</p><p><strong>Per trovare gli autovettori:</strong> Per ogni autovalore λ, si risolve il sistema (A − λI)<strong>v</strong> = <strong>0</strong>.</p>',
    exerciseText: '<p>Trova gli autovalori della seguente matrice:</p><p class="math-formula">A = | 4 &nbsp; 1 |<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| 2 &nbsp; 3 |</p>',
    result: '<p class="math-formula">λ₁ = 5, &nbsp; λ₂ = 2</p>',
    solution: '<p><strong>Passo 1:</strong> Scriviamo A − λI:</p><p class="math-formula">A − λI = | 4−λ &nbsp;&nbsp; 1 |<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;| &nbsp; 2 &nbsp;&nbsp; 3−λ |</p><p><strong>Passo 2:</strong> Calcoliamo il determinante:</p><p class="math-formula">det(A − λI) = (4−λ)(3−λ) − (1)(2)</p><p class="math-formula">= 12 − 4λ − 3λ + λ² − 2</p><p class="math-formula">= λ² − 7λ + 10</p><p><strong>Passo 3:</strong> Risolviamo λ² − 7λ + 10 = 0:</p><p class="math-formula">Δ = 49 − 40 = 9</p><p class="math-formula">λ = (7 ± 3) / 2</p><p class="math-formula">λ₁ = 5, &nbsp; λ₂ = 2</p>',
    graph: null
  }

];
