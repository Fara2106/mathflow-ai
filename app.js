/**
 * MathFlow AI — Main Application Logic
 * Handles UI state, topic selection, exercise generation, and display.
 */

(function () {
    'use strict';

    // ===== DOM REFS =====
    const apiKeyModal = document.getElementById('api-key-modal');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKeySave = document.getElementById('api-key-save');
    const settingsBtn = document.getElementById('settings-btn');

    const searchInput = document.getElementById('search-input');
    const searchClear = document.getElementById('search-clear');
    const topicDropdown = document.getElementById('topic-dropdown');
    const dropdownList = document.getElementById('dropdown-list');
    const topicsGrid = document.getElementById('topics-grid');
    const areaFilters = document.getElementById('area-filters');
    const topicsSection = document.getElementById('topics-section');
    const exerciseView = document.getElementById('exercise-view');
    const sectionTitle = document.getElementById('section-title');
    const sectionSubtitle = document.getElementById('section-subtitle');

    const backButton = document.getElementById('back-button');
    const countInput = document.getElementById('count-input');
    const batchWarning = document.getElementById('batch-warning');
    const batchWarningText = document.getElementById('batch-warning-text');
    const completeBatchBtn = document.getElementById('complete-batch-btn');
    const generateBtn = document.getElementById('generate-btn');
    const generateText = generateBtn.querySelector('.generate-text');
    const generateSpinner = generateBtn.querySelector('.generate-spinner');
    const generateIcon = generateBtn.querySelector('.generate-icon');
    const exerciseTopicIcon = document.getElementById('exercise-topic-icon');
    const exerciseTopicTitle = document.getElementById('exercise-topic-title');
    const exerciseLevelBadge = document.getElementById('exercise-level-badge');
    const subtypeBar = document.getElementById('subtype-bar');
    const subtypeChips = document.getElementById('subtype-chips');

    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const errorText = document.getElementById('error-text');
    const retryBtn = document.getElementById('retry-btn');

    const exerciseCards = document.getElementById('exercise-cards');
    const cardTemplate = document.getElementById('exercise-card-template');
    const difficultyAdjust = document.getElementById('difficulty-adjust');

    const navLevelBtns = document.querySelectorAll('.nav-level-btn');
    const diffBtns = document.querySelectorAll('.diff-btn');
    const pdfBtn = document.getElementById('pdf-btn');
    const easierBtn = document.getElementById('easier-btn');
    const harderBtn = document.getElementById('harder-btn');
    const difficultyCurrent = document.getElementById('difficulty-current');

    // Scala di difficoltà a 6 livelli con nome (indici 0..5), dal più facile
    // al più difficile. I pulsanti in alto e la barra +/- usano questi indici.
    const NAMED_DIFFICULTIES = ['facile', 'intermedio', 'difficile', 'difficilissimo', 'estremo', 'impossibile'];
    const NAMED_LABELS = {
        facile: 'Facile',
        intermedio: 'Intermedio',
        difficile: 'Difficile',
        difficilissimo: 'Difficilissimo',
        estremo: 'Estremo',
        impossibile: 'Impossibile'
    };
    const MAX_DIFFICULTY = NAMED_DIFFICULTIES.length - 1;

    // Ordine fisso delle macro-aree nei chip di filtro
    const AREA_ORDER = ['Aritmetica', 'Algebra', 'Geometria', 'Geometria analitica', 'Trigonometria', 'Analisi', 'Probabilità e statistica'];

    // ===== STATE =====
    let topics = [];
    let currentLevel = 'all';
    let currentArea = 'all';
    let currentSearchText = '';
    let currentSubtype = ''; // '' = "Qualsiasi"
    let currentTopic = null;
    let isGenerating = false;
    let difficultyLevel = 1; // indice in NAMED_DIFFICULTIES (default: intermedio)
    let lastBatch = []; // esercizi dell'ultimo batch (null = generazione fallita)

    // ===== INIT =====
    function init() {
        topics = window.TOPICS || [];

        // Check API key for current provider
        if (!window.GeminiAPI.hasApiKey(window.GeminiAPI.getProvider())) {
            showApiKeyModal();
        }

        renderAreaFilters();
        renderTopicCards();
        buildDropdown();
        bindEvents();
    }

    // ===== PROVIDER SELECTOR =====
    const providerBtns = document.querySelectorAll('.provider-btn');
    const modalLink = document.getElementById('modal-link');
    const modalLinkText = document.getElementById('modal-link-text');

    function updateModalForProvider(provider) {
        const info = window.GeminiAPI.getProviderInfo(provider);
        providerBtns.forEach(b => b.classList.toggle('active', b.dataset.provider === provider));
        modalLink.href = info.consoleUrl;
        modalLinkText.textContent = info.linkText;
        apiKeyInput.value = window.GeminiAPI.getApiKey(provider);
        apiKeyInput.placeholder = `API Key ${info.label}...`;
    }

    providerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.GeminiAPI.setProvider(btn.dataset.provider);
            updateModalForProvider(btn.dataset.provider);
        });
    });

    // ===== API KEY MODAL =====
    function showApiKeyModal() {
        apiKeyModal.hidden = false;
        const currentProvider = window.GeminiAPI.getProvider();
        updateModalForProvider(currentProvider);
        setTimeout(() => apiKeyInput.focus(), 100);
    }

    function hideApiKeyModal() {
        apiKeyModal.hidden = true;
    }

    function saveApiKey() {
        const key = apiKeyInput.value.trim();
        if (!key) {
            apiKeyInput.style.borderColor = '#FF3B30';
            apiKeyInput.focus();
            return;
        }
        window.GeminiAPI.setApiKey(key, window.GeminiAPI.getProvider());
        hideApiKeyModal();
    }

    // ===== UTILITY =====
    function getLevelClass(level) {
        return {
            'Elementari': 'level-elementari',
            'Medie': 'level-medie',
            'Superiori': 'level-superiori',
            'Università': 'level-universita',
        }[level] || '';
    }

    function getLevelColor(level) {
        return {
            'Elementari': { bg: 'rgba(52, 199, 89, 0.1)', color: '#248A3D' },
            'Medie': { bg: 'rgba(0, 122, 255, 0.08)', color: '#0055D4' },
            'Superiori': { bg: 'rgba(175, 82, 222, 0.08)', color: '#8944AB' },
            'Università': { bg: 'rgba(255, 149, 0, 0.08)', color: '#C93400' },
        }[level] || { bg: 'rgba(0,0,0,0.05)', color: '#333' };
    }

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

    // ===== RENDER TOPIC CARDS =====
    function renderTopicCards() {
        const filtered = getFilteredTopics(currentLevel, currentSearchText, currentArea);
        topicsGrid.innerHTML = '';

        if (filtered.length === 0) {
            topicsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <p class="no-results-text">Nessun argomento trovato</p>
                    <p class="no-results-hint">Prova a cambiare livello, area o testo di ricerca</p>
                </div>`;
            return;
        }

        const levelOrder = ['Elementari', 'Medie', 'Superiori', 'Università'];
        filtered.sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level) || a.topic.localeCompare(b.topic));

        filtered.forEach((t, i) => {
            const card = document.createElement('div');
            card.className = `topic-card ${getLevelClass(t.level)}`;
            card.style.animationDelay = `${i * 0.05}s`;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `${t.topic} — ${t.level}`);
            card.innerHTML = `
                <div class="topic-card-icon">${t.icon}</div>
                <span class="topic-card-level">${t.level}</span>
                <h3 class="topic-card-title">${t.topic}</h3>
                <span class="topic-card-hint">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3m6.36-.64-2.12 2.12M21 12h-3m.64 6.36-2.12-2.12M12 21v-3m-6.36.64 2.12-2.12M3 12h3m-.64-6.36 2.12 2.12"/></svg>
                    Genera con IA
                </span>`;

            card.addEventListener('click', () => openTopic(t));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openTopic(t); }
            });
            topicsGrid.appendChild(card);
        });

        // ===== "ALTRO" CUSTOM TOPIC CARD =====
        const altroCard = document.createElement('div');
        altroCard.className = 'topic-card altro-card';
        altroCard.style.animationDelay = `${filtered.length * 0.05}s`;
        altroCard.innerHTML = `
            <div class="topic-card-icon altro-icon">✨</div>
            <span class="topic-card-level altro-level-label">Personalizzato</span>
            <h3 class="topic-card-title">Altro argomento</h3>
            <p class="altro-desc">Scrivi qualsiasi argomento di matematica</p>
            <div class="altro-form">
                <input type="text" class="altro-input" id="altro-topic-input" placeholder="Es: Matrici, Coniche, MCD..." autocomplete="off">
                <select class="altro-select" id="altro-level-select">
                    <option value="Elementari">Elementari</option>
                    <option value="Medie">Medie</option>
                    <option value="Superiori" selected>Superiori</option>
                    <option value="Università">Università</option>
                </select>
                <button class="altro-generate-btn" id="altro-generate-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                    Genera
                </button>
            </div>`;

        // Focus input when clicking card background
        altroCard.addEventListener('click', (e) => {
            const input = altroCard.querySelector('#altro-topic-input');
            if (e.target === altroCard || e.target.classList.contains('topic-card-title') || e.target.classList.contains('altro-desc') || e.target.classList.contains('topic-card-icon')) {
                input.focus();
            }
        });

        const altroBtn = altroCard.querySelector('#altro-generate-btn');
        const altroInput = altroCard.querySelector('#altro-topic-input');
        const altroSelect = altroCard.querySelector('#altro-level-select');

        function handleAltroGenerate() {
            const customTopic = altroInput.value.trim();
            if (!customTopic) {
                altroInput.style.borderColor = '#FF3B30';
                altroInput.focus();
                return;
            }
            openTopic({ level: altroSelect.value, topic: customTopic, icon: '✨', graphHint: 'custom' });
        }

        altroBtn.addEventListener('click', (e) => { e.stopPropagation(); handleAltroGenerate(); });
        altroInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.stopPropagation(); handleAltroGenerate(); } });
        altroInput.addEventListener('input', () => { altroInput.style.borderColor = ''; });

        topicsGrid.appendChild(altroCard);

        sectionTitle.textContent = currentLevel === 'all' ? 'Scegli un argomento' : `Argomenti — ${currentLevel}`;
        sectionSubtitle.textContent = `${filtered.length} argomenti disponibili — oppure scrivi il tuo in "Altro"`;
    }

    // ===== DROPDOWN =====
    function buildDropdown(filter = '') {
        const filtered = getFilteredTopics('all', filter);
        const levelOrder = ['Elementari', 'Medie', 'Superiori', 'Università'];
        const grouped = {};
        filtered.forEach(t => {
            if (!grouped[t.level]) grouped[t.level] = [];
            grouped[t.level].push(t);
        });

        dropdownList.innerHTML = '';
        let hasResults = false;

        levelOrder.forEach(level => {
            if (!grouped[level]?.length) return;
            hasResults = true;
            const group = document.createElement('div');
            group.className = 'dropdown-level-group';
            const label = document.createElement('div');
            label.className = 'dropdown-level-label';
            label.textContent = level;
            group.appendChild(label);

            grouped[level].forEach(t => {
                const item = document.createElement('button');
                item.className = 'dropdown-item';
                item.setAttribute('role', 'option');
                item.innerHTML = `
                    <span class="dropdown-item-icon">${t.icon}</span>
                    <span class="dropdown-item-text">${t.topic}</span>`;
                item.addEventListener('click', () => {
                    closeDropdown();
                    resetSearch();
                    openTopic(t);
                });
                group.appendChild(item);
            });
            dropdownList.appendChild(group);
        });

        if (!hasResults && !filter) {
            dropdownList.innerHTML = '<div class="dropdown-no-results">Nessun argomento trovato</div>';
        }

        // Always add "Altro" at the bottom of dropdown
        const altroGroup = document.createElement('div');
        altroGroup.className = 'dropdown-level-group';
        const altroLabel = document.createElement('div');
        altroLabel.className = 'dropdown-level-label';
        altroLabel.textContent = 'Altro';
        altroGroup.appendChild(altroLabel);

        const altroItem = document.createElement('button');
        altroItem.className = 'dropdown-item';
        altroItem.setAttribute('role', 'option');
        const searchVal = filter || '';
        altroItem.innerHTML = `
            <span class="dropdown-item-icon">✨</span>
            <span class="dropdown-item-text">${searchVal ? `Genera: "${searchVal}"` : 'Argomento personalizzato...'}</span>`;
        altroItem.addEventListener('click', () => {
            closeDropdown();
            if (searchVal) {
                resetSearch();
                openTopic({ level: 'Superiori', topic: searchVal, icon: '✨', graphHint: 'custom' });
            } else {
                resetSearch();
                const card = document.querySelector('.altro-card');
                if (card) {
                    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const inp = card.querySelector('#altro-topic-input');
                    if (inp) setTimeout(() => inp.focus(), 400);
                }
            }
        });
        altroGroup.appendChild(altroItem);
        dropdownList.appendChild(altroGroup);
    }

    function openDropdown() { topicDropdown.hidden = false; }
    function closeDropdown() { topicDropdown.hidden = true; }

    // Clears the search box AND the grid filter state. Needed when the dropdown
    // empties the input programmatically (no 'input' event fires), otherwise
    // currentSearchText would go stale and keep the grid filtered.
    function resetSearch() {
        searchInput.value = '';
        searchClear.hidden = true;
        currentSearchText = '';
        renderTopicCards();
    }

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

    // ===== OPEN TOPIC =====
    function openTopic(topicObj) {
        if (!window.GeminiAPI.hasApiKey(window.GeminiAPI.getProvider())) {
            showApiKeyModal();
            return;
        }

        currentTopic = topicObj;
        currentSubtype = '';
        renderSubtypeChips();

        topicsSection.hidden = true;
        exerciseView.hidden = false;
        exerciseView.style.animation = 'none';
        void exerciseView.offsetWidth;
        exerciseView.style.animation = '';

        // Header
        exerciseTopicIcon.textContent = topicObj.icon;
        exerciseTopicTitle.textContent = topicObj.topic;
        exerciseLevelBadge.textContent = topicObj.level;
        const lc = getLevelColor(topicObj.level);
        exerciseLevelBadge.style.background = lc.bg;
        exerciseLevelBadge.style.color = lc.color;

        const header = document.getElementById('exercise-header');
        header.className = `exercise-header ${getLevelClass(topicObj.level)}`;

        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Generate first exercise
        generateExercise();
    }

    // ===== GENERATE EXERCISE =====
    function getExerciseCount() {
        const n = parseInt(countInput.value, 10);
        if (isNaN(n) || n < 1) return 1;
        return Math.min(n, 10);
    }

    async function generateExercise(onlyMissing) {
        if (isGenerating || !currentTopic) return;
        isGenerating = true;

        // Snapshot: la navigazione durante il batch non deve cambiare ciò che generiamo
        const topic = currentTopic;
        const subtype = currentSubtype;
        const difficultyName = apiDifficulty();

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

        // Assegnato prima del loop: results è per riferimento, quindi gli
        // esercizi già generati restano in lastBatch anche se il loop viene
        // interrotto da un errore di chiave API.
        lastBatch = results;

        try {
            for (let i = 0; i < total; i++) {
                if (results[i]) continue;
                const prefix = total > 1 ? `Esercizio ${i + 1} di ${total} — ` : '';
                if (loadingTextEl) loadingTextEl.textContent = `${prefix}Groq sta creando il tuo esercizio...`;
                try {
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
                } catch (error) {
                    console.error(`Generation error (esercizio ${i + 1} di ${total}):`, error);
                    lastError = error;
                    // Senza chiave valida fallirebbero tutti: inutile continuare
                    if (error.message === 'API_KEY_MISSING' || error.message === 'API_KEY_INVALID') {
                        throw error;
                    }
                    // Quota esaurita: inutile insistere sugli esercizi restanti
                    if (error.message === 'RATE_LIMIT') break;
                }
            }

            if (results.every(r => !r)) {
                throw lastError || new Error('Si è verificato un errore. Riprova.');
            }

            // L'utente ha cambiato argomento durante il batch: non toccare la UI
            if (currentTopic !== topic) return;

            showExercises(results);
            updateBatchWarning(results);
        } catch (error) {
            console.error('Generation error:', error);
            if (currentTopic === topic) handleError(error);
        } finally {
            isGenerating = false;
            generateBtn.disabled = false;
            generateText.textContent = 'Genera nuovo esercizio';
            generateSpinner.hidden = true;
            generateIcon.hidden = false;
            if (loadingTextEl) loadingTextEl.textContent = 'Groq sta creando il tuo esercizio...';

            // Se nel frattempo è stato aperto un altro argomento, genera per quello
            if (currentTopic && currentTopic !== topic) generateExercise();
        }
    }

    function updateBatchWarning(results) {
        const missing = results.filter(r => !r).length;
        batchWarning.hidden = missing === 0;
        if (missing > 0) {
            const ok = results.length - missing;
            batchWarningText.textContent = ok === 1
                ? `Generato 1 esercizio su ${results.length}. Alcuni non sono riusciti (probabile limite API).`
                : `Generati ${ok} esercizi su ${results.length}. Alcuni non sono riusciti (probabile limite API).`;
        }
    }

    // ===== SHOW LOADING =====
    function showLoading() {
        loadingState.hidden = false;
        errorState.hidden = true;
        exerciseCards.hidden = true;
        if (difficultyAdjust) difficultyAdjust.hidden = true;
        if (pdfBtn) pdfBtn.hidden = true;
        batchWarning.hidden = true;
    }

    // ===== CLEANUP LATEX artifacts in HTML strings =====
    function cleanMathHtml(html) {
        if (!html) return html;
        let s = html;

        // Remove outer $$ ... $$ or $ ... $ delimiters
        s = s.replace(/\$\$([^$]+)\$\$/g, '$1');
        s = s.replace(/\$([^$\n]+)\$/g, '$1');

        // \frac{num}{den} → fraction span
        s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g,
            '<span class="fraction"><span class="num">$1</span><span class="den">$2</span></span>');

        // \sqrt{x} → √x, \sqrt x → √x
        s = s.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');
        s = s.replace(/\\sqrt\s+(\S+)/g, '√$1');

        // \cdot → ×
        s = s.replace(/\\cdot/g, '×');

        // \pm → ±
        s = s.replace(/\\pm/g, '±');

        // \infty → ∞
        s = s.replace(/\\infty/g, '∞');

        // \leq → ≤, \geq → ≥, \neq → ≠
        s = s.replace(/\\leq/g, '≤');
        s = s.replace(/\\geq/g, '≥');
        s = s.replace(/\\neq/g, '≠');

        // \in → ∈, \sum → ∑, \int → ∫, \Delta → Δ, \pi → π
        s = s.replace(/\\in\b/g, '∈');
        s = s.replace(/\\sum/g, '∑');
        s = s.replace(/\\int/g, '∫');
        s = s.replace(/\\Delta/g, 'Δ');
        s = s.replace(/\\pi\b/g, 'π');
        s = s.replace(/\\theta/g, 'θ');
        s = s.replace(/\\alpha/g, 'α');
        s = s.replace(/\\beta/g, 'β');
        s = s.replace(/\\gamma/g, 'γ');
        s = s.replace(/\\lambda/g, 'λ');
        s = s.replace(/\\mu/g, 'μ');
        s = s.replace(/\\sigma/g, 'σ');
        s = s.replace(/\\omega/g, 'ω');
        s = s.replace(/\\phi/g, 'φ');

        // ^{...} → <sup>...</sup>
        s = s.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>');
        s = s.replace(/\^(\d)/g, '<sup>$1</sup>');

        // _{...} → <sub>...</sub>
        s = s.replace(/\_\{([^}]+)\}/g, '<sub>$1</sub>');
        s = s.replace(/\_(\d)/g, '<sub>$1</sub>');

        // \times → ×
        s = s.replace(/\\times/g, '×');

        // \div → ÷
        s = s.replace(/\\div/g, '÷');

        // ===== MATRICES =====
        // Convert \begin{pmatrix/bmatrix/vmatrix/Vmatrix/matrix/cases/array}...\end{...} to HTML tables
        // Must run BEFORE the catch-all \\[a-zA-Z]+ removal
        function convertMatrixEnv(str, envName, cssClass) {
            var pattern = new RegExp(
                '\\\\begin\\{' + envName + '\\}' +  // \begin{envName}
                '(?:\\{[^}]*\\})?' +                 // optional {ccc} column spec
                '([\\s\\S]*?)' +                     // body (captured)
                '\\\\end\\{' + envName + '\\}',      // \end{envName}
                'g'
            );
            return str.replace(pattern, function(m, body) {
                var rows = body.split(/\\\\/g).map(function(r) { return r.trim(); }).filter(function(r) { return r && r !== '\\hline'; });
                var html = '';
                for (var i = 0; i < rows.length; i++) {
                    var cols = rows[i].split('&').map(function(c) { return c.trim(); });
                    html += '<tr>';
                    for (var j = 0; j < cols.length; j++) {
                        html += '<td>' + cols[j] + '</td>';
                    }
                    html += '</tr>';
                }
                return '<div class="math-matrix ' + cssClass + '"><table>' + html + '</table></div>';
            });
        }

        s = convertMatrixEnv(s, 'pmatrix', 'matrix-paren');
        s = convertMatrixEnv(s, 'bmatrix', 'matrix-bracket');
        s = convertMatrixEnv(s, 'vmatrix', 'matrix-vbar');
        s = convertMatrixEnv(s, 'Vmatrix', 'matrix-dvbar');
        s = convertMatrixEnv(s, 'matrix', 'matrix-plain');
        s = convertMatrixEnv(s, 'smallmatrix', 'matrix-plain');
        s = convertMatrixEnv(s, 'cases', 'matrix-cases');
        s = convertMatrixEnv(s, 'array', 'matrix-plain');

        // remove leftover single backslash commands like \left \right \text{} \mathbb{} etc.
        s = s.replace(/\\text\{([^}]+)\}/g, '$1');
        s = s.replace(/\\mathbb\{([^}]+)\}/g, '$1');
        s = s.replace(/\\left[\(\[{|]/g, '');
        s = s.replace(/\\right[\)\]}|]/g, '');
        s = s.replace(/\\[a-zA-Z]+\s?/g, '');

        // ===== FALLBACK: Bracket-per-row matrix detection =====
        // Catches patterns like:
        //   [1, 2, 3]     or    (1, 2, 3)     or   |1, 2, 3|
        //   [4, 5, 6]           (4, 5, 6)          |4, 5, 6|
        //   [7, 8, 9]           (7, 8, 9)          |7, 8, 9|
        // These may appear with <br>, </p><p>, or newlines between rows.
        // We look for 2+ consecutive bracket rows and merge them into a single matrix.

        // Match sequences of bracket rows separated by <br>, </p><p>, whitespace, or newlines
        var bracketRowPattern = /(?:\[([^\]]+)\]|\(([^)]+)\))(?:\s*(?:<br\s*\/?>|<\/p>\s*<p[^>]*>)\s*(?:\[([^\]]+)\]|\(([^)]+)\))){1,}/gi;

        s = s.replace(bracketRowPattern, function(match) {
            // Extract all individual rows from the match
            var rowPattern = /[\[(]([^\])]*)[\])]/g;
            var rowMatch;
            var html = '';
            while ((rowMatch = rowPattern.exec(match)) !== null) {
                var cells = rowMatch[1].split(/[,;]/).map(function(c) { return c.trim(); });
                html += '<tr>';
                for (var i = 0; i < cells.length; i++) {
                    html += '<td>' + cells[i] + '</td>';
                }
                html += '</tr>';
            }
            if (html) {
                return '<div class="math-matrix matrix-paren"><table>' + html + '</table></div>';
            }
            return match;
        });

        return s;
    }

    // ===== DIFFICULTY HELPERS =====
    // Chiave inviata all'LLM (gemini.js la mappa sul descrittore di difficoltà).
    function apiDifficulty() {
        return NAMED_DIFFICULTIES[difficultyLevel];
    }

    // Etichetta mostrata all'utente.
    function difficultyLabel() {
        return NAMED_LABELS[NAMED_DIFFICULTIES[difficultyLevel]];
    }

    function setDifficultyLevel(level) {
        difficultyLevel = Math.min(MAX_DIFFICULTY, Math.max(0, level));
        diffBtns.forEach(b => b.classList.toggle('active', b.dataset.diff === NAMED_DIFFICULTIES[difficultyLevel]));
        updateDifficultyAdjust();
    }

    function updateDifficultyAdjust() {
        if (difficultyCurrent) difficultyCurrent.textContent = difficultyLabel();
        if (easierBtn) easierBtn.disabled = difficultyLevel <= 0;
        if (harderBtn) harderBtn.disabled = difficultyLevel >= MAX_DIFFICULTY;
    }

    // ===== SHOW EXERCISE(S) =====

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

    // ===== HANDLE ERROR =====
    function handleError(error) {
        loadingState.hidden = true;
        exerciseCards.hidden = true;
        if (difficultyAdjust) difficultyAdjust.hidden = true;
        errorState.hidden = false;

        if (error.message === 'API_KEY_MISSING') {
            errorText.textContent = 'Nessuna API Key configurata. Aggiungila dalle impostazioni.';
        } else if (error.message === 'API_KEY_INVALID') {
            errorText.textContent = 'API Key non valida. Controlla la chiave nelle impostazioni.';
        } else if (error.message === 'RATE_LIMIT') {
            errorText.textContent = 'Limite API raggiunto. Attendi 1-2 minuti e riprova. Se il problema persiste, la quota giornaliera della tua chiave API gratuita è esaurita: riprova domani o usa una chiave diversa.';
        } else {
            errorText.textContent = error.message || 'Si è verificato un errore. Riprova.';
        }
    }

    // ===== TOGGLE PANELS =====
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

    function expandPanel(toggleBtn, panel) {
        toggleBtn.setAttribute('aria-expanded', 'true');
        panel.hidden = false;
    }

    function collapsePanel(toggleBtn, panel) {
        toggleBtn.setAttribute('aria-expanded', 'false');
        panel.hidden = true;
    }

    // ===== BACK =====
    function backToTopics() {
        exerciseView.hidden = true;
        topicsSection.hidden = false;
        currentTopic = null;
        renderTopicCards();
    }

    // ===== EVENTS =====
    function bindEvents() {
        // API key
        apiKeySave.addEventListener('click', saveApiKey);
        apiKeyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveApiKey(); });
        apiKeyInput.addEventListener('input', () => { apiKeyInput.style.borderColor = ''; });
        settingsBtn.addEventListener('click', showApiKeyModal);
        apiKeyModal.addEventListener('click', (e) => {
            if (e.target === apiKeyModal && window.GeminiAPI.hasApiKey()) hideApiKeyModal();
        });

        // Search
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            searchClear.hidden = val.length === 0;
            currentSearchText = val;
            renderTopicCards();
            buildDropdown(val);
            if (val.length > 0) openDropdown(); else closeDropdown();
        });
        searchInput.addEventListener('focus', () => {
            buildDropdown(searchInput.value.trim());
            openDropdown();
        });
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.hidden = true;
            currentSearchText = '';
            renderTopicCards();
            closeDropdown();
            searchInput.focus();
        });
        document.addEventListener('click', (e) => {
            if (!document.getElementById('search-container').contains(e.target)) closeDropdown();
        });

        // Nav levels
        navLevelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                navLevelBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentLevel = btn.dataset.level;
                currentArea = 'all';
                renderAreaFilters();
                if (currentTopic) backToTopics();
                renderTopicCards();
            });
        });

        // Difficulty buttons (in alto): impostano un livello assoluto e rigenerano
        diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetLevel = NAMED_DIFFICULTIES.indexOf(btn.dataset.diff);
                if (isGenerating || targetLevel < 0 || targetLevel === difficultyLevel) return;
                setDifficultyLevel(targetLevel);
                // Se c'è già un argomento aperto, rigenera subito a questa difficoltà
                if (currentTopic) generateExercise();
            });
        });

        // Difficulty adjust (sotto l'esercizio): +1/-1 livello e rigenera.
        // "Più difficile" non ha tetto; "Più facile" si ferma a Facile.
        [easierBtn, harderBtn].forEach(btn => {
            if (!btn) return;
            btn.addEventListener('click', () => {
                if (isGenerating || btn.disabled) return;
                const step = parseInt(btn.dataset.step, 10);
                const next = difficultyLevel + step;
                if (next < 0) return;
                setDifficultyLevel(next);
                generateExercise();
            });
        });

        // PDF download
         if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                const topicName = currentTopic ? currentTopic.topic : 'esercizio';
                const diffLabel = difficultyLabel();
                const fileName = `MathFlow_${topicName}_${diffLabel}.pdf`.replace(/\s+/g, '_');

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

                const element = document.getElementById('exercise-cards');

                const opt = {
                    margin: [12, 12, 12, 12],
                    filename: fileName,
                    image: { type: 'png' },
                    html2canvas: {
                        scale: 4,
                        useCORS: true,
                        logging: false,
                        onclone: function (clonedDoc) {
                            // Force crisp font rendering on the cloned body
                            clonedDoc.body.style.webkitFontSmoothing = 'auto';
                            clonedDoc.body.style.MozOsxFontSmoothing = 'auto';
                            clonedDoc.body.style.textRendering = 'geometricPrecision';

                            const card = clonedDoc.getElementById('exercise-cards');
                            if (!card) return;

                            // Force every element's text to be dark and bold
                            const all = card.querySelectorAll('*');
                            all.forEach(el => {
                                const tag = el.tagName.toLowerCase();
                                // Skip SVGs and their children
                                if (tag === 'svg' || el.closest('svg') || tag === 'canvas') return;

                                const style = el.style;

                                // Disable antialiased font smoothing (makes text thinner)
                                style.webkitFontSmoothing = 'auto';
                                style.textRendering = 'geometricPrecision';

                                // Get current computed color to decide replacement
                                const computed = window.getComputedStyle(el);
                                const currentColor = computed.color;

                                // Parse RGB to check lightness
                                const rgb = currentColor.match(/\d+/g);
                                if (rgb) {
                                    const r = parseInt(rgb[0]);
                                    const g = parseInt(rgb[1]);
                                    const b = parseInt(rgb[2]);
                                    const lightness = (r + g + b) / 3;

                                    // If the text color is lighter than medium gray, darken it
                                    if (lightness > 80) {
                                        style.color = '#1a1a1a';
                                    }
                                }

                                // Make headings, labels, strongs bolder
                                if (['h1','h2','h3','h4','strong','b'].includes(tag) ||
                                    el.classList.contains('toggle-label') ||
                                    el.classList.contains('result-value') ||
                                    el.classList.contains('exercise-text-header')) {
                                    style.color = '#000000';
                                    const fw = parseInt(computed.fontWeight) || 400;
                                    if (fw < 700) style.fontWeight = '700';
                                }

                                // Result label — keep green but darker
                                if (el.classList.contains('result-label')) {
                                    style.color = '#166e2b';
                                    style.fontWeight = '700';
                                }

                                // Math formulas — solid dark
                                if (el.classList.contains('math-formula')) {
                                    style.color = '#0a0a0a';
                                }

                                // Fractions
                                if (el.classList.contains('fraction') ||
                                    el.classList.contains('num') ||
                                    el.classList.contains('den')) {
                                    style.color = '#0a0a0a';
                                }
                            });
                        }
                    },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                pdfBtn.disabled = true;
                pdfBtn.innerHTML = '<span>Generando PDF...</span>';

                html2pdf().set(opt).from(element).save().then(() => {
                    pdfBtn.disabled = false;
                    pdfBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg><span>PDF</span>`;
                }).catch(() => {
                    pdfBtn.disabled = false;
                    pdfBtn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg><span>PDF</span>`;
                });
            });
        }

        // Exercise view
        backButton.addEventListener('click', backToTopics);
        generateBtn.addEventListener('click', () => generateExercise());
        retryBtn.addEventListener('click', () => generateExercise());

        // Batch
        completeBatchBtn.addEventListener('click', () => generateExercise(true));
        countInput.addEventListener('change', () => {
            countInput.value = String(getExerciseCount());
        });

        // Keyboard nav
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { closeDropdown(); searchInput.blur(); }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const first = dropdownList.querySelector('.dropdown-item');
                if (first) first.focus();
            }
        });
        dropdownList.addEventListener('keydown', (e) => {
            const items = Array.from(dropdownList.querySelectorAll('.dropdown-item'));
            const idx = items.indexOf(document.activeElement);
            if (e.key === 'ArrowDown') { e.preventDefault(); if (idx < items.length - 1) items[idx + 1].focus(); }
            if (e.key === 'ArrowUp') { e.preventDefault(); if (idx > 0) items[idx - 1].focus(); else searchInput.focus(); }
            if (e.key === 'Escape') { closeDropdown(); searchInput.focus(); }
        });
    }

    // ===== START =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
