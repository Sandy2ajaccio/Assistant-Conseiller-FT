import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import AccueilMissionsPage from './pages/AccueilMissionsPage'
import MissionWorkflowPage from './pages/MissionWorkflowPage'
import AnalyseSituationPage from './pages/AnalyseSituationPage'
import DashboardPage from './pages/DashboardPage'
import CentreConnaissancesPage from './pages/CentreConnaissancesPage'
import ParametresPage from './pages/ParametresPage'
import AssistantMissionPage from './pages/AssistantMissionPage'
import CockpitPage from './pages/cockpit/CockpitPage'
import DemandeurPage from './pages/DemandeurPage'
import PreparationEntretienPage from './pages/PreparationEntretienPage'
import PrescriptionsPage from './pages/PrescriptionsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<AccueilMissionsPage />} />
          <Route path="/assistant" element={<AssistantMissionPage />} />
          <Route path="/cockpit" element={<CockpitPage />} />
          <Route path="/missions/:missionId" element={<MissionWorkflowPage />} />
          <Route path="/analyse" element={<AnalyseSituationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/preparation-entretien" element={<PreparationEntretienPage />} />
          <Route path="/prescriptions" element={<PrescriptionsPage />} />
          <Route path="/connaissances" element={<CentreConnaissancesPage />} />
          <Route path="/parametres" element={<ParametresPage />} />
          <Route path="/demandeurs" element={<DemandeurPage />} />
          <Route path="/demandeurs/:id" element={<DemandeurPage />} />
          <Route path="*" element={<AccueilMissionsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}