import fs from 'fs';

const locations = [
  "nampally", "kachiguda", "chikkadpally", "suraram", "jeedimetla", "chintal", "shamshabad",
  "chandrayangutta", "tellapur", "nallagandla", "madinaguda", "bachupally (vnr)", "kukatpally",
  "kphb", "jntu", "nizampet", "ameerpet", "secunderabad", "orr", "bachupally exit", 
  "paradise", "mindspace", "gundlapochampally", "dundigal", "gandimaisamma", "bowrampet", 
  "pragathi nagar", "upperpally", "esi", "allwyn x roads", "airport", "rajendranagar",
  "bharat nagar", "khajaguda", "assembly", "gandhi bhavan", "sultan bazar", "mgbs", "chaderghat", 
  "hayathnagar", "secunderabad east", "parade ground", "stadium", "ngri", "kapra", "quthbullapur", 
  "shamshabad orr", "gachibowli orr", "aramghar", "outer ring road", "jubilee hills", "road no. 5",
  "yusufguda", "omc", "esi hospital", "narayanguda", "vnr vjiet, bachupally", "nexus mall, hyd", 
  "gvk one mall", "gvk mall", "golconda fort", "hussain sagar", "tank bund", "salar jung museum",
  "ramoji film city", "shilparamam", "birla mandir", "chowmahalla palace", "lumbini park", "ntr gardens", 
  "qutb shahi tombs", "kbr park", "necklace road", "hitex exhibition center", "inorbit mall",
  "forum sujana mall", "durgam cheruvu", "cable bridge", "botanical garden", "wonderla", "ocean park", 
  "snow world", "hyderabad public school", "osmania university", "secunderabad club",
  "falaknuma palace", "nehru zoological park", "mindspace it park", "cyber towers", "dlf cyber city", 
  "tcs synergy park", "amazon campus", "google campus", "microsoft campus", "infosys pocharam", "raheja mindspace",
  "t-hub", "knowledge city", "salarpuria sattva knowledge city", "apollo hospitals jubilee hills", "yashoda hospital secunderabad",
  "yashoda hospital somajiguda", "care hospitals banjara hills", "kim hospitals secunderabad", "aig hospitals", "sunshine hospitals",
  "nims", "basavatarakam indo american cancer hospital", "rajiv gandhi international airport", "secunderabad railway station",
  "nampally railway station", "kacheguda railway station", "mahatma gandhi bus station", "jubilee bus station",
  "shamshabad bus stop", "lingampally railway station", "barkas", "pahadi sharif", "tukkuguda", "srisailam highway",
  "adibatla", "tcs adibatla", "maheshwaram", "himayat sagar", "osman sagar", "gandipet", "mrugavani national park",
  "chilkur balaji temple", "pvnr expressway", "sivarampalli", "shah ali banda", "santoshnagar", "owaisi hospital",
  "chandrayangutta x road", "saroornagar", "karmanghat", "champapet", "kanchanbagh", "drdo township", "midhani",
  "balapur", "hardware park", "fab city", "raviryala", "isnapur", "muthangi", "sangareddy", "rudraram",
  "iit hyderabad", "kandi", "sultanpur", "gowdavalli", "ida bolarum", "kazipally", "mallampet", "bahadurpally",
  "tech mahindra bahadurpally", "griet", "gokaraju rangaraju", "bvrit narsapur", "narsapur", "kphb phase 1", "kphb phase 6",
  "kphb phase 9", "whisper valley", "bollaram industrial area", "bhel mig", "rc puram", "ramachandrapuram", "beeramguda",
  "erragadda gokul theatre", "boduppal", "peerzadiguda", "medipally", "ghatkesar", "pocharam", "bhuvanagiri", "bibi nagar", "choutuppal",
  "kamineni hospital lb nagar", "victoria memorial home", "saroornagar lake", "dilsukhnagar bus station", "saidabad",
  "moosarambagh", "amberpet", "shivam road", "nallakunta", "basheerbagh", "secretariat", "domalguda", "ashok nagar",
  "gandhi hospital", "park lane", "sd road", "sindhi colony", "rasoolpura", "sanjeevaiah park", "banjara hills road no 12",
  "banjara hills road no 10", "banjara hills road no 1", "mecca masjid", "makka masjid", "laad bazaar", "madina circle",
  "pathergatti", "nayapul", "afzal gunj", "darulshifa", "purani haveli", "yakutpura", "dabirpura", "chanchalguda",
  "hussaini alam", "bahadurpura", "kishan bagh", "mir alam tank", "aliabad", "moghalpura", "khilwat", "moazzam jahi market",
  "begum bazaar", "mangalhat", "dhoolpet", "goshamahal", "mallepally", "madina", "mlrit", "iare", "cmr group of institutions", "kandlakoya",
  "mrec", "malla reddy engineering college", "maisammaguda", "bits pilani hyderabad", "shamirpet", "nalsar university",
  "anurag university", "snist", "sreenidhi institute of science and technology", "shapur nagar", "balanagar x roads", "moosapet y junction",
  "ayodhya nagar", "suraram x roads", "safilguda", "yapral", "dammaiguda", "kushaiguda", "cherlapally", "mallapur", "nacharam", "temple alwal",
  "kowkoor", "hakimpet", "thumkunta", "keesara", "keesaragutta", "yamnampet", "cbit", "chaitanya bharathi institute of technology", "mgit",
  "vjit", "vidya jyothi institute of technology", "icfai business school", "moinabad", "jbiet", "shankerpally", "appa junction",
  "kali mandir", "sun city", "bandlaguda jagir", "chevella", "aziznagar", "mvsr engineering college", "nadergul", "cvr college of engineering",
  "gurunanak institutions", "ibrahimpatnam", "tkr college", "meerpet", "badangpet", "b n reddy nagar", "hastinapuram",
  "turkayamjal", "bonguloor", "dhulapally", "doolapally", "st. martin's engineering college", "st martins", "dairy farm road", "fox sagar lake",
  "petbasheerabad", "yellampet", "athvelli", "apparel park", "siva sivani", "loyola academy", "army college of dental sciences",
  "afzalgunj", "aig", "amazon", "lb nagar", "dilsukhnagar", "malakpet", "lakdikapul", "khairatabad", "punjagutta", "moosapet",
  "bachupally", "vnr vjiet", "hyderabad spice", "s grand", "vnr hostel", "nexus mall kukatpally"
];

async function generate() {
  const map = {};
  for (const loc of locations) {
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(loc)}&count=1&format=json`);
      if (res.ok) {
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          map[loc.toLowerCase()] = { lat: data.results[0].latitude, lon: data.results[0].longitude };
          console.log(`Mapped ${loc}`);
        } else {
          console.log(`Failed ${loc}`);
        }
      }
      await new Promise(r => setTimeout(r, 250));
    } catch (e) {
      console.log(`Error ${loc}`);
    }
  }
  fs.writeFileSync('coords.json', JSON.stringify(map, null, 2));
}

generate();
