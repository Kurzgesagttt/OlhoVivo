import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const savedTheme = localStorage.getItem('theme')
const initialTheme = savedTheme ?? 'dark'
localStorage.setItem('theme', initialTheme)
document.documentElement.classList.toggle('dark', initialTheme === 'dark')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
