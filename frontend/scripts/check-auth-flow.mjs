import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const authGate = await readFile(new URL('../src/components/AuthGate.jsx', import.meta.url), 'utf8')
const firebaseClient = await readFile(
  new URL('../src/services/firebaseClient.js', import.meta.url),
  'utf8',
)
const mainSource = await readFile(new URL('../src/main.jsx', import.meta.url), 'utf8')
const firebaseHosting = JSON.parse(
  await readFile(new URL('../firebase.json', import.meta.url), 'utf8'),
)

assert.match(
  firebaseClient,
  /authDomain:\s*['"]cap-decision-ft\.firebaseapp\.com['"]/,
  'Firebase Auth doit utiliser le même domaine que le logiciel.',
)
assert.match(
  mainSource,
  /window\.location\.replace\([\s\S]*https:\/\/cap-decision-ft\.firebaseapp\.com/,
  'L’adresse web.app doit rediriger vers le domaine de connexion.',
)
assert.match(
  authGate,
  /signInWithRedirect\(auth,\s*getGoogleProvider\(\)\)/,
  'La connexion Google doit utiliser la redirection fiable.',
)
assert.doesNotMatch(
  authGate,
  /signInWithPopup/,
  'Le parcours popup incompatible ne doit plus être proposé.',
)
assert.equal(
  firebaseHosting.auth?.providers?.emailPassword,
  undefined,
  'Aucun fournisseur Adresse/Mot de passe ne doit être activé.',
)
const globalHeaders = firebaseHosting.hosting?.headers
  ?.find(({ source }) => source === '**')
  ?.headers || []
const contentSecurityPolicy = globalHeaders
  .find(({ key }) => key === 'Content-Security-Policy')
  ?.value || ''
const frameOptions = globalHeaders
  .find(({ key }) => key === 'X-Frame-Options')
  ?.value || ''

assert.match(
  contentSecurityPolicy,
  /frame-src[^;]*'self'[^;]*https:\/\/\*\.firebaseapp\.com/,
  'La CSP doit autoriser le module Firebase Auth interne.',
)
assert.match(
  contentSecurityPolicy,
  /frame-ancestors 'self'/,
  'Seules les pages du même domaine peuvent intégrer le logiciel.',
)
assert.equal(
  frameOptions,
  'SAMEORIGIN',
  'La protection anti-intégration doit rester compatible avec Firebase Auth.',
)

console.log('Connexion vérifiée : un seul parcours Google fiable sur firebaseapp.com.')
