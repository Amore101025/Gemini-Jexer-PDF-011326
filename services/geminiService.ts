
import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { SYSTEM_PROMPTS } from "../constants";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable is not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async performOCR(images: string[], model: string = 'gemini-2.5-flash-latest'): Promise<string> {
    const imageParts: Part[] = images.map(base64 => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64.split(',')[1]
      }
    }));

    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model,
      contents: { 
        parts: [
          ...imageParts, 
          { text: "Please OCR these pages and output in Markdown with coral keywords as instructed." }
        ] 
      },
      config: {
        systemInstruction: SYSTEM_PROMPTS.OCR,
        temperature: 0.1,
      }
    });

    return response.text || "Failed to generate OCR content.";
  }

  async processNote(content: string, model: string = 'gemini-3-flash-preview'): Promise<string> {
    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model,
      contents: content,
      config: {
        systemInstruction: SYSTEM_PROMPTS.NOTE_PROCESSOR,
        temperature: 0.3,
      }
    });
    return response.text || content;
  }

  async runMagic(content: string, prompt: string, model: string = 'gemini-3-flash-preview'): Promise<string> {
    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model,
      contents: content,
      config: {
        systemInstruction: prompt,
        temperature: 0.5,
      }
    });
    return response.text || content;
  }

  async generateSummary(text: string, model: string = 'gemini-3-flash-preview'): Promise<string> {
    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model,
      contents: text,
      config: {
        systemInstruction: SYSTEM_PROMPTS.SUMMARY,
        temperature: 0.2,
      }
    });
    return response.text || "Failed to generate summary.";
  }
}

export const geminiService = new GeminiService();
