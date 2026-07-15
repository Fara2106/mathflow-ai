'use strict';
const test = require('node:test');
const assert = require('node:assert');

const ExerciseHistory = require('../history.js');
globalThis.ExerciseHistory = ExerciseHistory;
const ExerciseSync = require('../sync.js');

function makeFakeStorage() {
    const map = new Map();
    return {
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => { map.set(k, String(v)); },
        removeItem: (k) => { map.delete(k); }
    };
}

function useStorage(storage) {
    Object.defineProperty(globalThis, 'localStorage', {
        value: storage, configurable: true, writable: true
    });
}

// Router di fetch finto: routes = [{method, match: RegExp, status, body}]
function stubFetch(routes) {
    const calls = [];
    globalThis.fetch = async (url, opts = {}) => {
        const method = (opts.method || 'GET').toUpperCase();
        calls.push({ url: String(url), method, body: opts.body ? String(opts.body) : '' });
        for (const r of routes) {
            if (r.method === method && r.match.test(String(url))) {
                return {
                    ok: r.status >= 200 && r.status < 300,
                    status: r.status,
                    json: async () => (typeof r.body === 'function' ? r.body() : r.body),
                    text: async () => JSON.stringify(typeof r.body === 'function' ? r.body() : r.body)
                };
            }
        }
        throw new Error('fetch non previsto: ' + method + ' ' + url);
    };
    return calls;
}

const GIST_LIST = { method: 'GET', match: /\/gists\?per_page/ };
const GIST_GET = { method: 'GET', match: /\/gists\/[^/?]+$/ };
const GIST_POST = { method: 'POST', match: /\/gists$/ };
const GIST_PATCH = { method: 'PATCH', match: /\/gists\/[^/?]+$/ };

function gistWithState(id, state) {
    return {
        id: id,
        files: { 'mathflow-archive.json': { content: JSON.stringify(state), truncated: false } }
    };
}

function fresh(routes, seedToken) {
    ExerciseSync._resetForTests();
    const storage = makeFakeStorage();
    if (seedToken) storage.setItem('mathflow_github_token', 'tok');
    useStorage(storage);
    const calls = stubFetch(routes);
    return { storage, calls };
}

function collectStatuses() {
    const states = [];
    ExerciseSync.onStatus(s => states.push(s));
    return states;
}

test('setToken valido salva il token', async () => {
    const { storage } = fresh([{ ...GIST_LIST, status: 200, body: [] }]);
    await ExerciseSync.setToken('tok-nuovo');
    assert.strictEqual(storage.getItem('mathflow_github_token'), 'tok-nuovo');
    assert.strictEqual(ExerciseSync.isConfigured(), true);
});

test('setToken 401 lancia TOKEN_INVALID e non salva', async () => {
    const { storage } = fresh([{ ...GIST_LIST, status: 401, body: {} }]);
    await assert.rejects(() => ExerciseSync.setToken('tok-rotto'), /TOKEN_INVALID/);
    assert.strictEqual(storage.getItem('mathflow_github_token'), null);
});

test('syncNow senza token non chiama la rete', async () => {
    const { calls } = fresh([]);
    const res = await ExerciseSync.syncNow();
    assert.deepStrictEqual(res, { localChanged: false });
    assert.strictEqual(calls.length, 0);
});

test('primo sync: nessun gist esistente, lo crea e salva l\'id', async () => {
    const { storage, calls } = fresh([
        { ...GIST_LIST, status: 200, body: [] },
        { ...GIST_POST, status: 201, body: { id: 'nuovo123' } },
        { ...GIST_GET, status: 200, body: gistWithState('nuovo123', { version: 1, entries: [], tombstones: [] }) }
    ], true);
    const states = collectStatuses();
    await ExerciseSync.syncNow();
    assert.strictEqual(storage.getItem('mathflow_gist_id'), 'nuovo123');
    assert.ok(calls.some(c => c.method === 'POST'), 'gist creato');
    assert.strictEqual(states[states.length - 1].state, 'synced');
});

test('scoperta: trova il gist per nome file e importa le voci remote', async () => {
    const remoteEntry = {
        id: 'rem1', savedAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
        level: 'Medie', topic: 'Remoto', icon: '🧪', subtype: '', difficulty: 'facile',
        favorite: false, exercise: { theory: 't', exerciseText: 'e', result: 'r', solution: 's' }
    };
    const { storage, calls } = fresh([
        { ...GIST_LIST, status: 200, body: [{ id: 'trovato1', files: { 'mathflow-archive.json': {} } }] },
        { ...GIST_GET, status: 200, body: gistWithState('trovato1', { version: 1, entries: [remoteEntry], tombstones: [] }) }
    ], true);
    const res = await ExerciseSync.syncNow();
    assert.strictEqual(storage.getItem('mathflow_gist_id'), 'trovato1');
    assert.strictEqual(res.localChanged, true);
    assert.strictEqual(ExerciseHistory.list()[0].id, 'rem1');
    assert.ok(!calls.some(c => c.method === 'PATCH'), 'niente push: locale e remoto ora coincidono');
});

