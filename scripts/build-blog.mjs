// Generatore del blog di 2M Traslochi (sito statico su GitHub Pages).
// Uso:  node scripts/build-blog.mjs          -> controlla gli articoli e rigenera blog/, sitemap.xml, robots.txt
//       node scripts/build-blog.mjs --check  -> solo controlli (non scrive nulla)
// Sorgenti: blog-src/<slug>.md con frontmatter (title, description, date, keyword). Nessuna dipendenza esterna.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "blog-src");
const OUT = path.join(root, "blog");
const SITE = "https://www.2mtraslochilombardia.it";
const LOGO = "/assets/3b14be66345e1d60.png";
const TEL = "+393294231495";
const WA = "https://wa.me/message/7XE22ZJTEYJ4M1";
const checkOnly = process.argv.includes("--check");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function parseFrontmatter(raw) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw.replace(/^﻿/, ""));
  if (!m) return { meta: {}, body: raw.trim() };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    meta[line.slice(0, i).trim()] = v;
  }
  return { meta, body: m[2].trim() };
}

// Markdown minimo: ## ### titoli, liste (-, 1.), tabelle |, citazioni >, **grassetto**, *corsivo*, [testo](url)
function inline(s) {
  let t = esc(s);
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, a, u) => `<a href="${u.replace(/&amp;/g, "&amp;")}">${a}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
  return t;
}
function mdToHtml(md) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = /^(#{2,3})\s+(.*)$/.exec(l))) { out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`); i++; continue; }
    if (/^\s*[-*]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*[-*]\s+/, ""))}</li>`);
      out.push(`<ul>${items.join("")}</ul>`); continue;
    }
    if (/^\s*\d+[.)]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(`<li>${inline(lines[i++].replace(/^\s*\d+[.)]\s+/, ""))}</li>`);
      out.push(`<ol>${items.join("")}</ol>`); continue;
    }
    if (/^\s*>\s?/.test(l)) {
      const q = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) q.push(lines[i++].replace(/^\s*>\s?/, ""));
      out.push(`<blockquote><p>${inline(q.join(" "))}</p></blockquote>`); continue;
    }
    if (/^\s*\|/.test(l) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      const cells = (r) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(l); i += 2;
      const rows = [];
      while (i < lines.length && /^\s*\|/.test(lines[i])) rows.push(cells(lines[i++]));
      out.push(`<div class="tw"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    const p = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|\s*[-*]\s+|\s*\d+[.)]\s+|\s*>|\s*\|)/.test(lines[i])) p.push(lines[i++]);
    out.push(`<p>${inline(p.join(" "))}</p>`);
  }
  return out.join("\n");
}

const fmtDate = (d) => new Date(d + "T12:00:00Z").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const words = (s) => (s.match(/\S+/g) || []).length;

// ---- lettura + controlli ----
const errors = [];
const posts = [];
if (existsSync(SRC)) {
  for (const f of readdirSync(SRC).filter((x) => x.endsWith(".md")).sort()) {
    const slug = f.replace(/\.md$/, "");
    const { meta, body } = parseFrontmatter(readFileSync(path.join(SRC, f), "utf8"));
    const e = (msg) => errors.push(`${f}: ${msg}`);
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) e("nome file non valido (solo minuscole, numeri e trattini)");
    if (!meta.title) e("manca title"); else if (meta.title.length > 70) e(`title troppo lungo (${meta.title.length}, max 70)`);
    if (!meta.description) e("manca description"); else if (meta.description.length < 110 || meta.description.length > 165) e(`description di ${meta.description.length} caratteri (servono 110-165)`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date || "")) e("date deve essere AAAA-MM-GG");
    if (!meta.keyword) e("manca keyword (parola chiave principale)");
    else if (!(meta.title + " " + body.slice(0, 600)).toLowerCase().includes(meta.keyword.toLowerCase())) e("la keyword deve comparire nel titolo o nell'introduzione");
    if (words(body) < 700) e(`solo ${words(body)} parole (minimo 700)`);
    if (/^#\s/m.test(body)) e("nel testo non usare il titolo # (il titolo è nel frontmatter): usa ## e ###");
    if (!/\]\(\/contatti\/?\)/.test(body) && !/\]\(\/#preventivo\)/.test(body)) e("manca un link al preventivo (/contatti/) nel testo");
    if (/lorem ipsum|\[inserire|TODO|XXX/i.test(body)) e("contiene segnaposto");
    posts.push({ slug, ...meta, body });
  }
}
const slugs = new Set(posts.map((p) => p.slug));
const keywords = new Map();
for (const p of posts) {
  if (p.keyword) { const k = p.keyword.toLowerCase(); if (keywords.has(k)) errors.push(`${p.slug}.md: keyword "${p.keyword}" già usata da ${keywords.get(k)}.md`); else keywords.set(k, p.slug); }
  for (const m of p.body.matchAll(/\]\((\/blog\/([a-z0-9-]+)\/?)\)/g)) if (!slugs.has(m[2])) errors.push(`${p.slug}.md: link interno a ${m[1]} ma l'articolo non esiste`);
}
if (errors.length) { console.error("CONTROLLI FALLITI:\n- " + errors.join("\n- ")); process.exit(1); }
console.log(`Controlli ok: ${posts.length} articoli.`);
if (checkOnly) process.exit(0);

