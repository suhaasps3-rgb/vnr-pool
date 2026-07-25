"use client";
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex items-center justify-center">
      <span className="text-slate-400">Loading map...</span>
    </div>
  ),
});

export default DynamicMap;
