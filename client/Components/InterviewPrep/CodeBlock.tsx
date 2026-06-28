"use client";
import { FC, useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CodeBlockProps {
  language?: string;
  value: string;
}

/**
 * Fenced-code renderer for page content. Highlights with shiki (lazy-loaded,
 * dual light/dark theme bound to the `.dark` class via globals.css). Shows the
 * raw code as a fallback until highlighting resolves, plus a copy control.
 */
const CodeBlock: FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    import("shiki")
      .then(({ codeToHtml }) =>
        codeToHtml(value, {
          lang: language || "text",
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        }),
      )
      // Unknown language (or load failure) → keep the plain fallback.
      .catch(() => "")
      .then((out) => {
        if (!cancelled && out) setHtml(out);
      });
    return () => {
      cancelled = true;
    };
  }, [value, language]);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable (insecure context) — fail quietly.
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 bg-[#f6f8fa] px-4 py-1.5 dark:border-gray-800 dark:bg-[#0d1117]">
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
      {html ? (
        <div
          className="shiki-block overflow-x-auto text-sm [&_pre]:m-0 [&_pre]:px-4 [&_pre]:py-3"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className="overflow-x-auto bg-[#f6f8fa] px-4 py-3 text-sm leading-relaxed dark:bg-[#0d1117]">
          <code className="font-mono text-gray-800 dark:text-gray-100">
            {value}
          </code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