test('push: il locale ha novità, PATCH col contenuto fuso', async () => {
    const { calls } = fresh([
        { ...GIST_LIST, status: 200, body: [{ id: 'g1', files: { 'mathflow-archive.json': {} } }] },
        { ...GIST_GET, status: 200, body: gistWithState('g1', { version: 1, entries: [], tombstones: [] }) },
        { ...GIST_PATCH, status: 200, body: { id: 'g1' } }
    ], true);
    const e = ExerciseHistory.add(
        { level: 'Medie', topic: 'Locale', icon: '🧪', subtype: '', difficulty: 'facile' },
        { theory: 't', exerciseText: 'e', result: 'r', solution: 's' }
    );
    await ExerciseSync.syncNow();
    const patch = calls.find(c => c.method === 'PATCH');
    assert.ok(patch, 'PATCH eseguito');
    assert.ok(patch.body.includes(e.id), 'il push contiene la voce locale');
});

test('gist cancellato a mano: 404 sul GET, ricrea e riallinea', async () => {
    let firstGet = true;
    const { storage, calls } = fresh([
        {
            ...GIST_GET, status: 200,
            body: () => gistWithState('nuovo9', { version: 1, entries: [], tombstones: [] })
        },
        { ...GIST_LIST, status: 200, body: [] },
        { ...GIST_POST, status: 201, body: { id: 'nuovo9' } }
    ], true);
    // Il primo GET deve dare 404: intercetta sostituendo fetch una volta
    const inner = globalThis.fetch;
    globalThis.fetch = async (url, opts) => {
        if (firstGet && /\/gists\/vecchio7$/.test(String(url))) {
            firstGet = false;
            calls.push({ url: String(url), method: 'GET', body: '' });
            return { ok: false, status: 404, json: async () => ({}), text: async () => '{}' };
        }
        return inner(url, opts);
    };
    storage.setItem('mathflow_gist_id', 'vecchio7');
    const states = collectStatuses();
    await ExerciseSync.syncNow();
    assert.strictEqual(storage.getItem('mathflow_gist_id'), 'nuovo9');
    assert.strictEqual(states[states.length - 1].state, 'synced');
});

test('version remota maggiore: stato errore, nessun PATCH, sync sospesa', async () => {
    const { calls } = fresh([
        { ...GIST_LIST, status: 200, body: [{ id: 'g1', files: { 'mathflow-archive.json': {} } }] },
        { ...GIST_GET, status: 200, body: gistWithState('g1', { version: 2, entries: [], tombstones: [] }) }
    ], true);
    const states = collectStatuses();
    await ExerciseSync.syncNow();
    assert.strictEqual(states[states.length - 1].state, 'error');
    assert.ok(!calls.some(c => c.method === 'PATCH'));
    const callsBefore = calls.length;
    await ExerciseSync.syncNow(); // sospesa: nessuna nuova chiamata
    assert.strictEqual(calls.length, callsBefore);
});

test('remoto corrotto: stato errore e nessun PATCH distruttivo', async () => {
    const { calls } = fresh([
        { ...GIST_LIST, status: 200, body: [{ id: 'g1', files: { 'mathflow-archive.json': {} } }] },
        {
            ...GIST_GET, status: 200,
            body: { id: 'g1', files: { 'mathflow-archive.json': { content: '{non-json', truncated: false } } }
        }
    ], true);
    const states = collectStatuses();
    await ExerciseSync.syncNow();
    assert.strictEqual(states[states.length - 1].state, 'error');
    assert.ok(!calls.some(c => c.method === 'PATCH'));
});

test('401 durante la sync: errore token e auto-sync sospesa', async () => {
    const { calls } = fresh([{ ...GIST_LIST, status: 401, body: {} }], true);
    const states = collectStatuses();
    await ExerciseSync.syncNow();
    assert.strictEqual(states[states.length - 1].state, 'error');
    assert.match(states[states.length - 1].message, /[Tt]oken/);
    const before = calls.length;
    ExerciseSync.schedulePush(1);
    await new Promise(r => setTimeout(r, 30));
    assert.strictEqual(calls.length, before, 'schedulePush no-op da sospeso');
});

test('schedulePush coalescente: due chiamate ravvicinate, una sola sync', async () => {
    const { calls } = fresh([
        { ...GIST_LIST, status: 200, body: [{ id: 'g1', files: { 'mathflow-archive.json': {} } }] },
        { ...GIST_GET, status: 200, body: gistWithState('g1', { version: 1, entries: [], tombstones: [] }) }
    ], true);
    ExerciseSync.schedulePush(10);
    ExerciseSync.schedulePush(10);
    await new Promise(r => setTimeout(r, 80));
    const gets = calls.filter(c => c.method === 'GET' && GIST_GET.match.test(c.url));
    assert.strictEqual(gets.length, 1, 'una sola sync');
});

test('syncIfStale: subito dopo una sync riuscita non risincronizza', async () => {
    const { calls } = fresh([
        { ...GIST_LIST, status: 200, body: [{ id: 'g1', files: { 'mathflow-archive.json': {} } }] },
        { ...GIST_GET, status: 200, body: gistWithState('g1', { version: 1, entries: [], tombstones: [] }) }
    ], true);
    await ExerciseSync.syncNow();
    const before = calls.length;
    await ExerciseSync.syncIfStale(60);
    assert.strictEqual(calls.length, before);
});

test('disconnect rimuove token e gist id', async () => {
    const { storage } = fresh([], true);
    storage.setItem('mathflow_gist_id', 'g1');
    ExerciseSync.disconnect();
    assert.strictEqual(storage.getItem('mathflow_github_token'), null);
    assert.strictEqual(storage.getItem('mathflow_gist_id'), null);
    assert.strictEqual(ExerciseSync.isConfigured(), false);
});
