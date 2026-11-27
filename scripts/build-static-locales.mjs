#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TODAY = '2026-11-27';

function escAttr(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function stripTags(str) {
    return String(str).replace(/<[^>]+>/g, '');
}

function buildYtShortsHtml(d) {
    if (!d || !d.yt_shorts) return '';
    const prefix = d.yt_play_prefix || 'Play';
    return d.yt_shorts.map((s) => {
        const t = escAttr(s.title);
        const lbl = escAttr(`${prefix} : ${s.title}`);
        const tb = escAttr(s.thumbBase);
        return `<figure class="yt-short-item">
                        <div class="yt-short-stage">
                            <button type="button" class="yt-short-btn" data-ytid="${escAttr(s.id)}" data-yttitle="${t}" aria-label="${lbl}">
                                <img src="${tb}-360.webp" srcset="${tb}-360.webp 360w, ${tb}.webp 540w" sizes="(max-width: 760px) 224px, 300px" alt="${t}" width="540" height="960" loading="lazy" decoding="async">
                                <span class="yt-play-badge" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
                            </button>
                        </div>
                        <figcaption>${escHtml(s.title)}</figcaption>
                    </figure>`;
    }).join('\n                    ');
}

function replaceByIdInner(html, id, innerHtml) {
    const openRe = new RegExp(`<([a-z0-9]+)\\b[^>]*\\bid="${id}"[^>]*>`, 'i');
    const m = openRe.exec(html);
    if (!m) {
        throw new Error(`Missing element id="${id}"`);
    }
    const tag = m[1].toLowerCase();
    const startInner = m.index + m[0].length;
    const tokenRe = new RegExp(`<(\\/)?${tag}\\b[^>]*>`, 'gi');
    tokenRe.lastIndex = startInner;
    let depth = 1;
    let tok;
    while ((tok = tokenRe.exec(html)) !== null) {
        if (tok[1]) {
            depth -= 1;
            if (depth === 0) {
                const closeStart = tok.index;
                return html.slice(0, startInner) + innerHtml + html.slice(closeStart);
            }
        } else if (!tok[0].endsWith('/>')) {
            depth += 1;
        }
    }
    throw new Error(`Unbalanced closing </${tag}> for id="${id}"`);
}

function replaceAttrById(html, id, attr, value) {
    const re = new RegExp(`(<[a-z0-9]+\\b[^>]*\\bid="${id}"[^>]*>)`, 'i');
    return html.replace(re, (tag) => {
        const attrRe = new RegExp(`\\b${attr}="[^"]*"`, 'i');
        if (attrRe.test(tag)) {
            return tag.replace(attrRe, () => `${attr}="${escAttr(value)}"`);
        }
        return tag.replace(/>$/, () => ` ${attr}="${escAttr(value)}">`);
    });
}

function replaceDataI18n(html, dict) {
    return html.replace(/<([a-z0-9]+)\b([^>]*\bdata-i18n="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/gi, (full, tag, attrs, key) => {
        if (dict[key] === undefined) return full;
        return `<${tag}${attrs}>${dict[key]}</${tag}>`;
    });
}

function markSelectOption(html, selectId, lang) {
    const re = new RegExp(`(<select\\b[^>]*\\bid="${selectId}"[^>]*>)([\\s\\S]*?)(<\\/select>)`, 'i');
    return html.replace(re, (_, open, opts, close) => {
        const cleanOpts = opts
            .replace(/\s+selected(?:="selected")?/gi, '')
            .replace(new RegExp(`(<option\\s+value="${lang}")>`, 'i'), (_, m1) => `${m1} selected>`);
        return `${open}${cleanOpts}${close}`;
    });
}

function updateHeadMeta(head, { htmlLang, staticLang, title, desc, keywords, canonicalUrl, ogTitle, ogDesc, twTitle, twDesc, jsonLd }) {
    let out = head;
    out = out.replace(/<html\s+lang="[^"]*">/i, () => `<html lang="${htmlLang}">`);
    out = out.replace(
        /(<meta\s+name="viewport"[^>]*>)/i,
        (_, m1) => `${m1}\n    <script>window.__PAGE_STATIC_LANG="${staticLang}";</script>`
    );
    out = out.replace(/<title>[\s\S]*?<\/title>/i, () => `<title>${escHtml(title)}</title>`);
    out = out.replace(/<meta\s+name="description"\s+content="[^"]*">/i, () => `<meta name="description" content="${escAttr(desc)}">`);
    if (keywords) {
        out = out.replace(/<meta\s+name="keywords"\s+content="[^"]*">/i, () => `<meta name="keywords" content="${escAttr(keywords)}">`);
    }
    out = out.replace(/<link\s+rel="canonical"\s+href="[^"]*">/i, () => `<link rel="canonical" href="${canonicalUrl}">`);
    out = out.replace(/<meta\s+property="og:title"\s+content="[^"]*">/i, () => `<meta property="og:title" content="${escAttr(ogTitle || title)}">`);
    out = out.replace(/<meta\s+property="og:description"\s+content="[^"]*">/i, () => `<meta property="og:description" content="${escAttr(ogDesc || desc)}">`);
    out = out.replace(/<meta\s+property="og:url"\s+content="[^"]*">/i, () => `<meta property="og:url" content="${canonicalUrl}">`);
    out = out.replace(/<meta\s+name="twitter:title"\s+content="[^"]*">/i, () => `<meta name="twitter:title" content="${escAttr(twTitle || ogTitle || title)}">`);
    out = out.replace(/<meta\s+name="twitter:description"\s+content="[^"]*">/i, () => `<meta name="twitter:description" content="${escAttr(twDesc || ogDesc || desc)}">`);
    out = out.replace(
        /(<script\s+type="application\/ld\+json"\s+id="pageJsonLd">)[\s\S]*?(<\/script>)/i,
        (_, openTag, closeTag) => `${openTag}\n${JSON.stringify(jsonLd, null, 2)}\n    ${closeTag}`
    );
    return out;
}

// ---------------------------------------------------------------------------
// 1. Load Dictionaries via VM
// ---------------------------------------------------------------------------
const orthoCtx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'ortho-i18n.js'), 'utf8'), orthoCtx);
const ORTHO_I18N = orthoCtx.window.ORTHO_I18N;

const mathHtmlRaw = fs.readFileSync(path.join(ROOT, 'math/index.html'), 'utf8');
const mathScriptMatch = mathHtmlRaw.match(/const i18n = (\{[\s\S]*?\n        \});\s*\n\s*const APPLE_PROVIDER_TOKEN/);
if (!mathScriptMatch) throw new Error('Could not extract math i18n object');
const MATH_I18N = vm.runInNewContext(`(${mathScriptMatch[1]})`, {});

const hunterCtx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'hunter/i18n.js'), 'utf8'), hunterCtx);
const HUNTER_I18N = hunterCtx.window.HUNTER_I18N;

// ---------------------------------------------------------------------------
// 2. Build Meemaw Orthographe Static Locales (/en/, /es/)
// ---------------------------------------------------------------------------
const orthoHtmlRaw = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const orthoStyleIdx = orthoHtmlRaw.indexOf('<style>');
const orthoBodyIdx = orthoHtmlRaw.indexOf('</head>');
const orthoScriptIdx = orthoHtmlRaw.indexOf('<script src="/ortho-i18n.js"');

const orthoHeadTop = orthoHtmlRaw.slice(0, orthoStyleIdx);
const orthoStyleBlock = orthoHtmlRaw.slice(orthoStyleIdx, orthoBodyIdx);
const orthoBodyMarkup = orthoHtmlRaw.slice(orthoBodyIdx, orthoScriptIdx);
const orthoScriptsTail = orthoHtmlRaw.slice(orthoScriptIdx);

const orthoStoreUrls = {
    en: 'https://apps.apple.com/us/app/learn-french-spelling-meemaw/id6757681331',
    es: 'https://apps.apple.com/es/app/ortograf%C3%ADa-francesa-meemaw/id6757681331'
};
const mathStoreUrls = {
    en: 'https://apps.apple.com/us/app/mental-math-games-meemaw-math/id6824002615',
    es: 'https://apps.apple.com/es/app/c%C3%A1lculo-mental-meemaw-mates/id6824002615'
};

