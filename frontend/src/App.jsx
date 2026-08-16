import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import AuthGate from './components/AuthGate'
import Layout from './components/Layout'

import AnalyseSituationPage from './pages/AnalyseSituationPage'
import AssistantMissionPage from './pages/AssistantMissionPage'
import CentreConnaissancesPage from './pages/CentreConnaissancesPage'
import DashboardPage from './pages/DashboardPage'
import DemandeursPage from './pages/DemandeursPage'
import FormationsPage from './pages/FormationsPage'
import MissionWorkflowPage from './pages/MissionWorkflowPage'
import ParametresPage from './pages/ParametresPage'
import PreparationEntretienPage from './pages/PreparationEntretienPage'
import VeilleOfficiellePage from './pages/VeilleOfficiellePage'
import UrgencyCalendarPage from './pages/UrgencyCalendarPage'

export default function App() {
  useEffect(() => {
    const verifierNouvelleVersion = async () => {
      try {
        const response = await fetch(
          `/index.html?version=${Date.now()}`,
          { cache: 'no-store' },
        )

        const html = await response.text()
        const nouvelleSource = html.match(/assets\/index-[^"]+\.js/)?.[0]

        const sourceChargee = Array.from(document.scripts)
          .map((script) => script.src)
          .find((source) => source.includes('/assets/index-'))

        if (
          nouvelleSource &&
          sourceChargee &&
          !sourceChargee.includes(nouvelleSource)
        ) {
          window.location.reload()
        }
      } catch {
        // Une indisponibilité réseau ne doit pas interrompre le travail.
      }
    }

    const premiereVerification = window.setTimeout(
      verifierNouvelleVersion,
      5000,
    )

    const verificationReguliere = window.setInterval(
      verifierNouvelleVersion,
      60000,
    )

    return () => {
      window.clearTimeout(premiereVerification)
      window.clearInterval(verificationReguliere)
    }
  }, [])

  return (
    <AuthGate>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/assistant" replace />}
            />

            <Route
              path="/assistant"
              element={<AssistantMissionPage />}
            />

            <Route
              path="/missions/:missionId"
              element={<MissionWorkflowPage />}
            />

            <Route
              path="/analyse"
              element={<AnalyseSituationPage />}
            />

            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />

            <Route
              path="/preparation-entretien"
              element={<PreparationEntretienPage />}
            />

            <Route
              path="/tableau-de-bord"
              element={<Navigate to="/assistant" replace />}
            />

            <Route
              path="/prescriptions"
              element={<Navigate to="/assistant" replace />}
            />

            <Route
              path="/connaissances"
              element={<CentreConnaissancesPage />}
            />

            <Route
              path="/veille-officielle"
              element={<VeilleOfficiellePage />}
            />

            <Route
              path="/agenda"
              element={<UrgencyCalendarPage />}
            />

            <Route
              path="/formations"
              element={<FormationsPage />}
            />

            <Route
              path="/parametres"
              element={<ParametresPage />}
            />

            <Route
              path="/demandeurs"
              element={<DemandeursPage />}
            />

            <Route
              path="/demandeurs/:id"
              element={<Navigate to="/assistant" replace />}
            />

            <Route
              path="*"
              element={<Navigate to="/assistant" replace />}
            />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthGate>
  )
}
