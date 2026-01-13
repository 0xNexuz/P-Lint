
import React from 'react';

interface ScoreCardProps {
  score: number;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ score }) => {
  const getColor = () => {
    if (score > 80) return 'text-green-400 border-green-400/30';
    if (score > 50) return 'text-yellow-400 border-yellow-400/30';
    return 'text-red-500 border-red-500/30';
  };

  const getBg = () => {
    if (score > 80) return 'bg-green-400/5';
    if (score > 50) return 'bg-yellow-400/5';
    return 'bg-red-500/5';
  };

  return (
    <div className={`p-8 rounded-2xl border-2 transition-all duration-500 ${getColor()} ${getBg()} flex flex-col items-center justify-center`}>
      <span className="text-sm font-semibold uppercase tracking-widest opacity-70 mb-2">Privacy Score</span>
      <div className="text-7xl font-bold mono">{score}</div>
      <div className="mt-4 flex items-center gap-2">
        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ${score > 80 ? 'bg-green-400' : score > 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className="text-xs font-medium">/ 100</span>
      </div>
    </div>
  );
};

export default ScoreCard;
