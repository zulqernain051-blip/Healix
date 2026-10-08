const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadTs } = require('./load-ts.cjs');
const { getAuthRedirect, getDashboardRoute } = loadTs('src/utils/authRouting.ts');
const { scheduleRange, shiftScheduleDate } = loadTs('src/utils/schedule.ts');
const { hasValidCoordinates } = loadTs('src/utils/location.ts');

function setup(fetchImpl, initial = { token: 'old', refreshToken: 'refresh-old' }) {
  const values = new Map(Object.entries(initial)); let version = 0; let clears = 0;
  const state = { accessToken: initial.token, clearSession: async () => { version++; clears++; values.clear(); state.accessToken = null; } };
  const storage = { getItemAsync: async k => values.get(k) ?? null, setItemAsync: async (k, v) => values.set(k, v), deleteItemAsync: async k => values.delete(k) };
  const mocks = {
    'react-native': { Platform: { OS: 'web' } }, 'expo-constants': {},
    '../utils/secureStorage': { secureStorage: storage },
    '../store/auth': { getSessionVersion: () => version, useAuthStore: { getState: () => state, setState: next => Object.assign(state, next) } },
  };
  const { apiClient } = loadTs('src/api/client.ts', mocks, { fetch: fetchImpl });
  return { apiClient, values, state, clears: () => clears };
}
const json = (data, status = 200) => new Response(JSON.stringify(data), { status });

test('admin and care workspaces reject other account roles', () => {
  assert.equal(getAuthRedirect('PATIENT', ['admin', 'users']), '/(patient)/(tabs)/home');
  assert.equal(getAuthRedirect('NURSE', ['(patient)', 'health']), '/(nurse)/(tabs)/home');
  assert.equal(getAuthRedirect(undefined, ['admin']), '/auth/login');
  assert.equal(getDashboardRoute('PARAMEDIC'), '/(paramedic)');
  assert.equal(getAuthRedirect('PATIENT', ['(paramedic)']), '/(patient)/(tabs)/home');
  assert.equal(getAuthRedirect('PARAMEDIC', ['(paramedic)']), null);
});
test('signed-in users can reach password change', () => {
  assert.equal(getAuthRedirect('PATIENT', ['auth', 'change-password']), null);
  assert.equal(getAuthRedirect('PATIENT', ['auth', 'login']), '/(patient)/(tabs)/home');
});
test('coordinates accept zero and reject missing/non-finite/out-of-range values', () => {
  assert.equal(hasValidCoordinates({ latitude: 0, longitude: 0 }), true);
  for (const latitude of [undefined, null, NaN, Infinity, 91, -91]) assert.equal(hasValidCoordinates({ latitude, longitude: 0 }), false);
  assert.equal(hasValidCoordinates({ latitude: 30, longitude: 181 }), false);
});
test('week starts Monday and month navigation does not skip February', () => {
  const range = scheduleRange(new Date(2026, 9, 4), 'WEEK');
  assert.equal(range.start.getDate(), 28); assert.equal(range.start.getMonth(), 8);
  assert.equal(range.end.getDate(), 5);
  const next = shiftScheduleDate(new Date(2026, 0, 31), 'MONTH', 1);
  assert.equal(next.getMonth(), 1); assert.equal(next.getDate(), 1);
});
test('non-JSON errors retain HTTP status and readable body', async () => {
  const { apiClient } = setup(async () => new Response('Service unavailable', { status: 503 }));
  await assert.rejects(apiClient.get('/data'), e => e.statusCode === 503 && e.message === 'Service unavailable');
});
test('no-content responses are successful', async () => {
  const { apiClient } = setup(async () => new Response(null, { status: 204 }));
  assert.equal(await apiClient.delete('/data'), undefined);
});
test('concurrent expired requests share one token rotation and update memory', async () => {
  let rotations = 0;
  const { apiClient, state } = setup(async (url, options) => {
    if (url.endsWith('/auth/refresh')) { rotations++; await new Promise(r => setTimeout(r, 10)); return json({ success: true, data: { accessToken: 'new', refreshToken: 'refresh-new' } }); }
    return new Headers(options.headers).get('Authorization') === 'Bearer new' ? json({ success: true, data: 'ok' }) : json({ message: 'expired' }, 401);
  });
  assert.deepEqual(await Promise.all([apiClient.get('/one'), apiClient.get('/two')]), ['ok', 'ok']);
  assert.equal(rotations, 1); assert.equal(state.accessToken, 'new');
});
test('invalid refresh clears the session and rejects all waiting calls', async () => {
  const ctx = setup(async () => json({ message: 'expired' }, 401));
  const results = await Promise.allSettled([ctx.apiClient.get('/one'), ctx.apiClient.get('/two')]);
  assert.ok(results.every(r => r.status === 'rejected')); assert.equal(ctx.clears(), 1); assert.equal(ctx.values.size, 0);
});
test('public login errors do not rotate a stored session', async () => {
  const calls = [];
  const { apiClient } = setup(async url => { calls.push(url); return json({ message: 'Invalid credentials' }, 401); });
  const { authApi } = loadTs('src/api/auth.api.ts', { './client': { apiClient } });
  await assert.rejects(authApi.login({ emailOrPhone: 'a', password: 'b' }), /Invalid credentials/);
  assert.equal(calls.length, 1);
});
test('transient refresh failure preserves credentials for reconnecting', async () => {
  const ctx = setup(async url => url.endsWith('/auth/refresh') ? new Response('Unavailable', { status: 503 }) : json({ message: 'expired' }, 401));
  await assert.rejects(ctx.apiClient.get('/data'));
  assert.equal(ctx.values.get('refreshToken'), 'refresh-old'); assert.equal(ctx.clears(), 0);
});
test('a refresh response cannot revive a signed-out account', async () => {
  let release, started;
  const begun = new Promise(r => { started = r; });
  const ctx = setup(async url => {
    if (!url.endsWith('/auth/refresh')) return json({ message: 'expired' }, 401);
    started(); await new Promise(r => { release = r; });
    return json({ success: true, data: { accessToken: 'new', refreshToken: 'refresh-new' } });
  });
  const pending = ctx.apiClient.get('/data');
  await begun; await ctx.state.clearSession(); release();
  await assert.rejects(pending); assert.equal(ctx.values.size, 0); assert.equal(ctx.state.accessToken, null);
});
test('multipart uploads let fetch generate the boundary without mutating caller headers', async () => {
  let sent;
  const { apiClient } = setup(async (_url, options) => { sent = options.headers; return json({ success: true, data: 'uploaded' }); });
  const headers = { 'Content-Type': 'multipart/form-data' };
  const form = new FormData(); form.append('file', new Blob(['data']), 'test.txt');
  await apiClient.post('/media', form, { headers });
  assert.equal(new Headers(sent).has('Content-Type'), false); assert.equal(headers['Content-Type'], 'multipart/form-data');
});
test('message sending returns the already-unwrapped message', async () => {
  const message = { id: 'message-1', threadId: 'thread-1' };
  const { messagesApi } = loadTs('src/api/messages.api.ts', { 'react-native': { Platform: { OS: 'web' } }, './client': { apiClient: { post: async () => message } } });
  assert.equal(await messagesApi.sendMessage({ threadId: 'thread-1', contentType: 'TEXT', contentUrlOrText: 'hello' }), message);
});

