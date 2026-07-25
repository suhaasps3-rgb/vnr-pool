import { DISTANCE_MAP } from './locations';

export const ROUTES: string[][] = [
  // S1: PATANCHERU TO VNRVJIET
  ["patancheru", "beeramguda kaman", "bhel", "chandanagar", "miyapur", "vnr vjiet"],
  // S2: LB NAGAR TO VNRVJIET
  ["lb nagar", "dilsukhnagar", "malakpet", "koti", "abids", "lakdi ka pool", "khairatabad", "vnr vjiet"],
  // S3: YUSUFGOUDA TO VNRVJIET
  ["yusufguda temple", "yusufguda check post", "jubilee check post", "madapur", "hi-tech city", "kothaguda", "kondapur", "hafeezpet", "miyapur x roads", "vnr vjiet"],
  // S5: ATTAPUR TO VNRVJIET
  ["attapur", "retibowli", "mehdipatnam", "masab tank", "banjara hills", "punjagutta", "ameerpet", "sr nagar", "erragadda", "vnr vjiet"],
  // S6: ANANDBAGH TO VNRVJIET
  ["anandbagh", "malkajgiri", "mettuguda", "chilkalguda x rds", "musheerabad", "rtc x rds", "narayanguda fly over", "himayat nagar", "liberty", "khairatabad", "vnr vjiet"],
  // S7: MOTHINAGAR TO VNRVJIET
  ["mothinagar signal", "pr nagar", "bharathnagar fly over", "moosapet", "rainbow vista", "lodha bellezza", "brand factory", "road no 1", "kphb", "jntu", "addagutta", "pragathi nagar", "vnr vjiet"],
  // S9: KUKATPALLY TO VNRVJIET
  ["kukatpally", "ramdev hosp", "vasanth nagar kaman", "miyapur metro", "nizampet x roads", "sanghamithra", "hanuman temple", "hill county", "bachupally", "vnr vjiet"],
  // S10: MANIKONDA TO VNRVJIET
  ["manikonda marri chettu", "lanco hills", "khazaguda", "gachibowli", "bio diversity park", "ikea", "hi-tech city rly stn fly over", "nexus mall", "manjeera mall", "vnr vjiet"],
  // S11: MASJIDBANDA TO VNRVJIET
  ["masjidbanda", "hcu", "nallagandla fly over", "bhel", "miyapur x roads", "bachupally", "vnr vjiet"],
  // S12: NAGOLE TO VNRVJIET
  ["nagole", "uppal", "tarnaka", "secunderabad", "himalaya book store", "jbs", "tadbund", "bowenpally", "balanagar", "vnr vjiet"],
  // S41: ECIL TO VNRVJIET
  ["ecil", "radhika", "sainikpuri", "neredmet x roads", "thirumalgiri", "bowenpally", "bapuji nagar", "suchitra", "kompally", "vnr vjiet"],
  // S42: OLD ALWAL TO VNRVJIET
  ["old alwal ig statue", "father balaiah ngr", "suchitra", "qutbullapur", "chintal shapur signal", "gajularamaram", "vnr vjiet"],
  
  // Custom Route 1: The NH65 Spine
  ["lb nagar", "dilsukhnagar", "malakpet", "koti", "abids", "nampally", "lakdikapul", "khairatabad", "panjagutta", "ameerpet", "sr nagar", "erragadda", "moosapet", "kukatpally", "kphb", "jntu", "nizampet", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 2: The Core City Hub
  ["kachiguda", "rtc x roads", "chikkadpally", "musheerabad", "secunderabad", "begumpet", "ameerpet", "sr nagar", "erragadda", "moosapet", "kukatpally", "kphb", "jntu", "nizampet", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 3: The East-West Connector
  ["uppal", "tarnaka", "secunderabad", "bowenpally", "balanagar", "moosapet", "kukatpally", "kphb", "jntu", "nizampet", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 4: The North-East Commute
  ["ecil", "as rao nagar", "neredmet", "malkajgiri", "trimulgherry", "bowenpally", "balanagar", "moosapet", "kukatpally", "kphb", "jntu", "nizampet", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 5: The ORR North Route
  ["medchal", "kompally", "suchitra", "suraram", "jeedimetla", "chintal", "balanagar", "moosapet", "kukatpally", "kphb", "jntu", "nizampet", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 6: The IT Corridor
  ["shamshabad", "chandrayangutta", "attapur", "mehdipatnam", "tolichowki", "shaikpet", "lanco hills", "manikonda", "raidurg", "hitech city", "madhapur", "kondapur", "hafeezpet", "miyapur", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 7: The Financial District Ring
  ["tellapur", "nallagandla", "financial district", "gachibowli", "kondapur", "hafeezpet", "miyapur", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 8: The Outer West Highway
  ["patancheru", "bhel", "chanda nagar", "madinaguda", "miyapur", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 9: The Inner Ring Road to IT Corridor to JNTU
  ["attapur", "mehdipatnam", "tolichowki", "gachibowli", "hi-tech city", "kukatpally", "kphb", "jntu", "nizampet", "bachupally (vnr)", "vnr vjiet"],
  // Custom Route 10: Shamshabad ORR to VNR
  ["shamshabad", "orr", "narsingi", "kokapet", "bachupally exit", "bachupally", "vnr vjiet"],
  // Custom Route 11: Medchal ORR to VNR
  ["medchal", "orr", "dundigal", "bachupally exit", "bachupally", "vnr vjiet"],
  // Custom Route 12: Patancheru ORR to VNR
  ["patancheru", "orr", "bachupally exit", "bachupally", "vnr vjiet"],
  // Custom Route 13: LB Nagar Corridor
  ["lb nagar", "dilsukhnagar", "malakpet", "nampally", "lakdikapul", "punjagutta", "ameerpet", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Custom Route 14: Uppal Corridor
  ["uppal", "habsiguda", "tarnaka", "secunderabad", "paradise", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Custom Route 15: Koti Corridor
  ["koti", "lakdikapul", "ameerpet", "kukatpally", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Custom Route 16: Ameerpet Corridor
  ["ameerpet", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Custom Route 17: Hitech City Corridor
  ["hi-tech city", "mindspace", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Custom Route 18: Gachibowli Corridor (Text Request)
  ["gachibowli", "kondapur", "kphb", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Custom Route 19: Gachibowli Corridor (Image Request)
  ["financial district", "nanakramguda", "gachibowli", "kondapur", "hafeezpet", "miyapur", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Custom Route 20: Kompally Corridor
  ["kompally", "suchitra", "jeedimetla", "gundlapochampally", "dundigal", "gandimaisamma", "bowrampet", "bachupally", "vnr vjiet"],
  // Extended Route 21: Attapur Route
  ["attapur", "upperpally", "mehdipatnam", "rethibowli", "tolichowki", "gachibowli", "hi-tech city", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 22: Secunderabad Route
  ["secunderabad", "paradise", "bowenpally", "balanagar", "moosapet", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 23: Ameerpet Route
  ["panjagutta", "ameerpet", "esi", "sr nagar", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 24: Miyapur Route
  ["miyapur", "hafeezpet", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 25: KPHB Route
  ["kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 26: Shamshabad Route
  ["shamshabad", "aramghar", "attapur", "mehdipatnam", "gachibowli", "hi-tech city", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 27: ORR Route
  ["shamshabad orr", "kokapet", "narsingi", "gachibowli orr", "bachupally exit", "bachupally", "vnr vjiet"],
  // Extended Route 28: South Hyderabad Corridor
  ["airport", "shamshabad", "rajendranagar", "attapur", "mehdipatnam", "masab tank", "lakdikapul", "khairatabad", "punjagutta", "ameerpet", "esi", "erragadda", "bharat nagar", "moosapet", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 29: IT Corridor
  ["financial district", "kokapet", "narsingi", "khajaguda", "manikonda", "tolichowki", "gachibowli", "raidurg", "hi-tech city", "madhapur", "kondapur", "hafeezpet", "miyapur", "allwyn x roads", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 30: Central Hyderabad Corridor
  ["assembly", "gandhi bhavan", "nampally", "sultan bazar", "mgbs", "chaderghat", "dilsukhnagar", "lb nagar", "hayathnagar", "punjagutta", "ameerpet", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 31: Secunderabad Corridor
  ["secunderabad east", "parade ground", "paradise", "bowenpally", "balanagar", "moosapet", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 32: North-East Corridor
  ["nagole", "stadium", "ngri", "habsiguda", "tarnaka", "mettuguda", "secunderabad", "paradise", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 33: ECIL Corridor
  ["sainikpuri", "kapra", "ecil", "as rao nagar", "neredmet", "malkajgiri", "bowenpally", "kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 34: North-West Corridor
  ["medchal", "kompally", "alwal", "suchitra", "jeedimetla", "suraram", "quthbullapur", "dundigal", "gandimaisamma", "bachupally", "vnr vjiet"],
  // Extended Route 35: Western Corridor
  ["patancheru", "beeramguda", "bhel", "lingampally", "chanda nagar", "madinaguda", "miyapur", "allwyn x roads", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Extended Route 36: Short VNR Corridor
  ["kukatpally", "kphb", "jntu", "miyapur", "allwyn x roads", "nizampet", "pragathi nagar", "bachupally", "vnr vjiet"],
  // Img Route 1: Gachibowli
  ["gachibowli", "kondapur", "kphb", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 2: Miyapur
  ["miyapur", "hafeezpet", "allwyn x roads", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 3: KPHB Colony
  ["kphb", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 4: LB Nagar
  ["lb nagar", "dilsukhnagar", "malakpet", "nampally", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 5: Uppal
  ["uppal", "tarnaka", "secunderabad", "paradise", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 6: Shamshabad Airport
  ["airport", "outer ring road", "bachupally exit", "vnr vjiet"],
  // Img Route 7: Tarnaka
  ["tarnaka", "habsiguda", "secunderabad", "paradise", "kukatpally", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 8: Dilsukhnagar
  ["dilsukhnagar", "chaderghat", "nampally", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 9: Mehdipatnam
  ["mehdipatnam", "masab tank", "punjagutta", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 10: Attapur
  ["attapur", "mehdipatnam", "punjagutta", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 11: Tolichowki
  ["tolichowki", "gachibowli", "kondapur", "kphb", "jntu", "vnr vjiet"],
  // Img Route 12: Manikonda
  ["manikonda", "khajaguda", "gachibowli", "kondapur", "kphb", "jntu", "vnr vjiet"],
  // Img Route 13: Kompally
  ["kompally", "suchitra", "jeedimetla", "suraram", "bachupally", "vnr vjiet"],
  // Img Route 14: Alwal
  ["alwal", "suchitra", "jeedimetla", "suraram", "bachupally", "vnr vjiet"],
  // Img Route 15: ECIL
  ["ecil", "as rao nagar", "malkajgiri", "bowenpally", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 16: Kapra
  ["kapra", "ecil", "malkajgiri", "bowenpally", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 17: Sainikpuri
  ["sainikpuri", "as rao nagar", "ecil", "bowenpally", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 18: Neredmet
  ["neredmet", "malkajgiri", "bowenpally", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 19: Beeramguda
  ["beeramguda", "bhel", "chanda nagar", "miyapur", "nizampet", "vnr vjiet"],
  // Img Route 20: Lingampally
  ["lingampally", "chanda nagar", "miyapur", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 21: BHEL
  ["bhel", "madinaguda", "miyapur", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 22: Patancheru
  ["patancheru", "bhel", "chanda nagar", "miyapur", "vnr vjiet"],
  // Img Route 23: Medchal
  ["medchal", "kompally", "suchitra", "suraram", "bachupally", "vnr vjiet"],
  // Img Route 24: Dundigal
  ["dundigal", "gandimaisamma", "bachupally", "vnr vjiet"],
  // Img Route 25: Quthbullapur
  ["quthbullapur", "suraram", "bachupally", "vnr vjiet"],
  // Img Route 26: Nagole
  ["nagole", "uppal", "tarnaka", "secunderabad", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 27: Hayathnagar
  ["hayathnagar", "lb nagar", "dilsukhnagar", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 28: Financial District
  ["financial district", "nanakramguda", "gachibowli", "kondapur", "kphb", "jntu", "vnr vjiet"],
  // Img Route 29: Kokapet
  ["kokapet", "narsingi", "gachibowli", "kondapur", "jntu", "vnr vjiet"],
  // Img Route 30: Narsingi
  ["narsingi", "gachibowli", "kondapur", "kphb", "jntu", "vnr vjiet"],
  // Img Route 31: Rajendranagar
  ["rajendranagar", "attapur", "mehdipatnam", "ameerpet", "kukatpally", "vnr vjiet"],
  // Img Route 32: Raidurg
  ["raidurg", "hi-tech city", "madhapur", "kphb", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 33: HITEC City
  ["hi-tech city", "madhapur", "kphb", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 34: Madhapur
  ["madhapur", "kphb", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 35: Jubilee Hills Check Post
  ["jubilee hills", "madhapur", "kphb", "jntu", "vnr vjiet"],
  // Img Route 36: Road No. 5 Jubilee Hills
  ["road no. 5", "jubilee hills", "madhapur", "jntu", "vnr vjiet"],
  // Img Route 37: Yusufguda
  ["yusufguda", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 38: Begumpet
  ["begumpet", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 39: Paradise
  ["paradise", "secunderabad", "balanagar", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 40: Secunderabad East
  ["secunderabad east", "paradise", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 41: Parade Ground
  ["parade ground", "paradise", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 42: Mettuguda
  ["mettuguda", "secunderabad", "paradise", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 43: Tarnaka 2
  ["tarnaka", "mettuguda", "secunderabad", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 44: Habsiguda
  ["habsiguda", "tarnaka", "secunderabad", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 45: NGRI
  ["ngri", "habsiguda", "tarnaka", "secunderabad", "jntu", "vnr vjiet"],
  // Img Route 46: Stadium
  ["stadium", "uppal", "tarnaka", "secunderabad", "jntu", "vnr vjiet"],
  // Img Route 47: Nagole 2
  ["nagole", "uppal", "tarnaka", "secunderabad", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 48: RTC X Roads
  ["rtc x rds", "musheerabad", "secunderabad", "paradise", "kukatpally", "vnr vjiet"],
  // Img Route 49: Narayanguda
  ["narayanguda", "chikkadpally", "rtc x rds", "musheerabad", "kukatpally", "vnr vjiet"],
  // Img Route 50: Sultan Bazar
  ["sultan bazar", "mgbs", "nampally", "ameerpet", "kukatpally", "vnr vjiet"],
  // Img Route 51: MGBS
  ["mgbs", "nampally", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 52: Osmania Medical College
  ["omc", "mgbs", "nampally", "ameerpet", "vnr vjiet"],
  // Img Route 53: Gandhi Bhavan
  ["gandhi bhavan", "nampally", "ameerpet", "kukatpally", "vnr vjiet"],
  // Img Route 54: Assembly
  ["assembly", "lakdikapul", "khairatabad", "ameerpet", "vnr vjiet"],
  // Img Route 55: Khairatabad
  ["khairatabad", "punjagutta", "ameerpet", "kukatpally", "vnr vjiet"],
  // Img Route 56: Punjagutta
  ["punjagutta", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 57: ESI Hospital
  ["esi hospital", "erragadda", "bharat nagar", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 58: Bharat Nagar
  ["bharat nagar", "moosapet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 59: Moosapet
  ["moosapet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 60: Balanagar
  ["balanagar", "kukatpally", "jntu", "nizampet", "vnr vjiet"],
  // Img Route 61: Kukatpally
  ["kukatpally", "kphb", "jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 62: JNTU College
  ["jntu", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 63: Miyapur 2
  ["miyapur", "allwyn x roads", "nizampet", "pragathi nagar", "vnr vjiet"],
  // Img Route 64: Dilsukhnagar 2
  ["dilsukhnagar", "mgbs", "ameerpet", "kukatpally", "jntu", "vnr vjiet"],
  // Img Route 65: LB Nagar 2
  ["lb nagar", "dilsukhnagar", "mgbs", "ameerpet", "kukatpally", "jntu", "vnr vjiet"]
];

export function isAIMatch(rideOrigin: string, rideDest: string, searchOrigin: string, searchDest: string): boolean {
  if (!searchOrigin && !searchDest) return false;
  
  const rO = rideOrigin.toLowerCase();
  const rD = rideDest.toLowerCase();
  const sO = searchOrigin ? searchOrigin.toLowerCase() : "";
  const sD = searchDest ? searchDest.toLowerCase() : "";

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace('qutbullapur', 'quthbullapur').replace('hitech', 'hitec').replace('hi-tech', 'hitec');
  
  // Helper to find index of a location in a route
  const findLocIndex = (route: string[], queryLoc: string) => {
    const q = normalize(queryLoc);
    if (!q) return -1;
    return route.findIndex(node => {
      const n = normalize(node);
      return q.includes(n) || n.includes(q);
    });
  };

  // Case 1: Driver is coming TO VNR (rD is VNR)
  if (rD.includes("vnr") || rD.includes("campus")) {
    if (sD === "" || sD.includes("vnr") || sD.includes("campus")) {
      if (sO) {
        // Find if there is any route where Driver Origin is before or equal to Passenger Origin
        for (const route of ROUTES) {
          const dIndex = findLocIndex(route, rO);
          const pIndex = findLocIndex(route, sO);
          if (dIndex !== -1 && pIndex !== -1) {
            // Driver is further away from VNR (lower index), passenger is closer to VNR (higher index)
            if (dIndex <= pIndex) {
              return true;
            }
          }
        }
      }
    }
  }
  
  // Case 2: Driver is leaving FROM VNR (rO is VNR)
  if (rO.includes("vnr") || rO.includes("campus")) {
    if (sO === "" || sO.includes("vnr") || sO.includes("campus")) {
      if (sD) {
        // Find if there is any route where Driver Dest is after or equal to Passenger Dest
        for (const route of ROUTES) {
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
  }

  return false;
}