const orthoAttrMap = {
    en: {
        'aria-label="Collection Meemaw"': 'aria-label="Meemaw Family Suite"',
        'title="Langue"': 'title="Language"',
        'aria-label="Langue"': 'aria-label="Language"',
        'alt="Meemaw vous salue"': 'alt="Meemaw waving hello"',
        'alt="QR Code App Store Meemaw"': 'alt="App Store QR Code for Learn French Spelling: Meemaw"',
        'aria-label="Pièges d\'orthographe"': 'aria-label="French spelling traps"',
        'alt="Meemaw corrige votre cahier avec bienveillance"': 'alt="Meemaw explaining the French rule in her notebook"',
        'alt="Meemaw transforme vos doutes en déclic"': 'alt="Meemaw turning spelling mistakes into confidence"',
        'alt="Meemaw et les cubes du Motus Orthographe"': 'alt="Meemaw holding French Motus letter blocks"',
        'alt="Meemaw et le sablier Temps d\'Écran Apple"': 'alt="Meemaw holding the Apple Screen Time hourglass"',
        'aria-label="Règles clés maîtrisées"': 'aria-label="Core French rules mastered"',
        'alt="Motus Orthographe Meemaw"': 'alt="French Spelling Motus by Meemaw"',
        'alt="50 fiches de règles sans jargon"': 'alt="50 jargon-free French grammar sheets"',
        'alt="Progression d\'Apprenti à Maître"': 'alt="5 mastery ranks from Apprentice to Master"',
        'aria-label="Capture précédente"': 'aria-label="Previous screenshot"',
        'aria-label="Capture suivante"': 'aria-label="Next screenshot"',
        'alt="Bouclier Temps d\'Écran Apple"': 'alt="Apple Screen Time Parental Shield"',
        'alt="Duels Parents vs Enfants"': 'alt="Referee Meemaw for 2-Round Family & Friend Duels"',
        'alt="Meemaw célèbre vos progrès avec son trophée"': 'alt="Meemaw celebrating your progress with her golden trophy"'
    },
    es: {
        'aria-label="Collection Meemaw"': 'aria-label="Colección Familiar Meemaw"',
        'aria-label="Sections"': 'aria-label="Secciones"',
        'title="Langue"': 'title="Idioma"',
        'aria-label="Langue"': 'aria-label="Idioma"',
        'alt="Meemaw vous salue"': 'alt="Meemaw saludando"',
        'alt="QR Code App Store Meemaw"': 'alt="Código QR App Store Ortografía francesa: Meemaw"',
        'aria-label="Pièges d\'orthographe"': 'aria-label="Trampas de ortografía francesa"',
        'alt="Meemaw corrige votre cahier avec bienveillance"': 'alt="Meemaw explicando la regla en su cuaderno"',
        'alt="Meemaw transforme vos doutes en déclic"': 'alt="Meemaw transformando tus dudas en seguridad"',
        'alt="Meemaw et les cubes du Motus Orthographe"': 'alt="Meemaw con los bloques de letras de Motus"',
        'alt="Meemaw et le sablier Temps d\'Écran Apple"': 'alt="Meemaw con el reloj de arena Tiempo en Pantalla"',
        'aria-label="Règles clés maîtrisées"': 'aria-label="Reglas clave dominadas"',
        'alt="Motus Orthographe Meemaw"': 'alt="Motus Ortografía Francesa de Meemaw"',
        'alt="50 fiches de règles sans jargon"': 'alt="50 fichas de reglas sin jerga"',
        'alt="Progression d\'Apprenti à Maître"': 'alt="Progresión de Aprendiz a Maestro"',
        'aria-label="Capture précédente"': 'aria-label="Captura anterior"',
        'aria-label="Capture suivante"': 'aria-label="Captura siguiente"',
        'alt="Bouclier Temps d\'Écran Apple"': 'alt="Escudo Tiempo en Pantalla de Apple"',
        'alt="Duels Parents vs Enfants"': 'alt="Meemaw árbitro de duelos familiares a 2 rondas"',
        'alt="Meemaw célèbre vos progrès avec son trophée"': 'alt="Meemaw celebrando tu progreso con su trofeo"'
    }
};

function buildOrthoJsonLd(lang, d) {
    const pageUrl = `https://meemaw.app/${lang}/`;
    const oStore = `${orthoStoreUrls[lang]}?ct=web_schema_ortho_${lang}&mt=8`;
    const mStore = `${mathStoreUrls[lang]}?ct=web_schema_math_${lang}&mt=8`;
    const hStore = `https://apps.apple.com/app/id6831648316?ct=web_schema_hunter_${lang}&mt=8`;
    const isEn = lang === 'en';

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': 'https://meemaw.app/#organization',
                name: 'Meemaw',
                url: pageUrl,
                logo: 'https://meemaw.app/assets/icon.webp',
                founder: { '@type': 'Person', name: 'Xavier Larrodé' },
                makesOffer: [
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'SoftwareApplication',
                            name: isEn ? 'Learn French Spelling: Meemaw' : 'Ortografía francesa: Meemaw',
                            operatingSystem: 'iOS, iPadOS',
                            applicationCategory: 'EducationalApplication',
                            url: pageUrl,
                            downloadUrl: oStore
                        }
                    },
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'SoftwareApplication',
                            name: isEn ? 'Mental Math Games: Meemaw Math' : 'Cálculo Mental : Meemaw Mates',
                            operatingSystem: 'iOS, iPadOS',
                            applicationCategory: 'EducationalApplication',
                            url: `https://meemaw.app/math/${lang}/`,
                            downloadUrl: mStore
                        }
                    },
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'VideoGame',
                            name: 'Meemaw Hunter',
                            operatingSystem: 'iOS, iPadOS',
                            applicationCategory: 'GameApplication',
                            url: `https://meemaw.app/hunter/${lang}/`,
                            downloadUrl: hStore
                        }
                    }
                ]
            },
            {
                '@type': 'SoftwareApplication',
                name: isEn ? 'Learn French Spelling: Meemaw' : 'Ortografía francesa: Meemaw',
                alternateName: ['Meemaw', 'Orthographe & Dictée : Meemaw', 'Learn French Spelling: Meemaw', 'Ortografía francesa: Meemaw', 'Meemaw French Motus'],
                operatingSystem: 'iOS, iPadOS',
                applicationCategory: 'EducationalApplication',
                softwareVersion: '1.0.49',
                inLanguage: ['fr', 'en', 'es'],
                url: pageUrl,
                downloadUrl: oStore,
                installUrl: oStore,
                trailer: { '@id': `${pageUrl}#trailer-video` },
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: isEn ? 'USD' : 'EUR',
                    description: isEn
                        ? 'Free download with 5-second express onboarding, daily French dictation & Motus practice, free PRO trial, and Apple Family Sharing for up to 6 family members.'
                        : 'Descarga gratuita con inicio exprés en 5 segundos, práctica diaria de dictado y Motus en francés, prueba PRO gratuita y En Familia de Apple para hasta 6 personas.'
                },
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '5.0',
                    ratingCount: '5',
                    bestRating: '5',
                    worstRating: '1'
                },
                author: { '@id': 'https://meemaw.app/#organization' },
                featureList: isEn
                    ? [
                        '1,837 studio 24 kHz French voice dictations read full-sentence then phrase-by-phrase with interactive Mini-Map',
                        'French Spelling Motus & 2-Round Turn-Based Duels: 1,000 curated 5-to-9-letter French words via Game Center or private rooms with English rule breakdowns',
                        '620 French Anagrams & Word-by-Word lexical spelling mode',
                        '50 jargon-free French grammar & agreement rule sheets explained in English, French, and Spanish',
                        '9 game modes across 5 ranks with 1-tap mid-game difficulty switching',
                        'Apple Screen Time Parental Shield & 1-tap WhatsApp / iMessage / Game Center Duels',
                        '100% offline, zero ads, zero data collected, and Apple Family Sharing for up to 6 members'
                    ]
                    : [
                        '1.837 dictados en francés con voz de estudio a 24 kHz leídos frase entera y tramo a tramo con Mini-Mapa interactivo',
                        'Motus Ortografía y Duelos por Turnos a 2 Rondas: 1.000 palabras francesas en Game Center o sala privada con explicación en español',
                        '620 Anagramas en francés y modo Palabra por Palabra',
                        '50 fichas de gramática y ortografía francesa explicadas sin jerga en español, francés e inglés',
                        '9 modos de juego en 5 niveles con cambio de dificultad en 1 toque en plena partida',
                        'Escudo Tiempo en Pantalla de Apple y duelos con amigos en Game Center, WhatsApp e iMessage',
                        '100 % sin conexión, cero anuncios, cero datos recopilados y En Familia de Apple para 6 personas'
                    ],
                description: d.meta_desc
            },
            {
                '@type': 'VideoObject',
                '@id': `${pageUrl}#trailer-video`,
                name: `${d.video_title} — ${isEn ? 'Learn French Spelling: Meemaw' : 'Ortografía francesa: Meemaw'}`,
                description: d.video_lead,
                thumbnailUrl: [`https://meemaw.app${d.video_poster}`],
                uploadDate: '2026-11-27T08:00:00+01:00',
                duration: 'PT26S',
                contentUrl: `https://meemaw.app${d.video_file}`,
                embedUrl: `${pageUrl}#video`,
                inLanguage: lang,
                isFamilyFriendly: true
            },
            {
                '@type': 'ItemList',
                name: isEn
                    ? '2026 Best French Dictation, Spelling & Grammar Apps on iPhone and iPad'
                    : 'Ranking 2026 de las mejores aplicaciones de dictado y ortografía en francés (iOS)',
                itemListOrder: 'https://schema.org/ItemListOrderDescending',
                numberOfItems: 5,
                itemListElement: isEn
                    ? [
                        { '@type': 'ListItem', position: 1, name: 'Learn French Spelling: Meemaw — 1,837 24 kHz French voice dictations on Seyès paper, 1,000-word Spelling Motus & 2-round duels, 620 Anagrams, 50 rules explained in English, 9 game modes, 100% offline & Family Sharing', url: oStore },
                        { '@type': 'ListItem', position: 2, name: 'Kwiziq / Lawless French — Detailed browser grammar quizzes (~$150+/yr, online-only)' },
                        { '@type': 'ListItem', position: 3, name: 'Projet Voltaire — Corporate French-only error-clicking drills (~$60/yr per user)' },
                        { '@type': 'ListItem', position: 4, name: 'Babbel — Beginner conversation lessons without dedicated word-by-word French dictation' },
                        { '@type': 'ListItem', position: 5, name: 'Duolingo (French) — Pre-spelled word bubbles without true dictation writing mastery' }
                    ]
                    : [
                        { '@type': 'ListItem', position: 1, name: 'Ortografía francesa: Meemaw — 1.837 dictados en francés 24 kHz sobre cuaderno Seyès, Motus de 1.000 palabras y duelos a 2 rondas, 620 anagramas, 50 reglas explicadas en español, 9 juegos, 100 % sin conexión', url: oStore },
                        { '@type': 'ListItem', position: 2, name: 'Busuu / TV5MONDE — Comprensión general en línea sin dictado guiado sin conexión' },
                        { '@type': 'ListItem', position: 3, name: 'Projet Voltaire — Entrenamiento corporativo exclusivamente en francés' },
                        { '@type': 'ListItem', position: 4, name: 'Babbel — Diálogos básicos sin entrenamiento profundo de ortografía francesa' },
                        { '@type': 'ListItem', position: 5, name: 'Duolingo (Francés) — Burbujas de palabras ya escritas sin dictado real' }
                    ]
            },
            {
                '@type': 'FAQPage',
                mainEntity: [
                    { '@type': 'Question', name: stripTags(d.q1), acceptedAnswer: { '@type': 'Answer', text: stripTags(d.a1) } },
                    { '@type': 'Question', name: stripTags(d.q2), acceptedAnswer: { '@type': 'Answer', text: stripTags(d.a2) } },
                    { '@type': 'Question', name: stripTags(d.q3), acceptedAnswer: { '@type': 'Answer', text: stripTags(d.a3) } },
                    { '@type': 'Question', name: stripTags(d.q4), acceptedAnswer: { '@type': 'Answer', text: stripTags(d.a4) } }
                ]
            }
        ]
    };
}