test('logout clears cached patient data, tokens and sockets', async () => {
  const values = new Map([['token', 'old'], ['refreshToken', 'refresh']]);
  let cleared = 0, disconnected = 0;
  const mocks = {
    '../lib/queryClient': { queryClient: { clear: () => cleared++ } },
    '../utils/secureStorage': { secureStorage: { deleteItemAsync: async key => values.delete(key), getItemAsync: async key => values.get(key), setItemAsync: async (key, value) => values.set(key, value) } },
    '../services/socket': { disconnectSocket: () => disconnected++ },
  };
  const { useAuthStore } = loadTs('src/store/auth.ts', mocks);
  useAuthStore.setState({ user: { id: 'old-user' }, accessToken: 'old' });
  await useAuthStore.getState().clearSession();
  assert.equal(useAuthStore.getState().user, null);
  assert.equal(values.size, 0); assert.equal(cleared, 1); assert.equal(disconnected, 1);
});
test('browser attachments use actual file blobs', async () => {
  let posted;
  const message = { id: 'media-1' };
  const { messagesApi } = loadTs('src/api/messages.api.ts', {
    'react-native': { Platform: { OS: 'web' } },
    './client': { apiClient: { post: async (_url, body) => { posted = body; return message; } } },
  }, { fetch: async () => new Response(new Blob(['attachment'], { type: 'text/plain' })) });
  assert.equal(await messagesApi.sendMediaMessage('thread-1', 'blob:file', 'text/plain', 'file.txt'), message);
  assert.equal(posted.get('file').name, 'file.txt'); assert.equal(await posted.get('file').text(), 'attachment');
});

test('pending nurses can reach onboarding only', () => {
  assert.equal(getAuthRedirect('NURSE', ['(nurse)', '(tabs)', 'home'], 'PENDING_VERIFICATION'), '/(nurse)/profile/verification');
  assert.equal(getAuthRedirect('NURSE', ['(nurse)', 'profile', 'verification'], 'PENDING_VERIFICATION'), null);
  assert.equal(getAuthRedirect('NURSE', ['(nurse)', '(tabs)', 'profile'], 'PENDING_VERIFICATION'), null);
  assert.equal(getAuthRedirect('NURSE', ['(nurse)', 'visits', 'id'], 'PENDING_VERIFICATION'), '/(nurse)/profile/verification');
});


test('calendar input rejects rolled-over days and invalid times', () => {
 const {localDateTime}=loadTs('src/utils/dates.ts');
 assert.equal(localDateTime('2026-02-29','10:00'),null);
 assert.equal(localDateTime('2026-04-31','10:00'),null);
 assert.equal(localDateTime('2026-10-05','24:00'),null);
 assert.ok(localDateTime('2028-02-29','23:59'));
});
