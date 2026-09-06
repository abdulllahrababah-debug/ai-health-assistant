import React from 'react';

export default function ProgressSteps({ current, total }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 flex-1 rounded-full transition-all ${
            i < current ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}
