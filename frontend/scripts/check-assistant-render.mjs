import React from 'react'
import { renderToString } from 'react-dom/server'
import { createServer } from 'vite'
import { fileURLToPath } from 'node:url'

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
  resolve: {
    alias: [
      {
        find: /^react-router-dom$/,
        replacement: fileURLToPath(
          new URL('../node_modules/react-router-dom/dist/index.mjs', import.meta.url),
        ),
      },
      {
        find: /^react-router\/dom$/,
        replacement: fileURLToPath(
          new URL('../node_modules/react-router/dist/development/dom-export.mjs', import.meta.url),
        ),
      },
      {
        find: /^react-router$/,
        replacement: fileURLToPath(
          new URL('../node_modules/react-router/dist/development/index.mjs', import.meta.url),
        ),
      },
    ],
  },
  ssr: {
    noExternal: ['react-router', 'react-router-dom'],
  },
})

const pages = [
  ['/', '/src/pages/AccueilMissionsPage.jsx'],
  ['/assistant', '/src/pages/AssistantMissionPage.jsx'],
  ['/missions/dpa-premier-entretien', '/src/pages/MissionWorkflowPage.jsx', '/missions/:missionId'],
  ['/analyse', '/src/pages/AnalyseSituationPage.jsx'],
  ['/dashboard', '/src/pages/DashboardPage.jsx'],
  ['/preparation-entretien', '/src/pages/PreparationEntretienPage.jsx'],
  ['/tableau-de-bord', '/src/pages/PrescriptionsPage.jsx'],
  ['/connaissances', '/src/pages/CentreConnaissancesPage.jsx'],
  ['/formations', '/src/pages/FormationsPage.jsx'],
  ['/parametres', '/src/pages/ParametresPage.jsx'],
  ['/demandeurs', '/src/pages/DemandeurPage.jsx'],
  ['/agenda', '/src/pages/UrgencyCalendarPage.jsx'],
]

try {
  const { MemoryRouter, Route, Routes } = await server.ssrLoadModule(
    '/node_modules/react-router-dom/dist/index.mjs',
  )

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
