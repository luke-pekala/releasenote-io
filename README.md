# ReleaseNote.io

> Beautiful public changelog and release notes publisher for product teams.

**Stack:** React · Node.js · PostgreSQL (Supabase) · TipTap rich editor · RSS feed

---

## Features

- ✍️ **TipTap rich editor** — bold, italic, headings, lists, blockquote, code blocks
- 🌍 **Public changelog page** — no login required, fully SEO-friendly
- 🔐 **Supabase Auth** — email/password login for your team
- 📦 **Version management** — tag each entry with a semver string
- 📋 **Draft / Publish** — write in private, publish when ready
- 📡 **RSS feed** — `/rss` endpoint, subscribe in any RSS reader
- 🌗 **Dark / Light** theme matching the StyleGuard design system

---

## Project Structure

```
releasenote-io/
├── client/                   # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── RichEditor.jsx    # TipTap editor + toolbar
│   │   │   ├── SiteHeader.jsx    # Shared navigation header
│   │   │   ├── ThemeToggle.jsx   # Dark/light toggle
│   │   │   └── Toast.jsx         # Toast notification system
│   │   ├── hooks/
│   │   │   └── useAuth.jsx       # Auth context + hook
│   │   ├── lib/
│   │   │   └── supabase.js       # Supabase client + all DB functions
│   │   ├── pages/
│   │   │   ├── PublicChangelog.jsx  # Public /  page
│   │   │   ├── LoginPage.jsx        # /login
│   │   │   ├── Dashboard.jsx        # /dashboard (protected)
│   │   │   └── EditorPage.jsx       # /editor and /editor/:id (protected)
│   │   ├── App.jsx               # Routes
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Full design system CSS
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                   # Node.js + Express backend
│   ├── src/
│   │   ├── index.js          # Express app + all routes
│   │   └── generateRSS.js    # RSS 2.0 XML generator
│   └── package.json
│
├── schema.sql                # PostgreSQL schema + RLS policies
├── vercel.json               # Vercel deployment config
├── package.json              # Root (workspaces)
└── README.md
```

---

## Local Setup (Step by Step)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/releasenote-io.git
cd releasenote-io
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Give it a name, set a database password, choose a region
3. Once created, go to **SQL Editor → New Query**
4. Paste the contents of `schema.sql` and click **Run**
5. Go to **Authentication → Providers → Email** — make sure it's enabled
6. Note your credentials from **Settings → API**:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public key**
   - **service_role key** (keep this secret — server only)

### 3. Configure environment variables

**Client** — create `client/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=http://localhost:5173
```

**Server** — create `server/.env`:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=4000
APP_URL=http://localhost:5173
APP_TITLE=My Product Changelog
APP_DESCRIPTION=What's new — every update, fix, and improvement.
```

### 4. Install dependencies and run

```bash
# Install everything
npm install

# Run both client and server in parallel
npm run dev
```

- **Frontend:** http://localhost:5173
- **API:**       http://localhost:4000
- **RSS:**       http://localhost:4000/rss

### 5. Create your admin account

1. Open http://localhost:5173/login
2. Click **Sign up** and register with your email
3. Check your email for the confirmation link (or disable email confirmation in Supabase → Auth → Settings)
4. Sign in and you'll land on the dashboard

---

## Deploy to Vercel

### Option A — Vercel CLI (fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the project root
vercel

# Follow the prompts:
#   Framework: Other
#   Build command: npm run build
#   Output directory: client/dist
#   Install command: npm install
```

Then go to your **Vercel project → Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key (**keep secret**) |
| `APP_URL` | Your Vercel production URL (e.g. `https://releasenote.vercel.app`) |
| `APP_TITLE` | Your product name |
| `APP_DESCRIPTION` | Short description for the RSS feed |

### Option B — Vercel Dashboard

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import repository
3. **Framework preset:** Other
4. **Build command:** `npm run build`
5. **Output directory:** `client/dist`
6. Add all environment variables from the table above
7. Click **Deploy**

### Option C — Separate deploys (recommended for production)

Deploy the **client** to Vercel (static) and the **server** to Railway or Render:

**Client on Vercel:**
- Root: `client/`
- Build: `npm run build`
- Output: `dist`
- Set `VITE_SUPABASE_*` env vars

**Server on Railway:**
```bash
# In Railway dashboard → New Project → Deploy from GitHub
# Set root directory to: server/
# Start command: npm start
# Add all SUPABASE_* and APP_* env vars
```

---

## Testing Checklist

| Test | Expected |
|---|---|
| Create account and log in | Auth works, redirects to dashboard |
| Write and publish an entry | Appears on public page immediately |
| Visit `/` while logged out | Changelog visible, no dashboard access |
| Visit `/dashboard` while logged out | Redirects to `/login` |
| Subscribe to `/rss` in a feed reader | Entries appear as feed items |
| Edit a published entry | Updates reflected on public page |
| Save as draft | Does NOT appear on public page |
| Delete an entry | Removed from dashboard and public page |

---

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` **bypasses RLS** — never expose it client-side
- The client uses the **anon key** + Supabase RLS — public reads are safe
- All admin writes (create/edit/delete/publish) require an authenticated session
- RLS policies ensure unauthenticated users can only read `is_published = true` rows

---

## License

MIT
