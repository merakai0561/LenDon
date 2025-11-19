import React, { useState, useEffect } from 'react';
import { Package, ExternalLink, Zap, Cpu, Settings, Globe } from 'lucide-react';
import { Scenario, TranslationState, ModelType, KEYWORD_PRESETS } from './types';
import { generateTranslation } from './services/geminiService';
import { ModeSelector } from './components/ModeSelector';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { SettingsModal } from './components/SettingsModal';
import { Language, TRANSLATIONS } from './locales';

// Safe env check helper
const hasEnvKey = () => {
  return typeof process !== 'undefined' && process.env && !!process.env.API_KEY;
};

const App: React.FC = () => {
  const [state, setState] = useState<TranslationState>({
    input: '',
    output: '',
    glossary: '',
    keywords: [],
    customTags: [], // Initialize empty custom tags
    scenario: Scenario.SEO_TITLE,
    model: 'gemini-3-pro-preview',
    isLoading: false,
    error: null
  });

  const [apiKey, setApiKey] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese

  const t = TRANSLATIONS[lang];

  // Load API Key from localStorage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    } else if (!hasEnvKey()) {
      // If no env key and no local key, prompt user
      const timer = setTimeout(() => setIsSettingsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleGenerate = async () => {
    if (!state.input.trim()) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await generateTranslation(
        state.input,
        state.scenario,
        state.glossary,
        state.keywords,
        state.model,
        apiKey // Pass the manual key
      );
      setState(prev => ({ ...prev, output: result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "Something went wrong"
      }));
      
      // If error is related to missing key, open settings
      if (err.message?.includes("API Key")) {
        setIsSettingsOpen(true);
      }
    }
  };

  const toggleKeyword = (kw: string) => {
    setState(prev => {
      const exists = prev.keywords.includes(kw);
      if (exists) {
        return { ...prev, keywords: prev.keywords.filter(k => k !== kw) };
      }
      return { ...prev, keywords: [...prev.keywords, kw] };
    });
  };

  const handleAddCustomTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    // Prevent duplicates in custom tags or existing presets
    const alreadyExists = state.customTags.includes(trimmedTag) || KEYWORD_PRESETS.some(p => p.term === trimmedTag);
    
    if (alreadyExists) {
      // If it exists but isn't selected, just select it
      if (!state.keywords.includes(trimmedTag)) {
        toggleKeyword(trimmedTag);
      }
      return;
    }

    // Add to custom tags AND auto-select it
    setState(prev => ({
      ...prev,
      customTags: [...prev.customTags, trimmedTag],
      keywords: [...prev.keywords, trimmedTag]
    }));
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'zh' : 'en');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f1f5f9] text-slate-900 selection:bg-[#ff5722] selection:text-white">
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        lang={lang}
      />

      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md fixed top-0 w-full z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#ff5722] to-[#f4511e] p-2 rounded-lg shadow-lg shadow-orange-500/20 text-white">
              <Package size={20} />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight text-lg leading-none">{t.header.title}</h1>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t.header.subtitle}</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-3 text-sm font-medium">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#ff5722] transition-all border border-transparent hover:border-slate-200"
            >
              <Globe size={12} />
              {lang === 'en' ? 'EN' : '中文'}
            </button>

            <div className="hidden md:flex items-center gap-2 mr-2 border-l border-slate-200 pl-3">
               <Cpu size={14} className="text-slate-400" />
               <select 
                 value={state.model}
                 onChange={(e) => setState(prev => ({ ...prev, model: e.target.value as ModelType }))}
                 className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#ff5722] focus:ring-1 focus:ring-[#ff5722]/20 cursor-pointer transition-all hover:bg-slate-100"
               >
                 <option value="gemini-3-pro-preview">{t.header.modelPro}</option>
                 <option value="gemini-2.5-flash">{t.header.modelFlash}</option>
               </select>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all shadow-sm border ${
                !apiKey && !hasEnvKey() 
                  ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Settings size={12} />
              {!apiKey && !hasEnvKey() ? t.header.setKey : t.header.settings}
            </button>

            <button className="hidden sm:flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs transition-all shadow-sm">
              <ExternalLink size={12} />
              {t.header.sellerCenter}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Scenario Tabs */}
          <ModeSelector 
            currentScenario={state.scenario} 
            onSelect={(s) => setState(prev => ({ ...prev, scenario: s }))} 
            lang={lang}
          />

          {/* Workbench Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
            
            {/* Left Column: Input */}
            <div className="bg-white rounded-2xl p-6 flex flex-col border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
              <InputPanel 
                text={state.input}
                glossary={state.glossary}
                keywords={state.keywords}
                customTags={state.customTags}
                onChangeText={(val) => setState(prev => ({ ...prev, input: val }))}
                onChangeGlossary={(val) => setState(prev => ({ ...prev, glossary: val }))}
                onToggleKeyword={toggleKeyword}
                onAddCustomTag={handleAddCustomTag}
                lang={lang}
                scenario={state.scenario}
              />
              
              <div className="mt-6 pt-5 border-t border-slate-100">
                <button
                  onClick={handleGenerate}
                  disabled={state.isLoading || !state.input.trim()}
                  className={`
                    w-full py-3.5 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all
                    ${state.isLoading || !state.input.trim()
                      ? 'bg-slate-200 cursor-not-allowed text-slate-400 shadow-none' 
                      : 'bg-gradient-to-r from-[#ff5722] to-[#f4511e] hover:from-[#ff7043] hover:to-[#ff5722] hover:shadow-orange-500/30 active:scale-[0.99]'}
                  `}
                >
                  {state.isLoading ? (
                    <span>{t.action.processing}</span>
                  ) : (
                    <>
                      <Zap size={18} className="fill-current" />
                      <span>{t.action.process}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Output */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative">
              <OutputPanel 
                result={state.output}
                isLoading={state.isLoading}
                scenario={state.scenario}
                onRegenerate={handleGenerate}
                lang={lang}
              />
              
              {state.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 text-center font-medium">
                  {state.error}
                </div>
              )}
            </div>

          </div>

          {/* Footer / Info */}
          <div className="mt-10 text-center">
            <p className="text-slate-400 text-xs font-medium">
              Powered by Google GenAI • Current Model: {state.model}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;