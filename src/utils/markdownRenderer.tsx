import React, { useState } from 'react';
import { Check, Copy, Play, Eye } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onTimestampClick?: (seconds: number) => void;
}

export function MarkdownRenderer({ content, onTimestampClick }: MarkdownRendererProps) {
  if (!content) return null;

  // Split content by code blocks first
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 leading-relaxed text-[14.5px] text-gray-800 dark:text-[#e3e3e3] break-words">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          return <CodeBlock key={index} raw={part} />;
        }
        return (
          <TextBlock
            key={index}
            text={part}
            onTimestampClick={onTimestampClick}
          />
        );
      })}
    </div>
  );
}

function CodeBlock({ raw }: { raw: string }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const lines = raw.slice(3, -3).trim().split('\n');
  const language = lines[0].trim();
  const code = language && !language.includes(' ')
    ? lines.slice(1).join('\n')
    : lines.join('\n');
  const displayLang = language && !language.includes(' ') ? language : 'text';

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHtml = displayLang.toLowerCase() === 'html' || displayLang.toLowerCase() === 'svg';

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-gray-300 dark:border-[#303134] bg-gray-900 dark:bg-[#1e1f20] text-gray-200 shadow-md">
      <div className="flex items-center justify-between border-b border-gray-800 dark:border-[#303134] bg-gray-950 dark:bg-[#282a2c] px-4 py-2 text-xs text-gray-400">
        <span className="font-mono font-medium uppercase tracking-wider text-gray-300 dark:text-[#c4c7c5]">
          {displayLang}
        </span>
        <div className="flex items-center gap-2">
          {isHtml && (
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-gray-800 text-blue-400 transition-colors"
              title="Toggle Live Preview"
            >
              <Eye className="w-3.5 h-3.5" />
              {showPreview ? 'Code' : 'Preview'}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded px-2.5 py-1 text-xs hover:bg-gray-800 text-gray-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {showPreview && isHtml ? (
        <div className="p-4 bg-white text-black min-h-[140px] overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: code }} />
        </div>
      ) : (
        <div className="overflow-x-auto p-4 text-[13px] font-mono leading-relaxed text-gray-200 dark:text-[#c4c7c5]">
          <pre>{code}</pre>
        </div>
      )}
    </div>
  );
}

function TextBlock({
  text,
  onTimestampClick,
}: {
  text: string;
  onTimestampClick?: (seconds: number) => void;
}) {
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <>
      {paragraphs.map((para, idx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Header 1
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={idx} className="mt-4 mb-2 text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="inline-block w-1.5 h-5 rounded-full bg-gradient-to-b from-[#4285F4] to-[#9B72CB]" />
              {parseInline(trimmed.slice(2), onTimestampClick)}
            </h1>
          );
        }

        // Header 2
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="mt-3.5 mb-1.5 text-lg font-semibold text-gray-900 dark:text-white">
              {parseInline(trimmed.slice(3), onTimestampClick)}
            </h2>
          );
        }

        // Header 3
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="mt-2.5 mb-1 text-base font-semibold text-blue-600 dark:text-[#8ab4f8]">
              {parseInline(trimmed.slice(4), onTimestampClick)}
            </h3>
          );
        }

        // Blockquote
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="my-2 border-l-4 border-blue-500 bg-blue-50/50 dark:bg-[#1e1f20]/60 pl-3.5 py-1.5 text-sm italic text-gray-700 dark:text-[#bdc1c6] rounded-r-lg"
            >
              {parseInline(trimmed.slice(2), onTimestampClick)}
            </blockquote>
          );
        }

        // Table
        if (trimmed.includes('|') && trimmed.split('\n').length > 1) {
          const lines = trimmed.split('\n').filter((l) => l.trim().startsWith('|'));
          if (lines.length >= 2) {
            const headerRow = lines[0].split('|').filter(Boolean).map((c) => c.trim());
            const bodyRows = lines.slice(2).map((l) => l.split('|').filter(Boolean).map((c) => c.trim()));

            return (
              <div key={idx} className="my-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-[#303134]">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-[#303134] text-xs">
                  <thead className="bg-gray-100 dark:bg-[#282a2c]">
                    <tr>
                      {headerRow.map((cell, cIdx) => (
                        <th key={cIdx} className="px-3 py-2 text-left font-semibold uppercase tracking-wider text-blue-600 dark:text-[#8ab4f8]">
                          {parseInline(cell, onTimestampClick)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-[#303134] bg-white dark:bg-[#1e1f20]">
                    {bodyRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-[#282a2c]/50 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3 py-2 text-gray-700 dark:text-[#c4c7c5]">
                            {parseInline(cell, onTimestampClick)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Bullet lists
        const lines = trimmed.split('\n');
        const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
        if (isBulletList) {
          return (
            <ul key={idx} className="my-2 space-y-1 pl-4 list-disc marker:text-blue-500">
              {lines.map((line, lIdx) => {
                const item = line.trim().replace(/^[-*]\s+/, '');
                return <li key={lIdx}>{parseInline(item, onTimestampClick)}</li>;
              })}
            </ul>
          );
        }

        // Numbered list
        const isNumList = lines.every((line) => /^\d+\.\s+/.test(line.trim()));
        if (isNumList) {
          return (
            <ol key={idx} className="my-2 space-y-1 pl-4 list-decimal marker:text-blue-500">
              {lines.map((line, lIdx) => {
                const item = line.trim().replace(/^\d+\.\s+/, '');
                return <li key={lIdx}>{parseInline(item, onTimestampClick)}</li>;
              })}
            </ol>
          );
        }

        // Regular paragraph
        return (
          <p key={idx} className="leading-relaxed">
            {lines.map((line, lIdx) => (
              <React.Fragment key={lIdx}>
                {parseInline(line, onTimestampClick)}
                {lIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </>
  );
}

function parseInline(text: string, onTimestampClick?: (seconds: number) => void): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|`.*?`|\[\d{1,2}:\d{2}\]|\(\d{1,2}:\d{2}\)|https?:\/\/[^\s)]+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Bold **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-gray-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Inline code `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded bg-gray-100 dark:bg-[#282a2c] px-1.5 py-0.5 font-mono text-[12.5px] text-gray-800 dark:text-[#e8eaed] border border-gray-200 dark:border-[#3c4043]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Timestamp tag [00:15] or (00:15)
    const tsMatch = part.match(/^[\[\(](\d{1,2}):(\d{2})[\]\)]$/);
    if (tsMatch) {
      const minutes = parseInt(tsMatch[1], 10);
      const seconds = parseInt(tsMatch[2], 10);
      const totalSec = minutes * 60 + seconds;
      return (
        <button
          key={index}
          onClick={() => onTimestampClick?.(totalSec)}
          className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-[#8ab4f8]/15 hover:bg-blue-200 dark:hover:bg-[#8ab4f8]/25 text-blue-600 dark:text-[#8ab4f8] text-xs font-mono font-medium transition-colors border border-blue-200 dark:border-[#8ab4f8]/30"
          title={`Jump video to ${part}`}
        >
          <Play className="w-2.5 h-2.5 fill-current" />
          {part}
        </button>
      );
    }

    // URLs
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-[#8ab4f8] hover:underline underline-offset-2 break-all"
        >
          {part}
        </a>
      );
    }

    return part;
  });
}
