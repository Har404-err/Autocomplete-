
import React from 'react';
import Suggestion from './Suggestion';
import { Bot } from './Icons';

interface SuggestionsListProps {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({ suggestions, isLoading, error, onSuggestionClick }) => {
  const hasContent = suggestions.length > 0 || isLoading || error;
  
  if (!hasContent) {
    return null;
  }

  return (
    <div className="bg-gemini-light-grey/30 border-t border-gemini-light-grey p-4 min-h-[80px]">
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse">
          <Bot className="w-5 h-5" />
          <span>Gemini is thinking...</span>
        </div>
      )}
      {error && (
        <div className="text-red-400 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}
      {!isLoading && suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
           <h3 className="text-sm font-semibold text-gray-300 mb-1">Suggestions:</h3>
          {suggestions.map((suggestion, index) => (
            <Suggestion
              key={index}
              suggestion={suggestion}
              onClick={() => onSuggestionClick(suggestion)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsList;
