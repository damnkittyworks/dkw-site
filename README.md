# dkw-site

Public website for Damn Kitty Works, built with Eleventy.

## Stack

- Eleventy (11ty)
- Plain CSS (no Tailwind)
- Markdown-driven content
- Deployed with Cloudflare Pages

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

- Build command: `npm run build`
- Build output directory: `_site`

The `git fetch --unshallow` step is required for accurate Living Posts revision counts
and changelog history. A shallow clone can hide older commits.

## Project structure

- `src/` site source files
- `src/posts/` post markdown files
- `src/_includes/` shared templates/layouts
- `src/_data/` global data
- `src/css/` site styles
- `src/assets/` images, fonts, and other static assets

## Writing Posts

Posts live in src/posts/.
Each post is a Markdown file with front matter at the top:
`---
layout: post.njk
title: Example post title
excerpt: One short sentence about the post.
date: 2026-06-28
updated: 2026-06-28
draft: false
permalink: /posts/example-post/
---`

Use date for the original publish date.

Use updated only when a meaningful reader-facing change is made. Small typo fixes do not need a new updated date.

Use draft: true to keep a post from publishing.

## Noting changes inside a post

For major changes, add a collapsed update note near the top of the post:
`{% details "What changed?" %}
### June 28, 2026

Added a status update and clarified the next step.
{% enddetails %}`

This keeps change notes visible without turning the whole site into a revision-history museum.

## Deployment

Changes pushed to main are built and deployed by Cloudflare Pages.

For small copy or post edits, committing directly to main is okay. For larger layout or design changes, use a branch first so the change can be reviewed before it goes live.
