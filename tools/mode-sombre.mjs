// ============================================================
// MODE SOMBRE : CONVERSION DES COULEURS EN VARIABLES CSS
// ============================================================
//
// Usage : node tools/mode-sombre.mjs
//
// 1. Dans chaque fichier .scss de src/, remplace les couleurs écrites
//    en dur (#1646a0, $blue...) par une variable CSS qui dépend de
//    l'USAGE de la couleur :
//      --b1646a0 : couleur de fond   (background)
//      --f1646a0 : couleur de texte  (color, fill, stroke...)
//      --l1646a0 : bordure / ombre   (border, outline, box-shadow)
// 2. Génère src/styles/_palette.scss : valeur claire (la couleur
//    d'origine) et valeur sombre calculée (espace OKLCH, teinte conservée) :
//      - fonds clairs → surfaces sombres (blanc = cartes, gris = page) ;
//      - textes foncés → textes clairs ; textes colorés éclaircis ;
//      - bordures claires → bordures sombres ;
//      - couleurs vives et surfaces bleu nuit (boutons, bandeaux) inchangées.
//
// Le script peut être relancé sans risque (les couleurs déjà converties
// sont conservées) : à relancer après avoir ajouté des couleurs.
// Les exceptions réglées à la main sont dans src/styles/_theme-sombre.scss.
// ============================================================

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const RACINE = 'src';
const PALETTE = 'src/styles/_palette.scss';

// ------------------------------------------------------------
// Fichiers
// ------------------------------------------------------------

function fichiersScss(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom);
    if (statSync(chemin).isDirectory()) {
      return fichiersScss(chemin);
    }
    return nom.endsWith('.scss') && chemin.replace(/\\/g, '/') !== PALETTE ? [chemin] : [];
  });
}

// ------------------------------------------------------------
// Usage d'une propriété
// ------------------------------------------------------------

function usage(propriete) {
  const p = propriete.toLowerCase();
  if (p.startsWith('--') || p.startsWith('$')) {
    return null;
  }
  if (p === 'background' || p.startsWith('background-')) {
    return 'b';
  }
  if (['color', 'fill', 'stroke', 'caret-color', '-webkit-text-fill-color', 'accent-color',
       'text-decoration', 'text-decoration-color'].includes(p)) {
    return 'f';
  }
  if (p.startsWith('border') || p.startsWith('outline') || p === 'box-shadow'
      || p === 'text-shadow' || p === 'column-rule' || p === 'filter') {
    return 'l';
  }
  return null;
}

const normaliser = (hex) => {
  const h = hex.slice(1).toLowerCase();
  return h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
};

// ------------------------------------------------------------
// Conversion d'un fichier
// ------------------------------------------------------------

const jetons = new Set();
const HEX = /#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])/g;
const DEJA = /var\(--([bfl])([0-9a-f]{6})\)/g;

