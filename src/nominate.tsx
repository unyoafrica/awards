import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/standard.css'
import '@fontsource-variable/source-serif-4/standard.css'
import '@fontsource-variable/source-serif-4/standard-italic.css'
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
