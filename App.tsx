
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, ScanLine, FileSearch, Workflow, 
  Settings as SettingsIcon, ChevronRight, Upload, Download, 
  FileCode, AlertCircle, Loader2, Trash2, CheckCircle2, 
  Moon, Sun, Languages, Dices, Sparkles, Wand2, Type as FontIcon,
  Palette, Highlighter, StickyNote
} from 'lucide-react';
import { AppTab, HistoryItem, FileState, SettingsState, ViewMode, NoteState, PAINTERS } from './types';
import { MODELS, CORAL_COLOR, TRANSLATIONS, SYSTEM_PROMPTS } from './constants';
import { geminiService } from './services/geminiService';

declare const mammoth: any;
declare const html2pdf: any;
declare const pdfjsLib: any;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [fileState, setFileState] = useState<FileState>({
    originalFile: null, pdfBlob: null, pdfUrl: null, 
    textContent: '', ocrContent: '', convertedFromDoc: false
  });
  const [noteState, setNoteState] = useState<NoteState>({ content: '', isModified: false });
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'Light', language: 'English', model: 'gemini-2.5-flash-latest',
    temperature: 0.2, maxTokens: 12000, painterStyle: 'None'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrPages, setOcrPages] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MARKDOWN);
  const [isJackpotting, setIsJackpotting] = useState(false);

  const t = TRANSLATIONS[settings.language as keyof typeof TRANSLATIONS];

  useEffect(() => {
    document.documentElement.className = settings.theme === 'Dark' ? 'dark' : '';
    const styleClass = `style-${settings.painterStyle.toLowerCase().replace(/\s+/g, '-')}`;
    document.body.className = `bg-slate-50 text-slate-900 transition-all duration-500 ${settings.theme === 'Dark' ? 'dark' : ''} ${settings.painterStyle !== 'None' ? styleClass : ''}`;
  }, [settings.theme, settings.painterStyle]);

  const addHistory = (action: string, details: string, tokens: number = 0) => {
    setHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action, details, model: settings.model, tokens
    }, ...prev]);
  };

  const toggleTheme = () => setSettings(s => ({ ...s, theme: s.theme === 'Light' ? 'Dark' : 'Light' }));
  const toggleLanguage = () => setSettings(s => ({ ...s, language: s.language === 'English' ? 'Traditional Chinese' : 'English' }));
  
  const triggerJackpot = () => {
    setIsJackpotting(true);
    let count = 0;
    const interval = setInterval(() => {
      const randomPainter = PAINTERS[Math.floor(Math.random() * PAINTERS.length)];
      setSettings(s => ({ ...s, painterStyle: randomPainter }));
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsJackpotting(false);
      }
    }, 100);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      if (file.type === 'application/pdf') {
        const url = URL.createObjectURL(file);
        setFileState({ ...fileState, originalFile: file, pdfBlob: file, pdfUrl: url, convertedFromDoc: false });
        addHistory('File Uploaded', `PDF: ${file.name}`);
      } else if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;
        const opt = {
          margin: 1, filename: file.name.replace(/\.[^/.]+$/, "") + ".pdf",
          image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };
        const element = document.createElement('div');
        element.innerHTML = `<div style="padding: 40px; font-family: sans-serif;">${html}</div>`;
        const pdfBlob = await html2pdf().from(element).set(opt).output('blob');
        setFileState({ ...fileState, originalFile: file, pdfBlob, pdfUrl: URL.createObjectURL(pdfBlob), textContent: html, convertedFromDoc: true });
        addHistory('Doc Converted', `${file.name} to PDF`);
      }
    } finally { setIsProcessing(false); }
  };

  const performOCR = async () => {
    if (!fileState.pdfBlob || ocrPages.length === 0) return;
    setIsProcessing(true);
    try {
      const typedArray = new Uint8Array(await fileState.pdfBlob.arrayBuffer());
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      const images: string[] = [];
      for (const pageNum of ocrPages) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height; canvas.width = viewport.width;
        await page.render({ canvasContext: context!, viewport }).promise;
        images.push(canvas.toDataURL('image/jpeg'));
      }
      const ocrResult = await geminiService.performOCR(images, settings.model);
      setFileState(prev => ({ ...prev, ocrContent: ocrResult }));
      addHistory('OCR Performed', `Pages: ${ocrPages.join(', ')}`, ocrResult.length / 4);
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 coral-bg rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <h1 className="font-bold text-white text-lg tracking-tight">FDA Agentic</h1>
        </div>
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <SidebarLink icon={<LayoutDashboard size={20}/>} label={t.dashboard} active={activeTab === AppTab.DASHBOARD} onClick={() => setActiveTab(AppTab.DASHBOARD)} />
          <SidebarLink icon={<FileCode size={20}/>} label={t.converter} active={activeTab === AppTab.CONVERTER} onClick={() => setActiveTab(AppTab.CONVERTER)} />
          <SidebarLink icon={<ScanLine size={20}/>} label={t.ocr} active={activeTab === AppTab.OCR} onClick={() => setActiveTab(AppTab.OCR)} />
          <SidebarLink icon={<StickyNote size={20}/>} label={t.notes} active={activeTab === AppTab.NOTE_KEEPER} onClick={() => setActiveTab(AppTab.NOTE_KEEPER)} />
          <SidebarLink icon={<FileSearch size={20}/>} label={t.summary} active={activeTab === AppTab.SUMMARY} onClick={() => setActiveTab(AppTab.SUMMARY)} />
          <SidebarLink icon={<Workflow size={20}/>} label={t.orchestration} active={activeTab === AppTab.ORCHESTRATION} onClick={() => setActiveTab(AppTab.ORCHESTRATION)} />
        </nav>
        <div className="p-4 mt-auto border-t border-slate-800">
          <SidebarLink icon={<SettingsIcon size={20}/>} label={t.settings} active={activeTab === AppTab.SETTINGS} onClick={() => setActiveTab(AppTab.SETTINGS)} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="capitalize">{activeTab.replace('_', ' ')}</span>
            <ChevronRight size={16} />
            <span className="text-slate-900 dark:text-white truncate max-w-[200px]">{fileState.originalFile?.name || 'Empty'}</span>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={triggerJackpot} className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all ${isJackpotting ? 'jackpot-anim' : ''}`} title={t.jackpot}>
                <Dices size={20} className={isJackpotting ? 'text-coral-bg' : ''} />
             </button>
             <button onClick={toggleLanguage} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all" title={t.lang}>
                <Languages size={20} />
             </button>
             <button onClick={toggleTheme} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all" title={t.theme}>
                {settings.theme === 'Light' ? <Moon size={20} /> : <Sun size={20} />}
             </button>
             <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
             {isProcessing && <Loader2 className="animate-spin text-blue-600" size={20} />}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === AppTab.DASHBOARD && <Dashboard history={history} />}
          {activeTab === AppTab.CONVERTER && <Converter fileState={fileState} onUpload={handleFileUpload} isProcessing={isProcessing} />}
          {activeTab === AppTab.OCR && <OCREngine fileState={fileState} ocrPages={ocrPages} setOcrPages={setOcrPages} onRunOCR={performOCR} isProcessing={isProcessing} viewMode={viewMode} setViewMode={setViewMode} />}
          {activeTab === AppTab.NOTE_KEEPER && <AINoteKeeper noteState={noteState} setNoteState={setNoteState} isProcessing={isProcessing} setIsProcessing={setIsProcessing} settings={settings} viewMode={viewMode} setViewMode={setViewMode} addHistory={addHistory} />}
          {activeTab === AppTab.SUMMARY && <Summary fileState={fileState} settings={settings} addHistory={addHistory} />}
          {activeTab === AppTab.ORCHESTRATION && <Orchestration />}
          {activeTab === AppTab.SETTINGS && <Settings settings={settings} setSettings={setSettings} />}
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

const SidebarLink = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${active ? 'bg-slate-800 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-slate-100'}`}>
    {icon} <span className="text-sm font-medium">{label}</span>
  </button>
);