function variablesSass(texte) {
  const brut = new Map();
  for (const m of texte.matchAll(/^\s*\$([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/gm)) {
    brut.set(m[1], m[2].trim().replace(/\s*!default$/, ''));
  }
  const resoudre = (nom, vus = new Set()) => {
    const valeur = brut.get(nom);
    if (!valeur || vus.has(nom)) {
      return null;
    }
    vus.add(nom);
    if (/^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(valeur)) {
      return normaliser(valeur);
    }
    const ref = valeur.match(/^\$([a-zA-Z0-9_-]+)$/);
    return ref ? resoudre(ref[1], vus) : null;
  };
  const couleurs = new Map();
  for (const nom of brut.keys()) {
    const hex = resoudre(nom);
    if (hex) {
      couleurs.set(nom, hex);
    }
  }
  return couleurs;
}

/** Couleurs écrites par leur nom. */
const NOMS = { white: 'ffffff', black: '000000' };

function convertirValeur(valeur, genre, vars) {
  let v = valeur.replace(/(?<![\w-])(white|black)(?![\w-])/g, (nom) => {
    jetons.add(genre + NOMS[nom]);
    return `var(--${genre}${NOMS[nom]})`;
  });
  v = v.replace(HEX, (hex) => {
    const h = normaliser(hex);
    jetons.add(genre + h);
    return `var(--${genre}${h})`;
  });
  v = v.replace(/(?<![\w.-])\$([a-zA-Z0-9_-]+)/g, (tout, nom) => {
    const h = vars.get(nom);
    if (!h) {
      return tout;
    }
    jetons.add(genre + h);
    return `var(--${genre}${h})`;
  });
  // Voile blanc opaque (barre de navigation « verre dépoli »...) : suit le thème.
  if (genre === 'b') {
    v = v.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(0?\.\d+|1)\s*\)/g, (tout, a) => {
      const alpha = parseFloat(a);
      if (alpha < 0.5) {
        return tout;
      }
      jetons.add('bffffff');
      return `color-mix(in srgb, var(--bffffff) ${Math.round(alpha * 100)}%, transparent)`;
    });
  }
  return v;
}

function convertirFichier(chemin) {
  const texte = readFileSync(chemin, 'utf8');
  for (const m of texte.matchAll(DEJA)) {
    jetons.add(m[1] + m[2]);
  }
  const vars = variablesSass(texte);
  const lignes = texte.split('\n');
  let propriete = null;
  let commentaire = false;

  const resultat = lignes.map((ligneComplete) => {
    // Fins de ligne Windows : le « \r » est retiré puis remis tel quel.
    const cr = ligneComplete.endsWith('\r') ? '\r' : '';
    return traiter(cr ? ligneComplete.slice(0, -1) : ligneComplete) + cr;
  });

  function traiter(brute) {
    if (commentaire) {
      if (brute.includes('*/')) {
        commentaire = false;
      }
      return brute;
    }
    if (/^\s*\/\*/.test(brute) && !brute.includes('*/')) {
      commentaire = true;
      return brute;
    }
    if (/^\s*\/\//.test(brute)) {
      return brute;
    }

    // Règle sur une seule ligne : « .x { background: #fff; color: $blue; } »
    if (/\{[^{}]*:[^{}]*\}/.test(brute)) {
      return brute.replace(/\{([^{}]*)\}/g, (bloc, interieur) => '{' + interieur.replace(
        /(^|;)(\s*)([a-zA-Z-][\w-]*)(\s*:\s*)([^;]+)/g,
        (tout, sep, esp, prop, deux, valeur) => {
          const genre = usage(prop);
          return genre ? sep + esp + prop + deux + convertirValeur(valeur, genre, vars) : tout;
        }) + '}');
    }

    const decl = brute.match(/^(\s*)([$a-zA-Z-][\w-]*)(\s*:\s*)(.*)$/);
    let sortie = brute;

    if (decl && !/^\s*[&.#:@]/.test(brute) && !decl[4].trim().endsWith('{')) {
      propriete = decl[2];
      const genre = usage(propriete);
      if (genre) {
        sortie = decl[1] + decl[2] + decl[3] + convertirValeur(decl[4], genre, vars);
      }
      if (decl[4].includes(';') || decl[4].trim().endsWith('{')) {
        propriete = null;
      }
    } else if (propriete) {
      // Suite d'une déclaration sur plusieurs lignes.
      const genre = usage(propriete);
      if (genre) {
        sortie = convertirValeur(brute, genre, vars);
      }
      if (brute.includes(';')) {
        propriete = null;
      }
    }
    return sortie;
  }

  const nouveau = resultat.join('\n');
  if (nouveau !== texte) {
    writeFileSync(chemin, nouveau);
    return true;
  }
  return false;
}

// ------------------------------------------------------------
// Couleurs : sRGB <-> OKLCH
// ------------------------------------------------------------

const versLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const depuisLin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexVersOklch(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => versLin(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: Math.atan2(B, A) };
}

function oklchVersRgb({ L, C, H }) {
  const A = C * Math.cos(H);
  const B = C * Math.sin(H);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ];
}

