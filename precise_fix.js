const fs = require('fs');
let matchCode = fs.readFileSync('lib/matchmaking.ts', 'utf8');
const routesMatch = matchCode.match(/export const ROUTES:\s*string\[]\[]\s*=\s*(\[[\s\S]*?\]);\s*export function getPossibleRoutes/);
let routes = eval('(' + routesMatch[1] + ')');

let locCode = fs.readFileSync('lib/locations.ts', 'utf8');
const distMapMatch = locCode.match(/export const DISTANCE_MAP:\s*Record<string,\s*number>\s*=\s*(\{[\s\S]*?\});/);
const DISTANCE_MAP = eval('(' + distMapMatch[1] + ')');

const injections = [
  { loc: 'afzalgunj', routeIdx: 29 },
  { loc: 'yellampet', routeIdx: 4 },
  { loc: 'mgbs', routeIdx: 29 },
  { loc: 'yashoda hospital somajiguda', routeIdx: 29 },
  { loc: 'yamnampet', routeIdx: 3 },
  { loc: 'basheerbagh', routeIdx: 29 },
  { loc: 'athvelli', routeIdx: 4 },
  { loc: 'yakutpura', routeIdx: 29 },
  { loc: 'vidya jyothi institute of technology', routeIdx: 5 },
  { loc: 'victoria memorial home', routeIdx: 12 },
  { loc: 'vanastalipuram', routeIdx: 12 },
  { loc: 'aig hospitals', routeIdx: 5 },
  { loc: 'aig', routeIdx: 5 },
  { loc: 'aliabad', routeIdx: 29 },
  { loc: 'amberpet', routeIdx: 29 },
  { loc: 'amazon campus', routeIdx: 6 },
  { loc: 'amazon', routeIdx: 6 },
  { loc: 'anurag university', routeIdx: 13 },
  { loc: 'army college of dental sciences', routeIdx: 3 },
  { loc: 'adibatla', routeIdx: 27 },
  { loc: 'tcs adibatla', routeIdx: 27 },
  { loc: 'maheshwaram', routeIdx: 27 },
  { loc: 'b n reddy nagar', routeIdx: 12 },
  { loc: 'cherlapally', routeIdx: 31 },
  { loc: 'dhoolpet', routeIdx: 29 },
  { loc: 'fox sagar lake', routeIdx: 19 },
  { loc: 'gandhi hospital', routeIdx: 1 },
];

injections.forEach(inj => {
  if (!routes[inj.routeIdx].includes(inj.loc)) {
    routes[inj.routeIdx].push(inj.loc);
  }
});

const touched = [...new Set(injections.map(i => i.routeIdx))];
touched.forEach(idx => {
  routes[idx] = routes[idx].sort((a,b) => DISTANCE_MAP[b] - DISTANCE_MAP[a]);
});

const routeLocs = new Set();
routes.forEach(r => r.forEach(l => routeLocs.add(l)));
const orphans = Object.keys(DISTANCE_MAP).filter(l => !routeLocs.has(l));

const extraRoutes = { north: [], south: [], east: [], west: [], central: [], nw: [] };

