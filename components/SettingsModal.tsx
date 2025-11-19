import React, { useState, useEffect } from 'react';
import { X, Key, Save, ShieldCheck } from 'lucide-react';
import { Language, TRANSLATIONS } from '../locales';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  lang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  apiKey, 
  onSaveApiKey,
  lang
}) => {
  const [inputValue, setInputValue] = useState('');
  
  // Safe check for env key
  const hasEnvKey = typeof process !== 'undefined' && process.env && !!process.env.API_KEY;
  
  const t = TRANSLATIONS[lang].settings;

  useEffect(() => {
    if (isOpen) {
      setInputValue(apiKey);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(inputValue.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-800">
            <div className="p-1.5 bg-slate-200 rounded-lg">
              <Key size={18} className="text-slate-600" />
            </div>
            <h2 className="font-bold text-lg">{t.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {hasEnvKey && (
            <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm">
              <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={16} />
              <div className="text-emerald-800">
                <span className="font-bold">{t.envDetected}</span>
                <p className="opacity-80 mt-0.5">{t.envDesc}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700">
              {t.label}
            </label>
            <input 
              type="password"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={hasEnvKey ? "Using environment key..." : t.placeholder}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#ff5722] focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-slate-800 placeholder:text-slate-400 font-mono text-sm"
            />
            <p className="text-xs text-slate-500">
              {t.storageTip} 
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[#ff5722] hover:underline ml-1">
                {t.getKey}
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 transition-colors text-sm"
          >
            {t.cancel}
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2 rounded-lg font-bold text-white bg-[#ff5722] hover:bg-[#f4511e] shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm"
          >
            <Save size={16} />
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
};