function oklchVersHex(couleur) {
  // Hors de l'espace sRGB : on réduit la saturation jusqu'à y revenir.
  let c = { ...couleur };
  for (let i = 0; i < 40; i++) {
    const rgb = oklchVersRgb(c);
    if (rgb.every((v) => v >= -0.0005 && v <= 1.0005)) {
      return '#' + rgb.map((v) => Math.round(Math.min(1, Math.max(0, depuisLin(v))) * 255)
        .toString(16).padStart(2, '0')).join('');
    }
    c = { ...c, C: c.C * 0.92 };
  }
  return '#808080';
}

// ------------------------------------------------------------
// Valeur sombre d'une couleur selon son usage
// ------------------------------------------------------------

function sombre(genre, hex) {
  const c = hexVersOklch(hex);
  const neutre = c.C < 0.02;

  if (genre === 'b') {
    if (c.L < 0.85) {
      return null; // couleur vive ou surface bleu nuit : inchangée
    }
    if (neutre) {
      if (c.L >= 0.995) return oklchVersHex({ L: 0.235, C: 0.012, H: 4.48 });   // cartes
      if (c.L >= 0.955) return oklchVersHex({ L: 0.19, C: 0.012, H: 4.48 });    // fond de page
      return oklchVersHex({ L: 0.30, C: 0.012, H: 4.48 });                      // gris de survol
    }
    return oklchVersHex({ L: 0.29, C: Math.min(c.C * 1.4, 0.06), H: c.H });     // teintes pâles
  }

  if (genre === 'f') {
    if (c.L >= 0.9) {
      return null; // texte blanc posé sur une couleur : inchangé
    }
    // Textes gris (même légèrement bleutés) : le plus foncé devient le plus clair.
    if (c.C < 0.07) {
      return oklchVersHex({ L: Math.min(0.96, 1.0 - c.L * 0.35), C: c.C * 0.6, H: c.H });
    }
    if (c.L >= 0.78) {
      return null;
    }
    return oklchVersHex({ L: 0.76 + c.L * 0.08, C: Math.min(c.C, 0.14), H: c.H });
  }

  // Bordures et ombres
  if (c.L < 0.8) {
    return null;
  }
  return neutre
    ? oklchVersHex({ L: 0.34, C: 0.012, H: 4.48 })
    : oklchVersHex({ L: 0.38, C: Math.min(c.C, 0.06), H: c.H });
}

// ------------------------------------------------------------
// Programme
// ------------------------------------------------------------

const modifies = fichiersScss(RACINE).filter(convertirFichier);

const tries = [...jetons].sort();
const clair = tries.map((j) => `  --${j}: #${j.slice(1)};`);
const fonce = tries
  .map((j) => [j, sombre(j[0], j.slice(1))])
  .filter(([, v]) => v)
  .map(([j, v]) => `  --${j}: ${v};`);

writeFileSync(PALETTE, `// ============================================================
// PALETTE CLAIRE / SOMBRE — FICHIER GÉNÉRÉ, NE PAS MODIFIER À LA MAIN
// ============================================================
// Généré par : node tools/mode-sombre.mjs
// --b… : fonds, --f… : textes, --l… : bordures et ombres.
// Exceptions réglées à la main : src/styles/_theme-sombre.scss
// ============================================================

:root {
${clair.join('\n')}
}

:root[data-theme='dark'] {
${fonce.join('\n')}
}
`);

console.log(`${modifies.length} fichier(s) convertis, ${tries.length} couleurs, `
  + `${fonce.length} adaptées au mode sombre → ${relative('.', PALETTE)}`);
for (const f of modifies) {
  console.log('  ' + relative('.', f));
}
