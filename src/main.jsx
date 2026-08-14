import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Automatically set the browser tab title with the current year (e.g., 2026, 2027...)
document.title = `Gabriela Nail Studio - Agenda ${new Date().getFullYear()}`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)