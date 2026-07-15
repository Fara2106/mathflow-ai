// ===== EXERCISE HISTORY =====
// Archivio in localStorage degli esercizi generati (chiave mathflow_history).
// Possiede da solo tetto, potatura e serializzazione: app.js non tocca mai
// la chiave direttamente. Tutte le API sono no-op sicure se lo storage non
// è disponibile: il salvataggio non deve mai far fallire la generazione.
(function () {
    'use strict';

    const STORAGE_KEY = 'mathflow_history';
    const MAX_UNFAVORITED = 200;
    const TOMB_KEY = 'mathflow_tombstones';

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

    function loadTombstones() {
        const storage = getStorage();
        if (!storage) return [];
        try {
            const parsed = JSON.parse(storage.getItem(TOMB_KEY) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    }

    // Le lapidi pesano ~50 byte l'una: niente potatura, niente retry quota
    function persistTombstones(tombstones) {
        const storage = getStorage();
        if (!storage) return;
        try {
            storage.setItem(TOMB_KEY, JSON.stringify(tombstones));
        } catch (e) {
            console.warn('ExerciseHistory: salvataggio lapidi fallito');
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
        const now = new Date().toISOString();
        const entry = {
            id: makeId(),
            savedAt: now,
            updatedAt: now,
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
        entry.updatedAt = new Date().toISOString();
        persist(entries);
        return entry.favorite;
    }

    function remove(id) {
        const entries = load();
        const next = entries.filter(en => en.id !== id);
        if (next.length === entries.length) return;
        persist(next);
        const tombstones = loadTombstones();
        tombstones.push({ id: id, deletedAt: new Date().toISOString() });
        persistTombstones(tombstones);
    }

    // ===== SYNC SUPPORT =====

    function exportState() {
        return { version: 1, entries: load(), tombstones: loadTombstones() };
    }

    // Fusione pura: unione per id, vince updatedAt più recente (fallback
    // savedAt, a parità vince il locale), le lapidi eliminano ovunque.
    function mergeStates(localState, remoteState) {
        const tombMap = new Map();
        (localState.tombstones || []).concat(remoteState.tombstones || []).forEach(t => {
            if (!t || !t.id) return;
            const prev = tombMap.get(t.id);
            if (!prev || String(t.deletedAt) > String(prev.deletedAt)) tombMap.set(t.id, t);
        });
        const ts = (en) => String(en.updatedAt || en.savedAt || '');
        const entryMap = new Map();
        (localState.entries || []).forEach(en => {
            if (en && en.id && !tombMap.has(en.id)) entryMap.set(en.id, en);
        });
        (remoteState.entries || []).forEach(en => {
            if (!en || !en.id || tombMap.has(en.id)) return;
            const prev = entryMap.get(en.id);
            if (!prev || ts(en) > ts(prev)) entryMap.set(en.id, en);
        });
        const entries = Array.from(entryMap.values())
            .sort((a, b) => String(a.savedAt).localeCompare(String(b.savedAt)));
        return { version: 1, entries: entries, tombstones: Array.from(tombMap.values()) };
    }

    function mergeState(remoteState) {
        if (!remoteState || typeof remoteState !== 'object') remoteState = {};
        const local = exportState();
        const merged = mergeStates(local, remoteState);
        const localChanged =
            JSON.stringify(merged.entries) !== JSON.stringify(local.entries) ||
            JSON.stringify(merged.tombstones) !== JSON.stringify(local.tombstones);
        const remoteChanged =
            JSON.stringify(merged.entries) !== JSON.stringify(remoteState.entries || []) ||
            JSON.stringify(merged.tombstones) !== JSON.stringify(remoteState.tombstones || []);
        if (localChanged) {
            persist(merged.entries);          // pota al tetto come sempre
            persistTombstones(merged.tombstones);
        }
        return { localChanged: localChanged, remoteChanged: remoteChanged };
    }

    const ExerciseHistory = { add, list, toggleFavorite, remove, exportState, mergeState };

    if (typeof window !== 'undefined') window.ExerciseHistory = ExerciseHistory;
    if (typeof module !== 'undefined' && module.exports) module.exports = ExerciseHistory;
})();
