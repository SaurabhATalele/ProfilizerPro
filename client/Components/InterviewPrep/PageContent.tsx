"use client";
import { FC } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";

interface PageContentProps {
  content: string;
}

/**
 * Renders a page's markdown body. HTML is escaped by default (no rehype-raw),
 * which prevents stored XSS from author-supplied content. Fenced code blocks
 * are delegated to the shared CodeBlock component; blockquotes are styled as
 * left-bordered italic callouts to match the reference UX.
 */
const components: Components = {
  code(props) {
    const { className, children } = props;
    const text = String(children ?? "");
    const match = /language-(\w+)/.exec(className || "");
    const isBlock = Boolean(match) || text.includes("\n");

    if (isBlock) {
      return (
        <CodeBlock
          language={match?.[1]}
          value={text.replace(/\n$/, "")}
        />
      );
    }
    // Inline code.
    return (
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--color-primary)] dark:bg-gray-800 dark:text-[var(--color-secondary)]">
        {children}
      </code>
    );
  },
  // The CodeBlock supplies its own <pre>; passthrough avoids nested <pre>.
  pre(props) {
    return <>{props.children}</>;
  },
  h1: (props) => (
    <h1 className="mb-4 mt-2 text-3xl font-bold text-gray-900 dark:text-white">
      {props.children}
    </h1>
  ),
  h2: (props) => (
    <h2 className="mb-3 mt-8 text-2xl font-semibold text-gray-900 dark:text-white">
      {props.children}
    </h2>
  ),
  h3: (props) => (
    <h3 className="mb-2 mt-6 text-xl font-semibold text-gray-800 dark:text-gray-100">
      {props.children}
    </h3>
  ),
  p: (props) => (
    <p className="my-3 leading-relaxed text-gray-700 dark:text-gray-300">
      {props.children}
    </p>
  ),
  strong: (props) => (
    <strong className="font-semibold text-gray-900 dark:text-white">
      {props.children}
    </strong>
  ),
  ul: (props) => (
    <ul className="my-3 list-disc space-y-1 pl-6 text-gray-700 dark:text-gray-300">
      {props.children}
    </ul>
  ),
  ol: (props) => (
    <ol className="my-3 list-decimal space-y-1 pl-6 text-gray-700 dark:text-gray-300">
      {props.children}
    </ol>
  ),
  a: (props) => (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--color-primary)] underline transition-colors hover:opacity-80 dark:text-[var(--color-secondary)]"
    >
      {props.children}
    </a>
  ),
  blockquote: (props) => (
    <blockquote className="my-4 border-l-4 border-[var(--color-primary)] bg-gray-50 py-2 pl-4 pr-3 italic text-gray-600 dark:border-[var(--color-secondary)] dark:bg-gray-900/40 dark:text-gray-300">
      {props.children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-gray-200 dark:border-gray-800" />,
  table: (props) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{props.children}</table>
    </div>
  ),
  th: (props) => (
    <th className="border border-gray-200 bg-gray-50 px-3 py-2 text-left font-semibold dark:border-gray-800 dark:bg-gray-900/50">
      {props.children}
    </th>
  ),
  td: (props) => (
    <td className="border border-gray-200 px-3 py-2 dark:border-gray-800">
      {props.children}
    </td>
  ),
};

const PageContent: FC<PageContentProps> = ({ content }) => {
  return (
    <div className="max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default PageContent;
