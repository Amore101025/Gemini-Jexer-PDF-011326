
export const MODELS = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash-latest',
  'gemini-2.5-flash-lite-latest'
];

export const CORAL_COLOR = '#FF7F50';

export const SYSTEM_PROMPTS = {
  OCR: `You are an expert OCR and document analysis engine. 
Perform a precise OCR on the provided image(s) from a medical device regulatory document.
Output the text in clean, professional Markdown. 
CRITICAL: Identify key regulatory and technical terms and wrap them in: <span style="color: coral; font-weight: bold;">term</span>.
Maintain tables as Markdown tables. Do not hallucinate content.`,
  SUMMARY: `You are an FDA 510(k) reviewer. 
Summarize the provided content into a professional review memo format. 
Highlight critical risks, technological characteristics, and predicate comparisons.`,
  NOTE_PROCESSOR: `You are a professional note-taking assistant. 
Convert the input into structured Markdown. 
CRITICAL: Identify important keywords and concepts and wrap them in: <span style="color: coral; font-weight: bold;">term</span>.`,
  MAGIC_KEYWORD: (keywords: string, color: string) => `You are a document highlighter. 
For the provided document, find all occurrences of these keywords: [${keywords}]. 
Wrap them EXACTLY in: <span style="color: ${color}; font-weight: bold;">term</span>. 
Do not change anything else in the text.`,
  MAGIC_SUMMARY: `Provide a extremely concise bulleted summary of this document.`,
  MAGIC_ANALOGY: `Explain the core concepts of this document using a creative visual analogy.`,
  MAGIC_TAGS: `Suggest 5 professional metadata tags for this document.`,
  MAGIC_TRANSLATE: (target: string) => `Translate the following text into ${target}, maintaining all Markdown formatting.`,
  MAGIC_POLISH: `Rewrite this text to be more professional, clear, and impactful while maintaining the core meaning.`
};

export const TRANSLATIONS = {
  English: {
    dashboard: "Dashboard",
    converter: "Doc Converter",
    ocr: "OCR Engine",
    notes: "AI Note Keeper",
    summary: "Summary & Entities",
    orchestration: "Orchestration",
    settings: "Settings",
    jackpot: "Style Jackpot",
    theme: "Theme",
    lang: "Language",
    process: "Process Note",
    magics: "AI Magics"
  },
  "Traditional Chinese": {
    dashboard: "儀表板",
    converter: "文件轉換器",
    ocr: "OCR 引擎",
    notes: "AI 筆記助手",
    summary: "摘要與實體",
    orchestration: "流程編排",
    settings: "設定",
    jackpot: "風格大樂透",
    theme: "主題",
    lang: "語言",
    process: "處理筆記",
    magics: "AI 魔法"
  }
};
