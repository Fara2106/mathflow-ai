/**
 * MathFlow AI — Groq API Integration
 * Handles communication with the Groq API to generate math exercises.
 */

window.GeminiAPI = (function () {
    'use strict';

    const PROVIDERS = {
        groq: {
            apiBase: 'https://api.groq.com/openai/v1/chat/completions',
            model: 'llama-3.3-70b-versatile',
            storageKey: 'mathflow_groq_key',
            label: 'Groq',
            consoleUrl: 'https://console.groq.com/keys',
            linkText: 'Ottieni una API Key gratuita da Groq Console'
        },
        openrouter: {
            apiBase: 'https://openrouter.ai/api/v1/chat/completions',
            model: 'meta-llama/llama-3.3-70b-instruct:free',
            storageKey: 'mathflow_openrouter_key',
            label: 'OpenRouter',
            consoleUrl: 'https://openrouter.ai/keys',
            linkText: 'Ottieni una API Key gratuita da OpenRouter',
            noJsonFormat: true,
            extraHeaders: {
                'HTTP-Referer': 'https://fara2106.github.io/mathflow-ai',
                'X-Title': 'MathFlow AI'
            }
        }
    };

    const PROVIDER_STORAGE_KEY = 'mathflow_provider';

    function getProvider() {
        const stored = localStorage.getItem(PROVIDER_STORAGE_KEY) || 'groq';
        return PROVIDERS[stored] ? stored : 'groq';
    }

    function setProvider(p) {
        if (PROVIDERS[p]) localStorage.setItem(PROVIDER_STORAGE_KEY, p);
    }

    function getProviderInfo(p) {
        return PROVIDERS[p || getProvider()];
    }

    function getApiKey(provider) {
        const p = provider || getProvider();
        return localStorage.getItem(PROVIDERS[p].storageKey) || '';
    }

    function setApiKey(key, provider) {
        const p = provider || getProvider();
        localStorage.setItem(PROVIDERS[p].storageKey, key.trim());
    }

    function hasApiKey(provider) {
        return getApiKey(provider).length > 0;
    }

    /**
     * Build the system prompt
     */
    function buildSystemPrompt(level, topic, graphHint, difficulty) {
        const graphInstructions = getGraphInstructions(graphHint);
        const difficultyMap = {
            facile: 'FACILE — numeri interi semplici, pochi passaggi, adatto a chi è alle prime armi o fa ripasso',
            medio: 'MEDIO — difficoltà standard per il livello scolastico indicato',
            difficile: 'DIFFICILE — esercizio complesso, possibili numeri decimali/frazioni/parametri, molti passaggi, eventuale contesto reale'
        };
        // Known keys → mapped text; qualsiasi altra stringa è usata come
        // descrittore libero (serve per i livelli oltre "difficile", senza tetto).
        const difficultyNote = difficultyMap[difficulty] || difficulty || difficultyMap.medio;

        return `Sei un professore di matematica esperto e creativo. Genera UN SINGOLO esercizio di matematica per il livello "${level}" sull'argomento "${topic}".

Livello di difficoltà: ${difficultyNote}

RISPONDI ESCLUSIVAMENTE in formato JSON valido (senza markdown, senza backtick, solo il JSON). La struttura DEVE essere:

{
  "theory": "stringa HTML con la spiegazione teorica necessaria per svolgere l'esercizio. Usa <h3> per il titolo, <p> per i paragrafi, <strong> per le parti importanti, <ul>/<li> per le liste, e <p class=\\"math-formula\\"> per le formule matematiche. Sii chiaro e completo ma adatto al livello ${level}.",
  "exerciseText": "stringa HTML con il testo dell'esercizio. Usa <p> e <p class=\\"math-formula\\"> per le formule.",
  "result": "stringa HTML con il risultato finale SIGNIFICATIVO dell'esercizio. NON ripetere la funzione o l'espressione di partenza. Esempi: per equazioni → la soluzione (x = 3); per derivate → f'(x) = ...; per integrali → il valore numerico o la primitiva; per studi di funzione → elenco sintetico: Dominio, Zeri, Segno, Asintoti, Punti critici; per geometria → area/perimetro calcolati; per probabilità → il valore numerico. Usa <p class=\\"math-formula\\"> per le espressioni matematiche.",
  "solution": "stringa HTML con lo svolgimento COMPLETO passo per passo. Usa <p><strong>Passo N:</strong> ...</p> per ogni passaggio e <p class=\\"math-formula\\"> per i calcoli.",
  "graph": ${graphInstructions}
}

REGOLE IMPORTANTI:
- L'esercizio deve essere ORIGINALE e diverso ogni volta
- La difficoltà deve essere appropriata per il livello "${level}"
- La teoria deve spiegare TUTTO ciò che serve per risolvere l'esercizio
- Lo svolgimento deve essere DETTAGLIATO con ogni passaggio ben spiegato
- Usa la notazione matematica con simboli Unicode: × ÷ ± √ ² ³ π ∞ ≤ ≥ ≠ ∈ ∑ ∫ Δ α β γ θ
- Per le frazioni nell'HTML usa: <span class="fraction"><span class="num">numeratore</span><span class="den">denominatore</span></span>
- Per le MATRICI nell'HTML usa SEMPRE: <div class="math-matrix matrix-paren"><table><tr><td>a</td><td>b</td></tr><tr><td>c</td><td>d</td></tr></table></div> dove matrix-paren aggiunge le parentesi tonde. NON scrivere mai le matrici come righe separate tipo [1, 2, 3] — usa SEMPRE il formato <div class="math-matrix matrix-paren"> con <table>.
- Per gli esponenti usa <sup>
- Tutto il testo DEVE essere in italiano
- NON includere backtick, markdown o altro. SOLO JSON puro.
- ASSOLUTAMENTE VIETATO usare sintassi LaTeX: NO \\frac{}{}, NO \\sqrt{}, NO $...$, NO $$...$$, NO \\cdot, NO \\leq, NO \\geq, NO \\neq, NO \\alpha, NO \\beta, NO \\begin{pmatrix}, NO \\begin{bmatrix}, NO \\begin{matrix}. Usa solo simboli Unicode e tag HTML come indicato sopra.`;
    }

    /**
     * Get graph configuration instructions based on graph hint
     */
    function getGraphInstructions(graphHint) {
        switch (graphHint) {
            case 'linear':
                return `{ "type": "linear", "config": { "slope": <numero>, "intercept": <numero>, "xRange": [-10, 10] } }
dove slope è il coefficiente angolare e intercept è l'intercetta y della retta correlata all'esercizio`;

            case 'quadratic':
                return `{ "type": "quadratic", "config": { "a": <numero>, "b": <numero>, "c": <numero>, "xRange": [-10, 10] } }
dove a, b, c sono i coefficienti della parabola y = ax² + bx + c dell'esercizio`;

            case 'trigonometric':
                return `{ "type": "trigonometric", "config": { "func": "sin" oppure "cos" oppure "tan", "amplitude": <numero>, "period": <numero>, "phase": <numero>, "xRange": [-6.28, 6.28] } }
per la funzione trigonometrica dell'esercizio`;

            case 'exponential':
                return `{ "type": "exponential", "config": { "base": <numero>, "xRange": [-3, 5] } }
per la funzione esponenziale base^x dell'esercizio`;

            case 'system':
                return `{ "type": "system", "config": { "eq1": { "slope": <numero>, "intercept": <numero> }, "eq2": { "slope": <numero>, "intercept": <numero> }, "xRange": [-10, 10] } }
per le due rette del sistema di equazioni`;

            case 'derivative':
                return `{ "type": "derivative", "config": { "func": "<espressione JS con x>", "derivative": "<espressione JS della derivata>", "xRange": [-5, 5] } }
dove func e derivative sono espressioni JavaScript valide (es: "x*x*x - 3*x", "3*x*x - 3"). Usa Math.sin, Math.cos, Math.log, Math.exp, Math.pow ecc.`;

            case 'integral':
                return `{ "type": "integral", "config": { "func": "<espressione JS con x>", "a": <estremo_sinistro>, "b": <estremo_destro>, "xRange": [-5, 8] } }
dove func è l'espressione JavaScript della funzione integranda, a e b sono gli estremi di integrazione`;

            case 'fraction-pie':
                return `{ "type": "fraction-pie", "config": { "numerator": <numero_intero>, "denominator": <numero_intero> } }
per rappresentare la frazione come grafico a torta`;

            case 'bar-chart':
                return `{ "type": "bar-chart", "config": { "labels": ["etichetta1", "etichetta2", ...], "values": [valore1, valore2, ...] } }
con dati pertinenti all'esercizio (massimo 6 barre)`;

            case 'custom':
                return `{ "type": "custom", "config": { "func": "<espressione JS con x>", "xRange": [-5, 5] } }
dove func è un'espressione JavaScript valida con la variabile x (es: "Math.log(x)", "1/x")`;

            case 'geometry':
                return `uno di questi formati JSON, scegliendo la figura più adatta all'esercizio:
Triangolo generico: { "type": "geometry", "config": { "shape": "triangle", "vertices": [{"x": <n>, "y": <n>, "label": "A"}, {"x": <n>, "y": <n>, "label": "B"}, {"x": <n>, "y": <n>, "label": "C"}], "sides": [{"label": "<es. a = 5 cm>"}, {"label": "<es. b = 3 cm>"}, {"label": "<es. c = 4 cm>"}], "angles": [{"at": 0, "label": "<es. α>"}, {"at": 1, "label": "<es. β>"}, {"at": 2, "label": "<es. γ>"}], "rightAngle": null } }
Triangolo rettangolo: stessa struttura ma con "shape": "right-triangle" e "rightAngle": <indice vertice con angolo retto (0,1 o 2)>
Rettangolo/Quadrato: { "type": "geometry", "config": { "shape": "rectangle", "width": <n>, "height": <n>, "labels": { "width": "<es. 6 cm>", "height": "<es. 4 cm>" } } }
Cerchio: { "type": "geometry", "config": { "shape": "circle", "radius": <n>, "labels": { "radius": "<es. r = 5 cm>", "extra": "<es. Circonferenza: 31.4 cm>", "extra2": "<es. Area: 78.5 cm²>" } } }
Parallelogramma: { "type": "geometry", "config": { "shape": "parallelogram", "base": <n>, "side": <n>, "angle": <gradi>, "labels": { "base": "<es. b = 6 cm>", "side": "<es. a = 4 cm>", "height": "<es. h = 3.5 cm>" } } }
Scegli la forma più pertinente all'esercizio. Le coordinate dei vertici del triangolo devono essere numeri reali coerenti con le misure indicate.`;

            case 'none':
            default:
                return `null (questo argomento non richiede un grafico)`;
        }
    }

    /**
     * Sleep helper
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate an exercise using Groq API (with automatic retry on rate limit)
     */
    async function generateExercise(level, topic, graphHint, onStatus, difficulty = 'medio') {
        const provider = getProvider();
        const providerInfo = PROVIDERS[provider];
        const apiKey = getApiKey(provider);
        if (!apiKey) {
            throw new Error('API_KEY_MISSING');
        }

        const systemPrompt = buildSystemPrompt(level, topic, graphHint, difficulty);

        const requestBody = {
            model: providerInfo.model,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: `Genera un esercizio di "${topic}" per il livello "${level}". Rispondi SOLO con JSON valido.`
                }
            ],
            temperature: 0.9,
            max_tokens: 4096,
            ...(providerInfo.noJsonFormat ? {} : { response_format: { type: 'json_object' } })
        };

        const MAX_RETRIES = 5;
        const BASE_DELAY = 5000;

        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            const response = await fetch(providerInfo.apiBase, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    ...(providerInfo.extraHeaders || {})
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                const text = data.choices?.[0]?.message?.content;
                if (!text) {
                    throw new Error('Risposta vuota da Groq');
                }

                let exercise;
                try {
                    let cleanText = text.trim();
                    if (cleanText.startsWith('```')) {
                        cleanText = cleanText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
                    }
                    exercise = JSON.parse(cleanText);
                } catch (e) {
                    console.error('JSON parse error:', e, 'Raw text:', text);
                    throw new Error('Formato risposta non valido. Riprova.');
                }

                if (!exercise.theory || !exercise.exerciseText || !exercise.result || !exercise.solution) {
                    throw new Error('Esercizio incompleto generato. Riprova.');
                }

                return exercise;
            }

            const errData = await response.json().catch(() => ({}));

            if (response.status === 400 || response.status === 401) {
                throw new Error('API_KEY_INVALID');
            }

            if (response.status === 429) {
                if (attempt === MAX_RETRIES) {
                    throw new Error('RATE_LIMIT');
                }
                const delay = BASE_DELAY * Math.pow(2, attempt - 1);
                const secs = Math.round(delay / 1000);
                if (onStatus) {
                    onStatus(`Limite raggiunto, nuovo tentativo tra ${secs}s... (${attempt}/${MAX_RETRIES})`);
                }
                await sleep(delay);
                continue;
            }

            throw new Error(errData.error?.message || `Errore API: ${response.status}`);
        }
    }

    return {
        getApiKey,
        setApiKey,
        hasApiKey,
        getProvider,
        setProvider,
        getProviderInfo,
        generateExercise
    };
})();
