export interface RouteData {
  id: string;
  path: string;
  discardedPath: string; // The sub-optimal route that is evaluated and rejected
  pickups: number[]; // Array of t-values (0 to 1) along the main path where pickups occur
  startPos: { x: number; y: number };
}

// These paths are handcrafted for an 800x800 viewBox.
export const handcraftedRoutes: RouteData[] = [
  {
    id: "route-alpha",
    path: "M 100,100 C 300,100 200,400 400,400 C 600,400 500,700 700,700",
    discardedPath: "M 100,100 C 300,100 200,400 400,400 C 500,400 650,550 700,700",
    pickups: [0.35, 0.75],
    startPos: { x: 100, y: 100 }
  },
  {
    id: "route-beta",
    path: "M 100,700 C 300,700 400,200 600,300 C 700,350 750,500 700,700",
    discardedPath: "M 100,700 C 300,700 400,200 600,300 C 600,450 700,600 700,700",
    pickups: [0.3, 0.8],
    startPos: { x: 100, y: 700 }
  },
  {
    id: "route-gamma",
    path: "M 700,100 C 500,100 500,500 300,500 C 150,500 100,700 100,700",
    discardedPath: "M 700,100 C 500,100 500,500 300,500 C 250,600 200,700 100,700",
    pickups: [0.25, 0.65],
    startPos: { x: 700, y: 100 }
  },
  {
    id: "route-delta",
    path: "M 400,100 C 400,300 200,300 200,500 C 200,700 600,700 700,500",
    discardedPath: "M 400,100 C 400,300 200,300 200,500 C 400,500 500,600 700,500",
    pickups: [0.4, 0.85],
    startPos: { x: 400, y: 100 }
  },
  {
    id: "route-epsilon",
    path: "M 100,400 C 300,200 500,600 700,400",
    discardedPath: "M 100,400 C 300,200 450,500 700,400",
    pickups: [0.5],
    startPos: { x: 100, y: 400 }
  },
  {
    id: "route-zeta",
    path: "M 200,100 C 100,300 300,500 400,700 C 500,900 700,600 700,400",
    discardedPath: "M 200,100 C 100,300 300,500 400,700 C 600,800 800,500 700,400",
    pickups: [0.33, 0.66],
    startPos: { x: 200, y: 100 }
  }
];

export function getRandomRoute(): { route: RouteData; mirrored: boolean } {
  const randomIndex = Math.floor(Math.random() * handcraftedRoutes.length);
  const mirrored = Math.random() > 0.5;
  return { route: handcraftedRoutes[randomIndex], mirrored };
}
