import { useEffect, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material'
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from '../services/firebaseClient'
import { backupAllLocalData, hydrateLocalDataFromCloud } from '../services/cloudPersistenceService'

const OWNER_EMAIL = 's.marchasson.cip@gmail.com'

const AuthGate = ({ children }) => {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

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
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ login_hint: OWNER_EMAIL, prompt: 'select_account' })
      const result = await signInWithPopup(auth, provider)
      if (result.user.email?.toLowerCase() !== OWNER_EMAIL) {
        await signOut(auth)
        setMessage('Ce compte Google n’est pas autorisé. Choisissez le compte propriétaire.')
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setMessage('La connexion Google n’a pas abouti. Réessayez et choisissez le compte propriétaire.')
      }
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
            <Typography variant="caption" color="text.secondary" textAlign="center">
              Utilisez votre compte Google professionnel habituel.
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
      <Button
        size="small"
        variant="contained"
        color="inherit"
        onClick={() => signOut(auth)}
        sx={{ position: 'fixed', right: 14, bottom: 14, zIndex: 1400 }}
      >
        Se déconnecter
      </Button>
    </>
  )
}

export default AuthGate
