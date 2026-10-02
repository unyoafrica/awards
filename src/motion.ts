import { useLayoutEffect, type RefObject } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * One motion grammar for the page, declared through data attributes so
 * sections stay free of animation code:
 *
 *   data-hero-line     hero headline lines, revealed in a single entrance
 *   data-hero-fade     hero supporting elements, after the headline
 *   data-reveal=lines  child `.line-mask > span` rise into their masks
 *   data-reveal=fade   gentle rise and fade
 *   data-reveal=stagger direct children reveal in sequence
 *   data-parallax      low-amplitude drift inside a clipped frame
 *   data-count         numbers count from 0 to their value
 *   data-bar           bars grow from 0 to their width
 *
 * Content is fully visible without JS and with reduced motion.
 */
export function usePageMotion(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    if (!root.current) return
    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const q = gsap.utils.selector(root)
      const ease = 'expo.out'

      // Hero entrance: the one orchestrated moment.
      const intro = gsap.timeline({ defaults: { ease } })
      intro
        .from(q('[data-hero-line] > span'), { yPercent: 110, duration: 1.3, stagger: 0.12 })
        .from(q('[data-hero-media]'), { clipPath: 'inset(100% 0 0 0)', duration: 1.4, ease: 'expo.inOut' }, 0.1)
        .from(q('[data-hero-fade]'), { y: 18, autoAlpha: 0, duration: 1, stagger: 0.07 }, 0.55)

      q('[data-reveal="lines"]').forEach((el) => {
        gsap.from(el.querySelectorAll('.line-mask > span'), {
          yPercent: 108,
          duration: 1.1,
          stagger: 0.09,
          ease,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        })
      })

      q('[data-reveal="fade"]').forEach((el) => {
        gsap.from(el, {
          y: 28,
          autoAlpha: 0,
          duration: 1,
          ease,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      q('[data-reveal="stagger"]').forEach((el) => {
        gsap.from(el.children, {
          y: 32,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease,
          scrollTrigger: { trigger: el, start: 'top 82%', once: true },
        })
      })

      q('[data-parallax]').forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: -4 },
          {
            yPercent: 4,
            ease: 'none',
            scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })

      q('[data-count]').forEach((el) => {
        const target = Number(el.dataset.count)
        const counter = { v: 0 }
        gsap.to(counter, {
          v: target,
          duration: 1.6,
          ease: 'power3.out',
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v))
          },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })

      q('[data-bar]').forEach((el) => {
        gsap.from(el, {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      })

      // The comparison in "Impact over popularity" settles as it is scrolled.
      const imp = q('[data-impact]')[0]
      if (imp) {
        gsap
          .timeline({ scrollTrigger: { trigger: imp, start: 'top 75%', end: 'center 45%', scrub: 0.6 } })
          .fromTo(q('[data-impact-a]'), { xPercent: -6 }, { xPercent: 0, ease: 'none' }, 0)
          .fromTo(q('[data-impact-b]'), { xPercent: 8, opacity: 0.9 }, { xPercent: 0, opacity: 0.5, ease: 'none' }, 0)
          .fromTo(q('[data-impact-sign]'), { rotate: -20, scale: 0.6 }, { rotate: 0, scale: 1, ease: 'none' }, 0)
      }
    })

    return () => mm.revert()
  }, [root])
}

export { gsap, ScrollTrigger }
