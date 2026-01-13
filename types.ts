
export enum ViewMode {
  MARKDOWN = 'MARKDOWN',
  TEXT = 'TEXT'
}

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  CONVERTER = 'CONVERTER',
  OCR = 'OCR',
  NOTE_KEEPER = 'NOTE_KEEPER',
  SUMMARY = 'SUMMARY',
  ORCHESTRATION = 'ORCHESTRATION',
  SETTINGS = 'SETTINGS'
}

export interface HistoryItem {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  model: string;
  tokens: number;
}

export interface FileState {
  originalFile: File | null;
  pdfBlob: Blob | null;
  pdfUrl: string | null;
  textContent: string;
  ocrContent: string;
  convertedFromDoc: boolean;
}

export interface NoteState {
  content: string;
  isModified: boolean;
}

export interface SettingsState {
  theme: 'Light' | 'Dark';
  language: 'English' | 'Traditional Chinese';
  model: string;
  temperature: number;
  maxTokens: number;
  painterStyle: string;
}

export const PAINTERS = [
  "None", "Van Gogh", "Picasso", "Monet", "Dalí", "Basquiat", "Kusama", 
  "Mondrian", "Kahlo", "Warhol", "Rembrandt", "Hokusai", "Klimt", 
  "Kandinsky", "Da Vinci", "Rothko", "Banksy", "O'Keeffe", "Matisse", "Vermeer", "Lichtenstein"
];
