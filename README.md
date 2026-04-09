# ReleaseNote.io

A full-stack SaaS changelog platform. Log in, write release notes in a rich text editor, publish by version, and share a beautiful public changelog page with your users. RSS feed included.

**Live App** → [releasenote-io.vercel.app](https://releasenote-io.vercel.app)

---

## What It Does

ReleaseNote.io gives product teams a dedicated public changelog. Team members log in, write release notes using a rich text editor (TipTap), tag them with a version number, and publish. A public-facing page shows the full history — no login required to read.

- Write entries in a rich text editor with full formatting support
- Save as draft or publish immediately
- Public changelog page accessible without login
- RSS feed at `/rss` for subscribers
- Edit or unpublish entries at any time
- Dark / light theme toggle

---

## Stack

- **React** · **Vite** — frontend
- **Node.js** · **Express** — API server + RSS generation
- **PostgreSQL** via **Supabase** — database with Row Level Security
- **Supabase Auth** — email/password authentication
- **TipTap** — rich text editor
- Deploys as a full-stack app on **Vercel**

---

## Features

- **TipTap rich editor** — bold, italic, H2/H3, bullet lists, numbered lists, blockquote, code, code block, horizontal rule
- **Version management** — tag each entry with a semver string (v1.2.3)
- **Draft / Publish workflow** — write privately, publish when ready
- **Public changelog page** — no login required, SEO-friendly
- **RSS 2.0 feed** — subscribe in any feed reader at `/rss`
- **Admin dashboard** — entry table with publish toggle, edit, and delete
- **Supabase Auth** — email/password login with protected routes
- **Row Level Security** — public read on published entries, auth required for writes
- **Dark / light theme** — matches the StyleGuard design system

---

## Local Development

**Prerequisites:** Node.js 18+, a free [Supabase](https://supabase.com) account

**1. Clone and install:**

```bash
git clone https://github.com/luke-pekala/releasenote-io.git
cd releasenote-io
npm install
```

**2. Set up Supabase:**

- Create a new project at [supabase.com](https://supabase.com)
- Run `schema.sql` in the Supabase SQL Editor
- Enable Email Auth in Authentication → Providers → Email

**3. Configure environment variables:**

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Fill in your Supabase URL and keys in both `.env` files.

**4. Run:**

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API + RSS: http://localhost:4000

---

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Add these environment variables in your Vercel project settings:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `APP_URL` | Your Vercel production URL |
| `APP_TITLE` | Your product name |
| `APP_DESCRIPTION` | Short description for RSS feed |

---

## License

MIT
