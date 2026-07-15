// ===== EXERCISE SYNC =====
// Sincronizza l'archivio (window.ExerciseHistory) con un Gist segreto
// GitHub. Possiede token, gist id e le chiamate a api.github.com.
// Regola d'oro: la sync non blocca MAI l'uso locale — syncNow non lancia,
// gli errori diventano eventi di stato per la UI.
(function () {
    'use strict';

    const TOKEN_KEY = 'mathflow_github_token';
    const GIST_KEY = 'mathflow_gist_id';
    const FILE_NAME = 'mathflow-archive.json';
    const API = 'https://api.github.com';
    const PUSH_DELAY_MS = 3000;

    let statusCb = null;
    let syncing = null;      // Promise della sync in corso
    let queued = false;      // richiesta arrivata durante una sync
    let pushTimer = null;
    let lastSyncAt = 0;      // epoch ms dell'ultima sync riuscita
    let suspended = false;   // token invalido o version sconosciuta

    function getStorage() {
        try {
            return globalThis.localStorage || null;
        } catch (e) {
            return null;
        }
    }

    function getToken() {
        const s = getStorage();
        return s ? s.getItem(TOKEN_KEY) : null;
    }

    function isConfigured() {
        return !!getToken();
    }

    function emit(state, message) {
        if (statusCb) statusCb({ state: state, at: new Date(), message: message || '' });
    }

    function onStatus(cb) {
        statusCb = cb;
    }

    function headers(token) {
        return {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        };
    }

    function statusError(res) {
        return new Error(res.status === 401 || res.status === 403 ? 'TOKEN_INVALID' : 'NETWORK');
    }

    async function setToken(token) {
        const res = await fetch(API + '/gists?per_page=1', { headers: headers(token) });
        if (res.status === 401 || res.status === 403) throw new Error('TOKEN_INVALID');
        if (!res.ok) throw new Error('NETWORK');
        const s = getStorage();
        if (!s) throw new Error('STORAGE_UNAVAILABLE');
        s.setItem(TOKEN_KEY, token);
        suspended = false;
        return true;
    }

    function disconnect() {
        const s = getStorage();
        if (s) {
            s.removeItem(TOKEN_KEY);
            s.removeItem(GIST_KEY);
        }
        suspended = false;
        clearTimeout(pushTimer);
        emit('idle');
    }

    // Trova il gist per nome file (fino a 300 gist) o lo crea, segreto
    async function findOrCreateGist(token) {
        const s = getStorage();
        const savedId = s && s.getItem(GIST_KEY);
        if (savedId) return savedId;
        for (let page = 1; page <= 3; page++) {
            const res = await fetch(API + '/gists?per_page=100&page=' + page, { headers: headers(token) });
            if (!res.ok) throw statusError(res);
            const gists = await res.json();
            const found = gists.find(g => g && g.files && g.files[FILE_NAME]);
            if (found) {
                if (s) s.setItem(GIST_KEY, found.id);
                return found.id;
            }
            if (gists.length < 100) break;
        }
        const res = await fetch(API + '/gists', {
            method: 'POST',
            headers: Object.assign({ 'Content-Type': 'application/json' }, headers(token)),
            body: JSON.stringify({
                description: 'MathFlow AI — archivio esercizi sincronizzato',
                public: false,
                files: { [FILE_NAME]: { content: JSON.stringify(globalThis.ExerciseHistory.exportState()) } }
            })
        });
        if (!res.ok) throw statusError(res);
        const gist = await res.json();
        if (s) s.setItem(GIST_KEY, gist.id);
        return gist.id;
    }

    // null = gist sparito (404); {} = gist senza file (trattato come vuoto)
    async function fetchRemoteState(token, id) {
        const res = await fetch(API + '/gists/' + id, { headers: headers(token) });
        if (res.status === 404) return null;
        if (!res.ok) throw statusError(res);
        const gist = await res.json();
        const file = gist && gist.files && gist.files[FILE_NAME];
        if (!file) return {};
        let content = file.content;
        if (file.truncated && file.raw_url) {
            const raw = await fetch(file.raw_url);
            if (!raw.ok) throw new Error('NETWORK');
            content = await raw.text();
        }
        if (content === undefined || content === '') return {};
        try {
            return JSON.parse(content);
        } catch (e) {
            throw new Error('REMOTE_CORRUPT');
        }
    }

    async function pushState(token, id) {
        const res = await fetch(API + '/gists/' + id, {
            method: 'PATCH',
            headers: Object.assign({ 'Content-Type': 'application/json' }, headers(token)),
            body: JSON.stringify({
                files: { [FILE_NAME]: { content: JSON.stringify(globalThis.ExerciseHistory.exportState()) } }
            })
        });
        if (!res.ok) throw statusError(res);
    }

    async function doSync() {
        const token = getToken();
        if (!token || suspended) return { localChanged: false };
        emit('syncing');
        try {
            let id = await findOrCreateGist(token);
            let remote = await fetchRemoteState(token, id);
            if (remote === null) {
                // Gist cancellato a mano: dimentica l'id e riparti
                const s = getStorage();
                if (s) s.removeItem(GIST_KEY);
                id = await findOrCreateGist(token);
                remote = (await fetchRemoteState(token, id)) || {};
            }
            if (remote.version && remote.version > 1) throw new Error('VERSION_UNSUPPORTED');
            const merged = globalThis.ExerciseHistory.mergeState(remote);
            if (merged.remoteChanged) await pushState(token, id);
            lastSyncAt = Date.now();
            emit('synced');
            return { localChanged: merged.localChanged };
        } catch (err) {
            if (err.message === 'TOKEN_INVALID') {
                suspended = true;
                emit('error', 'Token non valido o scaduto');
            } else if (err.message === 'VERSION_UNSUPPORTED') {
                suspended = true;
                emit('error', 'Archivio remoto più recente: ricarica l\'app su questo dispositivo');
            } else if (err.message === 'REMOTE_CORRUPT') {
                emit('error', 'Dati remoti illeggibili: sincronizzazione sospesa per sicurezza');
            } else {
                emit('error', 'Sincronizzazione non riuscita: controlla la connessione');
            }
            return { localChanged: false };
        }
    }

    function syncNow() {
        if (syncing) {
            queued = true;
            return syncing;
        }
        syncing = doSync().finally(() => {
            syncing = null;
            if (queued) {
                queued = false;
                syncNow();
            }
        });
        return syncing;
    }

    function syncIfStale(maxAgeSeconds) {
        if (Date.now() - lastSyncAt >= maxAgeSeconds * 1000) return syncNow();
        return Promise.resolve({ localChanged: false });
    }

    function schedulePush(delayMs) {
        if (!isConfigured() || suspended) return;
        clearTimeout(pushTimer);
        pushTimer = setTimeout(syncNow, typeof delayMs === 'number' ? delayMs : PUSH_DELAY_MS);
    }

    function _resetForTests() {
        statusCb = null;
        syncing = null;
        queued = false;
        clearTimeout(pushTimer);
        pushTimer = null;
        lastSyncAt = 0;
        suspended = false;
    }

    const ExerciseSync = {
        isConfigured, setToken, disconnect,
        syncNow, syncIfStale, schedulePush, onStatus,
        _resetForTests
    };

    if (typeof window !== 'undefined') window.ExerciseSync = ExerciseSync;
    if (typeof module !== 'undefined' && module.exports) module.exports = ExerciseSync;
})();
