const fs = require('fs');
let locCode = fs.readFileSync('lib/locations.ts', 'utf8');
const distMapMatch = locCode.match(/export const DISTANCE_MAP:\s*Record<string,\s*number>\s*=\s*(\{[\s\S]*?\});/);
const DISTANCE_MAP = eval('(' + distMapMatch[1] + ')');

let matchCode = fs.readFileSync('lib/matchmaking.ts', 'utf8');
const routesMatch = matchCode.match(/export const ROUTES:\s*string\[]\[]\s*=\s*(\[[\s\S]*?\]);/);
let routes = eval('(' + routesMatch[1] + ')');

const routeLocs = new Set();
routes.forEach(r => r.forEach(l => routeLocs.add(l)));

const distLocs = Object.keys(DISTANCE_MAP);
const orphans = distLocs.filter(l => !routeLocs.has(l));

// Define some broad geographic buckets that map to an existing route index
// Route 30: Central / Core (index 29)
// Route 28: South / Airport (index 27)
// Route 32: East / Uppal (index 31)
// Route 29: West / IT Corridor (index 28)
// Route 5: North / Medchal (index 4)
// Route 20: North-West / Kompally (index 19)

const keywordMap = {
  'east': 31, 'uppal': 31, 'ramanthapur': 31, 'nagole': 31, 'dilsukhnagar': 31, 'bhuvanagiri': 31, 'choutuppal': 31, 'bibi nagar': 31, 'ghatkesar': 31, 'pocharam': 31, 'boduppal': 31, 'peerzadiguda': 31, 'medipally': 31,
  'south': 27, 'airport': 27, 'shamshabad': 27, 'ramoji': 27, 'ibrahimpatnam': 27, 'gurunanak': 27, 'srisailam': 27, 'barkas': 27, 'pahadi sharif': 27, 'tukkuguda': 27, 'chandrayangutta': 27, 'saroornagar': 27, 'karmanghat': 27, 'champapet': 27, 'kanchanbagh': 27, 'drdo': 27, 'midhani': 27, 'balapur': 27, 'hardware park': 27, 'fab city': 27, 'raviryala': 27, 'falaknuma': 27, 'charminar': 27, 'owaisi': 27, 'santoshnagar': 27, 'shah ali banda': 27,
  'west': 28, 'hitech': 28, 'gachibowli': 28, 'wonderla': 28, 'ocean park': 28, 'cbit': 28, 'mgit': 28, 'vjit': 28, 'icfai': 28, 'moinabad': 28, 'jbiet': 28, 'shankerpally': 28, 'appa': 28, 'kali mandir': 28, 'sun city': 28, 'bandlaguda': 28, 'chevella': 28, 'aziznagar': 28, 'mindspace': 28, 'cyber': 28, 'tcs synergy': 28, 'google': 28, 'microsoft': 28, 't-hub': 28, 'knowledge city': 28, 'inorbit': 28, 'durgam': 28, 'botanical': 28, 'shilparamam': 28, 'hitex': 28,
  'north': 4, 'medchal': 4, 'kompally': 4, 'suchitra': 4, 'bolarum': 4, 'alwal': 4, 'yapral': 4, 'kowkoor': 4, 'hakimpet': 4, 'thumkunta': 4, 'shamirpet': 4, 'bits': 4, 'nalsar': 4, 'kandlakoya': 4, 'cmr': 4, 'iare': 4, 'mlrit': 4,
  'central': 29, 'secunderabad': 29, 'nampally': 29, 'kacheguda': 29, 'mgbs': 29, 'koti': 29, 'abids': 29, 'hussain sagar': 29, 'tank bund': 29, 'lumbini': 29, 'ntr gardens': 29, 'birla mandir': 29, 'snow world': 29, 'salar jung': 29, 'chowmahalla': 29, 'qutb shahi': 29, 'kbr park': 29, 'necklace road': 29, 'basheerbagh': 29, 'secretariat': 29, 'domalguda': 29, 'ashok nagar': 29, 'park lane': 29, 'sd road': 29, 'sindhi colony': 29, 'rasoolpura': 29, 'sanjeevaiah': 29, 'banjara': 29, 'mecca': 29, 'makka': 29, 'laad bazaar': 29, 'madina': 29, 'pathergatti': 29, 'nayapul': 29, 'darulshifa': 29, 'purani': 29, 'yakutpura': 29, 'dabirpura': 29, 'chanchalguda': 29, 'hussaini': 29, 'bahadurpura': 29, 'kishan bagh': 29, 'mir alam': 29, 'moghalpura': 29, 'khilwat': 29, 'moazzam': 29, 'begum': 29, 'mangalhat': 29, 'dhoolpet': 29, 'goshamahal': 29, 'mallepally': 29,
  'nw': 19, 'kukatpally': 19, 'jntu': 19, 'nizampet': 19, 'pragathi': 19, 'bachupally': 19, 'griet': 19, 'gokaraju': 19, 'mallampet': 19, 'kazipally': 19, 'ida bolarum': 19, 'gowdavalli': 19, 'sultanpur': 19, 'kandi': 19, 'iit hyderabad': 19, 'rudraram': 19, 'sangareddy': 19, 'muthangi': 19, 'isnapur': 19, 'rc puram': 19, 'ramachandrapuram': 19, 'bhel': 19, 'erragadda': 19, 'moosapet': 19, 'balanagar': 19, 'shapur': 19, 'suraram': 19, 'ayodhya': 19, 'dhulapally': 19, 'doolapally': 19, 'st martin': 19, 'dairy farm': 19, 'fox sagar': 19, 'petbasheerabad': 19, 'yellampet': 19, 'athvelli': 19, 'pudur': 19, 'apparel': 19, 'siva sivani': 19, 'loyola': 19
};

orphans.forEach(o => {
  let assigned = 29; // default Central
  for (let [kw, idx] of Object.entries(keywordMap)) {
    if (o.toLowerCase().includes(kw)) {
      assigned = idx;
      break;
    }
  }
  routes[assigned].push(o);
});

// Now sort all routes strictly by DISTANCE_MAP descending!
routes = routes.map(r => r.sort((a,b) => DISTANCE_MAP[b] - DISTANCE_MAP[a]));

const newRoutesStr = '[\n  ' + routes.map(r => JSON.stringify(r)).join(',\n  ') + '\n]';
const newMatchCode = matchCode.replace(/export const ROUTES:\s*string\[]\[]\s*=\s*\[[\s\S]*?\];/, 'export const ROUTES: string[][] = ' + newRoutesStr + ';');
fs.writeFileSync('lib/matchmaking.ts', newMatchCode);
console.log('Routes updated and sorted by distance successfully!');

