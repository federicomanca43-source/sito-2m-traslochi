# Blog di 2M Traslochi — regole e piano (leggere PRIMA di scrivere)

Il blog esce **un articolo a settimana**, scritto da una routine automatica (Claude) che lo pubblica da sola su questo repo (GitHub Pages → www.2mtraslochilombardia.it). Nessuno lo rilegge prima: per questo le regole sotto sono vincolanti. Obiettivo: far trovare 2M su Google a chi cerca traslochi, sgomberi e deposito in Lombardia, e portarlo a chiedere un preventivo.

## Chi è 2M (usa SOLO questi fatti)
- 2M Traslochi, Via Lodi 18, 20078 San Colombano al Lambro (MI). Tel. +39 329 423 1495 · WhatsApp · 2mtraslochi@gmail.com. Aperti 7 giorni su 7, 9:00–21:00.
- Zona: **Lombardia e dintorni**.
- Servizi (vedi /trasloco/, /sgombero/, /deposito/ — rileggi quelle pagine prima di promettere qualcosa): trasloco completo (imballaggio, smontaggio e rimontaggio mobili, trasporto, deposito temporaneo), **sopralluogo** con preventivo gratuito e personalizzato, **nessun acconto** richiesto per i traslochi, conferma della data almeno 10 giorni prima; **sgombero gratuito su valutazione** degli oggetti da eliminare; deposito con tariffe in base a spazio e durata.
- NON inventare altro su 2M: niente anni di esperienza, numeri di traslochi fatti, recensioni, assicurazioni, licenze, flotta, certificazioni, prezzi di 2M, nomi di dipendenti. Se un fatto non è nelle pagine del sito o qui sopra, non scriverlo.

## Come scegliere l'argomento (parole chiave)
1. Apri `docs/BLOG-PIANO-KEYWORD.md`: contiene le parole chiave già usate e quelle da fare.
2. Prendi la prima "da fare" non usata. Se la lista è finita o un tema è più urgente (stagione, notizia), cerca nuove idee con WebSearch: intenti di ricerca reali in italiano per la Lombardia (domande tipo «quanto costa…», «come…», «cosa serve per…», città: Milano, Lodi, Pavia, Bergamo, Brescia, Monza, Como, Varese, Cremona), guardando cosa si chiede la gente e cosa scrivono i primi risultati.
3. Una parola chiave principale per articolo (frase che una persona digita davvero, es. «quanto costa un trasloco a Milano»). Mai la stessa due volte (lo script lo controlla). Aggiungi 3–6 varianti/secondarie nel testo in modo naturale, senza ripeterle a forza.
4. Aggiorna il piano: sposta la parola chiave in "usate" con data e slug, e aggiungi 2–3 nuove idee in fondo alle "da fare".

## Come scrivere
- Italiano naturale, tono pratico e rassicurante, dai del "tu" o usa forma impersonale (come sul sito il "voi" è ok, ma resta coerente nell'articolo).
- **900–1.400 parole**. Rispondi alla domanda nelle prime 3 righe, poi approfondisci. Sezioni con `##` e `###` (mai `#`: il titolo è nel frontmatter). Elenchi, tabelle semplici dove servono, una sezione finale «Domande frequenti» con 3–5 domande (`###` + risposta breve).
- **Title** ≤ 65 caratteri con la parola chiave all'inizio o vicino; **description** 120–160 caratteri con la parola chiave e un motivo per cliccare.
- La parola chiave principale deve comparire nel titolo o nelle prime righe, e in almeno un `##`.
- Link interni obbligatori: almeno un link a `/contatti/` (preventivo) nel testo, uno a una pagina servizio (`/trasloco/`, `/sgombero/` o `/deposito/`) e, se pertinente, uno a un articolo già pubblicato (`/blog/<slug>/`, lo slug deve esistere). Link esterni solo a fonti ufficiali (es. Comune, ARERA, Agenzia delle Entrate) e solo se li hai letti davvero.
- **Cifre e prezzi**: non dare i prezzi di 2M. Puoi dare ordini di grandezza di mercato solo se trovati in fonti che hai letto, scrivendo che sono indicativi e che il prezzo reale richiede un sopralluogo/preventivo. Mai numeri inventati. Norme e regole locali (permessi suolo pubblico, ZTL, rifiuti ingombranti): verifica sul sito del Comune/fonte ufficiale e cita il nome della fonte; se non sei sicuro, scrivi di verificare col proprio Comune.
- Niente affermazioni mediche/legali/fiscali oltre il generico; niente confronti denigratori con altre ditte; niente testimonianze.
- Chiudi con un invito naturale al preventivo gratuito (il blocco con pulsanti Preventivo/Chiama/WhatsApp lo aggiunge già lo script in fondo a ogni articolo: non ripeterlo con i numeri di telefono nel testo).

## Formato del file
`blog-src/<slug>.md` (slug in minuscolo con trattini, = parola chiave sintetica, es. `quanto-costa-un-trasloco-a-milano`):

```
---
title: "Quanto costa un trasloco a Milano: prezzi e cosa li fa cambiare"
description: "Descrizione di 120-160 caratteri con la parola chiave."
date: 2026-11-25
keyword: quanto costa un trasloco a Milano
---

Testo…
```

`date` = data di oggi (AAAA-MM-GG). Una sola `keyword`, in minuscolo.

## Procedura di pubblicazione (ogni lunedì)
1. `git pull` e leggi questo file + `docs/BLOG-PIANO-KEYWORD.md` + gli articoli già in `blog-src/` (per non ripetere temi e per i link interni).
2. Ricerca (WebSearch/WebFetch) sulla parola chiave scelta; rileggi le pagine servizio del sito.
3. Scrivi `blog-src/<slug>.md` e aggiorna `docs/BLOG-PIANO-KEYWORD.md`.
4. `node scripts/build-blog.mjs` — controlla l'articolo e rigenera `blog/`, `sitemap.xml`, `robots.txt`. Se i controlli falliscono, correggi e rilancia. Se dopo 3 tentativi ancora falliscono, NON pubblicare: lascia tutto com'è e spiega il problema nella risposta finale.
5. `git add blog-src blog sitemap.xml robots.txt docs` · `git commit -m "Blog: <titolo>"` · `git push origin main` (GitHub Pages pubblica da solo in 1–2 minuti).
6. Rispondi con titolo, parola chiave, link `https://www.2mtraslochilombardia.it/blog/<slug>/` e le fonti che hai usato.

**Non toccare** nient'altro nel repo (pagine del sito, moduli, `site.js`, `vendenta-config.js`, cookie): i moduli inviano i contatti a Vendenta e non devono rompersi.
