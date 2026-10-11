import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  badge?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  title,
  showLineNumbers = true,
  maxHeight = 'max-h-[520px]',
  badge,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getHighlightedHtml = () => {
    try {
      const grammar = Prism.languages[language] || Prism.languages.python || Prism.languages.clike;
      return Prism.highlight(code || '', grammar, language);
    } catch {
      return code;
    }
  };

  const lines = (code || '').split('\n');

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/90 overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-800/80 bg-zinc-900/60">
        <div className="flex items-center gap-2 text-zinc-300">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-zinc-200">{title || `${language.toUpperCase()} Module`}</span>
          {badge && (
            <span className="text-[11px] text-zinc-400 font-normal">
              · {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-750 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-[11px] text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 text-zinc-400" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code contents with line numbers */}
      <div className={`overflow-auto p-3 text-zinc-200 ${maxHeight} leading-relaxed`}>
        {showLineNumbers ? (
          <div className="flex">
            <div className="select-none pr-3 text-right text-zinc-400 tabular-nums border-r border-zinc-800/80 font-mono">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="pl-3 overflow-x-auto flex-1 font-mono text-zinc-100">
              <code dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }} />
            </pre>
          </div>
        ) : (
          <pre className="overflow-x-auto font-mono text-zinc-100">
            <code dangerouslySetInnerHTML={{ __html: getHighlightedHtml() }} />
          </pre>
        )}
      </div>
    </div>
  );
};
