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

The `git fetch --unshallow` step is required for accurate Living Posts revision counts
and changelog history. A shallow clone can hide older commits.

## Project structure

- `src/` site source files
- `src/posts/` Living Posts markdown content
- `src/builds/` Build Log source notes/placeholders
- `src/_includes/` shared templates/layouts
- `src/_data/` global data
- `scripts/fetch-git-history.js` build-time local git metadata generator

## Git-powered Living Posts metadata

During `npm run build` and `npm run start`, the script
`scripts/fetch-git-history.js` runs before Eleventy to generate:

- `src/_data/gitHistory.json`

It uses local git history only (`git log --follow`) and does not call the GitHub API.
If git metadata is unavailable (for example, not a git repo), the script writes safe
fallback output so builds still succeed.
