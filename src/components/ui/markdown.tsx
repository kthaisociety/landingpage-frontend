import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'prose prose-gray prose-lg max-w-none',
        // Headings
        'prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-secondary-black',
        'prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-0 prose-h1:first:mt-0',
        'prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8',
        'prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6',
        'prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-5',
        // Paragraphs
        'prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base',
        // Lists – explicit list style and spacing so bullets/numbers always show
        'prose-ul:list-disc prose-ul:list-outside prose-ul:pl-6 prose-ul:my-4 prose-ul:space-y-2 prose-ul:text-gray-700',
        'prose-ol:list-decimal prose-ol:list-outside prose-ol:pl-6 prose-ol:my-4 prose-ol:space-y-2 prose-ol:text-gray-700',
        'prose-li:pl-1 prose-li:leading-relaxed prose-li:text-base prose-li:my-1',
        // Links
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium',
        // Strong and emphasis
        'prose-strong:font-bold prose-strong:text-secondary-black',
        'prose-em:italic',
        // Code
        'prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:text-gray-800',
        'prose-code:before:content-none prose-code:after:content-none',
        'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:mb-6',
        'prose-pre:border prose-pre:border-gray-700',
        // Blockquotes
        'prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-6',
        // Tables (with remark-gfm)
        'prose-table:w-full prose-table:border-collapse prose-table:mb-6',
        'prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold',
        'prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2',
        // Horizontal rule
        'prose-hr:border-t prose-hr:border-gray-300 prose-hr:my-8',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom component overrides
          a: ({ node: _node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          h1: ({ node: _node, ...props }) => (
            <h1 className="text-4xl font-bold mb-6 mt-0 first:mt-0 tracking-tight text-secondary-black" {...props} />
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="text-3xl font-bold mb-4 mt-8 tracking-tight text-secondary-black" {...props} />
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="text-2xl font-bold mb-3 mt-6 tracking-tight text-secondary-black" {...props} />
          ),
          h4: ({ node: _node, ...props }) => (
            <h4 className="text-xl font-bold mb-2 mt-5 tracking-tight text-secondary-black" {...props} />
          ),
          p: ({ node: _node, ...props }) => (
            <p className="text-gray-700 leading-relaxed mb-4 text-base" {...props} />
          ),
          hr: ({ node: _node, ...props }) => (
            <hr className="border-t border-gray-300 my-2" {...props} />
          ),
          ul: ({ node: _node, ...props }) => (
            <ul
              className="list-disc list-outside pl-6 my-4 space-y-2 text-gray-700 [&>li]:pl-1 [&>li]:my-1 [&>li]:leading-relaxed [&>li]:text-base"
              style={{ listStyleType: 'disc' }}
              {...props}
            />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol
              className="list-decimal list-outside pl-6 my-4 space-y-2 text-gray-700 [&>li]:pl-1 [&>li]:my-1 [&>li]:leading-relaxed [&>li]:text-base"
              style={{ listStyleType: 'decimal' }}
              {...props}
            />
          ),
          li: ({ node: _node, ...props }) => (
            <li className="pl-1 my-1 leading-relaxed text-base text-gray-700" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

