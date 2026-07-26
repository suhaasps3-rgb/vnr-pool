const fs = require('fs');

let content = fs.readFileSync('lib/matchmaking.ts', 'utf-8');

const newFunction = `
export function calculateDynamicOverlappingSplit(
  driverOrigin: string,
  driverDest: string,
  driverPricePerSeat: number,
  totalSeats: number,
  isAuto: boolean,
  passengers: { id: string; pickup: string; dropoff: string }[]
): { driverShare: number, passengerShares: Record<string, number> } | null {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const getDist = (loc: string) => {
    const q = normalize(loc);
    const matchedKey = Object.keys(DISTANCE_MAP).find(k => normalize(k) === q || normalize(k).includes(q) || q.includes(normalize(k)));
    if (matchedKey) return DISTANCE_MAP[matchedKey];
    return null;
  };

  const d1 = getDist(driverOrigin);
  const d2 = getDist(driverDest);
  if (d1 === null || d2 === null) return null;

  const totalDriverDist = Math.abs(d1 - d2);
  if (totalDriverDist === 0) return null;

  // Reverse engineer total cost
  const totalPeopleFactor = isAuto ? totalSeats + 1 : totalSeats;
  const totalCost = driverPricePerSeat * totalPeopleFactor;
  const costPerKm = totalCost / totalDriverDist;

  const stopsSet = new Set<number>();
  stopsSet.add(d1);
  stopsSet.add(d2);

  const validPassengers = passengers.map(p => {
    const p1 = getDist(p.pickup);
    const p2 = getDist(p.dropoff);
    return { ...p, dStart: p1, dEnd: p2 };
  }).filter(p => p.dStart !== null && p.dEnd !== null);

  validPassengers.forEach(p => {
    stopsSet.add(p.dStart as number);
    stopsSet.add(p.dEnd as number);
  });

  // Sort stops descending (furthest from VNR first)
  const stops = Array.from(stopsSet).sort((a, b) => b - a);

  const passengerShares: Record<string, number> = {};
  validPassengers.forEach(p => passengerShares[p.id] = 0);
  let driverShare = 0;

  const driverMax = Math.max(d1, d2);
  const driverMin = Math.min(d1, d2);

  for (let i = 0; i < stops.length - 1; i++) {
    const start = stops[i];
    const end = stops[i+1];
    
    // Only process segments that are within the driver's route
    if (start <= driverMax && end >= driverMin) {
      const segDist = start - end;
      const segCost = segDist * costPerKm;
      
      const inCar = validPassengers.filter(p => {
        const pMax = Math.max(p.dStart!, p.dEnd!);
        const pMin = Math.min(p.dStart!, p.dEnd!);
        return start <= pMax && end >= pMin;
      });
      
      const count = 1 + inCar.length;
      const split = segCost / count;
      
      driverShare += split;
      inCar.forEach(p => {
        passengerShares[p.id] += split;
      });
    }
  }

  driverShare = Math.ceil(driverShare);
  Object.keys(passengerShares).forEach(k => {
    passengerShares[k] = Math.ceil(passengerShares[k]);
  });

  return { driverShare, passengerShares };
}
`;

if (!content.includes('calculateDynamicOverlappingSplit')) {
  content += newFunction;
  fs.writeFileSync('lib/matchmaking.ts', content);
  console.log("Function added!");
} else {
  console.log("Already exists.");
}
