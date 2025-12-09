import React from 'react';
import { Memo } from '../types';

interface MemoCardProps {
  memo: Memo;
  onDelete: (id: string) => void;
}

const MemoCard: React.FC<MemoCardProps> = ({ memo, onDelete }) => {
  const date = new Date(memo.createdAt);
  
  // Format: "10:30 · Oct 24"
  const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="group relative bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 mb-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center text-xs text-slate-400 font-medium space-x-2">
          <span className="bg-slate-50 px-2 py-0.5 rounded text-slate-500">{dateString}</span>
          <span>{timeString}</span>
        </div>
        <button 
          onClick={() => onDelete(memo.id)}
          className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
          aria-label="Delete memo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
          </svg>
        </button>
      </div>
      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-[15px]">
        {memo.content}
      </div>
    </div>
  );
};

export default MemoCard;
