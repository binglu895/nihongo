
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const getExplanation = async (sentence: string, options: string[], answer: string, language: string = 'English'): Promise<string> => {
  const prompt = `
    Context: Japanese JLPT Study App.
    Language: ${language}
    Sentence: "${sentence}"
    Answer: "${answer}"
    Choices: ${options.join(", ")}
    
    Task: Explain in ${language} why "${answer}" is correct and why other choices might be confusing. Keep it concise, educational, and encouraging. Use Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate explanation at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The sensei is currently busy. Please try again later.";
  }
};

export const translateContent = async (text: string, targetLanguage: string): Promise<string> => {
  if (targetLanguage === 'English') return text;

  const prompt = `Translate the following text into ${targetLanguage}. Keep it simple and clear. Text: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-latest',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return text;
  }
};