const keywordMap = {
  'east': 'east', 'uppal': 'east', 'ramanthapur': 'east', 'nagole': 'east', 'dilsukhnagar': 'east', 'bhuvanagiri': 'east', 'choutuppal': 'east', 'bibi nagar': 'east', 'ghatkesar': 'east', 'pocharam': 'east', 'boduppal': 'east', 'peerzadiguda': 'east', 'medipally': 'east',
  'south': 'south', 'airport': 'south', 'shamshabad': 'south', 'ramoji': 'south', 'ibrahimpatnam': 'south', 'gurunanak': 'south', 'srisailam': 'south', 'barkas': 'south', 'pahadi sharif': 'south', 'tukkuguda': 'south', 'chandrayangutta': 'south', 'saroornagar': 'south', 'karmanghat': 'south', 'champapet': 'south', 'kanchanbagh': 'south', 'drdo': 'south', 'midhani': 'south', 'balapur': 'south', 'hardware park': 'south', 'fab city': 'south', 'raviryala': 'south', 'falaknuma': 'south', 'charminar': 'south', 'owaisi': 'south', 'santoshnagar': 'south', 'shah ali banda': 'south',
  'west': 'west', 'hitech': 'west', 'gachibowli': 'west', 'wonderla': 'west', 'ocean park': 'west', 'cbit': 'west', 'mgit': 'west', 'vjit': 'west', 'icfai': 'west', 'moinabad': 'west', 'jbiet': 'west', 'shankerpally': 'west', 'appa': 'west', 'kali mandir': 'west', 'sun city': 'west', 'bandlaguda': 'west', 'chevella': 'west', 'aziznagar': 'west', 'mindspace': 'west', 'cyber': 'west', 'tcs synergy': 'west', 'google': 'west', 'microsoft': 'west', 't-hub': 'west', 'knowledge city': 'west', 'inorbit': 'west', 'durgam': 'west', 'botanical': 'west', 'shilparamam': 'west', 'hitex': 'west',
  'north': 'north', 'medchal': 'north', 'kompally': 'north', 'suchitra': 'north', 'bolarum': 'north', 'alwal': 'north', 'yapral': 'north', 'kowkoor': 'north', 'hakimpet': 'north', 'thumkunta': 'north', 'shamirpet': 'north', 'bits': 'north', 'nalsar': 'north', 'kandlakoya': 'north', 'cmr': 'north', 'iare': 'north', 'mlrit': 'north',
  'central': 'central', 'secunderabad': 'central', 'nampally': 'central', 'kacheguda': 'central', 'mgbs': 'central', 'koti': 'central', 'abids': 'central', 'hussain sagar': 'central', 'tank bund': 'central', 'lumbini': 'central', 'ntr gardens': 'central', 'birla mandir': 'central', 'snow world': 'central', 'salar jung': 'central', 'chowmahalla': 'central', 'qutb shahi': 'central', 'kbr park': 'central', 'necklace road': 'central', 'basheerbagh': 'central', 'secretariat': 'central', 'domalguda': 'central', 'ashok nagar': 'central', 'park lane': 'central', 'sd road': 'central', 'sindhi colony': 'central', 'rasoolpura': 'central', 'sanjeevaiah': 'central', 'banjara': 'central', 'mecca': 'central', 'makka': 'central', 'laad bazaar': 'central', 'madina': 'central', 'pathergatti': 'central', 'nayapul': 'central', 'darulshifa': 'central', 'purani': 'central', 'yakutpura': 'central', 'dabirpura': 'central', 'chanchalguda': 'central', 'hussaini': 'central', 'bahadurpura': 'central', 'kishan bagh': 'central', 'mir alam': 'central', 'moghalpura': 'central', 'khilwat': 'central', 'moazzam': 'central', 'begum': 'central', 'mangalhat': 'central', 'dhoolpet': 'central', 'goshamahal': 'central', 'mallepally': 'central',
  'nw': 'nw', 'kukatpally': 'nw', 'jntu': 'nw', 'nizampet': 'nw', 'pragathi': 'nw', 'bachupally': 'nw', 'griet': 'nw', 'gokaraju': 'nw', 'mallampet': 'nw', 'kazipally': 'nw', 'ida bolarum': 'nw', 'gowdavalli': 'nw', 'sultanpur': 'nw', 'kandi': 'nw', 'iit hyderabad': 'nw', 'rudraram': 'nw', 'sangareddy': 'nw', 'muthangi': 'nw', 'isnapur': 'nw', 'rc puram': 'nw', 'ramachandrapuram': 'nw', 'bhel': 'nw', 'erragadda': 'nw', 'moosapet': 'nw', 'balanagar': 'nw', 'shapur': 'nw', 'suraram': 'nw', 'ayodhya': 'nw', 'dhulapally': 'nw', 'doolapally': 'nw', 'st martin': 'nw', 'dairy farm': 'nw', 'fox sagar': 'nw', 'petbasheerabad': 'nw', 'yellampet': 'nw', 'athvelli': 'nw', 'pudur': 'nw', 'apparel': 'nw', 'siva sivani': 'nw', 'loyola': 'nw'
};

orphans.forEach(o => {
  let assigned = 'central';
  for (let [kw, bucket] of Object.entries(keywordMap)) {
    if (o.toLowerCase().includes(kw)) {
      assigned = bucket;
      break;
    }
  }
  extraRoutes[assigned].push(o);
});

Object.values(extraRoutes).forEach(r => {
  if (!r.includes('vnr vjiet')) r.push('vnr vjiet');
});
if(extraRoutes.north.length > 1) { extraRoutes.north.push('kompally'); extraRoutes.north.push('medchal'); }
if(extraRoutes.south.length > 1) { extraRoutes.south.push('shamshabad'); extraRoutes.south.push('attapur'); }
if(extraRoutes.east.length > 1) { extraRoutes.east.push('uppal'); extraRoutes.east.push('tarnaka'); }
if(extraRoutes.west.length > 1) { extraRoutes.west.push('gachibowli'); extraRoutes.west.push('miyapur'); }
if(extraRoutes.central.length > 1) { extraRoutes.central.push('ameerpet'); extraRoutes.central.push('secunderabad'); }
if(extraRoutes.nw.length > 1) { extraRoutes.nw.push('kukatpally'); extraRoutes.nw.push('jntu'); }

Object.values(extraRoutes).forEach(r => {
  if (r.length > 1) {
    routes.push(r.sort((a,b) => DISTANCE_MAP[b] - DISTANCE_MAP[a]));
  }
});

const newRoutesStr = '[\n  ' + routes.map(r => JSON.stringify(r)).join(',\n  ') + '\n]';
const newMatchCode = matchCode.replace(routesMatch[1], newRoutesStr);
fs.writeFileSync('lib/matchmaking.ts', newMatchCode);
console.log('Routes restored safely!');

