import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const authGate = await readFile(new URL('../src/components/AuthGate.jsx', import.meta.url), 'utf8')
const firebaseClient = await readFile(
  new URL('../src/services/firebaseClient.js', import.meta.url),
  'utf8',
)
const firebaseHosting = JSON.parse(
  await readFile(new URL('../firebase.json', import.meta.url), 'utf8'),
)

assert.match(
  firebaseClient,
  /authDomain:\s*['"]cap-decision-ft\.firebaseapp\.com['"]/,
  'Le domaine Firebase Auth doit utiliser le domaine d’origine fonctionnel.',
)
assert.match(
  authGate,
  /signInWithPopup\(auth,\s*getGoogleProvider\(\)\)/,
  'La connexion principale doit utiliser le popup Google d’origine.',
)
assert.match(
  authGate,
  /signInWithRedirect\(auth,\s*getGoogleProvider\(\)\)/,
  'La connexion Google d’origine doit conserver la redirection de secours.',
)
assert.equal(
  firebaseHosting.auth?.providers?.emailPassword,
  undefined,
  'Aucun fournisseur Adresse/Mot de passe ne doit être activé.',
)
assert.deepEqual(
  firebaseHosting.auth?.providers?.googleSignIn?.authorizedRedirectUris,
  [
    'https://cap-decision-ft.firebaseapp.com/__/auth/handler',
    'https://cap-decision-ft.web.app/__/auth/handler',
  ],
  'Seuls les deux gestionnaires OAuth Firebase standards doivent être autorisés.',
)
const globalHeaders = firebaseHosting.hosting?.headers
  ?.find(({ source }) => source === '**')
  ?.headers || []
const contentSecurityPolicy = globalHeaders
  .find(({ key }) => key === 'Content-Security-Policy')
  ?.value || ''

assert.match(
  contentSecurityPolicy,
  /frame-src[^;]*https:\/\/\*\.firebaseapp\.com/,
  'La CSP doit autoriser l’iframe Firebase Auth du domaine d’origine.',
)

console.log('Connexion d’origine vérifiée : domaine firebaseapp.com, popup Google et redirection de secours.')
