'use client';

import React from 'react';

export function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dark Ambient Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />

      {/* Top Left Gradient Orb */}
      <div className="glow-ambient top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/15" />

      {/* Middle Right Gradient Orb */}
      <div className="glow-ambient top-[35%] right-[-10%] w-[600px] h-[600px] bg-sky-500/10" />

      {/* Bottom Left Gradient Orb */}
      <div className="glow-ambient bottom-[10%] left-[15%] w-[550px] h-[550px] bg-emerald-500/10" />
    </div>
  );
}
