import { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { auth } from '../services/firebaseClient'
import {
  backupAllLocalData,
  clearSensitiveLocalData,
  hydrateLocalDataFromCloud,
} from '../services/cloudPersistenceService'

const OWNER_EMAIL = 's.marchasson.cip@gmail.com'

const AuthGate = ({ children }) => {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

  const getGoogleProvider = () => {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ login_hint: OWNER_EMAIL, prompt: 'select_account' })
    return provider
  }

  const authErrorMessage = (error) => {
    if (error?.code === 'auth/unauthorized-domain') {
      return 'Cette adresse internet n’est pas encore autorisée dans Firebase. Le domaine cap-decision-ft.web.app doit être ajouté aux domaines autorisés.'
    }
    if (error?.code === 'auth/network-request-failed') {
      return 'Google n’a pas pu être joint. Vérifiez la connexion internet, puis réessayez.'
    }
    if (error?.code === 'auth/popup-blocked') {
      return 'La fenêtre Google a été bloquée. Utilisez le bouton « Connexion Google sans fenêtre séparée ».'
    }
    if (error?.code === 'auth/account-exists-with-different-credential') {
      return 'Ce compte existe déjà avec une autre méthode de connexion.'
    }
    if (error?.code === 'auth/operation-not-allowed') {
      return 'La connexion Google doit être activée dans Firebase Authentication.'
    }
    return `La connexion Google n’a pas abouti (${error?.code || 'erreur inconnue'}). Utilisez la connexion sans fenêtre séparée.`
  }

  useEffect(() => {
    getRedirectResult(auth).catch((error) => {
      setMessage(authErrorMessage(error))
      setChecking(false)
    })
  }, [])

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    if (nextUser && nextUser.email?.toLowerCase() !== OWNER_EMAIL) {
      await signOut(auth)
      setMessage('Ce compte Google n’est pas autorisé à accéder au logiciel.')
      setChecking(false)
      return
    }

    setUser(nextUser)
    if (nextUser) {
      setSyncing(true)
      try {
        await hydrateLocalDataFromCloud()
        await backupAllLocalData()
      } catch {
        setMessage('Connexion réussie, mais la synchronisation doit être relancée.')
      } finally {
        setSyncing(false)
      }
    }
    setChecking(false)
  }), [])

  const connectWithGoogle = async () => {
    setMessage('')
    try {
      const result = await signInWithPopup(auth, getGoogleProvider())
      if (result.user.email?.toLowerCase() !== OWNER_EMAIL) {
        await signOut(auth)
        setMessage('Ce compte Google n’est pas autorisé. Choisissez le compte propriétaire.')
      }
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') return
      setMessage(authErrorMessage(error))
    }
  }

  const connectWithGoogleRedirect = async () => {
    setMessage('')
    try {
      await signInWithRedirect(auth, getGoogleProvider())
    } catch (error) {
      setMessage(authErrorMessage(error))
    }
  }

  const disconnectFromGoogle = async () => {
    setMessage('')
    setSyncing(true)
    try {
      await backupAllLocalData()
      await signOut(auth)
      clearSensitiveLocalData()
    } catch {
      setMessage('Déconnexion annulée : la sauvegarde en ligne doit réussir avant d’effacer les données de cet appareil.')
    } finally {
      setSyncing(false)
    }
  }

  if (checking || syncing) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#eef3f8' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography sx={{ fontWeight: 800 }}>
            {syncing ? 'Synchronisation sécurisée des dossiers…' : 'Vérification de l’accès…'}
          </Typography>
        </Stack>
      </Box>
    )
  }

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: '#0d1b2d' }}>
        <Paper sx={{ width: '100%', maxWidth: 460, p: 4, borderTop: '8px solid #1976d2' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: '#123d64' }}>Cap Décision FT</Typography>
          <Typography sx={{ mt: 1, mb: 3 }} color="text.secondary">
            Espace personnel sécurisé. Seul le compte Google propriétaire peut accéder aux dossiers.
          </Typography>
          <Stack spacing={2}>
            <Button variant="contained" size="large" onClick={connectWithGoogle} sx={{ fontWeight: 900 }}>
              Continuer avec Google
            </Button>
            <Button variant="outlined" size="large" onClick={connectWithGoogleRedirect} sx={{ fontWeight: 900 }}>
              Connexion Google sans fenêtre séparée
            </Button>
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Utilisez uniquement le compte propriétaire {OWNER_EMAIL}.
            </Typography>
            {message ? <Alert severity="warning">{message}</Alert> : null}
          </Stack>
        </Paper>
      </Box>
    )
  }

  return (
    <>
      {children}
      {message ? (
        <Alert
          severity="error"
          sx={{ position: 'fixed', right: 14, bottom: 58, zIndex: 1400, maxWidth: 520 }}
        >
          {message}
        </Alert>
      ) : null}
      <Button
        size="small"
        variant="contained"
        color="inherit"
        onClick={disconnectFromGoogle}
        sx={{ position: 'fixed', right: 14, bottom: 14, zIndex: 1400 }}
      >
        Se déconnecter
      </Button>
    </>
  )
}

export default AuthGate
