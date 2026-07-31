"use client";
import dynamic from 'next/dynamic';

const DynamicRouteMap = dynamic(() => import('./RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
      <span className="text-slate-400">Loading map...</span>
    </div>
  ),
});

export default DynamicRouteMap;
