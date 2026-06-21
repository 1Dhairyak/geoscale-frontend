// ─────────────────────────────────────────────────────────────
// main.jsx — application entry point
// Mounts the React app into the #root element in index.html.
// ─────────────────────────────────────────────────────────────
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
