import { useRef } from 'react'
import { usePageMotion } from './motion'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Award } from './components/Award'
import { Eligibility } from './components/Eligibility'
import { Culture } from './components/Culture'
import { Judging } from './components/Judging'
import { Impact } from './components/Impact'
import { Nominate } from './components/Nominate'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'

export default function App() {
  const root = useRef<HTMLElement>(null)
  usePageMotion(root)

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main" ref={root}>
        <Hero />
        <Award />
        <Eligibility />
        <Culture />
        <Judging />
        <Impact />
        <Nominate />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
