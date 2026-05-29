# Meshahara Website
## Many Roots, One Ledger · RXPKL, Kuala Lumpur 2026
Curated by Art:Tech & Hersoid

---

## Folder Structure

```
meshahara-site/
├── index.html              ← Homepage
├── open-call.html          ← Open Call page
├── exhibition.html         ← Exhibition & Curatorial Brief
├── artists.html            ← Artists Roster
├── programme.html          ← Programme
├── blog.html               ← Blog listing
├── sponsors.html           ← Sponsors & Partners
├── contact.html            ← Contact & FAQ
├── netlify.toml            ← Netlify config (do not edit)
│
├── css/
│   └── main.css            ← All shared styles
│
├── js/
│   └── main.js             ← Content loading & utilities
│
├── images/
│   └── uploads/            ← CMS-uploaded images land here
│
├── content/
│   ├── blog/               ← Blog posts (Markdown files)
│   ├── gallery/            ← Gallery entries (Markdown files)
│   ├── artists/            ← Artist profiles (Markdown files)
│   └── sponsors/           ← Sponsor entries (Markdown files)
│
└── admin/
    ├── index.html          ← CMS login page
    └── config.yml          ← CMS content definitions
```

---

## Deploying to Netlify (one-time setup)

### Step 1 — Create a GitHub repository
1. Go to github.com and create a free account if you don't have one
2. Create a new repository called `meshahara-site` (set to Private)
3. Upload all the files from this folder to that repository

### Step 2 — Deploy to Netlify
1. Go to netlify.com and create a free account
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account and select `meshahara-site`
4. Build settings: leave everything blank (no build command needed)
5. Click "Deploy site"
6. Netlify gives you a URL like `https://random-name.netlify.app`
7. In Site Settings → Domain, you can connect your own domain

### Step 3 — Enable the CMS
1. In Netlify dashboard: go to Site Configuration → Identity
2. Click "Enable Identity"
3. Under Registration: set to "Invite only"
4. Under Services → Git Gateway: click "Enable Git Gateway"
5. Go to Identity → Invite users → enter your email
6. You'll receive an invite email — click it to set your password
7. Visit `yourdomain.com/admin` to access the CMS

---

## Using the CMS

Go to `yourdomain.com/admin` and log in.

**Blog** — Write and publish posts. Set category, add featured image, write in the visual editor. Toggle "Published" to control visibility.

**Gallery** — Add documentation images grouped by phase (Pre-production, Open Call, Installation, Opening Night, Post-Event). Upload images directly.

**Artists** — Add artist profiles as they are confirmed. Set status to "Confirmed" and toggle "Published" to make them appear on the site. Keep "pending" artists unpublished until ready.

**Sponsors** — Add sponsor entries with logo, tier, and description. Toggle "Published" when confirmed. Tier determines where they appear in the sponsor hierarchy.

---

## Updating the index.json files

When you add content via the CMS, Decap CMS handles this automatically. If you ever add Markdown files manually, you need to update the corresponding `index.json` in that content folder.

Example — if you add `content/blog/my-new-post.md` manually:
Open `content/blog/index.json` and add the filename:
```json
["2026-05-28-open-call-now-live.md", "my-new-post.md"]
```

---

## Editing static pages (text changes)

For pages that aren't CMS-managed (homepage, exhibition brief, open call, programme):
- Open the relevant `.html` file in a text editor
- Find the text you want to change
- Edit it, save the file
- Commit the change to GitHub — Netlify redeploys automatically (takes ~30 seconds)

Or come back to Claude and describe the change — we can update and re-export.

---

## Swapping images on static pages

Images on static pages are referenced as:
```html
<img src="/images/roots.jpg" alt="...">
```
or as CSS background:
```css
background-image: url('/images/roots.jpg');
```

To swap an image: upload the new image to `/images/`, update the filename in the HTML, commit to GitHub.

---

## Contact
hello@meshahara.art
press@meshahara.art