for (const lang of ['en', 'es']) {
    const d = ORTHO_I18N[lang];
    const canonicalUrl = `https://meemaw.app/${lang}/`;
    const keywords = lang === 'en'
        ? 'learn French spelling app, French voice dictation iPhone, French Wordle Motus game, French word puzzle app, French grammar rules in English, DELF DALF dictation practice, AP French writing, Meemaw vs Duolingo French'
        : 'aprender ortografía francesa, app dictado en francés iPhone, juego Motus palabras francés, gramática francesa explicada en español, preparar DELF DALF EOI francés, Meemaw vs Duolingo francés';

    const head = updateHeadMeta(orthoHeadTop, {
        htmlLang: lang,
        staticLang: lang,
        title: d.meta_title,
        desc: d.meta_desc,
        keywords,
        canonicalUrl,
        ogTitle: d.og_title || d.meta_title,
        ogDesc: d.og_desc || d.meta_desc,
        jsonLd: buildOrthoJsonLd(lang, d)
    });

    let body = replaceDataI18n(orthoBodyMarkup, d);
    body = replaceByIdInner(body, 'brandNameText', escHtml(d.brand));
    body = replaceByIdInner(body, 'suiteOrthoPill', escHtml(d.suite_ortho_pill));
    body = replaceByIdInner(body, 'suiteMathPill', escHtml(d.suite_math_pill));
    body = replaceByIdInner(body, 'thMeemaw', escHtml(d.brand));
    body = replaceByIdInner(body, 'thC1', escHtml(d.th_c1));
    body = replaceByIdInner(body, 'thC2', escHtml(d.th_c2));
    body = replaceByIdInner(body, 'thC3', escHtml(d.th_c3));
    body = replaceByIdInner(body, 'thC4', escHtml(d.th_c4));
    body = replaceByIdInner(body, 'tabTrap0', escHtml(d.tab_0));
    body = replaceByIdInner(body, 'tabTrap1', escHtml(d.tab_1));
    body = replaceByIdInner(body, 'tabTrap2', escHtml(d.tab_2));
    body = replaceByIdInner(body, 'tabTrap3', escHtml(d.tab_3));
    body = replaceByIdInner(body, 'footerCopy', escHtml(d.footer_copy));

    const t0 = d.traps[0];
    body = replaceByIdInner(body, 'slateExpr', escHtml(t0.expr));
    body = replaceByIdInner(body, 'slateAnswerBtn', escHtml(t0.ans));
    body = replaceByIdInner(body, 'step1Label', escHtml(d.step_1));
    body = replaceByIdInner(body, 'step2Label', escHtml(d.step_2));
    body = replaceByIdInner(body, 'step1Text', escHtml(t0.s1));
    body = replaceByIdInner(body, 'step2Text', escHtml(t0.s2));
    body = replaceByIdInner(body, 'trainerFootTag', escHtml(t0.tag));

    body = replaceByIdInner(
        body,
        'secretsStrip',
        d.chips.map((c) => `<span class="secret-chip">${c}</span>`).join('')
    );

    const storeBase = orthoStoreUrls[lang];
    body = replaceAttrById(body, 'navStoreBtn', 'href', `${storeBase}?ct=web_ortho_nav_${lang}&mt=8`);
    body = replaceAttrById(body, 'heroStoreBtn', 'href', `${storeBase}?ct=web_ortho_hero_${lang}&mt=8`);
    body = replaceAttrById(body, 'videoStoreBtn', 'href', `${storeBase}?ct=web_ortho_video_${lang}&mt=8`);
    body = replaceAttrById(body, 'finalStoreBtn', 'href', `${storeBase}?ct=web_ortho_final_${lang}&mt=8`);
    body = replaceByIdInner(body, 'videoSoundLabel', escHtml(d.video_sound_off));
    body = replaceAttrById(body, 'orthoTrailerVideo', 'poster', d.video_poster);
    body = replaceAttrById(body, 'orthoTrailerVideo', 'aria-label', d.video_poster_alt);
    body = replaceAttrById(body, 'orthoTrailerSource', 'data-src', d.video_file);
    body = replaceByIdInner(body, 'ytShortsGrid', buildYtShortsHtml(d));
    body = replaceAttrById(body, 'ytChannelLink', 'href', d.yt_channel_url);
    body = replaceAttrById(body, 'brandHomeLink', 'href', `/${lang}/`);
    body = replaceAttrById(body, 'suiteOrthoPill', 'href', `/${lang}/`);
    body = replaceAttrById(body, 'suiteMathPill', 'href', `/math/${lang}/`);
    body = replaceAttrById(body, 'suiteHunterPill', 'href', `/hunter/${lang}/`);
    body = replaceAttrById(body, 'suiteMathFooterLink', 'href', `/math/${lang}/`);
    body = replaceAttrById(body, 'suiteHunterFooterLink', 'href', `/hunter/${lang}/`);
    body = replaceAttrById(body, 'compGuideLink', 'href', d.comp_guide_url);
    body = replaceAttrById(body, 'footerCompLink', 'href', d.comp_guide_url);

    // Localized screenshots & alt text
    body = body.replace(/<img\b([^>]*\bdata-shot="([a-z0-9]+)"[^>]*)>/gi, (_, attrs, idx) => {
        const cap = d['cap_' + idx] || '';
        const newAlt = escAttr(`${cap} — ${d.brand}`);
        let updated = attrs
            .replace(/\bsrc="[^"]*"/i, `src="/assets/shots/${lang}-${idx}.webp"`)
            .replace(/\balt="[^"]*"/i, `alt="${newAlt}"`);
        return `<img${updated}>`;
    });

    // Comparison table mobile data-label attributes
    body = body
        .replace(/data-label="Meemaw"/g, `data-label="${escAttr(d.brand)}"`)
        .replace(/data-label="Projet Voltaire"/g, `data-label="${escAttr(d.th_c1)}"`)
        .replace(/data-label="Orthodidacte"/g, `data-label="${escAttr(d.th_c2)}"`)
        .replace(/data-label="Duolingo"/g, `data-label="${escAttr(d.th_c3)}"`)
        .replace(/data-label="Anton \/ Bescherelle"/g, `data-label="${escAttr(d.th_c4)}"`);

    for (const [k, v] of Object.entries(orthoAttrMap[lang])) {
        body = body.replaceAll(k, v);
    }

    body = markSelectOption(body, 'langSelectTop', lang);
    body = markSelectOption(body, 'langSelectFooter', lang);

    const outDir = path.join(ROOT, lang);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), head + orthoStyleBlock + body + orthoScriptsTail, 'utf8');
    console.log(`Built /${lang}/index.html`);
}