const AINoteKeeper = ({ noteState, setNoteState, isProcessing, setIsProcessing, settings, viewMode, setViewMode, addHistory }: any) => {
  const [magicKeywords, setMagicKeywords] = useState('');
  const [magicColor, setMagicColor] = useState('#FF7F50');
  const [showMagicPanel, setShowMagicPanel] = useState(false);

  const processNote = async () => {
    setIsProcessing(true);
    try {
      const result = await geminiService.processNote(noteState.content, settings.model);
      setNoteState({ content: result, isModified: true });
      addHistory('Note Processed', 'Auto-enhancement & Coral highlighting');
    } finally { setIsProcessing(false); }
  };

  const applyMagic = async (type: string) => {
    setIsProcessing(true);
    let prompt = "";
    switch(type) {
      case 'keywords': prompt = SYSTEM_PROMPTS.MAGIC_KEYWORD(magicKeywords, magicColor); break;
      case 'summary': prompt = SYSTEM_PROMPTS.MAGIC_SUMMARY; break;
      case 'analogy': prompt = SYSTEM_PROMPTS.MAGIC_ANALOGY; break;
      case 'tags': prompt = SYSTEM_PROMPTS.MAGIC_TAGS; break;
      case 'translate': prompt = SYSTEM_PROMPTS.MAGIC_TRANSLATE(settings.language === 'English' ? 'Traditional Chinese' : 'English'); break;
      case 'polish': prompt = SYSTEM_PROMPTS.MAGIC_POLISH; break;
    }
    try {
      const result = await geminiService.runMagic(noteState.content, prompt, settings.model);
      setNoteState({ content: result, isModified: true });
      addHistory('AI Magic Applied', `Type: ${type}`);
    } finally { setIsProcessing(false); setShowMagicPanel(false); }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full gap-4">
      <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex gap-2">
          <button onClick={processNote} disabled={!noteState.content || isProcessing} className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg text-sm font-bold flex items-center gap-2 hover:scale-105 transition-all">
            <Sparkles size={16} /> Process Note
          </button>
          <button onClick={() => setShowMagicPanel(!showMagicPanel)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all">
            <Wand2 size={16} /> AI Magics
          </button>
        </div>
        <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
          <button onClick={() => setViewMode(ViewMode.MARKDOWN)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.MARKDOWN ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Markdown</button>
          <button onClick={() => setViewMode(ViewMode.TEXT)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.TEXT ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Raw Text</button>
        </div>
      </div>

      {showMagicPanel && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-800 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top duration-300">
          <div className="space-y-2 col-span-1 border-r border-blue-200 pr-4">
             <label className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase">AI Keywords Highlight</label>
             <input value={magicKeywords} onChange={e => setMagicKeywords(e.target.value)} placeholder="Comma separated keywords..." className="w-full text-xs p-2 rounded border border-blue-200 dark:bg-slate-800 dark:border-slate-700" />
             <div className="flex items-center gap-2 mt-2">
               <input type="color" value={magicColor} onChange={e => setMagicColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
               <button onClick={() => applyMagic('keywords')} className="flex-1 py-1 bg-blue-600 text-white text-xs font-bold rounded">Apply Highlighter</button>
             </div>
          </div>
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <MagicButton icon={<FileSearch size={14}/>} label="Deep Summary" onClick={() => applyMagic('summary')} />
            <MagicButton icon={<Palette size={14}/>} label="Visual Analogy" onClick={() => applyMagic('analogy')} />
            <MagicButton icon={<Highlighter size={14}/>} label="Smart Tags" onClick={() => applyMagic('tags')} />
            <MagicButton icon={<Languages size={14}/>} label="Translate Mirror" onClick={() => applyMagic('translate')} />
            <MagicButton icon={<Sparkles size={14}/>} label="Pro Polish" onClick={() => applyMagic('polish')} />
            <MagicButton icon={<Trash2 size={14}/>} label="Clear All" onClick={() => setNoteState({content: '', isModified: false})} variant="danger" />
          </div>
        </div>
      )}

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-inner border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        {viewMode === ViewMode.TEXT ? (
          <textarea 
            value={noteState.content} 
            onChange={e => setNoteState({ ...noteState, content: e.target.value })} 
            placeholder="Paste your medical regulatory notes here..."
            className="w-full h-full p-8 font-mono text-sm dark:bg-slate-900 dark:text-slate-200 outline-none resize-none"
          />
        ) : (
          <div 
            className="w-full h-full p-8 overflow-y-auto prose dark:prose-invert max-w-none markdown-body" 
            dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(noteState.content || "_Start typing or paste content to begin..._") }}
          />
        )}
        {isProcessing && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>}
      </div>
    </div>
  );
};

const MagicButton = ({ icon, label, onClick, variant }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${variant === 'danger' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5'}`}>
    {icon} {label}
  </button>
);

const Dashboard = ({ history }: { history: HistoryItem[] }) => (
  <div className="max-w-6xl mx-auto space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard title="Total Processes" value={history.length.toString()} icon={<Workflow className="text-blue-500" />} />
      <StatCard title="Tokens Consumed" value={history.reduce((a, b) => a + b.tokens, 0).toLocaleString()} icon={<ScanLine className="text-coral-bg" />} />
      <StatCard title="System Health" value="Optimal" icon={<CheckCircle2 className="text-green-500" />} />
    </div>
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 dark:text-white">Recent Activity</h3>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {history.length === 0 ? <div className="p-8 text-center text-slate-500 italic">No activity recorded yet.</div> : history.map(item => (
          <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400"><FileText size={18} /></div>
              <div><div className="font-semibold text-slate-900 dark:text-white">{item.action}</div><div className="text-xs text-slate-500">{item.details}</div></div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</div>
              <div className="text-[10px] uppercase font-bold text-blue-600">{item.model}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
    <div><div className="text-sm text-slate-500 font-medium mb-1">{title}</div><div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div></div>
    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">{icon}</div>
  </div>
);

const Converter = ({ fileState, onUpload, isProcessing }: any) => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-center space-y-4">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Upload size={32} /></div>
      <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Documentation</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Select a DOCX, DOC, or PDF file to start. Automatic PDF conversion enabled.</p>
      <div className="relative inline-block mt-4">
        <input type="file" onChange={onUpload} accept=".pdf,.docx,.doc" className="absolute inset-0 opacity-0 cursor-pointer" disabled={isProcessing} />
        <button className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto">
          {isProcessing ? <Loader2 className="animate-spin" /> : <Upload size={20} />} Select File
        </button>
      </div>
    </div>
    {fileState.pdfUrl && (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[600px]">
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={18} />
            <span className="font-bold text-slate-800 dark:text-white text-sm">Preview Ready</span>
          </div>
          <a href={fileState.pdfUrl} download={fileState.originalFile?.name.replace(/\.[^/.]+$/, "") + ".pdf"} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"><Download size={16} /> Download PDF</a>
        </div>
        <iframe src={fileState.pdfUrl} className="flex-1 w-full border-none" title="PDF Preview" />
      </div>
    )}
  </div>
);

const OCREngine = ({ fileState, ocrPages, setOcrPages, onRunOCR, isProcessing, viewMode, setViewMode }: any) => {
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  useEffect(() => {
    if (!fileState.pdfBlob) return;
    const loadThumbnails = async () => {
      const typedArray = new Uint8Array(await fileState.pdfBlob.arrayBuffer());
      const pdf = await pdfjsLib.getDocument(typedArray).promise;
      const thumbArray: string[] = [];
      for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height; canvas.width = viewport.width;
        await page.render({ canvasContext: context!, viewport }).promise;
        thumbArray.push(canvas.toDataURL());
      }
      setThumbnails(thumbArray);
    };
    loadThumbnails();
  }, [fileState.pdfBlob]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
          <h3 className="font-bold text-slate-800 dark:text-white">1. Select Pages</h3>
          <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
            {thumbnails.map((src, i) => (
              <div key={i} onClick={() => setOcrPages(ocrPages.includes(i + 1) ? ocrPages.filter((x:any) => x !== i + 1) : [...ocrPages, i + 1].sort((a:any, b:any) => a - b))} className={`cursor-pointer rounded-lg border-2 transition-all overflow-hidden relative ${ocrPages.includes(i + 1) ? 'border-coral-bg shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                <img src={src} className="w-full h-auto" alt={`Page ${i+1}`} />
                <div className="absolute top-1 left-1 px-2 py-0.5 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm">Pg {i+1}</div>
                {ocrPages.includes(i + 1) && <div className="absolute inset-0 bg-coral-bg/10 flex items-center justify-center"><CheckCircle2 className="text-white" fill="#FF7F50" /></div>}
              </div>
            ))}
          </div>
        </div>
        <button onClick={onRunOCR} disabled={isProcessing || ocrPages.length === 0} className="w-full py-4 coral-bg text-white font-bold rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
          {isProcessing ? <Loader2 className="animate-spin" /> : <ScanLine size={20} />} Run AI OCR
        </button>
      </div>
      <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="font-bold text-slate-800 dark:text-white uppercase tracking-wider text-xs">Analysis Result</h3>
          <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
            <button onClick={() => setViewMode(ViewMode.MARKDOWN)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.MARKDOWN ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Markdown</button>
            <button onClick={() => setViewMode(ViewMode.TEXT)} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${viewMode === ViewMode.TEXT ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Text</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-8 prose dark:prose-invert max-w-none">
          {isProcessing ? <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4"><Loader2 className="animate-spin" size={48} /><p className="animate-pulse">Analysing...</p></div> : fileState.ocrContent ? (
            viewMode === ViewMode.MARKDOWN ? <div className="markdown-body" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(fileState.ocrContent) }} /> : <textarea value={fileState.ocrContent} readOnly className="w-full h-full font-mono text-sm p-4 bg-slate-900 text-slate-200 rounded-lg resize-none" />
          ) : <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4"><AlertCircle size={48} /><p>No data. Pick pages and run.</p></div>}
        </div>
      </div>
    </div>
  );
};

const convertMarkdownToHTML = (md: string) => {
  return md
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-4 border-b pb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-extrabold mt-10 mb-6">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n/gim, '<br />');
};

const Summary = ({ fileState, settings, addHistory }: any) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await geminiService.generateSummary(fileState.ocrContent || fileState.textContent, settings.model);
      setSummary(result);
      addHistory('Summary Generated', 'Created review memo');
    } finally { setLoading(false); }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
         <div><h3 className="font-bold text-slate-800 dark:text-white">Review Memo Generator</h3><p className="text-sm text-slate-500">Transform raw data into a structured FDA memo.</p></div>
         <button onClick={handleGenerate} disabled={loading || (!fileState.ocrContent && !fileState.textContent)} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">{loading ? <Loader2 className="animate-spin" size={18} /> : <FileSearch size={18} />} Generate Memo</button>
       </div>
       <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 min-h-[400px]">
          {loading ? <div className="flex flex-col items-center justify-center h-full text-slate-400 pt-20"><Loader2 className="animate-spin" size={48} /><p>Synthesizing...</p></div> : summary ? <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: convertMarkdownToHTML(summary) }} /> : <div className="flex flex-col items-center justify-center h-full text-slate-300 pt-20"><FileText size={48} /><p>No memo generated.</p></div>}
       </div>
    </div>
  );
};

const Orchestration = () => (
  <div className="max-w-4xl mx-auto space-y-8">
    <div className="bg-indigo-600 rounded-3xl p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
      <div className="flex-1 space-y-4"><h2 className="text-3xl font-extrabold">Regulatory Orchestrator</h2><p className="text-indigo-100 text-lg">AI-led strategy for submission pathways.</p><button className="px-8 py-3 bg-white text-indigo-600 font-bold rounded-xl">Start Mapping</button></div>
      <div className="w-full md:w-64 h-64 bg-white/10 rounded-2xl flex items-center justify-center"><Workflow size={120} className="text-indigo-200" /></div>
    </div>
  </div>
);

const Settings = ({ settings, setSettings }: any) => (
  <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 space-y-8">
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Painter Style (Jackpot Theme)</label>
        <select value={settings.painterStyle} onChange={e => setSettings({...settings, painterStyle: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none">
          {PAINTERS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Gemini Model</label>
        <select value={settings.model} onChange={e => setSettings({...settings, model: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none">
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Language</label>
        <div className="flex gap-4">
           {['English', 'Traditional Chinese'].map(lang => (
             <button key={lang} onClick={() => setSettings({...settings, language: lang})} className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${settings.language === lang ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'border-slate-100 dark:border-slate-700 text-slate-500'}`}>{lang}</button>
           ))}
        </div>
      </div>
    </div>
  </div>
);

export default App;
