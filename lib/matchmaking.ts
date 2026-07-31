import { DISTANCE_MAP } from './locations';

export const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace('qutbullapur', 'quthbullapur').replace('hitech', 'hitec').replace('hi-tech', 'hitec').replace('balnagar', 'balanagar');

const PARENT_MAPPING: Record<string, string> = {
  "s grand": "bachupally",
  "hyderabad spice": "bachupally",
  "pista house bachupally": "bachupally",
  "pista house": "bachupally",
  "pragathi nagar kaman": "pragathi nagar",
  "simhapuri kaman": "bachupally",
  "bakers heaven": "bachupally",
  "dosthi biryani's": "bachupally",
  "eat magic.in": "bachupally",
  "kammani telugu kitchen": "bachupally",
  "biryani factory": "bachupally",
  "vnr hostel": "vnr vjiet",
  "mams hospitals": "bachupally",
  "mamata academy of medical sciences": "bachupally",
  "reach super speciality hospital": "bachupally",
  "relief hospital pragathi nagar": "pragathi nagar",
  "silver oaks international school": "bachupally",
  "kennedy high the global school": "bachupally",
  "mallampet lake": "mallampet",
  "bachupally police station": "bachupally",
  "angaara restaurant": "nizampet",
  "allah's kitchen and bar": "nizampet",
  "taqila lounge and restaurant": "bachupally",
  "polar bear": "nizampet",
  "the golden barrel": "bachupally",
  "dominos": "bachupally"
};

export const findLocIndex = (route: string[], queryLoc: string) => {
  let q = queryLoc.toLowerCase().trim();
  if (!q) return -1;
  
  if (PARENT_MAPPING[q]) {
    q = PARENT_MAPPING[q];
  }
  let idx = route.findIndex(node => node.toLowerCase().trim() === q);
  if (idx !== -1) return idx;
  const regex = new RegExp(`\\b${q}\\b`, 'i');
  idx = route.findIndex(node => regex.test(node));
  if (idx !== -1) return idx;
  const normQ = normalize(queryLoc);
  return route.findIndex(node => {
    const n = normalize(node);
    return normQ.includes(n) || n.includes(normQ);
  });
};

