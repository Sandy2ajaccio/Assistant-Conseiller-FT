import React from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { createServer } from 'vite'

globalThis.localStorage = {
  get length() {
    return 0
  },
  getItem() {
    return null
  },
  setItem() {},
  removeItem() {},
  key() {
    return null
  },
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
})

const pages = [
  ['/', '/src/pages/AccueilMissionsPage.jsx'],
  ['/assistant', '/src/pages/AssistantMissionPage.jsx'],
  ['/missions/dpa-premier-entretien', '/src/pages/MissionWorkflowPage.jsx', '/missions/:missionId'],
  ['/analyse', '/src/pages/AnalyseSituationPage.jsx'],
  ['/dashboard', '/src/pages/DashboardPage.jsx'],
  ['/preparation-entretien', '/src/pages/PreparationEntretienPage.jsx'],
  ['/prescriptions', '/src/pages/PrescriptionsPage.jsx'],
  ['/connaissances', '/src/pages/CentreConnaissancesPage.jsx'],
  ['/parametres', '/src/pages/ParametresPage.jsx'],
  ['/demandeurs', '/src/pages/DemandeurPage.jsx'],
]

try {
  for (const [url, modulePath, routePath = url] of pages) {
    const { default: Page } = await server.ssrLoadModule(modulePath)
    const html = renderToString(
      React.createElement(
        MemoryRouter,
        { initialEntries: [url] },
        React.createElement(
          Routes,
          null,
          React.createElement(Route, {
            path: routePath,
            element: React.createElement(Page),
          }),
        ),
      ),
    )
    console.log(`${url} rendered successfully (${html.length} characters).`)
  }
} finally {
  await server.close()
}
