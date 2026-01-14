import React from 'react';
import { RiskLevel } from '../types';

export const RiskBadge: React.FC<{ level: RiskLevel; score: number }> = ({ level, score }) => {
  let colorClass = '';
  
  switch (level) {
    case RiskLevel.Low:
      colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      break;
    case RiskLevel.Medium:
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
      break;
    case RiskLevel.High:
      colorClass = 'bg-orange-100 text-orange-800 border-orange-200';
      break;
    case RiskLevel.Critical:
      colorClass = 'bg-rose-100 text-rose-800 border-rose-200';
      break;
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${colorClass} w-fit`}>
      <span className="font-semibold text-xs uppercase tracking-wide">{level}</span>
      <span className="w-px h-3 bg-current opacity-30"></span>
      <span className="font-bold text-sm">{score}</span>
    </div>
  );
};