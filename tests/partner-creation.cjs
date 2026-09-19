const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(file, dependencies = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports, require: (name) => dependencies[name], console, ...globals });
  return exports;
}
const phone = load('lib/partner-phone.ts');
test('normalizes Indian mobile numbers without stripping a local 91 prefix', () => {
  for (const input of ['9876543210', '+91 98765 43210', '919876543210']) {
    assert.equal(phone.normalizePartnerPhone(input), '+919876543210');
  }
  assert.equal(phone.normalizePartnerPhone('9123456789'), '+919123456789');
  for (const input of ['', '1234567890', '+1 9876543210', '987654321']) {
    assert.throws(() => phone.normalizePartnerPhone(input));
  }
});
function setup({ admin = true, failSave = false, duplicate = false, invalidToken = false, initError, verificationError } = {}) {
  const writes = []; const deleted = []; const created = [];
  const auth = {
    verifyIdToken: async () => {
      if (verificationError) throw verificationError;
      if (invalidToken) throw { code: 'auth/id-token-expired' };
      return { uid: 'admin' };
    },
    createUser: async (data) => {
      if (duplicate) throw { code: 'auth/phone-number-already-exists' };
      created.push(data); return { uid: 'partner-uid' };
    },
    deleteUser: async (uid) => deleted.push(uid),
  };
  const db = {
    doc: (path) => path,
    getAll: async () => [{ data: () => ({ role: admin ? 'admin' : 'partner', status: 'active' }) }],
    collection: () => ({
      doc: () => 'Partner/generated-id',
      where: () => ({ limit: () => ({ get: async () => ({ empty: true }) }) }),
    }),
    batch: () => ({ create: (path, data) => writes.push({ path, data }), commit: async () => { if (failSave) throw Error(); } }),
  };
  const { POST } = load('app/api/partners/route.ts', {
    'next/server': { NextResponse: { json: (body, { status }) => ({ body, status }) } },
    '@/lib/firebase-admin': { getFirebaseAdmin: () => { if (initError) throw initError; return { auth, db }; } },
    '@/lib/partner-phone': phone,
  });
  const request = (token = 'Bearer valid') => ({
    headers: { get: () => token },
    json: async () => ({ name: 'Partner', email: 'partner@example.com', phone: '9876543210', role: 'agent', status: 'active' }),
  });
  return { POST, request, writes, created, deleted };
}
test('requires a verified token and admin profile before creating an account', async () => {
  for (const options of [{ admin: false }, { invalidToken: true }]) {
    const s = setup(options); const result = await s.POST(s.request());
    assert.equal(result.status, options.admin === false ? 403 : 401);
    assert.equal(s.created.length, 0);
  }
  const s = setup(); assert.equal((await s.POST(s.request(null))).status, 401);
});
test('creates phone Auth and linked profiles with the same UID', async () => {
  const s = setup(); assert.equal((await s.POST(s.request())).status, 201);
  assert.equal(s.created[0].phoneNumber, '+919876543210');
  assert.equal(s.writes[0].path, 'users/partner-uid');
  assert.equal(s.writes[1].data.uid, 'partner-uid');
  assert.equal(s.writes[0].data.phone, '9876543210');
});
test('duplicate phone does not overwrite an existing account', async () => {
  const s = setup({ duplicate: true }); assert.equal((await s.POST(s.request())).status, 409);
  assert.equal(s.writes.length, 0); assert.equal(s.deleted.length, 0);
});
test('rolls back a newly created Auth account when profile saving fails', async () => {
  const s = setup({ failSave: true }); assert.equal((await s.POST(s.request())).status, 500);
  assert.deepEqual(s.deleted, ['partner-uid']);
});

test('server credential failures return 500 rather than session-expired errors', async () => {
  for (const options of [
    { initError: { code: 'admin/missing-credentials' } },
    { verificationError: { code: 'app/invalid-credential' } },
  ]) {
    const s = setup(options);
    const result = await s.POST(s.request());
    assert.equal(result.status, 500);
    assert.match(result.body.error, /Firebase Admin configuration/);
    assert.equal(s.created.length, 0);
  }
});

test('Vercel rejects missing credentials before attempting application defaults', () => {
  const { getFirebaseAdmin } = load('lib/firebase-admin.ts', {
    'firebase-admin/app': {
      getApps: () => [],
      applicationDefault: () => assert.fail('Must not attempt ADC on Vercel'),
      initializeApp: () => assert.fail('Must not initialize with missing credentials'),
    },
  }, { process: { env: { VERCEL: '1', NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test' } } });
  assert.throws(getFirebaseAdmin, { code: 'admin/missing-credentials' });
});

test('partner client reports HTML errors and preserves JSON API errors', async () => {
  for (const [response, message] of [
    [{ status: 500, ok: false, json: async () => { throw new SyntaxError('Unexpected token <'); } }, /HTTP 500/],
    [{ status: 409, ok: false, json: async () => ({ error: 'Already registered' }) }, /Already registered/],
    [{ status: 200, ok: true, json: async () => ({}) }, /did not confirm/],
  ]) {
    const { addEmployee } = load('lib/services/users.ts', {
      '@/lib/firebase': { auth: {
        authStateReady: async () => {}, currentUser: { getIdToken: async () => 'token' },
      } },
    }, { fetch: async () => response });
    await assert.rejects(addEmployee({ role: 'partner' }), message);
  }
});
