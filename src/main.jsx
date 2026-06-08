import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { QuestStateProvider } from './state/QuestStateContext.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QuestStateProvider>
        <App />
      </QuestStateProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