// ---------------------------------------------------------------------------
// 3. Build Meemaw Math Static Locales (/math/en/, /math/es/)
// ---------------------------------------------------------------------------
const mathStyleIdx = mathHtmlRaw.indexOf('<style>');
const mathBodyIdx = mathHtmlRaw.indexOf('</head>');
const mathScriptIdx = mathHtmlRaw.indexOf('<script>\n        const i18n =');

const mathHeadTop = mathHtmlRaw.slice(0, mathStyleIdx);
const mathStyleBlock = mathHtmlRaw.slice(mathStyleIdx, mathBodyIdx);
const mathBodyMarkup = mathHtmlRaw.slice(mathBodyIdx, mathScriptIdx);
const mathScriptsTail = mathHtmlRaw.slice(mathScriptIdx);

const mathAttrMap = {
    en: {
        'aria-label="Collection Meemaw"': 'aria-label="Meemaw Family Suite"',
        'title="Langue"': 'title="Language"',
        'aria-label="Langue"': 'aria-label="Language"',
        'alt="Meemaw vous salue"': 'alt="Meemaw waving hello"',
        'alt="QR Code App Store Meemaw Math"': 'alt="App Store QR Code for Meemaw Math"',
        'aria-label="Exemples de secrets"': 'aria-label="Mental math trick examples"',
        'alt="Meemaw décompose le calcul en 2 étapes"': 'alt="Meemaw breaking down the mental math shortcut in 2 steps"',
        'alt="Meemaw inspecte les pièges de calcul du quotidien"': 'alt="Meemaw inspecting everyday mental math traps"',
        'alt="Meemaw et le défi quotidien Mathus 24h"': 'alt="Meemaw with the daily 24h Mathus challenge"',
        'alt="Meemaw et le sablier Temps d\'Écran Apple"': 'alt="Meemaw holding the Apple Screen Time hourglass"',
        'aria-label="13 secrets du Dojo"': 'aria-label="13 Mental Math Dojo Secrets"',
        'alt="Mathus 24h Meemaw Math"': 'alt="Daily 24h Mathus Challenge by Meemaw Math"',
        'alt="La Caisse du Boulanger"': 'alt="Exact Change Register Game"',
        'alt="Pyramides et Carrés Magiques"': 'alt="Number Pyramids and Magic Squares"',
        'aria-label="Capture précédente"': 'aria-label="Previous screenshot"',
        'aria-label="Capture suivante"': 'aria-label="Next screenshot"',
        'alt="Bouclier Temps d\'Écran Apple"': 'alt="Apple Screen Time Parental Shield"',
        'alt="Duels Parents vs Enfants"': 'alt="Referee Meemaw for Kids vs. Parents Math Duels"',
        'alt="Meemaw célèbre votre Âge Cérébral avec son trophée"': 'alt="Meemaw celebrating your Brain Age with her trophy"'
    },
    es: {
        'aria-label="Collection Meemaw"': 'aria-label="Colección Familiar Meemaw"',
        'aria-label="Sections"': 'aria-label="Secciones"',
        'title="Langue"': 'title="Idioma"',
        'aria-label="Langue"': 'aria-label="Idioma"',
        'alt="Meemaw vous salue"': 'alt="Meemaw saludando"',
        'alt="QR Code App Store Meemaw Math"': 'alt="Código QR App Store Meemaw Mates"',
        'aria-label="Exemples de secrets"': 'aria-label="Ejemplos de trucos matemáticos"',
        'alt="Meemaw décompose le calcul en 2 étapes"': 'alt="Meemaw explicando el atajo mental en 2 pasos"',
        'alt="Meemaw inspecte les pièges de calcul du quotidien"': 'alt="Meemaw examinando las cuentas cotidianas"',
        'alt="Meemaw et le défi quotidien Mathus 24h"': 'alt="Meemaw con el reto diario Mathus 24h"',
        'alt="Meemaw et le sablier Temps d\'Écran Apple"': 'alt="Meemaw con el reloj de arena Tiempo en Pantalla"',
        'aria-label="13 secrets du Dojo"': 'aria-label="13 secretos del Dojo"',
        'alt="Mathus 24h Meemaw Math"': 'alt="Reto diario Mathus 24h de Meemaw Mates"',
        'alt="La Caisse du Boulanger"': 'alt="La Caja de la Panadería"',
        'alt="Pyramides et Carrés Magiques"': 'alt="Pirámides y Cuadrados Mágicos"',
        'aria-label="Capture précédente"': 'aria-label="Captura anterior"',
        'aria-label="Capture suivante"': 'aria-label="Captura siguiente"',
        'alt="Bouclier Temps d\'Écran Apple"': 'alt="Escudo Tiempo en Pantalla de Apple"',
        'alt="Duels Parents vs Enfants"': 'alt="Meemaw árbitro de duelos de cálculo familiares"',
        'alt="Meemaw célèbre votre Âge Cérébral avec son trophée"': 'alt="Meemaw celebrando tu Edad Cerebral con su trofeo"'
    }
};

