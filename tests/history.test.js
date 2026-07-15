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

// ===== Sync: updatedAt, lapidi, exportState/mergeState =====

// Semina direttamente le chiavi per test deterministici sul merge
function seedState(storage, entries, tombstones) {
    storage.setItem('mathflow_history', JSON.stringify(entries));
    storage.setItem('mathflow_tombstones', JSON.stringify(tombstones || []));
}

function makeEntry(id, savedAt, extra) {
    return Object.assign({
        id, savedAt, updatedAt: savedAt,
        level: 'Medie', topic: 'T', icon: '🧪', subtype: '',
        difficulty: 'facile', favorite: false,
        exercise: { theory: 't', exerciseText: 'e', result: 'r', solution: 's' }
    }, extra || {});
}

test('add imposta updatedAt uguale a savedAt', () => {
    useStorage(makeFakeStorage());
    const e = ExerciseHistory.add(META, EXERCISE);
    assert.strictEqual(e.updatedAt, e.savedAt);
});

test('toggleFavorite aggiorna updatedAt', () => {
    const storage = makeFakeStorage();
    seedState(storage, [makeEntry('a', '2026-01-01T00:00:00.000Z')]);
    useStorage(storage);
    ExerciseHistory.toggleFavorite('a');
    const entry = ExerciseHistory.list()[0];
    assert.ok(entry.updatedAt > '2026-01-01T00:00:00.000Z', 'updatedAt avanzato');
    assert.strictEqual(entry.savedAt, '2026-01-01T00:00:00.000Z', 'savedAt intatto');
});

test('remove lascia una lapide', () => {
    useStorage(makeFakeStorage());
    const e = ExerciseHistory.add(META, EXERCISE);
    ExerciseHistory.remove(e.id);
    const state = ExerciseHistory.exportState();
    assert.strictEqual(state.entries.length, 0);
    assert.strictEqual(state.tombstones.length, 1);
    assert.strictEqual(state.tombstones[0].id, e.id);
    assert.ok(!Number.isNaN(Date.parse(state.tombstones[0].deletedAt)));
});

test('remove di id inesistente non lascia lapidi', () => {
    useStorage(makeFakeStorage());
    ExerciseHistory.remove('fantasma');
    assert.strictEqual(ExerciseHistory.exportState().tombstones.length, 0);
});

test('exportState ha version 1, entries in ordine di inserimento, tombstones', () => {
    useStorage(makeFakeStorage());
    const a = ExerciseHistory.add({ ...META, topic: 'Primo' }, EXERCISE);
    ExerciseHistory.add({ ...META, topic: 'Secondo' }, EXERCISE);
    const state = ExerciseHistory.exportState();
    assert.strictEqual(state.version, 1);
    assert.strictEqual(state.entries[0].topic, 'Primo');
    assert.strictEqual(state.entries[1].topic, 'Secondo');
    assert.deepStrictEqual(state.tombstones, []);
    assert.strictEqual(state.entries[0].id, a.id);
});

test('mergeState: voce remota nuova entra in locale', () => {
    const storage = makeFakeStorage();
    seedState(storage, [makeEntry('a', '2026-01-01T00:00:00.000Z')]);
    useStorage(storage);
    const res = ExerciseHistory.mergeState({
        version: 1,
        entries: [makeEntry('b', '2026-01-02T00:00:00.000Z')],
        tombstones: []
    });
    assert.strictEqual(res.localChanged, true);
    assert.strictEqual(res.remoteChanged, true, 'il remoto non ha la voce a');
    const ids = ExerciseHistory.list().map(e => e.id);
    assert.deepStrictEqual(ids, ['b', 'a'], 'list() è più-recente-prima');
});

test('mergeState: conflitto stella, vince updatedAt più recente (remoto)', () => {
    const storage = makeFakeStorage();
    seedState(storage, [makeEntry('a', '2026-01-01T00:00:00.000Z')]);
    useStorage(storage);
    const remoteA = makeEntry('a', '2026-01-01T00:00:00.000Z',
        { favorite: true, updatedAt: '2026-01-05T00:00:00.000Z' });
    const res = ExerciseHistory.mergeState({ version: 1, entries: [remoteA], tombstones: [] });
    assert.strictEqual(res.localChanged, true);
    assert.strictEqual(res.remoteChanged, false);
    assert.strictEqual(ExerciseHistory.list()[0].favorite, true);
});

