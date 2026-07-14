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
