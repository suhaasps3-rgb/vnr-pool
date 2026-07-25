
export const CORRIDORS: Record<string, string[]> = {
  "kukatpally": ["miyapur x roads", "jntu metro", "kphb colony", "kukatpally metro", "nexus mall kukatpally", "pragathi nagar kaman", "nizampet x roads", "bachupally x roads", "chanda nagar", "hafeezpet"],
  "secunderabad": ["secunderabad station", "alwal", "bolarum", "kompally", "suchitra junction", "bowenpally", "malkajgiri"],
  "hitech_city": ["hi-tech city", "madhapur", "inorbit mall madhapur", "jubilee hills checkpost", "kondapur", "gachibowli", "gachibowli wipro circle", "nanakramguda", "financial district", "kokapet", "raidurg", "sarath city capital mall"],
  "ameerpet": ["ameerpet metro", "sr nagar", "sanjeeva reddy nagar", "erragadda", "moosapet", "balnagar", "panjagutta", "somajiguda", "khairatabad", "lakdikapul"],
  "mehdipatnam": ["mehdipatnam", "tolichowki", "shaikpet", "narsingi", "manikonda", "attapur", "banjara hills"],
  "uppal_lbnagar": ["uppal x roads", "nagole", "lb nagar", "dilsukhnagar", "kothapet", "ramanthapur", "habsiguda", "tarnaka", "kacheguda station", "koti", "abids", "mahatma gandhi bus station (mgbs)", "charminar", "nampally station", "dsl virtue mall uppal"]
};

export const DISTANCE_MAP: Record<string, number> = {
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
  "pragathi nagar kaman": 5, "raidurg": 20, "ramanthapur": 32, "sainikpuri": 25,
  "sanjeeva reddy nagar": 16, "sarath city capital mall": 16, "secunderabad station": 22,
  "shaikpet": 22, "shamshabad airport": 45, "somajiguda": 19, "sr nagar": 16,
  "suchitra junction": 15, "tarnaka": 28, "tolichowki": 24, "uppal x roads": 35,
  "vanastalipuram": 38
};

export function isAIMatch(rideOrigin: string, rideDest: string, searchOrigin: string, searchDest: string): boolean {
  if (!searchOrigin && !searchDest) return false;
  
  const rO = rideOrigin.toLowerCase();
  const rD = rideDest.toLowerCase();
  const sO = searchOrigin ? searchOrigin.toLowerCase() : "";
  const sD = searchDest ? searchDest.toLowerCase() : "";

  // Helper to find corridor
  const getCorridor = (loc: string) => Object.keys(CORRIDORS).find(k => CORRIDORS[k].some(l => loc.includes(l) || l.includes(loc)));
  
  // Case 1: Driver is coming to VNR (rD is VNR)
  if (rD.includes("vnr")) {
    // Passenger is also coming to VNR
    if (sD === "" || sD.includes("vnr")) {
      if (sO) {
        const dCorridor = getCorridor(rO);
        const pCorridor = getCorridor(sO);
        if (dCorridor && pCorridor && dCorridor === pCorridor) {
          // Both in same corridor. Match if Driver origin distance > Passenger origin distance (meaning passenger is on the way)
          const dDist = DISTANCE_MAP[CORRIDORS[dCorridor].find(l => rO.includes(l) || l.includes(rO)) || ""] || 0;
          const pDist = DISTANCE_MAP[CORRIDORS[pCorridor].find(l => sO.includes(l) || l.includes(sO)) || ""] || 0;
          if (dDist >= pDist) return true;
        }
      }
    }
  }
  
  // Case 2: Driver is leaving VNR (rO is VNR)
  if (rO.includes("vnr")) {
    if (sO === "" || sO.includes("vnr")) {
      if (sD) {
        const dCorridor = getCorridor(rD);
        const pCorridor = getCorridor(sD);
        if (dCorridor && pCorridor && dCorridor === pCorridor) {
          // Passenger destination is on the way to Driver destination
          const dDist = DISTANCE_MAP[CORRIDORS[dCorridor].find(l => rD.includes(l) || l.includes(rD)) || ""] || 0;
          const pDist = DISTANCE_MAP[CORRIDORS[pCorridor].find(l => sD.includes(l) || l.includes(sD)) || ""] || 0;
          if (dDist >= pDist) return true;
        }
      }
    }
  }

  return false;
}
