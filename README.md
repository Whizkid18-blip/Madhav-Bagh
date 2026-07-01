# Madhav Bagh — Royal Heritage Stay

A cinematic, scroll-driven website for **Madhav Bagh**, a royal Indo-Saracenic
heritage homestay in Vadodara, Gujarat (est. 1892). It is a single continuous
experience: real photographs of the mansion crossfade behind oversized
typography as you scroll, with a WebGL layer of light, dust, and fireflies
that shifts through a full day.

## Tech

- **Static site** — HTML, CSS, and vanilla JavaScript. No build step, no
  backend, no database, no third-party scripts.
- **WebGL** via a self-hosted copy of three.js (`js/vendor/`), so the page
  depends on no external code.
- A strict **Content-Security-Policy** limits execution to the site's own
  origin.

## Run locally

ES modules need to be served over `http://` (not opened as a `file://`):

```
python -m http.server 8080
```

Then open the printed URL.

## Deploy

Fully static — host it on GitHub Pages, Netlify, Vercel, or any static host.
No configuration required.

## Contact

**Madhav Bagh — Royal Heritage Stay**
Opposite O.N.G.C. Main Gate, Makarpura Road, Vadodara, Gujarat 390009
+91 70163 70801 · madhavbaghbaroda@gmail.com

Photographs © Madhav Bagh / the Gaekwad family.
