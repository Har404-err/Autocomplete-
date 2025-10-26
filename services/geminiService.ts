
import { GoogleGenAI } from "@google/genai";

export const getCodeSuggestions = async (codeSnippet: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
      You are an expert code completion AI.
      A user is typing code and needs an autocomplete suggestion.
      Complete the following code snippet. Provide only the code that should be appended to complete the snippet.
      Do not repeat the user's code. Do not add any explanations, comments, or markdown formatting.
      Keep the suggestion concise and directly related to the code context.

      Code snippet:
      \`\`\`
      ${codeSnippet}
      \`\`\`

      Completion:
    `;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 128,
        topP: 0.9,
        topK: 20,
      }
    });
    
    // Safely access the text property using optional chaining (?.) and provide a fallback value ('')
    // to prevent the "Cannot read properties of undefined (reading 'trimStart')" error.
    const text = response.text?.trimStart() ?? '';
    
    if (!text) {
      return '';
    }

    return text;

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    // Propagate a more user-friendly error
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("Invalid API Key. Please check your configuration.");
    }
    throw new Error("Failed to get suggestions from Gemini.");
  }
};
