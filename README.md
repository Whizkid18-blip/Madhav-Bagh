# Madhav Bagh — Royal Heritage Stay · Est. 1892

A cinematic, scroll-driven journey through the Madhav Bagh mansion in Vadodara —
built with WebGL (Three.js), oversized typography, and a story told in chapters
instead of feature sections.

## The experience

Scrolling walks you through the palace itself — real photographs of its spaces
crossfade as you move, graded by a day that passes around you, with embers,
fireflies and stars drifting over them in WebGL:

| Chapter | Scene | Light |
| --- | --- | --- |
| Arrival | `MADHAV BAGH` | pre-dawn indigo |
| 1892 | the stone remembers | oxblood dawn |
| Light | the courtyard | bright ivory morning |
| Home | the Gaekwad family | warm afternoon |
| Stella | the first to greet you | golden hour |
| Rasoi | the table | lamplit plum evening |
| Four Jewels | Sapphire · Turquoise · Coral · Ruby | each room tints the world |
| Wild | two acres of garden | firefly night |
| Stay | contact + reserve | starfield |

The WebGL canvas, the text colour, the accents — everything is driven by one
palette timeline keyed to scroll position, so the page feels like a single
continuous place rather than stacked sections.

## Run it locally

The page uses ES modules, so it needs any static server (opening `index.html`
directly from disk won't work):

```
npx serve .
# or
python -m http.server 8080
```

Then open the printed URL. Three.js loads from a CDN — first view needs internet.

## Deploy

It's a fully static site (no build step). Drag the folder into Netlify,
`vercel deploy`, or push to GitHub Pages — done.

## Customising

- **Copy / story** — everything lives in `index.html`, one `<section class="chapter">` per scene.
- **Colours** — the `PALETTES` map at the top of `js/main.js`. Each stop is
  `(sky, text, accent, photo-tint strength, photo key)` and is matched to a
  section via its `data-stop` attribute.
- **Typography** — `css/style.css`, `--serif` (Fraunces) and `--sans` (Manrope).
- **Pace** — section heights (`.chapter { height: 190vh }`) control how long
  each chapter dwells.
- **Photos** — real photographs of the property live in `assets/img/` and
  crossfade behind each chapter like rooms you walk between. They were curated
  from two sources: madhavbagh.com's own media library, and the best of the
  60 guest photos on the Google Maps listing (all 60 kept in `assets/gmaps/`
  with a `review.html` contact sheet for future re-curation). The chapter→photo mapping is the last argument of
  each `PALETTES` entry in `js/main.js`; the `data-photo` attribute on the
  `.photo` imgs in `index.html` is the key. Framed insets (the founder's
  portrait, the hosts, the dining hall) are `.figure-card` elements inside
  their chapters. Originals are kept in `assets/src/`; the resize/compress
  pipeline is plain PowerShell + System.Drawing (max 1600px wide, JPEG ~72).
  To give Stella her own photograph, add it as a `.figure-card` in the
  `#stella` section. All photographs © Madhav Bagh / the Gaekwad family.

## Facts used

Built in 1892 by Shrimant Madhavrao Gaekwad (cousin of Maharaja Sayajirao III),
Indo-Saracenic red-and-white mansion with jharokha balconies and a corner tower,
restored by grandson Shivraj Gaekwad and Indrayani Devi; four guest rooms
(Sapphire, Turquoise, Coral, Ruby); royal Maratha cuisine from ancestral recipes
(Baroda, Thanjavur, Gwalior, Kolhapur); two acres of garden; crocodiles in the
Vishwamitri nearby; and Stella — golden, unhurried, family.

Contact: +91 70163 70801 · madhavbaghbaroda@gmail.com ·
Opposite O.N.G.C. Main Gate, Makarpura Road, Vadodara, Gujarat 390009
