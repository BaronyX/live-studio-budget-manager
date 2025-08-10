import React from 'react';

export const SkeletonRow: React.FC = () => (
  <div className="animate-pulse flex items-center gap-3 p-3">
    <div className="w-14 h-14 bg-bd/40 rounded-md" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-bd/40 rounded w-1/3" />
      <div className="h-3 bg-bd/30 rounded w-2/3" />
    </div>
  </div>
);

export default SkeletonRow;