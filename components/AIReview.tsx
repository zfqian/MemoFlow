import React, { useState } from 'react';
import { AIReviewResult, ReviewFrequency } from '../types';

interface AIReviewProps {
  currentResult: AIReviewResult | null;
  history: AIReviewResult[];
  isLoading: boolean;
  frequency: ReviewFrequency;
  onClose: () => void;
  onGenerate: () => void;
  onLoadReview: (review: AIReviewResult) => void;
}

const AIReview: React.FC<AIReviewProps> = ({ 
  currentResult, 
  history, 
  isLoading, 
  frequency,
  onClose, 
  onGenerate,
  onLoadReview
}) => {
  const [view, setView] = useState<'current' | 'history'>(currentResult ? 'current' : 'history');

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            </div>
            <div>
              <h2 className="font-bold text-slate-800">Review Center</h2>
              <p className="text-xs text-slate-500 capitalize">{frequency} Review Mode</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setView('current')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${view === 'current' ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Latest Insight
            {view === 'current' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 mx-12 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setView('history')}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${view === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Past Reviews
            {view === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 mx-12 rounded-t-full"></div>}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {view === 'current' ? (
             isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-slate-500 animate-pulse">Analysing your week...</p>
              </div>
            ) : !currentResult ? (
              <div className="text-center py-12 space-y-4">
                 <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                 </div>
                 <p className="text-slate-600">No active review for this period.</p>
                 <button 
                  onClick={onGenerate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-indigo-200 active:scale-95"
                 >
                   Start {frequency.charAt(0).toUpperCase() + frequency.slice(1)} Review
                 </button>
              </div>
            ) : (
              <ReviewDetail result={currentResult} />
            )
          ) : (
            // History View
            <div className="space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">No review history yet.</div>
              ) : (
                history.map((review) => (
                  <button 
                    key={review.id}
                    onClick={() => {
                      onLoadReview(review);
                      setView('current');
                    }}
                    className="w-full text-left bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex justify-between items-center group"
                  >
                    <div>
                      <div className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">{review.frequency} Review</div>
                      <div className="text-slate-800 font-medium">{formatDate(review.periodStart)} - {formatDate(review.periodEnd)}</div>
                      <div className="text-slate-400 text-xs mt-1 truncate max-w-[200px]">{review.summary}</div>
                    </div>
                    <div className="text-slate-300 group-hover:text-indigo-400 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for displaying a single review result
const ReviewDetail: React.FC<{ result: AIReviewResult }> = ({ result }) => {
  return (
    <>
      {/* Mood & Stats */}
      <section className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center">
           <span className="text-xs text-slate-400 uppercase font-bold">Current Mood</span>
           <span className="text-indigo-600 font-bold text-lg mt-1">{result.dimensions?.mood || 'Neutral'}</span>
        </div>
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
           {result.dimensions?.scores && Object.entries(result.dimensions.scores).map(([key, val]) => (
             <div key={key} className="flex items-center gap-2 text-xs">
               <span className="capitalize w-12 text-slate-500">{key}</span>
               <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${val}%` }}></div>
               </div>
             </div>
           ))}
        </div>
      </section>

      {/* Summary Section */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          Summary
        </h3>
        <div className="bg-white p-0 text-slate-700 leading-relaxed text-[15px]">
          {result.summary}
        </div>
      </section>

      {/* Connections Section */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          Insights & Connections
        </h3>
        <ul className="space-y-2">
          {result.connections.map((item, idx) => (
            <li key={idx} className="flex gap-3 text-slate-700 text-sm bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-50">
              <span className="text-indigo-500 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Action Items */}
      {result.actionableItems.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            Action Items
          </h3>
          <div className="bg-green-50 rounded-xl border border-green-100">
            {result.actionableItems.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 text-sm text-slate-700 border-b border-green-100 last:border-0 items-start">
                 <div className="mt-1 w-4 h-4 rounded-full border-2 border-green-400 flex-shrink-0"></div>
                 <span className="leading-tight">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tags */}
      <section>
        <div className="flex flex-wrap gap-2">
          {result.tags.map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </section>
    </>
  );
};

export default AIReview;