function buildMathJsonLd(lang, d) {
    const pageUrl = `https://meemaw.app/math/${lang}/`;
    const mStore = `${mathStoreUrls[lang]}?ct=web_schema_math_${lang}&mt=8`;
    const isEn = lang === 'en';

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'SoftwareApplication',
                name: isEn ? 'Mental Math Games: Meemaw Math' : 'Cálculo Mental : Meemaw Mates',
                alternateName: ['Meemaw Math', 'Meemaw Mates', 'Mental Math Games: Meemaw Math', 'Cálculo Mental : Meemaw Mates'],
                operatingSystem: 'iOS, iPadOS',
                applicationCategory: 'EducationalApplication',
                inLanguage: ['fr', 'en', 'es'],
                url: pageUrl,
                downloadUrl: mStore,
                installUrl: mStore,
                trailer: { '@id': `${pageUrl}#trailer-video` },
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: isEn ? 'USD' : 'EUR',
                    description: isEn
                        ? 'Free download with daily mental math workout, free PRO trial, and Apple Family Sharing for up to 6 family members.'
                        : 'Descarga gratuita con entrenamiento diario de cálculo mental, prueba PRO gratis y En Familia de Apple para hasta 6 personas.'
                },
                aggregateRating: {
                    '@type': 'AggregateRating',
                    ratingValue: '4.9',
                    ratingCount: '94',
                    bestRating: '5',
                    worstRating: '1'
                },
                author: { '@type': 'Person', name: 'Xavier Larrodé' },
                description: d.meta_desc
            },
            {
                '@type': 'VideoObject',
                '@id': `${pageUrl}#trailer-video`,
                name: `${d.video_title} — ${isEn ? 'Mental Math Games: Meemaw Math' : 'Cálculo Mental : Meemaw Mates'}`,
                description: d.video_lead,
                thumbnailUrl: [`https://meemaw.app${d.video_poster}`],
                uploadDate: '2026-11-27T08:00:00+01:00',
                duration: 'PT27S',
                contentUrl: `https://meemaw.app${d.video_file}`,
                embedUrl: `${pageUrl}#video`,
                inLanguage: lang,
                isFamilyFriendly: true
            },
            {
                '@type': 'ItemList',
                name: isEn
                    ? '2026 Best Mental Math, Brain Age & Numerical IQ Apps on iPhone and iPad'
                    : 'Ranking 2026 de las mejores apps de cálculo mental, trucos de mates y CI en iPhone e iPad',
                itemListOrder: 'https://schema.org/ItemListOrderDescending',
                numberOfItems: 5,
                itemListElement: isEn
                    ? [
                        { '@type': 'ListItem', position: 1, name: 'Meemaw Math — 13 guided 2-step mental math secrets, Dr. Kawashima-style Brain Age, Numerical IQ, 11 games, Apple Screen Time Shield & Family Sharing', url: mStore },
                        { '@type': 'ListItem', position: 2, name: 'Elevate / Smartick — General cognitive mini-games or expensive monthly kid subscriptions without offline Family Sharing' },
                        { '@type': 'ListItem', position: 3, name: 'King of Math — Fast 4-choice multiple choice drills without step-by-step shortcut explanations' },
                        { '@type': 'ListItem', position: 4, name: 'Duolingo Math — Visual elementary basics without advanced mental math shortcuts' },
                        { '@type': 'ListItem', position: 5, name: 'Photomath — Camera equation solver that gives away answers instead of training mental reflexes' }
                    ]
                    : [
                        { '@type': 'ListItem', position: 1, name: 'Meemaw Mates — 13 secretos de cálculo mental en 2 pasos, Edad Cerebral estilo Dr. Kawashima, Retos de CI, 11 juegos, Tiempo en Pantalla y En Familia', url: mStore },
                        { '@type': 'ListItem', position: 2, name: 'Smartick / Anton — Plataformas escolares en línea (~39 €/mes por niño en Smartick)' },
                        { '@type': 'ListItem', position: 3, name: 'Rey de las Matemáticas — Test de 4 opciones sin explicación de métodos ni borrador' },
                        { '@type': 'ListItem', position: 4, name: 'Duolingo Math — Ejercicios visuales básicos de primaria' },
                        { '@type': 'ListItem', position: 5, name: 'Photomath — Escáner por cámara que da la respuesta hecha' }
                    ]
            },
            {
                '@type': 'FAQPage',
                mainEntity: [
                    { '@type': 'Question', name: stripTags(d.q1), acceptedAnswer: { '@type': 'Answer', text: stripTags(d.a1) } },
                    { '@type': 'Question', name: stripTags(d.q2), acceptedAnswer: { '@type': 'Answer', text: stripTags(d.a2) } },
                    { '@type': 'Question', name: stripTags(d.q3), acceptedAnswer: { '@type': 'Answer', text: stripTags(d.a3) } }
                ]
            }
        ]
    };
}

for (const lang of ['en', 'es']) {
    const d = MATH_I18N[lang];
    const canonicalUrl = `https://meemaw.app/math/${lang}/`;
    const keywords = lang === 'en'
        ? 'mental math app iPhone, mental math shortcuts, calculate percentages in head, Dr Kawashima brain training iOS, numerical IQ puzzles, no calculator math exam GCSE SAT, Apple Screen Time math lock, Meemaw Math'
        : 'app cálculo mental iPhone, Meemaw Mates, trucos de matemáticas rápidas, edad cerebral Dr Kawashima iOS, retos de CI numérico, exámenes mates sin calculadora Primaria ESO, control parental tiempo en pantalla';

    const head = updateHeadMeta(mathHeadTop, {
        htmlLang: lang,
        staticLang: lang,
        title: d.meta_title,
        desc: d.meta_desc,
        keywords,
        canonicalUrl,
        ogTitle: d.meta_title,
        ogDesc: d.meta_desc,
        jsonLd: buildMathJsonLd(lang, d)
    });

    let body = replaceDataI18n(mathBodyMarkup, d);
    body = replaceByIdInner(body, 'brandNameText', escHtml(d.brand));
    body = replaceByIdInner(body, 'suiteMathPill', escHtml(d.brand));
    body = replaceByIdInner(body, 'thMeemaw', escHtml(d.brand));
    body = replaceByIdInner(body, 'thKing', escHtml(d.th_king));
    if (d.th_c5) body = replaceByIdInner(body, 'thC5', escHtml(d.th_c5));
    body = replaceByIdInner(body, 'tabPct', escHtml(d.tab_pct));
    body = replaceByIdInner(body, 'footerCopy', escHtml(d.footer_copy));

    const tr0 = d.tricks[0];
    body = replaceByIdInner(body, 'slateExpr', escHtml(tr0.expr));
    body = replaceByIdInner(body, 'slateAnswerBtn', escHtml(tr0.ans));
    body = replaceByIdInner(body, 'step1Label', escHtml(d.step_1));
    body = replaceByIdInner(body, 'step2Label', escHtml(d.step_2));
    body = replaceByIdInner(body, 'step1Text', escHtml(tr0.s1));
    body = replaceByIdInner(body, 'step2Text', escHtml(tr0.s2));
    body = replaceByIdInner(body, 'trainerFootTag', escHtml(tr0.tag));

    body = replaceByIdInner(
        body,
        'secretsStrip',
        d.chips.map((c) => `<span class="secret-chip">${c}</span>`).join('')
    );

    const mBase = mathStoreUrls[lang];
    body = body
        .replace(
            'https://apps.apple.com/fr/app/calcul-mental-meemaw-math/id6824002615?ct=web_math_nav_fr&amp;mt=8',
            `${mBase}?ct=web_math_nav_${lang}&amp;mt=8`
        )
        .replace(
            'https://apps.apple.com/fr/app/calcul-mental-meemaw-math/id6824002615?ct=web_math_hero_fr&amp;mt=8',
            `${mBase}?ct=web_math_hero_${lang}&amp;mt=8`
        )
        .replace(
            'https://apps.apple.com/fr/app/calcul-mental-meemaw-math/id6824002615?ct=web_math_video_fr&amp;mt=8',
            `${mBase}?ct=web_math_video_${lang}&amp;mt=8`
        )
        .replace(
            'https://apps.apple.com/fr/app/calcul-mental-meemaw-math/id6824002615?ct=web_math_final_fr&amp;mt=8',
            `${mBase}?ct=web_math_final_${lang}&amp;mt=8`
        );

    body = replaceByIdInner(body, 'videoSoundLabel', escHtml(d.video_sound_off));
    body = replaceAttrById(body, 'mathTrailerVideo', 'poster', d.video_poster);
    body = replaceAttrById(body, 'mathTrailerVideo', 'aria-label', d.video_poster_alt);
    body = replaceAttrById(body, 'mathTrailerSource', 'data-src', d.video_file);
    body = replaceByIdInner(body, 'ytShortsGrid', buildYtShortsHtml(d));
    body = replaceAttrById(body, 'ytChannelLink', 'href', d.yt_channel_url);

    body = replaceAttrById(body, 'brandHomeLink', 'href', `/math/${lang}/`);
    body = replaceAttrById(body, 'suiteMathPill', 'href', `/math/${lang}/`);
    body = replaceAttrById(body, 'suiteOrthoPill', 'href', `/${lang}/`);
    body = body.replaceAll('href="/hunter/"', `href="/hunter/${lang}/"`);
    body = body.replace('<a href="/" class="suite-sibling">', `<a href="/${lang}/" class="suite-sibling">`);
    body = replaceAttrById(body, 'compGuideLink', 'href', d.comp_guide_url);
    body = replaceAttrById(body, 'footerCompLink', 'href', d.comp_guide_url);

    body = body.replace(/<img\b([^>]*\bdata-shot="(\d)"[^>]*)>/gi, (_, attrs, idx) => {
        const cap = d['cap_' + idx] || '';
        const newAlt = escAttr(`${cap} — ${d.brand}`);
        let updated = attrs
            .replace(/\bsrc="[^"]*"/i, `src="/math/assets/shots/${lang}-${idx}.webp"`)
            .replace(/\balt="[^"]*"/i, `alt="${newAlt}"`);
        return `<img${updated}>`;
    });

    body = body
        .replace(/data-label="Meemaw Math"/g, `data-label="${escAttr(d.brand)}"`)
        .replace(/data-label="Roi des Maths"/g, `data-label="${escAttr(d.th_king)}"`)
        .replace(/data-label="Anton \/ Smartick"/g, `data-label="${escAttr(d.th_c5 || 'Smartick / Anton')}"`);

    for (const [k, v] of Object.entries(mathAttrMap[lang])) {
        body = body.replaceAll(k, v);
    }

    body = markSelectOption(body, 'langSelectTop', lang);
    body = markSelectOption(body, 'langSelectFooter', lang);

    const outDir = path.join(ROOT, 'math', lang);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), head + mathStyleBlock + body + mathScriptsTail, 'utf8');
    console.log(`Built /math/${lang}/index.html`);
}

