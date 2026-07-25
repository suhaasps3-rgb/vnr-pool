
export const DISTANCE_MAP: Record<string, number> = {
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
  "pragathi nagar kaman": 5, "raidurg": 20, "ramanthapur": 32, "sainikpuri": 25,
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
  "vnr vjiet": 0
};

export const ALL_LOCATIONS = Object.keys(DISTANCE_MAP)
  .map(loc => loc.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "))
  .sort();
