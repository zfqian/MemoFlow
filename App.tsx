import React, { useState, useEffect, useRef } from 'react';
import { Memo, AIReviewResult, AppSettings } from './types';
import * as storage from './services/storageService';
import * as gemini from './services/geminiService';
import MemoCard from './components/MemoCard';
import AIReview from './components/AIReview';
import SettingsModal from './components/SettingsModal';

// Speech Recognition Type Extension
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

const App: React.FC = () => {
  // --- State ---
  const [memos, setMemos] = useState<Memo[]>([]);
  const [reviews, setReviews] = useState<AIReviewResult[]>([]);
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingSupported, setIsRecordingSupported] = useState(true);
  
  const [showReview, setShowReview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentReview, setCurrentReview] = useState<AIReviewResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Initialization ---
  useEffect(() => {
    setMemos(storage.getMemos());
    setReviews(storage.getReviews());
    
    // Check Speech capability
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsRecordingSupported(false);
    }
  }, []);

  // --- Logic: Memos ---
  const handleSubmit = () => {
    if (!inputText.trim()) return;

    const newMemo: Memo = {
      id: crypto.randomUUID(),
      content: inputText.trim(),
      createdAt: Date.now(),
    };

    const updated = storage.saveMemo(newMemo);
    setMemos(updated);
    setInputText('');
  };

  const handleDelete = (id: string) => {
    const updated = storage.deleteMemo(id);
    setMemos(updated);
  };

  // --- Logic: Grouping ---
  const getGroupedMemos = () => {
    const groups: { [key: string]: Memo[] } = {};
    
    memos.forEach(memo => {
      const date = new Date(memo.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let key = date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
      
      if (date.toDateString() === today.toDateString()) key = "Today";
      else if (date.toDateString() === yesterday.toDateString()) key = "Yesterday";
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(memo);
    });

    return Object.entries(groups).sort((a, b) => {
      // Sort keys roughly by recency (Note: This simple string key sort isn't perfect for all dates, 
      // but works for "Today"/"Yesterday" if we rely on the memo order which is already sorted desc).
      // Since memos are stored Newest->Oldest, the groups will naturally form in that order if we iterate correctly.
      // A safer way is to compare the timestamp of the first item in each group.
      return b[1][0].createdAt - a[1][0].createdAt;
    });
  };

  // --- Logic: Audio ---
  const toggleRecording = () => {
    if (!isRecordingSupported) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = navigator.language || 'en-US'; // Use browser language

      recognition.onstart = () => setIsRecording(true);
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText(prev => (prev ? prev + ' ' : '') + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  // --- Logic: Review & AI ---
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(storage.saveSettings(newSettings));
  };

  const handleGenerateReview = async () => {
    setIsAiLoading(true);
    try {
      // Call service with frequency
      const resultData = await gemini.generateReview(memos, settings.reviewFrequency);
      
      const fullResult: AIReviewResult = {
        ...resultData,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        frequency: settings.reviewFrequency
      };

      setCurrentReview(fullResult);
      const updatedReviews = storage.saveReview(fullResult);
      setReviews(updatedReviews);

    } catch (error) {
      console.error("Failed review:", error);
      alert("Failed to generate review. Please check connection and API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-50 shadow-2xl overflow-hidden relative border-x border-gray-100 font-sans">
      
      {/* Header */}
      <header className="flex-none px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 z-10 flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">MemoFlow</h1>
           <p className="text-xs text-slate-400">{memos.length} fragments • {settings.reviewFrequency} mode</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Settings Button */}
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.35a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          
          {/* Review Button */}
          <button 
            onClick={() => setShowReview(true)}
            className="p-2.5 bg-indigo-50 text-indigo-600 rounded-full hover:bg-indigo-100 transition-colors active:scale-95 relative"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            {reviews.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main List Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        {memos.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
             <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
             </div>
             <p className="text-slate-500 font-medium text-lg">Your mind is clear.</p>
             <p className="text-slate-400 text-sm mt-2">Capture a fragment to start your flow.</p>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            {getGroupedMemos().map(([dateGroup, groupMemos]) => (
              <div key={dateGroup} className="animate-in fade-in slide-in-from-bottom-4">
                <div className="sticky top-0 z-0 flex items-center mb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-gray-50 pr-4">{dateGroup}</span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                <div className="space-y-3">
                  {groupMemos.map(memo => (
                    <MemoCard key={memo.id} memo={memo} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input Area */}
      <div className="flex-none p-4 bg-white border-t border-slate-100">
        <div className="relative flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
          
          <button 
            onClick={toggleRecording}
            className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${
              isRecording 
                ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse' 
                : isRecordingSupported 
                  ? 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                  : 'text-slate-200 cursor-not-allowed'
            }`}
            title={isRecordingSupported ? "Voice Input" : "Voice Not Supported"}
            disabled={!isRecordingSupported}
          >
            {isRecording ? (
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            ) : (
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            )}
          </button>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={isRecording ? "Listening..." : "What's on your mind?"}
            className="w-full bg-transparent border-0 focus:ring-0 p-3 max-h-32 min-h-[48px] resize-none text-slate-700 placeholder:text-slate-400 leading-relaxed"
            rows={1}
          />

          <button 
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            className={`p-3 rounded-xl transition-all duration-200 flex-shrink-0 mb-px ${
              inputText.trim() 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transform hover:-translate-y-0.5' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showReview && (
        <AIReview 
          currentResult={currentReview}
          history={reviews}
          isLoading={isAiLoading}
          frequency={settings.reviewFrequency}
          onClose={() => setShowReview(false)}
          onGenerate={handleGenerateReview}
          onLoadReview={setCurrentReview}
        />
      )}

      {showSettings && (
        <SettingsModal 
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
