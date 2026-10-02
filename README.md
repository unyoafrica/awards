# Unyo Africa Cultural Tourism Impact Award 2026

Landing page for the inaugural Unyo Africa Cultural Tourism Impact Award.
Vite, React and TypeScript, with GSAP ScrollTrigger for motion and self-hosted variable fonts.

```bash
npm install
npm run dev      # local dev server
npm run build    # type-check and production build into dist/
```

## Where things live

| Path | What |
| --- | --- |
| `src/content.ts` | Every line of copy. Facts come from the brief; lines marked `VERIFY` need checking against the source site. |
| `src/images.ts` | Image manifest and shot list. |
| `src/assets/photos/` | Drop photographs here. |
| `src/styles/tokens.css` | Colour, type, spacing and motion tokens. |
| `src/motion.ts` | The page's single motion system, driven by `data-*` attributes. |
| `src/components/` | One component and stylesheet per section. |

## Adding photographs

Each image slot shows a placeholder plate describing the shot until a file exists.
Save a photo in `src/assets/photos/` named after its key (`hero-guide.jpg`, `culture-food.webp`, and so on)
and it replaces the plate on the next build. Update the matching `alt` text in `src/images.ts` to describe the real photo.

Direction: documentary, natural light, real Nigerian people and places. No staged corporate stock, no safari,
no decorative "tribal" graphics.

| Key | Shot |
| --- | --- |
| `hero-guide` | Portrait. A young guide mid-story, visitors behind. |
| `hero-detail` | Tight craft detail: adire dyeing, beadwork, weaving. |
| `manifesto` | Wide. A festival or procession carrying tradition through the street. |
| `award-plaque` | The award plaque, straight on. |
| `eligibility-youth`, `-active`, `-impact` | The team, the work in motion, the community benefit. |
| `culture-heritage`, `-festivals`, `-food`, `-crafts`, `-storytelling`, `-community` | One per area of cultural tourism. |
| `nominate` | Portrait of a young cultural entrepreneur in their own setting. |

## Before launch

- Check every `VERIFY` string in `src/content.ts` against the source site, including the FAQ wording.
- Replace the "U" monogram in the navigation and the favicon with the real Unyo Africa emblem.
- Confirm how the Comemakewego Tourism Africa Foundation should be credited in the footer.
