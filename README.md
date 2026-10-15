# Personal Portfolio

### **Check it Out:** https://cashecollins.github.io

A single-page portfolio built with plain HTML, CSS, and vanilla JavaScript. No frameworks, build step, or dependencies beyond Google Fonts.

## Structure

- `index.html` holds all of the content: hero, about, the experience timeline, stack, projects, and contact.
- `css/styles.css` holds the styles. The color palette lives in the `:root` variables at the top.
- `scripts.js` holds the interactions: the hero particle field, text scramble, scroll reveals, custom cursor, card tilt and spotlight, experience accordion and previews, and the project modal.
- `css/assets/` holds the images.

## Editing content

- **Experience:** each company is an `.xp-item` in `index.html`. Its roles are `<li>` entries in `.xp-roles`, newest first.
- **Projects:** each card is an `article.project`. The modal reads the card's image, kind, title, and tags, plus the `<template class="project-details">` text. Add `data-link` (live site) or `data-repo` (GitHub) to the article to show buttons in the modal.
- **Stack icons:** the brand icons are inline SVG symbols from [Simple Icons](https://simpleicons.org) (CC0) near the top of `index.html`. Reference one with `<svg class="tech-icon"><use href="#i-name"/></svg>`.

Motion respects `prefers-reduced-motion`, and all content stays visible with JavaScript turned off.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
npx http-server .
```
