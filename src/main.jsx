import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { LaundryProvider } from './context/LaundryContext.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LaundryProvider>
      <App />
    </LaundryProvider>
  </React.StrictMode>,
)
