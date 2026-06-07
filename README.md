# mipoem

A quiet, Pinterest-style website for poems, built with **Next.js** (App Router).
Every poem is a simple Markdown file in the [`/poems`](./poems) folder — add a file,
and it appears on the site automatically.

## Add a poem

Create a new `.md` file in `poems/`, for example `poems/my-poem.md`:

```md
---
title: My Poem
author: Your Name
date: 2026-06-07
tags: [calm, night]
excerpt: Optional. If omitted, the first lines are used on the card.
---

The first stanza goes here,
line by line, just as you wrote it.

A blank line starts a new stanza.
```

Frontmatter fields:

- `title` — shown on the card and poem page
- `author` — byline
- `date` — used for sorting (newest first) and display
- `tags` — optional list, shown as little pills
- `excerpt` — optional card preview; defaults to the first few lines

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
npm start
```

## How it works

- `lib/poems.ts` reads the Markdown files, parses frontmatter with `gray-matter`,
  and renders the body to HTML with `remark`.
- `app/page.tsx` shows all poems in a CSS masonry (column) layout.
- `app/poems/[slug]/page.tsx` renders a single poem.

The main font is **DM Serif Text**, with **Radley** for body text and
**Explora** for the wordmark.