// ---------------------------------------------------------------------------
// 4. Build Meemaw Hunter Static Locales (/hunter/{en,es,de,it,pt-br,ja,ko}/)
// ---------------------------------------------------------------------------
const hunterHtmlRaw = fs.readFileSync(path.join(ROOT, 'hunter/index.html'), 'utf8');
const hunterStyleIdx = hunterHtmlRaw.indexOf('<style>');
const hunterBodyIdx = hunterHtmlRaw.indexOf('</head>');
const hunterInlineIdx = hunterHtmlRaw.indexOf('</section><script>(function(){var H=');
const hunterChapter2Idx = hunterHtmlRaw.indexOf('<!-- Chapter 2:');
const hunterMainCloseIdx = hunterHtmlRaw.indexOf('</main>');

const hunterHeadTop = hunterHtmlRaw.slice(0, hunterStyleIdx);
const hunterStyleBlock = hunterHtmlRaw.slice(hunterStyleIdx, hunterBodyIdx);
const hunterPart1 = hunterHtmlRaw.slice(hunterBodyIdx, hunterInlineIdx + '</section>'.length);
const hunterInlineScript = hunterHtmlRaw.slice(hunterInlineIdx + '</section>'.length, hunterChapter2Idx);
const hunterPart2 = hunterHtmlRaw.slice(hunterChapter2Idx, hunterMainCloseIdx);
const hunterScriptsTail = hunterHtmlRaw.slice(hunterMainCloseIdx);

const checkSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const chevronSvg = '<svg class="faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';

const hunterSimpleIds = [
    'navGestures', 'navVideo', 'navWorlds', 'navAirplay', 'navPrivacy', 'navDownload',
    'heroTitle', 'heroLead', 'ctaAppStore', 'ctaTestFlight', 'proofLocal', 'proofFree',
    'hudDemoLabel', 'hudScoreLabel', 'hudReloadBtn',
    'gesturesTitle', 'gesturesIntro', 'g1Title', 'g1Body', 'g2Title', 'g2Body', 'g3Title', 'g3Body', 'hardwareStrip',
    'videoTitle', 'videoLead',
    'worldsTitle', 'worldsIntro', 'arsenalTitle',
    'hqTitle', 'hqIntro', 'hqTrophiesNote',
    'airplayTitle', 'airplayBody', 'shotsTitle',
    'trustTitle', 'privacyHeading', 'privacyBody', 'privacyLinkLabel',
    'priceHeading', 'priceAmount', 'priceBody', 'termsLinkLabel',
    'faqTitle', 'closingTitle', 'closingSub', 'suiteLabel', 'suiteOrth', 'suiteMath',
    'footerRights', 'footerPrivacy', 'footerTerms', 'footerSuitePrivacy'
];

function buildHunterJsonLd(lang, p) {
    const htmlLang = lang === 'pt-br' ? 'pt-BR' : lang;
    const pageUrl = `https://meemaw.app/hunter/${lang}/`;
    const hStore = `https://apps.apple.com/app/id6831648316?ct=web_schema_hunter_${lang}&mt=8`;
    const currencyMap = { en: 'USD', ja: 'JPY', ko: 'KRW', 'pt-br': 'BRL', es: 'EUR', de: 'EUR', it: 'EUR' };
    const videoLang = lang === 'es' ? 'es' : 'en';

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'VideoGame',
                name: 'Meemaw Hunter',
                alternateName: ['MeemawHunter: AR Hand Shooter', 'MeemawHunter: Jeu Tir Caméra', 'Meemaw Hunter 60 FPS'],
                softwareVersion: '1.0.3',
                url: pageUrl,
                downloadUrl: hStore,
                installUrl: hStore,
                operatingSystem: 'iOS, iPadOS',
                applicationCategory: 'GameApplication',
                gamePlatform: ['iPhone', 'iPad', 'Apple TV via AirPlay'],
                playMode: ['SinglePlayer', 'MultiPlayer', 'CoOp'],
                numberOfPlayers: {
                    '@type': 'QuantitativeValue',
                    minValue: 1,
                    maxValue: 4
                },
                genre: ['Arcade Shooter', 'Western', 'Party Game', 'Camera Hand-Tracking Game'],
                inLanguage: [htmlLang, 'fr', 'en', 'es', 'de', 'it', 'pt-BR', 'ja', 'ko'],
                trailer: { '@id': `${pageUrl}#trailer-video` },
                featureList: [
                    `${p.g1Title} · ${p.g2Title} · ${p.g3Title}`,
                    ...(p.hqItems || []).map((it) => `${it.name}: ${it.desc}`),
                    p.airplayPoints[1],
                    p.privacyBullets[0]
                ],
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: currencyMap[lang] || 'USD',
                    description: `${p.priceBody} (${p.priceAmount})`
                },
                author: { '@type': 'Person', name: 'Xavier Larrodé' },
                description: p.metaDesc
            },
            {
                '@type': 'VideoObject',
                '@id': `${pageUrl}#trailer-video`,
                name: `${p.videoTitle} — Meemaw Hunter`,
                description: p.videoLead,
                thumbnailUrl: [`https://meemaw.app${p.videoPoster}`],
                uploadDate: '2026-11-27T08:00:00+01:00',
                duration: 'PT26S',
                contentUrl: `https://meemaw.app${p.videoFile}`,
                embedUrl: `${pageUrl}#video`,
                inLanguage: videoLang,
                isFamilyFriendly: true
            },
            {
                '@type': 'ItemList',
                name: `${p.metaTitle} — Arcade Light-Gun Comparison (2026)`,
                itemListOrder: 'https://schema.org/ItemListOrderDescending',
                numberOfItems: 4,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: `Meemaw Hunter (iPhone, iPad & 16:9 AirPlay TV) — ${p.proofLocal} · ${p.proofFree}`, url: hStore },
                    { '@type': 'ListItem', position: 2, name: 'Duck Hunt / Time Crisis — Classic console light-gun shooters requiring dedicated hardware' },
                    { '@type': 'ListItem', position: 3, name: 'Console Party Shooters (Switch Joy-Con) — Requires console and physical controllers' },
                    { '@type': 'ListItem', position: 4, name: 'Typical Mobile AR Camera Games — Often ad-supported or subscription-locked' }
                ]
            },
            {
                '@type': 'FAQPage',
                mainEntity: p.faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a }
                }))
            }
        ]
    };
}

