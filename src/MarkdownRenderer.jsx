import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownRenderer = ({ content }) => {
    return (
        <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <div className="relative group">
                                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">{match[1]}</span>
                                </div>
                                <pre className="bg-slate-900/50 p-4 rounded-lg overflow-x-auto border border-white/10 my-2">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        ) : (
                            <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 text-sm font-mono" {...props}>
                                {children}
                            </code>
                        );
                    },
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 ml-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 ml-2">{children}</ol>,
                    li: ({ children }) => <li className="text-slate-300">{children}</li>,
                    h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 mt-4 border-b border-white/10 pb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-lg font-bold text-white mb-2 mt-3">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-base font-bold text-white mb-2 mt-2">{children}</h3>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-400 my-2 bg-blue-500/5 py-2 pr-2 rounded-r">{children}</blockquote>,
                    a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline hover:text-blue-300 transition-colors">{children}</a>,
                    table: ({ children }) => <div className="overflow-x-auto my-4 border border-white/10 rounded-lg"><table className="min-w-full divide-y divide-white/10 text-sm">{children}</table></div>,
                    th: ({ children }) => <th className="px-4 py-3 bg-slate-800 text-left font-semibold text-white">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-3 border-t border-white/5 text-slate-300">{children}</td>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
