const fs = require('fs');

async function testGeocode(locName) {
  let queries = [
    `${locName}, Hyderabad, Telangana`,
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
        console.log(`[SUCCESS] ${locName} -> ${query}: ${data[0].lat}, ${data[0].lon}`);
        return;
      }
    } catch (e) {
      console.error(e.message);
    }
    // delay
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log(`[FAILED] ${locName}`);
}

async function main() {
  const testLocs = ['Adibatla', 'TCS Adibatla', 'Shamshabad Airport', 'Nexus Mall Kukatpally', 'VNR VJIET', 'Bachupally', 'Miyapur'];
  for (const loc of testLocs) {
    await testGeocode(loc);
  }
}

main();
