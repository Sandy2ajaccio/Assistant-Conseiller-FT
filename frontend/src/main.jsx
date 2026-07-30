import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

const isLegacyHostingDomain = window.location.hostname === 'cap-decision-ft.web.app'

if (isLegacyHostingDomain) {
  window.location.replace(
    `https://cap-decision-ft.firebaseapp.com${window.location.pathname}${window.location.search}${window.location.hash}`,
  )
} else {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
