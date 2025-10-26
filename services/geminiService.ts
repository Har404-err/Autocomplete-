import { GoogleGenAI } from "@google/genai";

export const getCodeSuggestions = async (codeSnippet: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `You are an expert code completion AI.
A user is typing code and needs an autocomplete suggestion.
Complete the following code snippet. Provide only the code that should be appended to complete the snippet.
Do not repeat the user's code. Do not add any explanations, comments, or markdown formatting.
Keep the suggestion concise and directly related to the code context.`;
    
    const contents = `Code snippet:
\`\`\`
${codeSnippet}
\`\`\`

Completion:`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
        maxOutputTokens: 128,
        topP: 0.9,
        topK: 20,
      }
    });
    
    // Use response.text, which is the recommended accessor for the text content.
    const text = response.text;

    // Trim whitespace from both ends. This prevents issues where the model returns
    // only spaces, which would cause the Tab key to appear to do nothing.
    // If text is null or undefined, return an empty string.
    return text ? text.trim() : '';

  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    // Propagate a more user-friendly error
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("Invalid API Key. Please check your configuration.");
    }
    throw new Error("Failed to get suggestions from Gemini.");
  }
};
