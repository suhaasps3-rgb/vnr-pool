const https = require('https');

const CUSTOM_POIS = [
  { name: "S Grand", lat: 17.525, lon: 78.385, neighbourhood: "Bachupally", radius: 0.3 },
  { name: "Hyderabad Spice", lat: 17.5185, lon: 78.3965, neighbourhood: "Bachupally", radius: 0.3 },
  { name: "Pista House Bachupally", lat: 17.5300, lon: 78.3800, neighbourhood: "Bachupally", radius: 0.3 },
  { name: "Pragathi Nagar Kaman", lat: 17.5408, lon: 78.3938, neighbourhood: "Pragathi Nagar", radius: 0.4 },
  { name: "Simhapuri Kaman", lat: 17.5350, lon: 78.3850, neighbourhood: "Bachupally", radius: 0.3 },
  { name: "Bakers Heaven", lat: 17.5380, lon: 78.3860, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "Dosthi Biryani's", lat: 17.5395, lon: 78.3852, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "Eat Magic.in", lat: 17.5398, lon: 78.3855, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "Kammani Telugu Kitchen", lat: 17.5385, lon: 78.3845, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "Biryani Factory", lat: 17.5400, lon: 78.3860, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "Angaara Restaurant", lat: 17.5180, lon: 78.3970, neighbourhood: "Nizampet", radius: 0.2 },
  { name: "Allah's Kitchen and Bar", lat: 17.5200, lon: 78.3900, neighbourhood: "Nizampet", radius: 0.2 },
  { name: "Taqila Lounge and Restaurant", lat: 17.5250, lon: 78.3880, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "Polar Bear", lat: 17.5150, lon: 78.3900, neighbourhood: "Nizampet", radius: 0.2 },
  { name: "The Golden Barrel", lat: 17.5210, lon: 78.3920, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "Dominos", lat: 17.5300, lon: 78.3850, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "VNR Hostel", lat: 17.5392, lon: 78.3865, neighbourhood: "Bachupally", radius: 0.2 },
  { name: "Mamata Academy of Medical Sciences", lat: 17.531, lon: 78.381, neighbourhood: "Bachupally", radius: 0.6 },
  { name: "Reach Super Speciality Hospital", lat: 17.528, lon: 78.382, neighbourhood: "Bachupally", radius: 0.4 },
  { name: "Relief Hospital Pragathi Nagar", lat: 17.541, lon: 78.395, neighbourhood: "Pragathi Nagar", radius: 0.4 },
  { name: "Silver Oaks International School", lat: 17.5455, lon: 78.3755, neighbourhood: "Bachupally", radius: 0.5 },
  { name: "Kennedy High The Global School", lat: 17.5332, lon: 78.3661, neighbourhood: "Bachupally", radius: 0.5 },
  { name: "Mallampet Lake", lat: 17.5500, lon: 78.3600, neighbourhood: "Mallampet", radius: 0.8 },
  { name: "Bachupally Police Station", lat: 17.5420, lon: 78.3780, neighbourhood: "Bachupally", radius: 0.3 },
  { name: "VNR VJIET", lat: 17.53905, lon: 78.38546, neighbourhood: "Bachupally", radius: 1.5 }
];

async function checkLocation(poi) {
  return new Promise((resolve) => {
    // Add cache buster to force Vercel to compute it on the edge
    const url = `https://vnr-pool-omega.vercel.app/api/geocode?lat=${poi.lat}&lon=${poi.lon}&t=${Date.now()}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.poiLabel === poi.name) {
            console.log(`[PASS] ${poi.name}`);
            resolve(true);
          } else {
            console.log(`[FAIL] Expected: '${poi.name}', Got: '${json.poiLabel}' (Distance Check Failed)`);
            resolve(false);
          }
        } catch (e) {
          console.log(`[FAIL] ${poi.name} - API Error or Rate Limit`);
          resolve(false);
        }
      });
    }).on('error', () => {
      console.log(`[FAIL] ${poi.name} - Network Error`);
      resolve(false);
    });
  });
}

async function runTests() {
  console.log(`Starting manual verification of ${CUSTOM_POIS.length} Custom POIs against Live Vercel API...\n`);
  let passed = 0;
  for (const poi of CUSTOM_POIS) {
    const success = await checkLocation(poi);
    if (success) passed++;
    // tiny delay to avoid overwhelming the external Nominatim API if it forwards to it
    await new Promise(r => setTimeout(r, 600));
  }
  console.log(`\nVerification Complete! ${passed}/${CUSTOM_POIS.length} locations passed successfully.`);
}

runTests();
