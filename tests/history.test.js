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
