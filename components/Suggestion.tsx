
import React from 'react';

interface SuggestionProps {
  suggestion: string;
  onClick: () => void;
}

const Suggestion: React.FC<SuggestionProps> = ({ suggestion, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-2 rounded-md bg-gemini-light-grey hover:bg-gemini-blue/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gemini-blue"
    >
      <pre className="font-mono text-sm text-gray-200 whitespace-pre-wrap">
        <code>{suggestion}</code>
      </pre>
    </button>
  );
};

export default Suggestion;