export const ROUTES: string[][] = [
  ["balapur","chandrayangutta x road","kamineni hospital lb nagar","drdo township","falaknuma palace","kishan bagh","mir alam tank","bahadurpura","aliabad","chanchalguda","patancheru","beeramguda kaman","bhel","chandanagar","miyapur","barkas","midhani","santoshnagar","owaisi hospital","shah ali banda","chowmahalla palace","purani haveli","yakutpura","hussaini alam","moghalpura","khilwat","charminar","mahatma gandhi bus station (mgbs)","salar jung museum","mecca masjid","makka masjid","laad bazaar","darulshifa","dabirpura","madina circle","pathergatti","nayapul","afzal gunj","mangalhat","dhoolpet","madina","afzalgunj","begum bazaar","goshamahal","moazzam jahi market","mallepally","vnr vjiet"],
  ["ramoji film city","snist","mvsr engineering college","badangpet","lb nagar","tkr college","meerpet","kanchanbagh","icfai business school","dilsukhnagar","himayat sagar","sivarampalli","moosarambagh","vidya jyothi institute of technology","osmania university","nehru zoological park","osman sagar","narsapur","saidabad","chaitanya bharathi institute of technology","malakpet","amberpet","shivam road","mahatma gandhi bus station","pvnr expressway","bvrit narsapur","nallakunta","kacheguda station","kacheguda railway station","koti","qutb shahi tombs","gandhi hospital","safilguda","abids","secunderabad station","golconda fort","secunderabad club","microsoft campus","yashoda hospital secunderabad","kim hospitals secunderabad","secunderabad railway station","lakdi ka pool","khairatabad","necklace road","tcs synergy park","google campus","care hospitals banjara hills","sunshine hospitals","jubilee bus station","park lane","sd road","somajiguda","gvk one mall","gvk mall","kbr park","apollo hospitals jubilee hills","yashoda hospital somajiguda","nims","basavatarakam indo american cancer hospital","sindhi colony","rasoolpura","banjara hills road no 12","banjara hills road no 10","banjara hills road no 1","ameerpet metro","jubilee hills checkpost","cable bridge","botanical garden","hyderabad public school","hitex exhibition center","sanjeeva reddy nagar","sarath city capital mall","lingampally railway station","erragadda gokul theatre","mrec","malla reddy engineering college","maisammaguda","moosapet y junction","balnagar","balanagar x roads","shapur nagar","petbasheerabad","ayodhya nagar","dhulapally","doolapally","st. martin's engineering college","vnr vjiet"],
  ["yusufguda temple","yusufguda check post","jubilee check post","madapur","hi-tech city","kothaguda","kondapur","hafeezpet","miyapur x roads","vnr vjiet"],
  ["yamnampet","keesaragutta","keesara","mallapur","cherlapally","nacharam","attapur","ecil x roads","thumkunta","kushaiguda","retibowli","dammaiguda","mehdipatnam","hakimpet","army college of dental sciences","yapral","kowkoor","masab tank","temple alwal","banjara hills","punjagutta","ameerpet","sr nagar","erragadda","vnr vjiet"],
  ["shamirpet","nalsar university","bits pilani hyderabad","mettuguda","chilkalguda x rds","rtc x rds","anandbagh","musheerabad","narayanguda fly over","malkajgiri","himayat nagar","liberty","khairatabad","bolarum","athvelli","loyola academy","yellampet","suchitra junction","suraram x roads","dairy farm road","apparel park","kandlakoya","siva sivani","cmr group of institutions","st martins","fox sagar lake","mlrit","iare","ida bolarum","vnr vjiet"],
  ["shamshabad airport","shamshabad bus stop","gachibowli wipro circle","inorbit mall madhapur","inorbit mall","durgam cheruvu","mindspace it park","dlf cyber city","raheja mindspace","knowledge city","salarpuria sattva knowledge city","aig hospitals","aig","shilparamam","cyber towers","mothinagar signal","pr nagar","bharathnagar fly over","moosapet","rainbow vista","lodha bellezza","brand factory","road no 1","kphb","jntu","addagutta","pragathi nagar","vnr vjiet"],
  ["amazon campus","amazon","t-hub","kukatpally","ramdev hosp","vasanth nagar kaman","miyapur metro","nizampet x roads","sanghamithra","hanuman temple","hill county","bachupally","vnr vjiet"],
  ["sangareddy","kandi","iit hyderabad","lanco hills","muthangi","manikonda marri chettu","isnapur","khazaguda","gachibowli","bio diversity park","ikea","hi-tech city rly stn fly over","rc puram","ramachandrapuram","bhel mig","nexus mall","manjeera mall","vnr vjiet"],
  ["wonderla","chevella","chilkur balaji temple","shankerpally","mrugavani national park","moinabad","jbiet","aziznagar","vjit","ocean park","gandipet","cbit","mgit","appa junction","kali mandir","bandlaguda jagir","sun city","masjidbanda","hcu","nallagandla fly over","bhel","miyapur x roads","bachupally","vnr vjiet"],
  ["maheshwaram","adibatla","tcs adibatla","fab city","rajiv gandhi international airport","srisailam highway","hardware park","raviryala","tukkuguda","pahadi sharif","nagole","uppal","tarnaka","secunderabad","himalaya book store","jbs","tadbund","bowenpally","balanagar","vnr vjiet"],
  ["ecil","radhika","sainikpuri","neredmet x roads","thirumalgiri","bowenpally","bapuji nagar","suchitra","kompally","vnr vjiet"],
  ["old alwal ig statue","father balaiah ngr","suchitra","qutbullapur","chintal shapur signal","gajularamaram","vnr vjiet"],
  ["gurunanak institutions","ibrahimpatnam","cvr college of engineering","bonguloor","turkayamjal","nadergul","vanastalipuram","b n reddy nagar","hastinapuram","lb nagar","karmanghat","saroornagar","champapet","saroornagar lake","victoria memorial home","kothapet","dilsukhnagar","dilsukhnagar bus station","malakpet","koti","abids","nampally","lakdikapul","khairatabad","panjagutta","ameerpet","sr nagar","erragadda","moosapet","kukatpally","kphb","jntu","nizampet","bachupally (vnr)","vnr vjiet"],
  ["kachiguda","rtc x roads","chikkadpally","musheerabad","secunderabad","begumpet","ameerpet","sr nagar","erragadda","moosapet","kukatpally","kphb","jntu","nizampet","bachupally (vnr)","vnr vjiet"],
  ["uppal","tarnaka","secunderabad","nampally station","basheerbagh","ashok nagar","lumbini park","bowenpally","balanagar","birla mandir","ntr gardens","snow world","nampally railway station","secretariat","domalguda","hussain sagar","tank bund","sanjeevaiah park","moosapet","kukatpally","kphb","jntu","nizampet","bachupally (vnr)","vnr vjiet"],
  ["ecil","as rao nagar","neredmet","malkajgiri","trimulgherry","bowenpally","balanagar","moosapet","kukatpally","kphb","jntu","nizampet","bachupally (vnr)","vnr vjiet"],
  ["rudraram","medchal","suraram","suchitra","jeedimetla","chintal","moosapet","kompally","balanagar","nexus mall kukatpally","nexus mall, hyd","forum sujana mall","kukatpally","kukatpally metro","gowdavalli","kphb phase 6","kphb","kphb colony","kphb phase 1","jntu","jntu metro","sultanpur","kphb phase 9","bollaram industrial area","nizampet","whisper valley","kazipally","pragathi nagar kaman","mallampet","griet","gokaraju rangaraju","bahadurpally","tech mahindra bahadurpally","bachupally x roads","bachupally (vnr)","vnr vjiet","vnr vjiet, bachupally"],
  ["shamshabad","chandrayangutta","attapur","mehdipatnam","tolichowki","shaikpet","lanco hills","manikonda","raidurg","hitech city","madhapur","kondapur","hafeezpet","miyapur","bachupally (vnr)","vnr vjiet"],
  ["tellapur","nallagandla","financial district","gachibowli","kondapur","hafeezpet","miyapur","bachupally (vnr)","vnr vjiet"],
  ["patancheru","bhel","chanda nagar","madinaguda","miyapur","bachupally (vnr)","vnr vjiet"],
  ["attapur","mehdipatnam","tolichowki","gachibowli","hi-tech city","kukatpally","kphb","jntu","nizampet","bachupally (vnr)","vnr vjiet"],
  ["shamshabad","orr","narsingi","kokapet","bachupally exit","bachupally","vnr vjiet"],
  ["medchal","orr","dundigal","bachupally exit","bachupally","vnr vjiet"],
  ["patancheru","orr","bachupally exit","bachupally","vnr vjiet"],
  ["lb nagar","dilsukhnagar","malakpet","nampally","lakdikapul","punjagutta","ameerpet","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["uppal","habsiguda","tarnaka","secunderabad","paradise","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["koti","lakdikapul","ameerpet","kukatpally","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["ameerpet","kukatpally","kphb","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["hi-tech city","mindspace","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["gachibowli","kondapur","kphb","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["financial district","nanakramguda","gachibowli","kondapur","hafeezpet","miyapur","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["bhuvanagiri","choutuppal","bibi nagar","infosys pocharam","ghatkesar","pocharam","sreenidhi institute of science and technology","anurag university","medipally","peerzadiguda","dsl virtue mall uppal","uppal x roads","boduppal","ramanthapur","suchitra","jeedimetla","dundigal","kompally","gundlapochampally","gandimaisamma","bowrampet","bachupally","vnr vjiet"],
  ["attapur","upperpally","mehdipatnam","rethibowli","tolichowki","gachibowli","hi-tech city","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["secunderabad","paradise","bowenpally","balanagar","moosapet","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["panjagutta","ameerpet","esi","sr nagar","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["miyapur","hafeezpet","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["shamshabad","aramghar","attapur","mehdipatnam","gachibowli","hi-tech city","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["shamshabad orr","kokapet","narsingi","gachibowli orr","bachupally exit","bachupally","vnr vjiet"],
  ["airport","shamshabad","rajendranagar","attapur","mehdipatnam","masab tank","lakdikapul","khairatabad","punjagutta","ameerpet","esi","erragadda","bharat nagar","moosapet","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["financial district","kokapet","narsingi","khajaguda","manikonda","tolichowki","gachibowli","raidurg","hi-tech city","madhapur","kondapur","hafeezpet","miyapur","allwyn x roads","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["assembly","gandhi bhavan","nampally","sultan bazar","mgbs","chaderghat","dilsukhnagar","lb nagar","hayathnagar","punjagutta","ameerpet","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["secunderabad east","parade ground","paradise","bowenpally","balanagar","moosapet","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["nagole","stadium","ngri","habsiguda","tarnaka","mettuguda","secunderabad","paradise","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["sainikpuri","kapra","ecil","as rao nagar","neredmet","malkajgiri","bowenpally","kukatpally","kphb","jntu","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["medchal","kompally","alwal","suchitra","jeedimetla","suraram","quthbullapur","dundigal","gandimaisamma","bachupally","vnr vjiet"],
  ["patancheru","beeramguda","bhel","lingampally","chanda nagar","madinaguda","miyapur","allwyn x roads","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["kukatpally","kphb","jntu","miyapur","allwyn x roads","nizampet","pragathi nagar","bachupally","vnr vjiet"],
  ["gachibowli","kondapur","kphb","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["miyapur","hafeezpet","allwyn x roads","nizampet","pragathi nagar","vnr vjiet"],
  ["kphb","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["lb nagar","dilsukhnagar","malakpet","nampally","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["uppal","tarnaka","secunderabad","paradise","kukatpally","jntu","vnr vjiet"],
  ["airport","outer ring road","bachupally exit","vnr vjiet"],
  ["tarnaka","habsiguda","secunderabad","paradise","kukatpally","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["dilsukhnagar","chaderghat","nampally","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["mehdipatnam","masab tank","punjagutta","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["attapur","mehdipatnam","punjagutta","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["tolichowki","gachibowli","kondapur","kphb","jntu","vnr vjiet"],
  ["manikonda","khajaguda","gachibowli","kondapur","kphb","jntu","vnr vjiet"],
  ["kompally","suchitra","jeedimetla","suraram","bachupally","vnr vjiet"],
  ["alwal","suchitra","jeedimetla","suraram","bachupally","vnr vjiet"],
  ["ecil","as rao nagar","malkajgiri","bowenpally","kukatpally","jntu","vnr vjiet"],
  ["kapra","ecil","malkajgiri","bowenpally","kukatpally","jntu","vnr vjiet"],
  ["sainikpuri","as rao nagar","ecil","bowenpally","kukatpally","jntu","vnr vjiet"],
  ["neredmet","malkajgiri","bowenpally","kukatpally","jntu","vnr vjiet"],
  ["beeramguda","bhel","chanda nagar","miyapur","nizampet","vnr vjiet"],
  ["lingampally","chanda nagar","miyapur","nizampet","pragathi nagar","vnr vjiet"],
  ["bhel","madinaguda","miyapur","nizampet","pragathi nagar","vnr vjiet"],
  ["patancheru","bhel","chanda nagar","miyapur","vnr vjiet"],
  ["medchal","kompally","suchitra","suraram","bachupally","vnr vjiet"],
  ["dundigal","gandimaisamma","bachupally","vnr vjiet"],
  ["quthbullapur","suraram","bachupally","vnr vjiet"],
  ["nagole","uppal","tarnaka","secunderabad","kukatpally","jntu","vnr vjiet"],
  ["hayathnagar","lb nagar","dilsukhnagar","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["financial district","nanakramguda","gachibowli","kondapur","kphb","jntu","vnr vjiet"],
  ["kokapet","narsingi","gachibowli","kondapur","jntu","vnr vjiet"],
  ["narsingi","gachibowli","kondapur","kphb","jntu","vnr vjiet"],
  ["rajendranagar","attapur","mehdipatnam","ameerpet","kukatpally","vnr vjiet"],
  ["raidurg","hi-tech city","madhapur","kphb","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["hi-tech city","madhapur","kphb","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["madhapur","kphb","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["jubilee hills","madhapur","kphb","jntu","vnr vjiet"],
  ["road no. 5","jubilee hills","madhapur","jntu","vnr vjiet"],
  ["yusufguda","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["begumpet","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["paradise","secunderabad","balanagar","kukatpally","jntu","vnr vjiet"],
  ["secunderabad east","paradise","kukatpally","jntu","vnr vjiet"],
  ["parade ground","paradise","kukatpally","jntu","vnr vjiet"],
  ["mettuguda","secunderabad","paradise","kukatpally","jntu","vnr vjiet"],
  ["tarnaka","mettuguda","secunderabad","kukatpally","jntu","vnr vjiet"],
  ["habsiguda","tarnaka","secunderabad","kukatpally","jntu","vnr vjiet"],
  ["ngri","habsiguda","tarnaka","secunderabad","jntu","vnr vjiet"],
  ["stadium","uppal","tarnaka","secunderabad","jntu","vnr vjiet"],
  ["nagole","uppal","tarnaka","secunderabad","kukatpally","jntu","vnr vjiet"],
  ["rtc x rds","musheerabad","secunderabad","paradise","kukatpally","vnr vjiet"],
  ["narayanguda","chikkadpally","rtc x rds","musheerabad","kukatpally","vnr vjiet"],
  ["sultan bazar","mgbs","nampally","ameerpet","kukatpally","vnr vjiet"],
  ["mgbs","nampally","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["omc","mgbs","nampally","ameerpet","vnr vjiet"],
  ["gandhi bhavan","nampally","ameerpet","kukatpally","vnr vjiet"],
  ["assembly","lakdikapul","khairatabad","ameerpet","vnr vjiet"],
  ["khairatabad","punjagutta","ameerpet","kukatpally","vnr vjiet"],
  ["punjagutta","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["esi hospital","erragadda","bharat nagar","kukatpally","jntu","vnr vjiet"],
  ["bharat nagar","moosapet","kukatpally","jntu","vnr vjiet"],
  ["moosapet","kukatpally","jntu","vnr vjiet"],
  ["balanagar","kukatpally","jntu","nizampet","vnr vjiet"],
  ["kukatpally","kphb","jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["jntu","nizampet","pragathi nagar","vnr vjiet"],
  ["miyapur","allwyn x roads","nizampet","pragathi nagar","vnr vjiet"],
  ["dilsukhnagar","mgbs","ameerpet","kukatpally","jntu","vnr vjiet"],
  ["lb nagar","dilsukhnagar","mgbs","ameerpet","kukatpally","jntu","vnr vjiet"]
];

export function getPossibleRoutes(rideOrigin: string, rideDest: string): { index: number, path: string[] }[] {
  const rO = rideOrigin.toLowerCase();
  const rD = rideDest.toLowerCase();


  const validRoutes: { index: number, path: string[] }[] = [];

  if (rD.includes("vnr") || rD.includes("campus")) {
    ROUTES.forEach((route, index) => {
      const dIndex = findLocIndex(route, rO);
      const vnrIndex = findLocIndex(route, rD);
      if (dIndex !== -1 && vnrIndex !== -1 && dIndex <= vnrIndex) {
        validRoutes.push({ index, path: route.slice(dIndex, vnrIndex + 1) });
      }
    });
  } else if (rO.includes("vnr") || rO.includes("campus")) {
    ROUTES.forEach((route, index) => {
      const vnrIndex = findLocIndex(route, rO);
      const dIndex = findLocIndex(route, rD);
      if (dIndex !== -1 && vnrIndex !== -1 && vnrIndex >= dIndex) {
        // Reverse the path since they are traveling AWAY from campus
        validRoutes.push({ index, path: route.slice(dIndex, vnrIndex + 1).reverse() });
      }
    });
  }

  // Strict Deduplication Logic (only remove if 100% subset)
  const filteredRoutes = validRoutes.filter((routeA, i) => {
    const isSubset = validRoutes.some((routeB, j) => {
      if (i === j) return false;
      // Is Route A completely contained within Route B with no extra stops?
      if (routeA.path.length <= routeB.path.length) {
        let allInB = true;
        for (const nodeA of routeA.path) {
            if (findLocIndex(routeB.path, nodeA) === -1) {
                allInB = false;
                break;
            }
        }
        
        if (allInB) {
            // A is a strict subset of B (or exactly equal)
            if (routeA.path.length === routeB.path.length) {
                return j < i; // keep the one that appears earlier
            }
            return true; // Discard A, it's a strict subset of B
        }
      }
      return false;
    });
    return !isSubset;
  });

  return filteredRoutes.slice(0, 5);
}

export function isAIMatch(rideOrigin: string, rideDest: string, searchOrigin: string, searchDest: string, chosenRouteIndex: number | null = null): boolean {
  if (!searchOrigin && !searchDest) return false;
  
  const rO = rideOrigin.toLowerCase();
  const rD = rideDest.toLowerCase();
  const sO = searchOrigin ? searchOrigin.toLowerCase() : "";
  const sD = searchDest ? searchDest.toLowerCase() : "";
  


  const routesToCheck = chosenRouteIndex !== null && chosenRouteIndex !== undefined && chosenRouteIndex >= 0 && chosenRouteIndex < ROUTES.length
    ? [ROUTES[chosenRouteIndex]]
    : ROUTES;

  // Case 1: Driver is coming TO VNR (rD is VNR)
  if (rD.includes("vnr") || rD.includes("campus")) {
    if (sD === "" || sD.includes("vnr") || sD.includes("campus")) {
      if (!sO) return true;
      
      // Find if there is any route where Driver Origin is before or equal to Passenger Origin
      for (const route of routesToCheck) {
        const dIndex = findLocIndex(route, rO);
        const pIndex = findLocIndex(route, sO);
        if (dIndex !== -1 && pIndex !== -1) {
          // Driver travels to a lower index (further away from VNR), Passenger travels to a higher index (closer to VNR)
          if (dIndex <= pIndex) {
            return true;
          }
        }
      }
    }
  }
  
  // Case 2: Driver is leaving FROM VNR (rO is VNR)
  if (rO.includes("vnr") || rO.includes("campus")) {
    if (sO === "" || sO.includes("vnr") || sO.includes("campus")) {
      if (!sD) return true;
      
      // Find if there is any route where Driver Dest is after or equal to Passenger Dest
      for (const route of routesToCheck) {
        const dIndex = findLocIndex(route, rD);
        const pIndex = findLocIndex(route, sD);
        if (dIndex !== -1 && pIndex !== -1) {
          // Driver travels to a lower/equal index (further away from VNR), Passenger travels to a higher/equal index (closer to VNR)
          if (dIndex <= pIndex) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export function calculateFractionalPrice(
  driverOrigin: string,
  driverDest: string,
  paxOrigin: string,
  paxDest: string,
  driverPrice: number
): number {
  if (!paxOrigin || !paxDest) return driverPrice;

  const getDistInternal = (loc: string) => {
    const q = normalize(loc);
    const matchedKey = Object.keys(DISTANCE_MAP).find(k => normalize(k) === q || normalize(k).includes(q) || q.includes(normalize(k)));
    if (matchedKey) return DISTANCE_MAP[matchedKey];
    return null;
  };

  const getDist = (loc: string) => {
    const val = getDistInternal(loc);
    if (val !== null) return val;
    
    if (normalize(loc) === normalize(driverOrigin) && !driverOrigin.toLowerCase().includes('vnr')) {
        const pd = getDistInternal(paxOrigin);
        return (pd !== null ? pd : 10) + 5;
    }
    if (normalize(loc) === normalize(driverDest) && !driverDest.toLowerCase().includes('vnr')) {
        const pd = getDistInternal(paxDest);
        return (pd !== null ? pd : 10) + 5;
    }
    
    if (!loc.toLowerCase().includes('vnr')) {
        if (driverDest.toLowerCase().includes('vnr')) {
            return getDist(driverOrigin);
        } else {
            return getDist(driverDest);
        }
    }
    
    return 0;
  };

  const d1 = getDist(driverOrigin);
  const d2 = getDist(driverDest);
  const p1 = getDist(paxOrigin);
  const p2 = getDist(paxDest);

  if (d1 === null || d2 === null || p1 === null || p2 === null) {
    return driverPrice;
  }

  const driverDistance = Math.abs(d1 - d2);
  const paxDistance = Math.abs(p1 - p2);

  if (driverDistance === 0) return driverPrice;

  // Minimum fraction is 30% to account for base pickup overhead
  const distanceFraction = paxDistance / driverDistance;
  const fraction = Math.max(0.3, Math.min(1, distanceFraction));

  return Math.ceil(driverPrice * fraction);
}

export function calculateDynamicOverlappingSplit(
  driverOrigin: string,
  driverDest: string,
  driverPricePerSeat: number,
  totalSeats: number,
  isAuto: boolean,
  passengers: { id: string; pickup: string; dropoff: string }[]
): { driverShare: number, passengerShares: Record<string, number> } | null {
  const getDistInternal = (loc: string) => {
    const q = normalize(loc);
    const matchedKey = Object.keys(DISTANCE_MAP).find(k => normalize(k) === q || normalize(k).includes(q) || q.includes(normalize(k)));
    if (matchedKey) return DISTANCE_MAP[matchedKey];
    return null;
  };

  const getDist = (loc: string) => {
    const val = getDistInternal(loc);
    if (val !== null) return val;
    
    if (normalize(loc) === normalize(driverOrigin) && !driverOrigin.toLowerCase().includes('vnr')) {
        let maxD = 10;
        passengers.forEach(p => {
           const pd = getDistInternal(p.pickup);
           if (pd !== null && pd > maxD) maxD = pd;
        });
        return maxD + 5;
    }
    if (normalize(loc) === normalize(driverDest) && !driverDest.toLowerCase().includes('vnr')) {
        let maxD = 10;
        passengers.forEach(p => {
           const pd = getDistInternal(p.dropoff);
           if (pd !== null && pd > maxD) maxD = pd;
        });
        return maxD + 5;
    }
    
    if (!loc.toLowerCase().includes('vnr')) {
        if (driverDest.toLowerCase().includes('vnr')) {
            return getDist(driverOrigin);
        } else {
            return getDist(driverDest);
        }
    }
    
    return 0;
  };

  const d1 = getDist(driverOrigin);
  const d2 = getDist(driverDest);
  if (d1 === null || d2 === null) return null;

  const totalDriverDist = Math.abs(d1 - d2);
  if (totalDriverDist === 0) return null;

  // Reverse engineer total cost
  const totalPeopleFactor = isAuto ? totalSeats + 1 : totalSeats;
  const totalCost = driverPricePerSeat * totalPeopleFactor;
  const costPerKm = totalCost / totalDriverDist;

  const stopsSet = new Set<number>();
  stopsSet.add(d1);
  stopsSet.add(d2);

  const validPassengers = passengers.map(p => {
    const p1 = getDist(p.pickup);
    const p2 = getDist(p.dropoff);
    return { ...p, dStart: p1, dEnd: p2 };
  }).filter(p => p.dStart !== null && p.dEnd !== null);

  validPassengers.forEach(p => {
    stopsSet.add(p.dStart as number);
    stopsSet.add(p.dEnd as number);
  });

  // Sort stops descending (furthest from VNR first)
  const stops = Array.from(stopsSet).sort((a, b) => b - a);

  const passengerShares: Record<string, number> = {};
  validPassengers.forEach(p => passengerShares[p.id] = 0);
  let driverShare = 0;

  const driverMax = Math.max(d1, d2);
  const driverMin = Math.min(d1, d2);

  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i];
    const end = stops[i+1];
    
    // Only process segments that are within the driver's route
    if (start <= driverMax && end >= driverMin) {
      const segDist = start - end;
      const segCost = segDist * costPerKm;
      
      const inCar = validPassengers.filter(p => {
        const pMax = Math.max(p.dStart!, p.dEnd!);
        const pMin = Math.min(p.dStart!, p.dEnd!);
        return start <= pMax && end >= pMin;
      });
      
      const count = 1 + inCar.length;
      const split = segCost / count;
      
      driverShare += split;
      inCar.forEach(p => {
        passengerShares[p.id] += split;
      });
    }
  }

  let totalPaxShare = 0;
  Object.keys(passengerShares).forEach(k => {
    passengerShares[k] = Math.round(passengerShares[k]);
    totalPaxShare += passengerShares[k];
  });
  
  driverShare = Math.round(totalCost) - totalPaxShare;

  return { driverShare, passengerShares };
}
