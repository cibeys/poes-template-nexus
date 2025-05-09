
import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className="code-block group my-6">
      <div className="code-header">
        <span className="text-xs uppercase font-mono font-medium">{language}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={copyToClipboard}
            className="code-copy-btn"
            aria-label="Copy code"
            title="Copy code"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
      <div className="code-content">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}
