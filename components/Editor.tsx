
import React, { forwardRef, useRef, useLayoutEffect } from 'react';

interface EditorProps {
  code: string;
  inlineSuggestion: string;
  onCodeChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ code, inlineSuggestion, onCodeChange, onKeyDown }, ref) => {
  const backdropRef = useRef<HTMLPreElement>(null);

  // Sync scroll positions
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };
  
  // This ensures that when the code is updated programmatically (e.g., by accepting a suggestion),
  // the textarea scroll position is also updated immediately.
  useLayoutEffect(() => {
    if (ref && 'current' in ref && ref.current && backdropRef.current) {
      backdropRef.current.scrollTop = ref.current.scrollTop;
      backdropRef.current.scrollLeft = ref.current.scrollLeft;
    }
  }, [code, ref]);

  return (
    <div className="relative p-4 h-80">
      <pre
        ref={backdropRef}
        aria-hidden="true"
        className="absolute top-4 left-4 right-4 bottom-4 m-0 p-0 font-mono text-sm pointer-events-none overflow-auto whitespace-pre-wrap break-words"
      >
        {/* A hidden copy of the code to take up space and align the suggestion */}
        <span className="text-transparent">{code}</span>
        {/* The visible suggestion */}
        <span className="text-gemini-grey">{inlineSuggestion}</span>
      </pre>

      <textarea
        ref={ref}
        value={code}
        onChange={onCodeChange}
        onKeyDown={onKeyDown}
        onScroll={handleScroll}
        className="absolute top-4 left-4 right-4 bottom-4 m-0 p-0 w-[calc(100%-2rem)] h-[calc(100%-2rem)] bg-transparent text-gray-200 font-mono text-sm resize-none focus:outline-none z-10 overflow-auto whitespace-pre-wrap break-words"
        placeholder="Start typing code here..."
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
    </div>
  );
});

Editor.displayName = 'Editor';
export default Editor;
