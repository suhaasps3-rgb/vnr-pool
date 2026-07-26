
const fs = require('fs');
const content = fs.readFileSync('lib/matchmaking.ts', 'utf-8');
const match = content.match(/export const ROUTES: string\[\]\[\] = \[([\s\S]*?)\];/);
const routesStr = match[0].replace('export const ROUTES: string[][] = ', '');
const ROUTES = eval(routesStr);

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '').replace('qutbullapur', 'quthbullapur').replace('hitech', 'hitec').replace('hi-tech', 'hitec');
const findLocIndex = (route, queryLoc) => {
    const q = queryLoc.toLowerCase().trim();
    if (!q) return -1;
    let idx = route.findIndex(node => node.toLowerCase().trim() === q);
    if (idx !== -1) return idx;
    const regex = new RegExp('\\\\b' + q + '\\\\b', 'i');
    idx = route.findIndex(node => regex.test(node));
    if (idx !== -1) return idx;
    const normQ = normalize(queryLoc);
    return route.findIndex(node => {
      const n = normalize(node);
      return normQ.includes(n) || n.includes(normQ);
    });
};
const testRoute = (rO, rD) => {
  const validRoutes = [];
  const addRoute = (index, route, startIndex, endIndex) => {
    validRoutes.push({ index, path: route.slice(startIndex, endIndex + 1) });
  };
  if (rD.includes('vnr') || rD.includes('campus')) {
    ROUTES.forEach((route, index) => {
      const dIndex = findLocIndex(route, rO);
      const vnrIndex = findLocIndex(route, rD);
      if (dIndex !== -1 && vnrIndex !== -1 && dIndex <= vnrIndex) {
        addRoute(index, route, dIndex, vnrIndex);
      }
    });
  }
  const filteredRoutes = validRoutes.filter((routeA, i) => {
    const isSubset = validRoutes.some((routeB, j) => {
      if (i === j) return false;
      if (routeA.path.length <= routeB.path.length) {
        let matches = 0;
        routeA.path.forEach(nodeA => {
          if (findLocIndex(routeB.path, nodeA) !== -1) matches++;
        });
        if (matches / routeA.path.length >= 0.75) {
          if (routeA.path.length === routeB.path.length) {
             return j < i;
          }
          return true;
        }
      }
      return false;
    });
    return !isSubset;
  });
  console.log(rO, 'routes:', filteredRoutes.length);
};
testRoute('ecil', 'vnr vjiet campus gate 1');
testRoute('anandbagh', 'vnr vjiet campus gate 1');

