const fs = require('fs');

let content = fs.readFileSync('components/Dashboard.tsx', 'utf-8');

// Root
content = content.replace('className="dark min-h-screen bg-slate-950 text-slate-50 relative', 'className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 relative');

// Header
content = content.replace('bg-slate-950/80 border-b border-slate-800/80', 'bg-white/80 border-b border-slate-200 dark:bg-slate-950/80 dark:border-slate-800/80');

function replaceClass(target, replacement) {
  const escapedTarget = target.replace(/\//g, '\\/');
  const lookahead = target.includes('/') ? '' : '(?![\\/a-zA-Z0-9-])';
  const regex = new RegExp(`(?<!dark:)${escapedTarget}${lookahead}`, 'g');
  content = content.replace(regex, replacement);
}

replaceClass('text-white', 'text-slate-900 dark:text-white');
replaceClass('text-slate-400', 'text-slate-500 dark:text-slate-400');
replaceClass('text-slate-300', 'text-slate-600 dark:text-slate-300');
replaceClass('text-slate-50', 'text-slate-900 dark:text-slate-50');

replaceClass('bg-slate-900/50', 'bg-white dark:bg-slate-900/50');
replaceClass('border-slate-800/80', 'border-slate-200 dark:border-slate-800/80');
replaceClass('bg-slate-900/60', 'bg-slate-100/80 dark:bg-slate-900/60');
replaceClass('border-slate-700/50', 'border-slate-300 dark:border-slate-700/50');
replaceClass('bg-slate-800', 'bg-slate-200 dark:bg-slate-800');
replaceClass('bg-slate-900', 'bg-white dark:bg-slate-900');
replaceClass('hover:bg-slate-800', 'hover:bg-slate-200 dark:hover:bg-slate-800');
replaceClass('hover:border-slate-700', 'hover:border-slate-300 dark:hover:border-slate-700');
replaceClass('bg-slate-900/40', 'bg-white/60 dark:bg-slate-900/40');
replaceClass('bg-slate-900/80', 'bg-white/80 dark:bg-slate-900/80');
replaceClass('border-slate-800', 'border-slate-200 dark:border-slate-800');
replaceClass('bg-slate-950', 'bg-slate-50 dark:bg-slate-950');

fs.writeFileSync('components/Dashboard.tsx', content);
console.log("Updated classes cleanly!");
