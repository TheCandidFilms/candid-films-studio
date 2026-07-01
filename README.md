# The Candid Films — Studio

A Netflix-style film delivery site for wedding and corporate video work, built with React + Supabase.

## What's inside
- `src/App.jsx` — the full app (browsing, video player, admin panel, password-gated private films)
- `src/supabaseClient.js` — connects to your Supabase database (already wired to your project)
- Real persistent storage via Supabase — films you add through the admin panel are saved permanently

## Deploy this yourself (no local setup needed)

You do NOT need to install anything on your computer. Everything below happens on github.com and vercel.com in the browser.

### Step 1 — Push this code to GitHub
1. Go to github.com → click the **+** icon top right → **New repository**
2. Name it `candid-films-studio` → keep it **Private** or **Public**, your choice → **Create repository**
3. On the next page, click **"uploading an existing file"**
4. Drag every file and folder from this project into the upload box
5. Scroll down → click **Commit changes**

### Step 2 — Deploy to Vercel
1. Go to vercel.com → **Add New** → **Project**
2. Find `candid-films-studio` in your GitHub repos → click **Import**
3. Leave all settings as default (Vercel auto-detects Vite) → click **Deploy**
4. Wait ~1 minute — you'll get a live URL like `candid-films-studio.vercel.app`

### Step 3 — (Optional) Connect your own domain
1. In Vercel, open your project → **Settings** → **Domains**
2. Add `films.thecandidfilms.com` (or whatever subdomain you want)
3. Vercel will show you a DNS record to add — go to wherever your main domain is registered (GoDaddy, Namecheap, etc.), add that record
4. Wait a few minutes for it to connect

## Adding films
Once live, click **"Manage Library"** in the top right of your site → **Add Film** tab. Every film you add is saved permanently to your Supabase database — no code changes needed.

## Notes
- Only paste the YouTube/Vimeo **video ID**, not the full URL (e.g. `dQw4w9WgXcQ`, not the full youtube.com link)
- Use **Unlisted** on YouTube for private client films, plus set a password in the admin form — this gives two layers of privacy