// ---- pagine ----
posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

const CSS = `:root{--navy:#0e1424;--yellow:#f2b705;--red:#d62b2f;--green:#1f9a4a;--cream:#f6f7fb;--soft:rgba(246,247,251,.8);--line:rgba(246,247,251,.17)}
*{box-sizing:border-box;margin:0;padding:0}html{background:var(--navy)}
body{font-family:'Inter',system-ui,sans-serif;color:var(--cream);background:var(--navy);line-height:1.75;min-height:100vh;display:flex;flex-direction:column;-webkit-font-smoothing:antialiased}
header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px clamp(18px,4vw,48px);border-bottom:1px solid var(--line)}
header nav{display:flex;gap:20px;align-items:center}header nav a{font-size:.9rem;color:var(--soft);text-decoration:none}header nav a:hover{color:#fff}
.pill{display:inline-block;padding:11px 20px;border-radius:12px;font-weight:700;text-decoration:none;border:2px solid var(--yellow);background:var(--yellow);color:#171100!important;font-size:.92rem}
.pill.ghost{background:transparent;color:var(--cream)!important;border-color:rgba(246,247,251,.5)}
.pill{white-space:nowrap}@media(max-width:520px){header nav{gap:12px}header nav a.home{display:none}header nav .pill{padding:9px 14px;font-size:.84rem}}
main{flex:1;max-width:46rem;width:100%;margin:0 auto;padding:clamp(24px,5vh,56px) clamp(18px,5vw,32px) 60px}
.eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:.72rem;color:var(--yellow);font-weight:700;margin-bottom:12px}
h1{font-family:'Archivo','Inter',sans-serif;font-weight:800;font-size:clamp(1.9rem,5vw,2.9rem);line-height:1.08;letter-spacing:-.02em;margin-bottom:12px}
.meta{color:rgba(246,247,251,.55);font-size:.88rem;margin-bottom:28px}
article h2{font-family:'Archivo','Inter',sans-serif;font-weight:800;font-size:1.5rem;line-height:1.2;margin:38px 0 10px;color:#fff}
article h3{font-family:'Archivo','Inter',sans-serif;font-weight:700;font-size:1.15rem;margin:26px 0 8px;color:#fff}
p,li{color:var(--soft);margin-bottom:14px;font-size:1.04rem}ul,ol{padding-left:1.3rem;margin-bottom:14px}
a{color:var(--yellow)}strong{color:#fff}
blockquote{border-left:3px solid var(--yellow);padding:4px 0 4px 16px;margin:18px 0}
.tw{overflow-x:auto;margin:16px 0}table{width:100%;border-collapse:collapse;font-size:.94rem}th,td{text-align:left;padding:10px 12px;border:1px solid var(--line);vertical-align:top;color:var(--soft)}th{color:#fff;background:rgba(246,247,251,.05)}
.cta{margin:42px 0 8px;padding:24px;border:1px solid var(--line);border-radius:18px;background:rgba(246,247,251,.04)}
.cta h2{margin:0 0 8px!important;font-size:1.35rem!important}.cta .acts{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.rel{margin-top:44px}.rel h2{font-family:'Archivo','Inter',sans-serif;font-size:1.15rem;margin-bottom:10px}.rel a{display:block;padding:10px 0;border-top:1px solid var(--line);text-decoration:none;color:var(--cream)}.rel a:hover{color:var(--yellow)}
.list a.card{display:block;padding:22px 0;border-top:1px solid var(--line);text-decoration:none;color:inherit}.list a.card:hover h2{color:var(--yellow)}
.list h2{font-family:'Archivo','Inter',sans-serif;font-weight:800;font-size:1.35rem;line-height:1.2;margin-bottom:6px;color:#fff}.list p{margin-bottom:4px}
footer{padding:22px 24px 30px;font-size:.8rem;color:var(--soft);text-align:center}footer a{color:var(--soft)}`;

