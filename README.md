# Madhav Bagh, Royal Heritage Stay

Website for Madhav Bagh, a royal heritage homestay in a 1892 Indo-Saracenic
mansion in Vadodara, Gujarat. It is a single scrolling page. Real photographs
of the house fade from one to the next as you move down, lit by a WebGL layer
of dust and fireflies that shifts through a day.

## How it is built

- A static site: HTML, CSS, and plain JavaScript. No build step, no backend,
  no database, no third-party scripts.
- three.js is included locally (`js/vendor/`), so the page loads no code from
  anyone else.
- A Content-Security-Policy limits everything to the site's own files.

## Running it locally

The page uses JavaScript modules, so it needs to be served over http, not
opened as a file:

```
python -m http.server 8080
```

Then open the address it prints.

## Hosting

It is a plain static site, so it runs on GitHub Pages, Netlify, Vercel, or any
ordinary web host. Nothing to configure.

## Contact

Madhav Bagh, Royal Heritage Stay
Opposite O.N.G.C. Main Gate, Makarpura Road, Vadodara, Gujarat 390009
+91 70163 70801 · madhavbaghbaroda@gmail.com

Photographs belong to Madhav Bagh and the Gaekwad family.
