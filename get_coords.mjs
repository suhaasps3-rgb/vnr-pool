import fs from 'fs';

const locations = ["kphb", "jntu hyderabad", "ameerpet", "nampally", "secunderabad", "kukatpally", "pragathi nagar", "miyapur", "dilsukhnagar", "lb nagar", "madhapur", "hitech city", "gachibowli", "kondapur"];

async function run() {
    const out = {};
    for (const loc of locations) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}, Hyderabad, Telangana, India`, {
                headers: { "User-Agent": "antigravity-bot/1.0" }
            });
            const data = await res.json();
            if (data && data.length > 0) {
                out[loc.replace(' hyderabad', '')] = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                console.log(`Found ${loc}`);
            } else {
                console.log(`Not found ${loc}`);
            }
        } catch (e) {
            console.error(e);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
    fs.writeFileSync('top_coords.json', JSON.stringify(out, null, 2));
}

run();
