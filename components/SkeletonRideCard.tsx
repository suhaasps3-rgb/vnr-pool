export function SkeletonRideCard() {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden animate-pulse">
      <div className="p-4 md:p-6 pb-5">
        
        {/* Header: Driver Info & Price */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--bg-primary)]"></div>
            </div>
            <div>
              <div className="w-32 h-5 bg-[var(--bg-primary)] rounded-md mb-2"></div>
              <div className="w-16 h-4 bg-[var(--bg-primary)] rounded-md"></div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-10 h-3 bg-[var(--bg-primary)] rounded-sm mb-2"></div>
            <div className="w-16 h-8 bg-[var(--bg-primary)] rounded-xl"></div>
          </div>
        </div>

        {/* Route Micro-Timeline */}
        <div className="relative pl-[22px] mb-8">
          <div className="absolute left-[7px] top-4 bottom-5 w-[2px] bg-[var(--bg-primary)] rounded-full" />
          
          {/* Origin */}
          <div className="relative flex items-start gap-4 mb-6">
            <div className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--bg-primary)] shadow-[0_0_0_4px_var(--bg-surface)] z-10" />
            <div>
              <div className="w-12 h-3 bg-[var(--bg-primary)] rounded-sm mb-1"></div>
              <div className="w-40 h-5 bg-[var(--bg-primary)] rounded-md"></div>
            </div>
          </div>

          {/* Destination */}
          <div className="relative flex items-start gap-4">
            <div className="absolute -left-[20.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[var(--bg-primary)] shadow-[0_0_0_4px_var(--bg-surface)] z-10" />
            <div>
              <div className="w-16 h-3 bg-[var(--bg-primary)] rounded-sm mb-1"></div>
              <div className="w-48 h-5 bg-[var(--bg-primary)] rounded-md"></div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] mb-5 h-12">
          <div className="w-24 h-4 bg-[var(--bg-surface)] rounded-md"></div>
          <div className="w-px h-6 bg-[var(--border-subtle)]" />
          <div className="w-20 h-4 bg-[var(--bg-surface)] rounded-md"></div>
        </div>

        {/* Vehicle Tag */}
        <div className="mb-6 h-8 w-28 bg-[var(--bg-primary)] rounded-full"></div>

        {/* Action Button */}
        <div className="h-12 md:h-14 w-full bg-[var(--bg-primary)] rounded-xl"></div>
      </div>
    </div>
  );
}
