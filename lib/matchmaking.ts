export const ROUTES: string[][] = [
  // Route 1: Uppal -> Tarnaka -> Secunderabad -> Bowenpally -> Balnagar -> Kukatpally -> JNTU -> Nizampet -> Bachupally
  ["dsl virtue mall uppal", "uppal x roads", "habsiguda", "tarnaka", "secunderabad station", "bowenpally", "balnagar", "moosapet", "kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "nizampet x roads", "bachupally x roads"],
  
  // Route 2: LB Nagar -> Dilsukhnagar -> Ameerpet -> Kukatpally -> JNTU
  ["vanastalipuram", "lb nagar", "kothapet", "dilsukhnagar", "mahatma gandhi bus station (mgbs)", "koti", "abids", "nampally station", "lakdikapul", "khairatabad", "panjagutta", "ameerpet metro", "sr nagar", "sanjeeva reddy nagar", "erragadda", "moosapet", "kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "nizampet x roads", "bachupally x roads"],

  // Route 3: Patancheru -> Miyapur
  ["patancheru", "bhel", "chanda nagar", "lingampally", "miyapur x roads", "bachupally x roads"],

  // Route 4: Shamshabad -> Mehdipatnam -> Hitech City -> Miyapur
  ["shamshabad airport", "attapur", "mehdipatnam", "tolichowki", "shaikpet", "raidurg", "inorbit mall madhapur", "madhapur", "hi-tech city", "kondapur", "sarath city capital mall", "hafeezpet", "miyapur x roads", "bachupally x roads"],

  // Route 5: Financial District -> Gachibowli -> Kondapur
  ["kokapet", "financial district", "nanakramguda", "gachibowli wipro circle", "gachibowli", "kondapur", "sarath city capital mall", "hafeezpet", "miyapur x roads", "bachupally x roads"],

  // Route 6: ECIL -> Secunderabad -> Balnagar
  ["ecil x roads", "as rao nagar", "sainikpuri", "malkajgiri", "secunderabad station", "bowenpally", "balnagar", "moosapet", "kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "nizampet x roads", "bachupally x roads"],

  // Route 7: Medchal -> Kompally -> Bowenpally -> Balnagar
  ["medchal", "kompally", "bolarum", "suchitra junction", "bowenpally", "balnagar", "moosapet", "kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "nizampet x roads", "bachupally x roads"],

  // Route 8: Nagole -> Ramanthapur -> Tarnaka
  ["nagole", "ramanthapur", "habsiguda", "tarnaka", "secunderabad station", "bowenpally", "balnagar", "moosapet", "kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "nizampet x roads", "bachupally x roads"],

  // Route 9: Banjara Hills -> Jubilee Hills -> Hitech City
  ["banjara hills", "jubilee hills checkpost", "madhapur", "hi-tech city", "kondapur", "sarath city capital mall", "hafeezpet", "miyapur x roads", "bachupally x roads"],

  // Route 10: Somajiguda -> Begumpet -> Balnagar
  ["somajiguda", "begumpet", "balnagar", "moosapet", "kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "nizampet x roads", "bachupally x roads"],

  // Route 11: Manikonda -> Shaikpet -> Hitech
  ["manikonda", "shaikpet", "raidurg", "inorbit mall madhapur", "madhapur", "hi-tech city", "kondapur", "sarath city capital mall", "hafeezpet", "miyapur x roads", "bachupally x roads"],

  // Route 12: Pragathi Nagar fork
  ["kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "pragathi nagar kaman", "bachupally x roads"],
  ["secunderabad station", "bowenpally", "balnagar", "moosapet", "kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "pragathi nagar kaman", "bachupally x roads"],
  ["ameerpet metro", "sr nagar", "sanjeeva reddy nagar", "erragadda", "moosapet", "kukatpally metro", "nexus mall kukatpally", "kphb colony", "jntu metro", "pragathi nagar kaman", "bachupally x roads"]
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
