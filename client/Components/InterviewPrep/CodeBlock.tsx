"use client";
import { FC, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  value: string;
}

/**
 * The single fenced-code-block renderer for page content. Every markdown code
 * fence routes through this component (see PageContent). Shows the language
 * label and a copy-to-clipboard control; styled for both light and dark mode.
 */
const CodeBlock: FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (e.g. insecure context) — fail quietly.
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-200 bg-[#f6f8fa] dark:border-gray-800 dark:bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-1.5 dark:border-gray-800">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-gray-500 transition-colors duration-300 hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-sm leading-relaxed">
        <code className="font-mono text-gray-800 dark:text-gray-100">
          {value}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
