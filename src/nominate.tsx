import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/eb-garamond/wght.css'
import '@fontsource-variable/eb-garamond/wght-italic.css'
import '@fontsource-variable/inter/wght.css'
import './styles/tokens.css'
import './styles/base.css'
import { Nav } from './components/Nav'
import { NominationForm } from './components/NominationForm'
import { Footer } from './components/Footer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <a className="skip-link" href="#nomination-form">
      Skip to form
    </a>
    <Nav page="nominate" />
    <NominationForm />
    <Footer page="nominate" />
  </StrictMode>,
)
