
import React, { useState } from 'react';
import { Lock, Keyboard, Plus, X } from 'lucide-react';
import { KEYWORD_PRESETS, Scenario } from '../types';
import { Language, TRANSLATIONS } from '../locales';

interface InputPanelProps {
  text: string;
  glossary: string;
  keywords: string[];
  customTags: string[];
  onChangeText: (val: string) => void;
  onChangeGlossary: (val: string) => void;
  onToggleKeyword: (keyword: string) => void;
  onAddCustomTag: (tag: string) => void;
  lang: Language;
  scenario: Scenario;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  text,
  glossary,
  keywords,
  customTags,
  onChangeText,
  onChangeGlossary,
  onToggleKeyword,
  onAddCustomTag,
  lang,
  scenario
}) => {
  const t = TRANSLATIONS[lang].input;
  const placeholders = TRANSLATIONS[lang].placeholders;
  const [newTag, setNewTag] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newTag.trim()) {
        onAddCustomTag(newTag.trim());
        setNewTag('');
      }
    }
  };

  const handleAddClick = () => {
    if (newTag.trim()) {
      onAddCustomTag(newTag.trim());
      setNewTag('');
    }
  };

  // Merge presets with custom tags for display
  const allTags = [
    ...KEYWORD_PRESETS,
    ...customTags.map(tag => ({ term: tag, meaning: 'Custom' }))
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t.source}</h3>
        <div className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-500 border border-slate-200">
          {text.length} {t.chars}
        </div>
      </div>

      {/* Main Text Area */}
      <div className="flex-grow relative mb-6 group">
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={placeholders[scenario] || t.placeholder}
          className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-800 font-medium text-lg placeholder:text-slate-400 focus:outline-none focus:border-[#ff5722] focus:ring-4 focus:ring-orange-500/10 transition-all resize-none custom-scrollbar leading-relaxed"
          style={{ minHeight: '240px' }}
        />
        {text && (
          <button 
            onClick={() => onChangeText('')}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xs bg-white border border-slate-200 px-2 py-1 rounded hover:bg-slate-50 transition-colors shadow-sm"
          >
            {t.clear}
          </button>
        )}
      </div>

      {/* Tools Section */}
      <div className="space-y-5">
        {/* Glossary */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
          <div className="flex items-center gap-2 mb-2 text-[#00bfa5]">
            <Lock size={14} />
            <span className="text-xs font-bold uppercase tracking-wide">{t.glossaryTitle}</span>
          </div>
          <input
            type="text"
            value={glossary}
            onChange={(e) => onChangeGlossary(e.target.value)}
            placeholder={t.glossaryPlaceholder}
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-[#00bfa5] focus:ring-2 focus:ring-[#00bfa5]/10 transition-all placeholder:text-slate-400"
          />
          <p className="text-[10px] text-slate-400 mt-1.5 ml-1">{t.glossaryTip}</p>
        </div>

        {/* Quick Keywords & Custom Tags */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-[#ff5722]">
            <Keyboard size={14} />
            <span className="text-xs font-bold uppercase tracking-wide">{t.keywordTitle}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {allTags.map((kw, idx) => {
              const active = keywords.includes(kw.term);
              return (
                <button
                  key={`${kw.term}-${idx}`}
                  onClick={() => onToggleKeyword(kw.term)}
                  title={kw.meaning}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all shadow-sm flex flex-col items-start group ${
                    active 
                    ? 'bg-[#ff5722] text-white border-[#ff5722] shadow-orange-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <span className="leading-none flex items-center gap-1">
                    {active ? <span className="opacity-75">✓</span> : <span className="opacity-50">+</span>}
                    {kw.term}
                  </span>
                  {/* Show meaning only if it's not "Custom" */}
                  {kw.meaning !== 'Custom' && (
                    <span className={`text-[9px] font-normal mt-0.5 ${active ? 'text-orange-100' : 'text-slate-400 group-hover:text-slate-500'}`}>
                      {kw.meaning}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Add Custom Tag Input */}
          <div className="flex items-center gap-2 max-w-[240px]">
            <input 
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.addTagPlaceholder}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff5722] transition-all"
            />
            <button 
              onClick={handleAddClick}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg p-1.5 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
