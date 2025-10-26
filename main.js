/* global acode */
/*
 * This file is the main entry point for the Gemini Code Autocomplete plugin.
 * It uses the Acode Plugin SDK, which is available globally via the `acode` object.
 * The SDK provides methods to interact with the editor, settings, UI components, and more.
 */

// We are importing the official Google GenAI library from a CDN.
// This is the standard way to include external libraries in Acode plugins.
import { GoogleGenAI } from "https://aistudiocdn.com/@google/genai@^1.27.0";

class GeminiAutocompletePlugin {
    
    #ai = null;
    #abortController = null;
    #debounceTimeout = null;
    #isLoading = false;

    constructor() {
        // The ID must match the 'id' in plugin.json
        this.id = "com.gemini.code.autocomplete";
    }

    /**
     * This method is called by Acode when the plugin is initialized.
     * It's the main setup point for the plugin.
     */
    async init() {
        try {
            const apiKey = this.settings.geminiApiKey;
            if (!apiKey) {
                // Using Acode's built-in alert system to notify the user.
                acode.alert("Error", "Gemini API Key is not set. Please configure it in the plugin settings.");
                return;
            }
            // Initialize the Gemini AI client with the user's API key.
            this.#ai = new GoogleGenAI({ apiKey });
            
            // This is the core of the plugin. We register a "completion provider" with Acode.
            // Acode will call our #provideCompletions method whenever it needs autocomplete suggestions
            // for the specified file types (['javascript', 'jsx', ...]).
            acode.registerCompletionProvider(
              ['javascript', 'jsx', 'typescript', 'tsx', 'html', 'css'], 
              this.#provideCompletions.bind(this)
            );
            
            // Let the user know the plugin is active.
            acode.require('toast')('Gemini Autocomplete is active.');

        } catch (error) {
            console.error("Gemini Plugin Init Error:", error);
            acode.alert("Error", "Failed to initialize Gemini Autocomplete plugin. Check the Acode app console for details.");
        }
    }
    
    /**
     * This method is called by Acode when the plugin is unmounted or disabled.
     * Used for cleanup.
     */
    destroy() {
        // If there's an ongoing API request, abort it.
        if (this.#abortController) {
            this.#abortController.abort();
        }
        // Clear any scheduled debouncing timers.
        clearTimeout(this.#debounceTimeout);
        // Note: Acode's SDK currently does not have a method to unregister completion providers.
        // If it were added in the future, the call to unregister would go here.
    }
    
    /**
     * A helper getter to access the plugin's settings.
     * It uses Acode's settings manager.
     */
    get settings() {
        return acode.require('settings').plugins[this.id];
    }

    /**
     * Provides completion items to Acode's editor.
     * This method is part of the Acode CompletionProvider API.
     * @param {AceAjax.Editor} editor - The Ace editor instance.
     * @param {AceAjax.EditSession} session - The editor session.
     * @param {{row: number, column: number}} pos - The cursor position.
     * @param {string} prefix - The text prefix before the cursor.
     * @returns {Promise<Array<{caption: string, value: string, score: number, meta: string}>>} A promise that resolves to an array of completion items.
     */
    async #provideCompletions(editor, session, pos, prefix) {
        return new Promise((resolve) => {
            // Debouncing: We wait for the user to stop typing for a moment before making an API call.
            // This prevents sending a request for every single keystroke.
            clearTimeout(this.#debounceTimeout);

            this.#debounceTimeout = setTimeout(async () => {
                // If a request is already in flight, cancel it before starting a new one.
                if (this.#isLoading) {
                    this.#abortController?.abort();
                }

                this.#isLoading = true;
                this.#abortController = new AbortController();
                
                try {
                    // Using the Acode editor session to get all text up to the current cursor position.
                    // This provides the context for the AI.
                    const codeBeforeCursor = session.getTextRange({
                        start: { row: 0, column: 0 },
                        end: pos
                    });

                    // Don't trigger for very short code snippets to save API calls.
                    if (codeBeforeCursor.trim().length < 10) {
                       resolve([]);
                       return;
                    }
                    
                    // Show a subtle notification that the AI is working.
                    acode.require('toast')('Gemini is thinking...');

                    const suggestion = await this.#getCodeSuggestion(codeBeforeCursor, session.getMode().$id, this.#abortController.signal);
                    
                    // If we got a suggestion and the request wasn't cancelled, format it for Acode.
                    if (suggestion && !this.#abortController.signal.aborted) {
                        resolve([{
                            caption: suggestion.split('\n')[0].substring(0, 50) + '...', // Show first line as a preview
                            value: suggestion,
                            score: 1000, // High score to appear at the top of suggestions
                            meta: "Gemini AI" // Label to show it's from our plugin
                        }]);
                    } else {
                        resolve([]);
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') { // Don't show an error if we intentionally cancelled the request.
                        console.error("Gemini Completion Error:", error);
                        let errorMessage = error.message;
                        if (errorMessage.includes('API key not valid')) {
                            errorMessage = "Invalid API Key. Please check your plugin settings.";
                        }
                        acode.require('toast')(`Gemini Error: ${errorMessage}`);
                    }
                    resolve([]);
                } finally {
                    this.#isLoading = false;
                }
            }, 700); // 700ms debounce delay
        });
    }

    /**
     * Fetches a code suggestion from the Gemini API.
     * @param {string} codeSnippet - The code context before the cursor.
     * @param {string} language - The language mode of the current file (e.g., 'ace/mode/javascript').
     * @param {AbortSignal} signal - Abort signal to cancel the request.
     * @returns {Promise<string>} The suggested code completion.
     */
    async #getCodeSuggestion(codeSnippet, language, signal) {
        if (!this.#ai) {
            throw new Error("Gemini AI client not initialized.");
        }

        // Clean up the language name (e.g., 'ace/mode/javascript' -> 'javascript')
        const langName = language.split('/').pop();

        const prompt = `
          You are an expert code completion AI assistant integrated into a code editor.
          A user is typing code in a ${langName} file and needs an autocomplete suggestion.
          Your task is to complete the following code snippet.
          
          Guidelines:
          - Provide ONLY the new code that should be appended at the user's cursor.
          - Do NOT repeat any of the user's existing code from the snippet.
          - Do NOT add any explanations, comments, or markdown formatting (like \`\`\`).
          - The completion should be concise, relevant, and syntactically correct.
          - Preserve indentation and formatting based on the context.
          - You can provide multi-line suggestions if it makes sense (e.g., completing a function body, a CSS rule, or an HTML tag).

          Code context (everything in the file before the user's cursor):
          ---
          ${codeSnippet}
          ---

          Your code completion:
        `;
        
        const response = await this.#ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.2,
                maxOutputTokens: 256,
                topP: 0.9,
                topK: 30,
            }
        });

        if (signal.aborted) return '';
        
        const text = response.text;
        return text || '';
    }
}

// This is the standard Acode plugin registration check.
// It ensures the code only runs inside the Acode environment.
if (window.acode) {
    const plugin = new GeminiAutocompletePlugin();
    // Register the init function with Acode.
    acode.setPluginInit(plugin.id, (baseUrl, $page, { cacheFileUsers, cacheFile }) => {
        plugin.init();
    });
    // Register the destroy function with Acode for cleanup.
    acode.setPluginUnmount(plugin.id, () => {
        plugin.destroy();
    });
}