test('mergeState: conflitto stella, vince updatedAt più recente (locale)', () => {
    const storage = makeFakeStorage();
    seedState(storage, [makeEntry('a', '2026-01-01T00:00:00.000Z',
        { favorite: true, updatedAt: '2026-01-09T00:00:00.000Z' })]);
    useStorage(storage);
    const remoteA = makeEntry('a', '2026-01-01T00:00:00.000Z',
        { favorite: false, updatedAt: '2026-01-05T00:00:00.000Z' });
    const res = ExerciseHistory.mergeState({ version: 1, entries: [remoteA], tombstones: [] });
    assert.strictEqual(res.localChanged, false);
    assert.strictEqual(res.remoteChanged, true);
    assert.strictEqual(ExerciseHistory.list()[0].favorite, true);
});

test('mergeState: lapide remota elimina la voce locale', () => {
    const storage = makeFakeStorage();
    seedState(storage, [makeEntry('a', '2026-01-01T00:00:00.000Z')]);
    useStorage(storage);
    const res = ExerciseHistory.mergeState({
        version: 1, entries: [],
        tombstones: [{ id: 'a', deletedAt: '2026-01-02T00:00:00.000Z' }]
    });
    assert.strictEqual(res.localChanged, true);
    assert.strictEqual(ExerciseHistory.list().length, 0);
    assert.strictEqual(ExerciseHistory.exportState().tombstones.length, 1, 'lapide adottata');
});

test('mergeState: lapide locale vince sulla voce remota e segnala remoteChanged', () => {
    const storage = makeFakeStorage();
    seedState(storage, [], [{ id: 'a', deletedAt: '2026-01-03T00:00:00.000Z' }]);
    useStorage(storage);
    const res = ExerciseHistory.mergeState({
        version: 1, entries: [makeEntry('a', '2026-01-01T00:00:00.000Z')], tombstones: []
    });
    assert.strictEqual(res.localChanged, false);
    assert.strictEqual(res.remoteChanged, true);
    assert.strictEqual(ExerciseHistory.list().length, 0, 'la voce non risorge');
});

test('mergeState: stati identici, nessun cambiamento', () => {
    const storage = makeFakeStorage();
    const entries = [makeEntry('a', '2026-01-01T00:00:00.000Z')];
    seedState(storage, entries);
    useStorage(storage);
    const res = ExerciseHistory.mergeState({ version: 1, entries, tombstones: [] });
    assert.strictEqual(res.localChanged, false);
    assert.strictEqual(res.remoteChanged, false);
});

test('mergeState: remoto vuoto o malformato = solo remoteChanged', () => {
    const storage = makeFakeStorage();
    seedState(storage, [makeEntry('a', '2026-01-01T00:00:00.000Z')]);
    useStorage(storage);
    for (const remote of [{}, null, undefined, { version: 1 }]) {
        const res = ExerciseHistory.mergeState(remote);
        assert.strictEqual(res.localChanged, false, 'nulla da cambiare in locale');
        assert.strictEqual(res.remoteChanged, true, 'il remoto va riempito');
    }
});

test('mergeState: voce senza updatedAt usa savedAt come fallback', () => {
    const storage = makeFakeStorage();
    const localOld = makeEntry('a', '2026-01-01T00:00:00.000Z');
    delete localOld.updatedAt; // voce pre-sync
    seedState(storage, [localOld]);
    useStorage(storage);
    const remoteA = makeEntry('a', '2026-01-01T00:00:00.000Z',
        { favorite: true, updatedAt: '2026-01-02T00:00:00.000Z' });
    ExerciseHistory.mergeState({ version: 1, entries: [remoteA], tombstones: [] });
    assert.strictEqual(ExerciseHistory.list()[0].favorite, true, 'vince il remoto più recente');
});
