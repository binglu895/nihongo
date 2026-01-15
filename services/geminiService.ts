
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const getExplanation = async (question: string, options: string[], correctAnswer: string): Promise<string> => {
  const prompt = `
    Context: Japanese JLPT Study App.
    Question: "${question}"
    Choices: ${options.join(", ")}
    Correct Answer: "${correctAnswer}"
    
    Task: Briefly explain why the correct answer is right and why the other common mistakes (like the other choices) are wrong. Keep it concise, educational, and encouraging. Use Markdown. Focus on the nuance between the options.
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
