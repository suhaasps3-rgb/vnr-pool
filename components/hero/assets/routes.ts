export interface RouteData {
  id: string;
  path: string;
  pickups: number[]; // Array of t-values (0 to 1) along the path where pickups occur
  startPos: { x: number; y: number };
}

// These paths are handcrafted for an 800x800 viewBox.
// They use smooth cubic beziers to simulate real-world road curves.
export const handcraftedRoutes: RouteData[] = [
  {
    id: "route-alpha",
    path: "M 100,100 C 300,100 200,400 400,400 C 600,400 500,700 700,700",
    pickups: [0.35, 0.75],
    startPos: { x: 100, y: 100 }
  },
  {
    id: "route-beta",
    path: "M 100,700 C 300,700 400,200 600,300 C 700,350 750,500 700,700",
    pickups: [0.3, 0.8],
    startPos: { x: 100, y: 700 }
  },
  {
    id: "route-gamma",
    path: "M 700,100 C 500,100 500,500 300,500 C 150,500 100,700 100,700",
    pickups: [0.25, 0.65],
    startPos: { x: 700, y: 100 }
  },
  {
    id: "route-delta",
    path: "M 400,100 C 400,300 200,300 200,500 C 200,700 600,700 700,500",
    pickups: [0.4, 0.85],
    startPos: { x: 400, y: 100 }
  },
  {
    id: "route-epsilon",
    path: "M 100,400 C 300,200 500,600 700,400",
    pickups: [0.5],
    startPos: { x: 100, y: 400 }
  },
  {
    id: "route-zeta",
    path: "M 200,100 C 100,300 300,500 400,700 C 500,900 700,600 700,400",
    pickups: [0.33, 0.66],
    startPos: { x: 200, y: 100 }
  }
];

// Helper to select a random route and optionally mirror it to create more variety
export function getRandomRoute(): { route: RouteData; mirrored: boolean } {
  const randomIndex = Math.floor(Math.random() * handcraftedRoutes.length);
  const mirrored = Math.random() > 0.5;
  return { route: handcraftedRoutes[randomIndex], mirrored };
}
