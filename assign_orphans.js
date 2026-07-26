const fs = require('fs');
let matchCode = fs.readFileSync('lib/matchmaking.ts', 'utf8');

const routesMatch = matchCode.match(/export const ROUTES:\s*string\[]\[]\s*=\s*(\[[\s\S]*?\]);\s*export function/);
let routes = eval('(' + routesMatch[1] + ')');

let locCode = fs.readFileSync('lib/locations.ts', 'utf8');
const distMapMatch = locCode.match(/export const DISTANCE_MAP:\s*Record<string,\s*number>\s*=\s*(\{[\s\S]*?\});/);
const DISTANCE_MAP = eval('(' + distMapMatch[1] + ')');

const routeLocs = new Set();
routes.forEach(r => r.forEach(l => routeLocs.add(l)));
const orphans = Object.keys(DISTANCE_MAP).filter(l => !routeLocs.has(l));

const indexMap = {
  31: ['uppal', 'ramanthapur', 'nagole', 'sreenidhi', 'ghatkesar', 'pocharam', 'boduppal', 'peerzadiguda', 'medipally', 'bhuvanagiri', 'bibi nagar', 'choutuppal', 'anurag', 'dsl virtue'],
  12: ['dilsukhnagar', 'lb nagar', 'vanastalipuram', 'hayathnagar', 'kothapet', 'saroornagar', 'karmanghat', 'champapet', 'b n reddy', 'victoria', 'hastinapuram', 'turkayamjal', 'bonguloor', 'cvr', 'nadergul', 'gurunanak', 'ibrahimpatnam'],
  9: ['airport', 'shamshabad', 'tukkuguda', 'pahadi sharif', 'srisailam', 'adibatla', 'maheshwaram', 'raviryala', 'hardware park', 'fab city'],
  14: ['koti', 'nampally', 'abids', 'lakdikapul', 'khairatabad', 'assembly', 'secretariat', 'tank bund', 'hussain sagar', 'lumbini', 'ntr', 'snow world', 'birla mandir', 'basheerbagh', 'domalguda', 'ashok nagar', 'sanjeevaiah'],
  1: ['secunderabad', 'paradise', 'begumpet', 'somajiguda', 'punjagutta', 'ameerpet', 'sr nagar', 'erragadda', 'moosapet', 'balanagar', 'gandhi hospital', 'kacheguda', 'rtc x', 'chikkadpally', 'musheerabad', 'park lane', 'sd road', 'sindhi colony', 'rasoolpura', 'yashoda', 'sunshine', 'nims'],
  0: ['lb nagar', 'malakpet', 'charminar', 'mecca', 'makka', 'laad bazaar', 'madina', 'pathergatti', 'nayapul', 'afzal', 'darulshifa', 'purani', 'yakutpura', 'dabirpura', 'chanchalguda', 'hussaini', 'bahadurpura', 'kishan bagh', 'mir alam', 'moghalpura', 'khilwat', 'moazzam', 'begum', 'mangalhat', 'dhoolpet', 'goshamahal', 'mallepally', 'shah ali banda', 'santoshnagar', 'owaisi', 'chandrayangutta', 'falaknuma', 'barkas', 'balapur', 'drdo', 'midhani', 'aliabad', 'mgbs', 'salar jung', 'chowmahalla'],
  5: ['shamshabad', 'mehdipatnam', 'gachibowli', 'hitech', 'miyapur', 'mindspace', 'inorbit', 'durgam', 'shilparamam', 'cyber', 'raidurg', 'knowledge city', 'aig', 'madhapur'],
  6: ['tellapur', 'nallagandla', 'financial', 'amazon', 'wipro', 'nanakramguda', 't-hub'],
  7: ['patancheru', 'bhel', 'rc puram', 'ramachandrapuram', 'isnapur', 'muthangi', 'sangareddy', 'kandi', 'iit'],
  4: ['medchal', 'kompally', 'suchitra', 'bolarum', 'kandlakoya', 'shamirpet', 'bits', 'nalsar', 'cmr', 'iare', 'mlrit', 'yellampet', 'athvelli', 'pudur', 'apparel', 'siva sivani', 'loyola', 'suraram', 'jeedimetla', 'chintal', 'fox sagar', 'dairy farm', 'st martin'],
  3: ['ecil', 'as rao nagar', 'neredmet', 'malkajgiri', 'yapral', 'kowkoor', 'alwal', 'hakimpet', 'thumkunta', 'cherlapally', 'mallapur', 'nacharam', 'keesara', 'yamnampet', 'army college', 'sainikpuri', 'dammaiguda', 'kushaiguda', 'trimulgherry'],
  8: ['attapur', 'mehdipatnam', 'tolichowki', 'retibowli', 'masab tank', 'cbit', 'mgit', 'vjit', 'moinabad', 'jbiet', 'shankerpally', 'chilkur', 'gandipet', 'mrugavani', 'ocean park', 'wonderla', 'appa', 'kali mandir', 'sun city', 'bandlaguda', 'chevella', 'aziznagar'],
  16: ['kukatpally', 'kphb', 'jntu', 'nizampet', 'pragathi', 'bachupally', 'griet', 'gokaraju', 'mallampet', 'kazipally', 'ida bolarum', 'gowdavalli', 'sultanpur', 'rudraram', 'bahadurpally', 'tech mahindra', 'whisper', 'bollaram', 'nexus', 'forum'],
};

orphans.forEach(o => {
  let assigned = 1; 
  for (let [idxStr, kws] of Object.entries(indexMap)) {
    if (kws.some(kw => o.toLowerCase().includes(kw))) {
      assigned = parseInt(idxStr);
      break;
    }
  }
  // Make sure we only insert into one of the master routes, not pushing new ones
  if (!routes[assigned]) {
      routes[assigned] = [];
  }
  routes[assigned].push(o);
});

Object.keys(indexMap).forEach(idxStr => {
  const idx = parseInt(idxStr);
  routes[idx] = [...new Set(routes[idx])].sort((a,b) => DISTANCE_MAP[b] - DISTANCE_MAP[a]);
});

const newRoutesStr = '[\n  ' + routes.map(r => JSON.stringify(r)).join(',\n  ') + '\n]';
const newMatchCode = matchCode.replace(routesMatch[1], newRoutesStr);
fs.writeFileSync('lib/matchmaking.ts', newMatchCode);
console.log('Orphans elegantly merged into the 32 master routes by proximity!');
