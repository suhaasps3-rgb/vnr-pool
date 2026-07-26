import { isAIMatch } from '../lib/matchmaking';

console.log('Quthbullapur (h):', isAIMatch('Jeedimetla', 'VNR VJIET', 'Quthbullapur', 'VNR VJIET'));
console.log('Qutbullapur (no h):', isAIMatch('Jeedimetla', 'VNR VJIET', 'Qutbullapur', 'VNR VJIET'));
console.log('Dundigal:', isAIMatch('Jeedimetla', 'VNR VJIET', 'Dundigal', 'VNR VJIET'));
console.log('Dundigal (empty dest):', isAIMatch('Jeedimetla', 'VNR VJIET', 'Dundigal', ''));
