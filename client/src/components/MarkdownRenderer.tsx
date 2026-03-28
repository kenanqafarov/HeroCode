import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`prose prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 text-white" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-bold mt-5 mb-3 text-white" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-4 mb-2 text-white" {...props} />,
          p: ({ node, ...props }) => <p className="mb-3 text-gray-300 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-3 text-gray-300" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-3 text-gray-300" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1 ml-4" {...props} />,
          code: ({ node, inline, ...props }: any) =>
            inline ? (
              <code className="bg-slate-800 px-2 py-1 rounded text-pink-400 font-mono text-sm" {...props} />
            ) : (
              <code className="block bg-slate-800 p-4 rounded-lg mb-3 overflow-x-auto text-gray-300 font-mono text-sm" {...props} />
            ),
          pre: ({ node, ...props }) => <pre className="mb-3" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-400 mb-3" {...props} />
          ),
          a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 underline" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-white" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-gray-300" {...props} />,
          table: ({ node, ...props }) => (
            <table className="w-full border-collapse border border-gray-600 mb-3" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-600 bg-slate-800 px-4 py-2 text-left text-white font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-600 px-4 py-2 text-gray-300" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const getMarkdownPreview = (content: string, maxLength: number = 150): string => {
  // Remove markdown syntax and get a preview
  const clean = content
    .replace(/#+\s/g, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italics
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .trim();

  return clean.substring(0, maxLength) + (clean.length > maxLength ? '...' : '');
};

export default MarkdownRenderer;
