// Génère src/app/data/etablissements-superieur.ts depuis le jeu de données officiel.
// Usage : node scripts/generer-etablissements.mjs src/app/data/etablissements-superieur.ts
import { writeFileSync } from 'node:fs';
const B = 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-etablissements-enseignement-superieur/records';
const champs = 'uo_lib_officiel,uo_lib,nom_court,sigle,uucr_nom,com_nom,type_d_etablissement';
const tous = [];
for (let offset = 0; ; offset += 100) {
  const r = await (await fetch(`${B}?select=${champs}&limit=100&offset=${offset}&order_by=uo_lib`)).json();
  tous.push(...r.results);
  if (offset + 100 >= r.total_count) break;
}
const lignes = tous.map((e) => {
  const nom = (e.uo_lib_officiel || e.uo_lib).trim();
  const autres = [...new Set([e.uo_lib, e.nom_court, e.sigle].filter((x) => x && x.trim() !== nom))].join(' · ');
  const ville = (e.uucr_nom || e.com_nom || '').trim();
  return [nom, autres, ville];
}).sort((a, b) => a[0].localeCompare(b[0], 'fr'));
const corps = lignes.map((l) => '  [' + l.map((x) => JSON.stringify(x)).join(', ') + ']').join(',\n');
writeFileSync(process.argv[2], `// ============================================================
// ÉTABLISSEMENTS D'ENSEIGNEMENT SUPÉRIEUR (champ « Université » du profil)
// ============================================================
//
// [nom officiel, autres noms (recherche), ville]
//
// Source : « Principaux établissements d'enseignement supérieur »,
// ministère de l'Enseignement supérieur et de la Recherche
// (data.enseignementsup-recherche.gouv.fr), Licence Ouverte 2.0.
// Extraction du ${new Date().toISOString().slice(0, 10)} : ${lignes.length} établissements.
// Les autres établissements (BTS, écoles privées…) restent saisissables librement.
// ============================================================

export type Etablissement = readonly [nom: string, autresNoms: string, ville: string];

export const ETABLISSEMENTS: readonly Etablissement[] = [
${corps}
];
`);
console.log(lignes.length, 'établissements');