for (const lang of ['en', 'es', 'de', 'it', 'pt-br', 'ja', 'ko']) {
    const p = HUNTER_I18N[lang];
    const htmlLang = lang === 'pt-br' ? 'pt-BR' : lang;
    const canonicalUrl = `https://meemaw.app/hunter/${lang}/`;
    const orthoSibling = lang === 'es' ? '/es/' : '/en/';
    const mathSibling = lang === 'es' ? '/math/es/' : '/math/en/';

    const head = updateHeadMeta(hunterHeadTop, {
        htmlLang,
        staticLang: lang,
        title: p.metaTitle,
        desc: p.metaDesc,
        canonicalUrl,
        ogTitle: p.metaTitle,
        ogDesc: p.metaDesc,
        jsonLd: buildHunterJsonLd(lang, p)
    });

    let p1 = hunterPart1;
    let p2 = hunterPart2;

    for (const id of hunterSimpleIds) {
        if (!p[id]) continue;
        const val = escHtml(p[id]);
        if (new RegExp(`\\bid="${id}"`, 'i').test(p1)) {
            p1 = replaceByIdInner(p1, id, val);
        } else if (new RegExp(`\\bid="${id}"`, 'i').test(p2)) {
            p2 = replaceByIdInner(p2, id, val);
        }
    }

    p1 = replaceByIdInner(p1, 'hudHint', escHtml(p.hudHint));
    p2 = replaceByIdInner(p2, 'videoSoundLabel', escHtml(p.videoSoundOff));
    p2 = replaceByIdInner(p2, 'videoAppStore', escHtml(p.ctaAppStore));
    p2 = replaceAttrById(p2, 'hunterTrailerVideo', 'poster', p.videoPoster);
    p2 = replaceAttrById(p2, 'hunterTrailerVideo', 'aria-label', p.videoPosterAlt);
    p2 = replaceAttrById(p2, 'hunterTrailerSource', 'data-src', p.videoFile);
    if (p.videoPoints) {
        const vListHtml = p.videoPoints.map((pt) => `<li>${checkSvg}<span>${escHtml(pt)}</span></li>`).join('');
        p2 = replaceByIdInner(p2, 'videoList', vListHtml);
    }
    p2 = replaceByIdInner(p2, 'closingAppStore', escHtml(p.ctaAppStore));
    p2 = replaceByIdInner(p2, 'closingTestFlight', escHtml(p.ctaTestFlight));

    // World tabs & initial World 0
    const w0 = p.worlds[0];
    const worldTabsHtml = p.worlds.map((w, idx) =>
        `<button type="button" role="tab" class="world-tab${idx === 0 ? ' is-active' : ''}" data-widx="${idx}" aria-selected="${idx === 0 ? 'true' : 'false'}"><span>${escHtml(`${idx + 1}. ${w.name}`)}</span><span class="world-pill ${w.free ? 'is-free' : 'is-pro'}">${escHtml(w.free ? p.freeBadge : p.fullBadge)}</span></button>`
    ).join('');
    p2 = replaceByIdInner(p2, 'worldTabs', worldTabsHtml);
    p2 = replaceAttrById(p2, 'theaterCritter', 'alt', w0.name);
    p2 = replaceByIdInner(p2, 'theaterName', escHtml(`1. ${w0.name}`));
    p2 = replaceByIdInner(p2, 'theaterDesc', escHtml(w0.desc));
    p2 = replaceByIdInner(p2, 'theaterBadge', escHtml(w0.free ? p.freeBadge : p.fullBadge));
    p2 = replaceByIdInner(p2, 'theaterWeapon', escHtml(`${p.weaponLabel} : ${w0.weapon}`));

    // Armory, Ranch HQ, AirPlay, localized screenshots, privacy, pricing, FAQs
    const armoryHtml = p.arsenalItems.map((it) =>
        `<div class="armory-item"><strong>${escHtml(it.name)}</strong><span>${escHtml(it.desc)}</span></div>`
    ).join('');
    p2 = replaceByIdInner(p2, 'armoryGrid', armoryHtml);

    if (p.hqItems) {
        const hqHtml = p.hqItems.map((it) =>
            `<div class="armory-item"><strong>${escHtml(it.name)}</strong><span>${escHtml(it.desc)}</span></div>`
        ).join('');
        p2 = replaceByIdInner(p2, 'hqGrid', hqHtml);
    }
    if (p.hqHeroAlt) {
        p2 = replaceAttrById(p2, 'hqHeroImg', 'alt', p.hqHeroAlt);
    }

    const airplayHtml = p.airplayPoints.map((pt) => `<li>${checkSvg}<span>${escHtml(pt)}</span></li>`).join('');
    p2 = replaceByIdInner(p2, 'airplayList', airplayHtml);

    const shotsHtml = p.shotsCaptions.map((cap, i) => {
        const num = String(i + 1).padStart(2, '0');
        const c = cap.trim();
        return `<figure class="shot-item"><img src="/hunter/assets/shots/${lang}/${num}-360.webp" srcset="/hunter/assets/shots/${lang}/${num}-360.webp 360w, /hunter/assets/shots/${lang}/${num}.webp 540w" sizes="(max-width: 1200px) 236px, 195px" alt="${escAttr(c)}" width="540" height="1170" loading="lazy" decoding="async"><figcaption>${escHtml(c)}</figcaption></figure>`;
    }).join('');
    p2 = replaceByIdInner(p2, 'shotsFilmstrip', shotsHtml);

    const privListHtml = p.privacyBullets.map((b) => `<li>${checkSvg}<span>${escHtml(b)}</span></li>`).join('');
    p2 = replaceByIdInner(p2, 'privacyList', privListHtml);

    const priceListHtml = p.priceBullets.map((b) => `<li>${checkSvg}<span>${escHtml(b)}</span></li>`).join('');
    p2 = replaceByIdInner(p2, 'priceList', priceListHtml);

    const faqHtml = p.faqs.map((f, idx) =>
        `<details${idx === 0 ? ' open' : ''}><summary><span>${escHtml(f.q)}</span>${chevronSvg}</summary><p>${escHtml(f.a)}</p></details>`
    ).join('');
    p2 = replaceByIdInner(p2, 'faqList', faqHtml);

    // Links & campaign tags
    p1 = replaceAttrById(p1, 'brandHomeLink', 'href', `/hunter/${lang}/`);
    p1 = replaceAttrById(p1, 'suiteHunterPill', 'href', `/hunter/${lang}/`);
    p1 = p1
        .replace('<a href="/" class="suite-link">Meemaw</a>', `<a href="${orthoSibling}" class="suite-link">Meemaw</a>`)
        .replace('<a href="/math/" class="suite-link">Meemaw Math</a>', `<a href="${mathSibling}" class="suite-link">Meemaw Math</a>`)
        .replace('ct=web_hunter_nav_fr&amp;mt=8', `ct=web_hunter_nav_${lang}&amp;mt=8`)
        .replace('ct=web_hunter_hero_fr&amp;mt=8', `ct=web_hunter_hero_${lang}&amp;mt=8`);

    p2 = replaceAttrById(p2, 'privacyLink', 'href', `/hunter/privacy.html?lang=${lang}`);
    p2 = replaceAttrById(p2, 'footerPrivacy', 'href', `/hunter/privacy.html?lang=${lang}`);
    p2 = replaceAttrById(p2, 'termsLink', 'href', `/hunter/terms.html?lang=${lang}`);
    p2 = replaceAttrById(p2, 'footerTerms', 'href', `/hunter/terms.html?lang=${lang}`);
    p2 = replaceAttrById(p2, 'suiteOrth', 'href', orthoSibling);
    p2 = replaceAttrById(p2, 'suiteMath', 'href', mathSibling);
    p2 = p2
        .replace('ct=web_hunter_video_fr&amp;mt=8', `ct=web_hunter_video_${lang}&amp;mt=8`)
        .replace('ct=web_hunter_final_fr&amp;mt=8', `ct=web_hunter_final_${lang}&amp;mt=8`);

    const localizedHead = head.replace(
        'app-argument=https://meemaw.app/hunter/',
        `app-argument=${canonicalUrl}`
    );

    // Localized alt attributes
    p1 = p1
        .replace('aria-label="6 balles"', () => 'aria-label="6/6"')
        .replace('alt="Cible volante Ball-Trap"', () => `alt="${escAttr(w0.name)}"`)
        .replace('alt="Raton bandit hors-la-loi"', () => 'alt="Outlaw Bandit"')
        .replace('alt="Tarte dorée bonus"', () => 'alt="Golden Bonus Pie"');
    p2 = p2
        .replace('alt="Main ouverte pour viser"', () => `alt="${escAttr(p.g1Title)}"`)
        .replace('alt="Pincer deux doigts pour tirer"', () => `alt="${escAttr(p.g2Title)}"`)
        .replace('alt="Tourner la main pour recharger"', () => `alt="${escAttr(p.g3Title)}"`)
        .replace(
            'alt="Meemaw Hunter projeté en 16:9 sur une télévision via AirPlay, avec l’iPhone posé juste sous l’écran TV face au joueur"',
            () => `alt="${escAttr(p.airplayTitle)}"`
        );

    p1 = markSelectOption(p1, 'langSelect', lang);

    const staticPack = {
        hudHint: p.hudHint,
        hudEmpty: p.hudEmpty,
        freeBadge: p.freeBadge,
        fullBadge: p.fullBadge,
        weaponLabel: p.weaponLabel,
        videoSoundOff: p.videoSoundOff,
        videoSoundOn: p.videoSoundOn,
        videoFile: p.videoFile,
        videoPoster: p.videoPoster,
        worlds: p.worlds
    };
    const localizedInlineScript = `<script>(function(){var st=window.__PAGE_STATIC_LANG||'fr';var q=new URLSearchParams(location.search).get('lang');var l=st;if(q){var rq=q.toLowerCase();l=rq.indexOf('pt')===0?'pt-br':({fr:1,en:1,es:1,de:1,it:1,'pt-br':1,ja:1,ko:1}[rq]?rq:({fr:1,en:1,es:1,de:1,it:1,ja:1,ko:1}[rq.slice(0,2)]?rq.slice(0,2):st));}window.__HUNTER_INIT_LANG=l;var sel=document.getElementById('langSelect');if(sel)sel.value=l;})();</script>\n\n        `;
    const localizedTail = hunterScriptsTail.replace(
        /window\.__STATIC_PACK=\{[\s\S]*?\};window\.addEventListener/,
        () => `window.__STATIC_PACK=${JSON.stringify(staticPack)};window.addEventListener`
    );

    const outDir = path.join(ROOT, 'hunter', lang);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), localizedHead + hunterStyleBlock + p1 + localizedInlineScript + p2 + localizedTail, 'utf8');
    console.log(`Built /hunter/${lang}/index.html`);
}

