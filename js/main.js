// ── MESHAHARA SITE JS ──────────────────────────────────────────

// Parse YAML frontmatter from markdown files
function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: text };
  const data = {};
  match[1].split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) return;
    const key = line.slice(0, colonIdx).trim();
    let val = line.slice(colonIdx + 1).trim();
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Parse booleans — handle both quoted and unquoted
    if (val === 'true' || val === 'True') val = true;
    if (val === 'false' || val === 'False') val = false;
    data[key] = val;
  });
  return { data, body: match[2] || '' };
}

// Load all markdown files from a content folder
async function loadContent(folder) {
  try {
    const res = await fetch(`/content/${folder}/index.json`, { cache: 'no-cache' });
    if (!res.ok) {
      console.warn(`index.json not found for ${folder}:`, res.status);
      return [];
    }
    const files = await res.json();
    if (!files || !files.length) return [];

    const items = await Promise.all(
      files.map(async file => {
        try {
          const r = await fetch(`/content/${folder}/${file}`, { cache: 'no-cache' });
          if (!r.ok) {
            console.warn(`Could not fetch ${file}:`, r.status);
            return null;
          }
          const text = await r.text();
          const { data, body } = parseFrontmatter(text);
          return { ...data, body, slug: file.replace(/\.md$/, '') };
        } catch (e) {
          console.warn(`Error loading ${file}:`, e);
          return null;
        }
      })
    );

    return items
      .filter(i => i !== null)
      // published can be boolean true, string "true", or absent (default show)
      .filter(i => i.published !== false && i.published !== 'false')
      .sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return Number(a.order) - Number(b.order);
        return new Date(b.date || 0) - new Date(a.date || 0);
      });
  } catch (e) {
    console.warn(`Could not load ${folder}:`, e);
    return [];
  }
}

// Simple markdown-to-HTML
function markdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p)
    .map(p => p.startsWith('<h') ? p : `<p>${p}</p>`)
    .join('\n');
}

// Format date nicely
function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch(e) { return dateStr; }
}

// FAQ accordion
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      q.classList.toggle('open');
      const ans = q.nextElementSibling;
      if (ans) ans.classList.toggle('open');
    });
  });
}

// Countdown timer
function initCountdown(targetDate, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const target = new Date(targetDate).getTime();
  function update() {
    const diff = target - Date.now();
    if (diff <= 0) { el.textContent = 'Deadline passed'; return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    el.textContent = `${d}d ${h}h ${m}m remaining`;
  }
  update();
  setInterval(update, 60000);
}

// Blog listing
async function renderBlogListing(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<p style="color:var(--dim);padding:2rem;">Loading posts...</p>';
  const posts = await loadContent('blog');
  if (!posts.length) {
    el.innerHTML = '<p style="color:var(--dim);padding:2rem;">No posts yet — check back soon.</p>';
    return;
  }
  el.innerHTML = posts.map(post => `
    <article class="card">
      ${post.image
        ? `<div class="card-img" style="background-image:url('${post.image}')"></div>`
        : '<div class="card-img"></div>'}
      <div class="card-body">
        <div class="card-label">${post.category || 'News'} · ${formatDate(post.date)}</div>
        <div class="card-title">${post.title || 'Untitled'}</div>
        <div class="card-excerpt">${post.excerpt || ''}</div>
        <a href="/blog/${post.slug}.html" class="read-more">Read more →</a>
      </div>
    </article>
  `).join('');
}

// Artists listing
async function renderArtists(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const artists = await loadContent('artists');
  const confirmed = artists.filter(a => a.status === 'confirmed');
  if (!confirmed.length) {
    el.innerHTML = '<p style="color:var(--dim);padding:2rem;">Artists will be announced soon.</p>';
    return;
  }
  el.innerHTML = confirmed.map(artist => `
    <article class="card">
      ${artist.image
        ? `<div class="card-img" style="background-image:url('${artist.image}')"></div>`
        : `<div class="card-img" style="background:var(--surface);display:flex;align-items:center;justify-content:center;">
             <span style="font-size:13px;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);">Image TBC</span>
           </div>`}
      <div class="card-body">
        <div class="card-label">${artist.location || ''}</div>
        <div class="card-title">${artist.title || ''}</div>
        <div class="card-excerpt">${artist.bio ? artist.bio.substring(0, 140) + '...' : ''}</div>
        ${artist.work_title ? `<div class="card-meta">Work: ${artist.work_title}</div>` : ''}
        ${artist.website ? `<a href="${artist.website}" target="_blank" class="read-more">View work →</a>` : ''}
      </div>
    </article>
  `).join('');
}

// Sponsors
async function renderSponsors(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const sponsors = await loadContent('sponsors');
  if (!sponsors.length) {
    el.innerHTML = '<p style="color:var(--dim);padding:1rem 2rem;">Sponsor announcements coming soon.</p>';
    return;
  }
  const tiers = ['title', 'major', 'community', 'in-kind', 'media', 'grant'];
  const tierLabels = {
    title: 'Title Sponsor', major: 'Major Sponsor',
    community: 'Community Partner', 'in-kind': 'In-Kind Partner',
    media: 'Media Partner', grant: 'Grant / Funding Body'
  };
  let html = '';
  tiers.forEach(tier => {
    const group = sponsors.filter(s => s.tier === tier);
    if (!group.length) return;
    html += `<div class="sponsor-group">
      <div class="sponsor-tier-label">${tierLabels[tier]}</div>
      <div class="sponsor-row">
        ${group.map(s => `
          <div class="sponsor-item">
            ${s.logo ? `<img src="${s.logo}" alt="${s.title}" class="sponsor-logo">` : `<div class="sponsor-name-only">${s.title}</div>`}
            ${s.description ? `<div class="sponsor-desc">${s.description}</div>` : ''}
          </div>`).join('')}
      </div>
    </div>`;
  });
  el.innerHTML = html;
}

// Gallery
async function renderGallery(containerId, phase) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const entries = await loadContent('gallery');
  const filtered = phase ? entries.filter(e => e.phase === phase) : entries;
  if (!filtered.length) {
    el.innerHTML = '<p style="color:var(--dim);padding:2rem;">Documentation will appear here as the project develops.</p>';
    return;
  }
  el.innerHTML = filtered.map(entry => `
    <div class="gallery-entry">
      <div class="gallery-entry-header">
        <span class="lbl">${entry.phase ? entry.phase.replace(/-/g, ' ') : ''}</span>
        <span style="font-size:13px;color:var(--dim);">${formatDate(entry.date)}</span>
      </div>
      ${entry.images && entry.images.length
        ? `<div class="gallery-img-grid">
             ${entry.images.map(img => `<div class="gallery-img" style="background-image:url('${img}')"></div>`).join('')}
           </div>`
        : ''}
      ${entry.caption ? `<div class="gallery-caption">${entry.caption}</div>` : ''}
      ${entry.credit ? `<div class="gallery-credit">Photo: ${entry.credit}</div>` : ''}
    </div>
  `).join('');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  initFaq();
  initCountdown('2026-08-31T23:59:00+08:00', 'countdown');
});
