import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/plus-jakarta-sans/wght.css'
import './styles/tokens.css'
import './styles/base.css'
import { QartApp } from './app/QartApp'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QartApp />
  </StrictMode>,
)
