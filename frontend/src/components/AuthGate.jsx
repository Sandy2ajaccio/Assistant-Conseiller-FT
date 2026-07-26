import { useEffect, useRef, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material'
import { onAuthStateChanged, RecaptchaVerifier, signInWithPhoneNumber, signOut } from 'firebase/auth'
import { auth } from '../services/firebaseClient'
import { backupAllLocalData, hydrateLocalDataFromCloud } from '../services/cloudPersistenceService'

const normalizeFrenchPhone = (value) => {
  const compact = String(value || '').replace(/[^\d+]/g, '')
  if (/^06\d{8}$/.test(compact)) return `+33${compact.slice(1)}`
  if (/^\+336\d{8}$/.test(compact)) return compact
  return ''
}

const AuthGate = ({ children }) => {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [confirmation, setConfirmation] = useState(null)
  const [message, setMessage] = useState('')
  const recaptchaRef = useRef(null)

  useEffect(() => onAuthStateChanged(auth, async (nextUser) => {
    setUser(nextUser)
    if (nextUser) {
      setSyncing(true)
      try {
        await hydrateLocalDataFromCloud()
        await backupAllLocalData()
      } catch {
        setMessage('Connexion réussie, mais la sauvegarde distante doit encore être activée.')
      } finally {
        setSyncing(false)
      }
    }
    setChecking(false)
  }), [])

  const requestCode = async () => {
    setMessage('')
    const normalized = normalizeFrenchPhone(phone)
    if (!normalized) {
      setMessage('Saisissez un numéro mobile français valide.')
      return
    }
    try {
      if (recaptchaRef.current) recaptchaRef.current.clear()
      recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      const result = await signInWithPhoneNumber(auth, normalized, recaptchaRef.current)
      setConfirmation(result)
      setMessage('Le code de sécurité vient de vous être envoyé par SMS.')
    } catch (error) {
      setMessage(error.code === 'auth/operation-not-allowed'
        ? 'La connexion par SMS doit encore être activée dans Firebase.'
        : 'Le SMS n’a pas pu être envoyé. Vérifiez le numéro et réessayez.')
    }
  }

  const confirmCode = async () => {
    setMessage('')
    if (!confirmation || !/^\d{6}$/.test(code)) {
      setMessage('Saisissez le code à 6 chiffres reçu par SMS.')
      return
    }
    try {
      await confirmation.confirm(code)
    } catch {
      setMessage('Le code est incorrect ou a expiré. Demandez un nouveau code.')
    }
  }

  if (checking || syncing) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#eef3f8' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography sx={{ fontWeight: 800 }}>{syncing ? 'Synchronisation sécurisée des dossiers…' : 'Vérification de l’accès…'}</Typography>
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
            Espace personnel sécurisé. Un code temporaire est nécessaire pour accéder aux dossiers.
          </Typography>
          <Stack spacing={2}>
            {!confirmation ? (
              <>
                <TextField
                  label="Votre numéro de téléphone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="06 XX XX XX XX"
                  autoComplete="tel"
                  fullWidth
                />
                <Button variant="contained" size="large" onClick={requestCode}>Recevoir mon code par SMS</Button>
              </>
            ) : (
              <>
                <TextField
                  label="Code de sécurité"
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  fullWidth
                />
                <Button variant="contained" size="large" onClick={confirmCode}>Ouvrir mon logiciel</Button>
                <Button onClick={() => { setConfirmation(null); setCode('') }}>Recevoir un nouveau code</Button>
              </>
            )}
            <div id="recaptcha-container" />
            {message ? <Alert severity={message.includes('envoyé') ? 'success' : 'warning'}>{message}</Alert> : null}
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
