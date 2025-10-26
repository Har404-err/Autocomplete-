
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCodeSuggestions } from './services/geminiService';
import Editor from './components/Editor';
import { Code, Bot } from './components/Icons';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('function greet(name) {\n  ');
  const [inlineSuggestion, setInlineSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const requestAbortController = useRef<AbortController | null>(null);

  const fetchSuggestions = useCallback(async (currentCode: string, signal: AbortSignal) => {
    if (currentCode.trim().length < 3) {
      setInlineSuggestion('');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCodeSuggestions(currentCode);
      if (!signal.aborted) {
        setInlineSuggestion(result);
      }
    } catch (err) {
      if (!signal.aborted) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        setInlineSuggestion('');
      }
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Abort previous request if a new one is coming in
    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }
    
    const controller = new AbortController();
    requestAbortController.current = controller;

    const handler = setTimeout(() => {
      fetchSuggestions(code, controller.signal);
    }, 500); // Debounce API call by 500ms

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [code, fetchSuggestions]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setInlineSuggestion(''); // Clear suggestion on manual typing
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && inlineSuggestion) {
      e.preventDefault();
      const newCode = code + inlineSuggestion;
      setCode(newCode);
      setInlineSuggestion('');
      
      // HACK: Move cursor to the end. The timeout ensures the state update has rendered.
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = newCode.length;
        }
      }, 0);
    }
  };

  return (
    <div className="min-h-screen bg-gemini-dark flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Bot className="w-12 h-12 text-gemini-blue" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
              Gemini Code Autocomplete
            </h1>
          </div>
          <p className="text-lg text-gray-400">
            Press <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-200 bg-gemini-light-grey border border-gemini-grey rounded-lg">Tab</kbd> to accept AI suggestions.
          </p>
        </header>

        <main className="bg-gemini-light-dark rounded-xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="p-4 bg-gemini-light-grey/50 border-b border-gemini-light-grey flex items-center gap-2">
             <Code className="w-5 h-5 text-gray-400" />
             <span className="text-sm text-gray-300 font-mono">code-editor.js</span>
          </div>
          <Editor
            ref={editorRef}
            code={code}
            onCodeChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            inlineSuggestion={inlineSuggestion}
          />
          <div className="bg-gemini-light-grey/30 border-t border-gemini-light-grey px-4 py-2 min-h-[36px] flex items-center">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
                <Bot className="w-4 h-4" />
                <span>Gemini is thinking...</span>
              </div>
            )}
            {error && (
              <div className="text-red-400 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}
          </div>
        </main>
        
        <footer className="text-center mt-8 text-sm text-gemini-grey">
          <p>Powered by Google's Gemini API. This is a demo application.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
