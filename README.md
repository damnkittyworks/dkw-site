# dkw-site

Public website for Damn Kitty Works, built with Eleventy.

## Stack

- Eleventy (11ty)
- Plain CSS (no Tailwind)
- Markdown-driven content

## Getting started

1. Install dependencies:

```bash
npm install
```

2. Run local dev server:

```bash
npm run start
```

3. Build for production:

```bash
npm run build
```

Production output is written to `_site/`, which works directly with Cloudflare Pages.

## Cloudflare Pages build settings

- Build command: `git fetch --unshallow && npm run build`
- Build output directory: `_site`

The `git fetch --unshallow` step prepares the repo for future git-history-powered post metadata.

## Project structure

- `src/` site source files
- `src/posts/` Living Posts markdown content
- `src/builds/` Build Log source notes/placeholders
- `src/_includes/` shared templates/layouts
- `src/_data/` global data
- `scripts/fetch-git-history.js` future git metadata generator (stub)
