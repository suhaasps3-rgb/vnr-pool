const fs = require('fs');

// We copy ALL_LOCATIONS array from locations.ts here (manually constructed from keys for simplicity)
const distanceMap = {
  // Original
  "abids": 22, "alwal": 20, "ameerpet metro": 18, "as rao nagar": 25, "attapur": 28,
  "bachupally x roads": 3, "balnagar": 13, "banjara hills": 20, "begumpet": 18, "bhel": 15,
  "bolarum": 18, "bowenpally": 16, "chanda nagar": 12, "charminar": 25, "dilsukhnagar": 30,
  "dsl virtue mall uppal": 35, "ecil x roads": 28, "erragadda": 15, "financial district": 22,
  "gachibowli": 20, "gachibowli wipro circle": 22, "habsiguda": 30, "hafeezpet": 10,
  "hi-tech city": 18, "inorbit mall madhapur": 18, "jntu metro": 10, "jubilee hills checkpost": 18,
  "kacheguda station": 24, "khairatabad": 20, "kokapet": 25, "kompally": 12, "kondapur": 15,
  "kothapet": 32, "koti": 23, "kphb colony": 11, "kukatpally metro": 12, "lakdikapul": 21,
  "lb nagar": 35, "lingampally": 16, "madhapur": 18, "mahatma gandhi bus station (mgbs)": 25,
  "malkajgiri": 22, "manikonda": 22, "medchal": 20, "mehdipatnam": 25, "miyapur x roads": 8,
  "moosapet": 14, "nagole": 35, "nampally station": 22, "nanakramguda": 22, "narsingi": 25,
  "nexus mall kukatpally": 13, "nizampet x roads": 8, "panjagutta": 19, "patancheru": 18,
  "raidurg": 20, "ramanthapur": 32, "sainikpuri": 25,
  "sanjeeva reddy nagar": 16, "sarath city capital mall": 16, "secunderabad station": 22,
  "shaikpet": 22, "shamshabad airport": 45, "somajiguda": 19, "sr nagar": 16,
  "suchitra junction": 15, "tarnaka": 28, "tolichowki": 24, "uppal x roads": 35,
  "vanastalipuram": 38,

  // New locations from routes
  "beeramguda kaman": 17, "malakpet": 27, "lakdi ka pool": 21, "yusufguda temple": 19, "yusufguda check post": 18,
  "kothaguda": 16, "retibowli": 26, "masab tank": 22, "punjagutta": 19, "anandbagh": 23, "mettuguda": 26,
  "chilkalguda x rds": 25, "musheerabad": 23, "rtc x rds": 24, "narayanguda fly over": 23, "himayat nagar": 22,
  "liberty": 21, "mothinagar signal": 15, "pr nagar": 14, "bharathnagar fly over": 14, "rainbow vista": 13,
  "lodha bellezza": 13, "brand factory": 12, "road no 1": 11, "addagutta": 10, "ramdev hosp": 11,
  "vasanth nagar kaman": 10, "miyapur metro": 9, "sanghamithra": 6, "hanuman temple": 5, "hill county": 4,
  "bachupally": 2, "manikonda marri chettu": 23, "lanco hills": 24, "khazaguda": 21, "bio diversity park": 19,
  "ikea": 18, "hi-tech city rly stn fly over": 17, "nexus mall": 13, "manjeera mall": 12, "masjidbanda": 18,
  "hcu": 17, "nallagandla fly over": 16, "uppal": 35, "himalaya book store": 21, "jbs": 20, "tadbund": 19,
  "ecil": 28, "radhika": 27, "neredmet x roads": 24, "thirumalgiri": 22, "bapuji nagar": 17, "suchitra": 15,
  "old alwal ig statue": 21, "father balaiah ngr": 19, "qutbullapur": 14, "chintal shapur signal": 12, "gajularamaram": 10,
  "vnr vjiet": 0,
  
  // Curated 5km Radius Landmarks (Bachupally/Pragathi Nagar)
  "s grand": 2, "hyderabad spice": 3, "pista house bachupally": 1, "pragathi nagar kaman": 2,
  "simhapuri kaman": 1, "bakers heaven": 0, "dosthi biryani's": 0, "eat magic.in": 0,
  "kammani telugu kitchen": 0, "biryani factory": 1, "vnr hostel": 0,
  "mams hospitals": 1, "mamata academy of medical sciences": 1, "reach super speciality hospital": 2,
  "relief hospital pragathi nagar": 3, "silver oaks international school": 2,
  "kennedy high the global school": 3, "mallampet lake": 4, "bachupally police station": 1,
  "pista house": 1, "angaara restaurant": 3, "allah's kitchen and bar": 2,
  "taqila lounge and restaurant": 1, "polar bear": 3, "the golden barrel": 2, "dominos": 1,
  
  // Extra locations from user request
  "nampally": 21, "kachiguda": 24, "chikkadpally": 23,
  "suraram": 16, "jeedimetla": 15, "chintal": 14, "shamshabad": 45,
  "chandrayangutta": 35, "tellapur": 22, "nallagandla": 18, "madinaguda": 9,
  "bachupally (vnr)": 0, "kukatpally": 12, "kphb": 11, "jntu": 10, "nizampet": 8,
  "ameerpet": 18, "secunderabad": 22, "orr": 15, "bachupally exit": 4, 
  "paradise": 20, "mindspace": 18, "gundlapochampally": 12,
  "dundigal": 15, "gandimaisamma": 10, "bowrampet": 6, "pragathi nagar": 5,
  "upperpally": 28, "esi": 17, "allwyn x roads": 9, "airport": 45, "rajendranagar": 30,
  "bharat nagar": 14, "khajaguda": 21, "assembly": 21, "gandhi bhavan": 22, 
  "sultan bazar": 23, "mgbs": 25, "chaderghat": 26, "hayathnagar": 40, 
  "secunderabad east": 22, "parade ground": 21, "stadium": 34, "ngri": 33, 
  "kapra": 27, "quthbullapur": 14, "shamshabad orr": 45, "gachibowli orr": 20, 
  "aramghar": 32, "outer ring road": 15, "jubilee hills": 19, "road no. 5": 20,
  "yusufguda": 18, "omc": 24, "esi hospital": 17, "narayanguda": 23,
  
  // Specific aliases requested by user
  "vnr vjiet, bachupally": 0, "nexus mall, hyd": 13, "gvk one mall": 19, "gvk mall": 19,
  
  // Major Landmarks & Tech Parks
  "golconda fort": 22, "hussain sagar": 20, "tank bund": 20, "salar jung museum": 25,
  "ramoji film city": 60, "shilparamam": 17, "birla mandir": 21, "chowmahalla palace": 26,
  "lumbini park": 21, "ntr gardens": 21, "qutb shahi tombs": 23, "kbr park": 19,
  "necklace road": 20, "hitex exhibition center": 17, "inorbit mall": 18,
  "forum sujana mall": 13, "durgam cheruvu": 18, "cable bridge": 18,
  "botanical garden": 18, "wonderla": 55, "ocean park": 28, "snow world": 21,
  "hyderabad public school": 18, "osmania university": 28, "secunderabad club": 22,
  "falaknuma palace": 30, "nehru zoological park": 28,
  
  // Tech Parks & Corporate Campuses
  "mindspace it park": 18, "cyber towers": 17, "dlf cyber city": 18, 
  "tcs synergy park": 20, "amazon campus": 22, "google campus": 20, 
  "microsoft campus": 22, "infosys pocharam": 45, "raheja mindspace": 18,
  "t-hub": 18, "knowledge city": 18, "salarpuria sattva knowledge city": 18,
  
  // Major Hospitals
  "apollo hospitals jubilee hills": 19, "yashoda hospital secunderabad": 22,
  "yashoda hospital somajiguda": 19, "care hospitals banjara hills": 20,
  "kim hospitals secunderabad": 22, "aig hospitals": 18, "sunshine hospitals": 20,
  "nims": 19, "basavatarakam indo american cancer hospital": 19,
  
  // Major Transport Hubs
  "rajiv gandhi international airport": 45, "secunderabad railway station": 22,
  "nampally railway station": 21, "kacheguda railway station": 24,
  "mahatma gandhi bus station": 25, "jubilee bus station": 20,
  "shamshabad bus stop": 45, "lingampally railway station": 16,
  
  // South Hyderabad Landmarks & Localities
  "barkas": 33, "pahadi sharif": 40, "tukkuguda": 42, "srisailam highway": 45,
  "adibatla": 48, "tcs adibatla": 48, "maheshwaram": 50, "himayat sagar": 30,
  "osman sagar": 28, "gandipet": 28, "mrugavani national park": 32,
  "chilkur balaji temple": 35, "pvnr expressway": 25, "sivarampalli": 30,
  "shah ali banda": 27, "santoshnagar": 32, "owaisi hospital": 32,
  "chandrayangutta x road": 35, "saroornagar": 34, "karmanghat": 35,
  "champapet": 34, "kanchanbagh": 33, "drdo township": 33, "midhani": 33,
  "balapur": 36, "hardware park": 45, "fab city": 46, "raviryala": 45,
  
  // North-West Hyderabad Landmarks & Localities
  "isnapur": 22, "muthangi": 24, "sangareddy": 35, "rudraram": 30,
  "iit hyderabad": 32, "kandi": 33, "sultanpur": 10, "gowdavalli": 12,
  "ida bolarum": 8, "kazipally": 7, "mallampet": 5, "bahadurpally": 4,
  "tech mahindra bahadurpally": 4, "griet": 5, "gokaraju rangaraju": 5,
  "bvrit narsapur": 25, "narsapur": 28, "kphb phase 1": 11, "kphb phase 6": 12,
  "kphb phase 9": 10, "whisper valley": 8, "bollaram industrial area": 10,
  "bhel mig": 15, "rc puram": 16, "ramachandrapuram": 16, "beeramguda": 17,
  "erragadda gokul theatre": 15,
  
  // East Hyderabad Landmarks & Localities
  "boduppal": 35, "peerzadiguda": 36, "medipally": 38, "ghatkesar": 45,
  "pocharam": 45, "bhuvanagiri": 65, "bibi nagar": 55, "choutuppal": 60,
  "kamineni hospital lb nagar": 34, "victoria memorial home": 33, 
  "saroornagar lake": 34, "dilsukhnagar bus station": 30, "saidabad": 28,
  "moosarambagh": 29, "amberpet": 27, "shivam road": 26, "nallakunta": 25,
  
  // Central Hyderabad Landmarks & Localities
  "basheerbagh": 22, "secretariat": 21, "domalguda": 21, "ashok nagar": 22,
  "gandhi hospital": 23, "park lane": 20, "sd road": 20, "sindhi colony": 19,
  "rasoolpura": 19, "sanjeevaiah park": 20, "banjara hills road no 12": 19,
  "banjara hills road no 10": 19, "banjara hills road no 1": 19,
  
  // Old City & Near Charminar Landmarks
  "mecca masjid": 25, "makka masjid": 25, "laad bazaar": 25, "madina circle": 24,
  "pathergatti": 24, "nayapul": 24, "afzal gunj": 24, "darulshifa": 25,
  "purani haveli": 26, "yakutpura": 26, "dabirpura": 25, "chanchalguda": 27,
  "hussaini alam": 26, "bahadurpura": 28, "kishan bagh": 29, "mir alam tank": 29,
  "aliabad": 28, "moghalpura": 26, "khilwat": 26, "moazzam jahi market": 22,
  "begum bazaar": 23, "mangalhat": 24, "dhoolpet": 24, "goshamahal": 23,
  "mallepally": 22, "madina": 24,
  
  // Prominent Colleges & Educational Hubs (NW & NE)
  "mlrit": 9, "iare": 9, "cmr group of institutions": 11, "kandlakoya": 12,
  "mrec": 14, "malla reddy engineering college": 14, "maisammaguda": 14,
  "bits pilani hyderabad": 28, "shamirpet": 30, "nalsar university": 29,
  "anurag university": 42, "snist": 43, "sreenidhi institute of science and technology": 43,
  
  // More North-West Additions
  "shapur nagar": 12, "balanagar x roads": 13, "moosapet y junction": 14,
  "ayodhya nagar": 11, "suraram x roads": 15,
  
  // North-East Hyderabad Landmarks & Localities
  "safilguda": 23, "yapral": 24, "dammaiguda": 26, "kushaiguda": 27,
  "cherlapally": 29, "mallapur": 30, "nacharam": 29, "temple alwal": 21,
  "kowkoor": 23, "hakimpet": 25, "thumkunta": 28, "keesara": 35,
  "keesaragutta": 36, "yamnampet": 42,
  
  // South-West Landmarks & Colleges
  "cbit": 28, "chaitanya bharathi institute of technology": 28, "mgit": 28,
  "vjit": 29, "vidya jyothi institute of technology": 29, "icfai business school": 32,
  "moinabad": 32, "jbiet": 32, "shankerpally": 35, "appa junction": 26,
  "kali mandir": 26, "sun city": 25, "bandlaguda jagir": 26, "chevella": 45,
  "aziznagar": 30,
  
  // South-East Landmarks & Colleges
  "mvsr engineering college": 40, "nadergul": 40, "cvr college of engineering": 48,
  "gurunanak institutions": 50, "ibrahimpatnam": 50, "tkr college": 35,
  "meerpet": 35, "badangpet": 36, "b n reddy nagar": 37, "hastinapuram": 36,
  "turkayamjal": 42, "bonguloor": 45,
  
  // North Hyderabad Landmarks & Colleges
  "dhulapally": 11, "doolapally": 11, "st. martin's engineering college": 11,
  "st martins": 11, "dairy farm road": 14, "fox sagar lake": 11,
  "petbasheerabad": 12, "yellampet": 17, "athvelli": 18, "apparel park": 13, "siva sivani": 12,
  "loyola academy": 18, "army college of dental sciences": 25,
  "afzalgunj": 24, "aig": 18, "amazon": 22
};

const allLocations = Object.keys(distanceMap);

async function testGeocode(locName) {
  let queries = [
    `${locName}, Hyderabad, Telangana, India`,
    `${locName}, Telangana, India`,
    `${locName}, India`,
    locName
  ];

  for (const query of queries) {
    const encoded = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encoded}`;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'vnr-pool-test' } });
      const data = await res.json();
      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch (e) {
      // ignore
    }
  }
  return null;
}

async function main() {
  const failed = [];
  // Randomly test 5 difficult ones
  const difficult = [
    'adibatla', 'tcs adibatla', 'nexus mall kukatpally', 'dsl virtue mall uppal', 'eat magic.in'
  ];
  
  for (const loc of difficult) {
    const res = await testGeocode(loc);
    if (!res) failed.push(loc);
  }
  
  console.log("FAILED:", failed);
}

main();
