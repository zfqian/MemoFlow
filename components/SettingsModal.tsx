import React from 'react';
import { AppSettings, ReviewFrequency } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);

  const frequencies: { value: ReviewFrequency; label: string }[] = [
    { value: 'daily', label: 'Daily Review' },
    { value: 'weekly', label: 'Weekly Review' },
    { value: 'monthly', label: 'Monthly Review' },
  ];

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-800">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Frequency */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Review Frequency</label>
            <div className="grid grid-cols-1 gap-2">
              {frequencies.map((freq) => (
                <button
                  key={freq.value}
                  onClick={() => setLocalSettings({ ...localSettings, reviewFrequency: freq.value })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                    localSettings.reviewFrequency === freq.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  {freq.label}
                  {localSettings.reviewFrequency === freq.value && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Time */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Preferred Review Time</label>
            <input
              type="time"
              value={localSettings.reviewTime}
              onChange={(e) => setLocalSettings({ ...localSettings, reviewTime: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-slate-700"
            />
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-200"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