// ---------------------------------------------------------------------------
// 5. Regenerate Complete Reciprocal Hreflang Sitemap (sitemap.xml)
// ---------------------------------------------------------------------------
const clusters = [
    {
        priority: '1.0',
        changefreq: 'weekly',
        xDefault: 'https://meemaw.app/',
        alternates: [
            { hreflang: 'fr', loc: 'https://meemaw.app/' },
            { hreflang: 'en', loc: 'https://meemaw.app/en/' },
            { hreflang: 'es', loc: 'https://meemaw.app/es/' }
        ]
    },
    {
        priority: '0.95',
        changefreq: 'weekly',
        xDefault: 'https://meemaw.app/math/',
        alternates: [
            { hreflang: 'fr', loc: 'https://meemaw.app/math/' },
            { hreflang: 'en', loc: 'https://meemaw.app/math/en/' },
            { hreflang: 'es', loc: 'https://meemaw.app/math/es/' }
        ]
    },
    {
        priority: '0.95',
        changefreq: 'weekly',
        xDefault: 'https://meemaw.app/hunter/',
        alternates: [
            { hreflang: 'fr', loc: 'https://meemaw.app/hunter/' },
            { hreflang: 'en', loc: 'https://meemaw.app/hunter/en/' },
            { hreflang: 'es', loc: 'https://meemaw.app/hunter/es/' },
            { hreflang: 'de', loc: 'https://meemaw.app/hunter/de/' },
            { hreflang: 'it', loc: 'https://meemaw.app/hunter/it/' },
            { hreflang: 'pt-BR', loc: 'https://meemaw.app/hunter/pt-br/' },
            { hreflang: 'ja', loc: 'https://meemaw.app/hunter/ja/' },
            { hreflang: 'ko', loc: 'https://meemaw.app/hunter/ko/' }
        ]
    },
    {
        priority: '0.9',
        changefreq: 'monthly',
        xDefault: 'https://meemaw.app/comparatif-applications-orthographe-dictee.html',
        alternates: [
            { hreflang: 'fr', loc: 'https://meemaw.app/comparatif-applications-orthographe-dictee.html' },
            { hreflang: 'en', loc: 'https://meemaw.app/best-french-spelling-dictation-app.html' },
            { hreflang: 'es', loc: 'https://meemaw.app/mejor-app-ortografia-dictado-frances.html' }
        ]
    },
    {
        priority: '0.9',
        changefreq: 'monthly',
        xDefault: 'https://meemaw.app/math/best-mental-math-app-comparison.html',
        alternates: [
            { hreflang: 'fr', loc: 'https://meemaw.app/math/comparatif-applications-calcul-mental-brevet.html' },
            { hreflang: 'en', loc: 'https://meemaw.app/math/best-mental-math-app-comparison.html' },
            { hreflang: 'es', loc: 'https://meemaw.app/math/mejor-app-calculo-mental-matematicas.html' }
        ]
    }
];

const standaloneUrls = [
    { loc: 'https://meemaw.app/privacy.html', priority: '0.4', changefreq: 'yearly' },
    { loc: 'https://meemaw.app/terms.html', priority: '0.4', changefreq: 'yearly' },
    { loc: 'https://meemaw.app/hunter/privacy.html', priority: '0.4', changefreq: 'yearly' },
    { loc: 'https://meemaw.app/hunter/terms.html', priority: '0.4', changefreq: 'yearly' },
    { loc: 'https://meemaw.app/support/', priority: '0.4', changefreq: 'yearly' }
];

const xmlEntries = [];
for (const c of clusters) {
    const linksBlock = [
        ...c.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.loc}"/>`),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${c.xDefault}"/>`
    ].join('\n');

    for (const item of c.alternates) {
        let videoXml = '';
        if (c.xDefault === 'https://meemaw.app/') {
            const op = ORTHO_I18N[item.hreflang] || ORTHO_I18N.fr;
            videoXml = `\n    <video:video>
      <video:thumbnail_loc>https://meemaw.app${op.video_poster}</video:thumbnail_loc>
      <video:title>${escHtml(`${op.video_title} — Meemaw`)}</video:title>
      <video:description>${escHtml(op.video_lead)}</video:description>
      <video:content_loc>https://meemaw.app${op.video_file}</video:content_loc>
      <video:duration>26</video:duration>
      <video:publication_date>2026-11-27T08:00:00+01:00</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>`;
        } else if (c.xDefault === 'https://meemaw.app/math/') {
            const mp = MATH_I18N[item.hreflang] || MATH_I18N.fr;
            videoXml = `\n    <video:video>
      <video:thumbnail_loc>https://meemaw.app${mp.video_poster}</video:thumbnail_loc>
      <video:title>${escHtml(`${mp.video_title} — ${mp.brand}`)}</video:title>
      <video:description>${escHtml(mp.video_lead)}</video:description>
      <video:content_loc>https://meemaw.app${mp.video_file}</video:content_loc>
      <video:duration>27</video:duration>
      <video:publication_date>2026-11-27T08:00:00+01:00</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>`;
        } else if (c.xDefault === 'https://meemaw.app/hunter/') {
            const lk = item.hreflang === 'pt-BR' ? 'pt-br' : item.hreflang;
            const hp = HUNTER_I18N[lk] || HUNTER_I18N.fr;
            videoXml = `\n    <video:video>
      <video:thumbnail_loc>https://meemaw.app${hp.videoPoster}</video:thumbnail_loc>
      <video:title>${escHtml(`${hp.videoTitle} — Meemaw Hunter`)}</video:title>
      <video:description>${escHtml(hp.videoLead)}</video:description>
      <video:content_loc>https://meemaw.app${hp.videoFile}</video:content_loc>
      <video:duration>26</video:duration>
      <video:publication_date>2026-11-27T08:00:00+01:00</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
    </video:video>`;
        }
        xmlEntries.push(`  <url>
    <loc>${item.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${c.changefreq}</changefreq>
    <priority>${c.priority}</priority>
${linksBlock}${videoXml}
  </url>`);
    }
}

for (const s of standaloneUrls) {
    xmlEntries.push(`  <url>
    <loc>${s.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${s.changefreq}</changefreq>
    <priority>${s.priority}</priority>
  </url>`);
}

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${xmlEntries.join('\n')}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`Built sitemap.xml (${xmlEntries.length} URLs)`);
