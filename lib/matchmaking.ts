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
  ["attapur", "mehdipatnam", "tolichowki", "gachibowli", "hi-tech city", "kukatpally", "kphb", "jntu", "nizampet", "bachupally (vnr)", "vnr vjiet"]
];

export function isAIMatch(rideOrigin: string, rideDest: string, searchOrigin: string, searchDest: string): boolean {
  if (!searchOrigin && !searchDest) return false;
  
  const rO = rideOrigin.toLowerCase();
  const rD = rideDest.toLowerCase();
  const sO = searchOrigin ? searchOrigin.toLowerCase() : "";
  const sD = searchDest ? searchDest.toLowerCase() : "";

  // Helper to find index of a location in a route
  const findLocIndex = (route: string[], queryLoc: string) => {
    return route.findIndex(node => queryLoc.includes(node) || node.includes(queryLoc));
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
            // Driver travels to a higher index, Passenger travels to a lower/equal index
            if (pIndex <= dIndex) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}