function page({ title, description, urlPath, body, ld }) {
  const url = SITE + urlPath;
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#0e1424">
<meta property="og:type" content="${ld && ld["@type"] === "BlogPosting" ? "article" : "website"}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="${LOGO}">
<link rel="stylesheet" href="/assets/fonts/fonts.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>
<style>${CSS}</style>
</head>
<body>
<header>
  <a href="/" aria-label="2M Traslochi"><img src="${LOGO}" alt="2M Traslochi" width="140" height="40"></a>
  <nav aria-label="Principale"><a class="home" href="/">Home</a><a href="/blog/">Blog</a><a class="pill" href="/contatti/">Preventivo gratuito</a></nav>
</header>
${body}
<footer>© 2M Traslochi · Via Lodi 18, San Colombano al Lambro (MI) · <a href="/cookie-policy/">Cookie policy</a></footer>
<script src="/cookie-consent.js" defer></script>
</body>
</html>
`;
}

const publisher = { "@type": "MovingCompany", name: "2M Traslochi", telephone: TEL, url: SITE + "/", logo: SITE + LOGO };

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const p of posts) {
  const related = posts.filter((x) => x.slug !== p.slug).slice(0, 3);
  const mins = Math.max(1, Math.round(words(p.body) / 200));
  const body = `<main>
<article>
  <p class="eyebrow">Blog · Traslochi e sgomberi in Lombardia</p>
  <h1>${esc(p.title)}</h1>
  <p class="meta">${fmtDate(p.date)}${p.updated ? ` · aggiornato il ${fmtDate(p.updated)}` : ""} · ${mins} min di lettura</p>
${mdToHtml(p.body)}
  <div class="cta">
    <h2>Vuoi un preventivo per il tuo trasloco?</h2>
    <p>Raccontaci cosa devi spostare: ti rispondiamo con un preventivo gratuito e senza impegno, sette giorni su sette.</p>
    <div class="acts"><a class="pill" href="/contatti/">Richiedi il preventivo</a><a class="pill ghost" href="tel:${TEL}">Chiama</a><a class="pill ghost" href="${WA}" target="_blank" rel="noopener">WhatsApp</a></div>
  </div>
</article>
${related.length ? `<div class="rel"><h2>Altri articoli</h2>${related.map((r) => `<a href="/blog/${r.slug}/">${esc(r.title)}</a>`).join("")}</div>` : ""}
</main>`;
  const ld = {
    "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.description,
    datePublished: p.date, dateModified: p.updated || p.date, inLanguage: "it", keywords: p.keyword,
    mainEntityOfPage: `${SITE}/blog/${p.slug}/`, author: publisher, publisher,
  };
  mkdirSync(path.join(OUT, p.slug), { recursive: true });
  writeFileSync(path.join(OUT, p.slug, "index.html"), page({ title: `${p.title} – 2M Traslochi`, description: p.description, urlPath: `/blog/${p.slug}/`, body, ld }), "utf8");
}

const indexBody = `<main>
  <p class="eyebrow">Blog</p>
  <h1>Traslochi, sgomberi e deposito: guide pratiche</h1>
  <p class="meta">Consigli, prezzi e cose da sapere dal team di 2M Traslochi, in Lombardia.</p>
  <div class="list">${posts.length ? posts.map((p) => `<a class="card" href="/blog/${p.slug}/"><h2>${esc(p.title)}</h2><p>${esc(p.description)}</p><p class="meta">${fmtDate(p.date)}</p></a>`).join("") : "<p>Primi articoli in arrivo.</p>"}</div>
</main>`;
writeFileSync(path.join(OUT, "index.html"), page({
  title: "Blog – 2M Traslochi Lombardia", description: "Guide e consigli su traslochi, sgomberi e deposito mobili in Lombardia dal team di 2M Traslochi.", urlPath: "/blog/", body: indexBody,
  ld: { "@context": "https://schema.org", "@type": "Blog", name: "Blog di 2M Traslochi", url: SITE + "/blog/", inLanguage: "it", publisher },
}), "utf8");

const urls = [["/", null], ["/trasloco/", null], ["/sgombero/", null], ["/deposito/", null], ["/contatti/", null], ["/blog/", posts[0]?.date || null], ...posts.map((p) => [`/blog/${p.slug}/`, p.updated || p.date])];
writeFileSync(path.join(root, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `  <url><loc>${SITE}${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`, "utf8");
writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /docs/\nDisallow: /blog-src/\nDisallow: /scripts/\n\nSitemap: ${SITE}/sitemap.xml\n`, "utf8");
console.log(`Generate ${posts.length} pagine articolo + indice, sitemap (${urls.length} URL) e robots.txt.`);
