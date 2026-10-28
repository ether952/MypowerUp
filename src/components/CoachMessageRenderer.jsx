import React from 'react';

/**
 * Renderiza de forma elegante las negritas, cursivas y destacados dentro de una línea.
 */
function renderInlineMarkdown(str, isUser = false) {
  if (!str) return '';
  const parts = [];
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const content = token.slice(2, -2);
      parts.push(
        <strong
          key={match.index}
          className={isUser ? 'font-bold underline decoration-zinc-900/30' : 'text-emerald-400 font-bold'}
        >
          {content}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      const content = token.slice(1, -1);
      parts.push(
        <em
          key={match.index}
          className={isUser ? 'italic font-medium' : 'text-zinc-300 not-italic font-semibold'}
        >
          {content}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts.length > 0 ? parts : str;
}

/**
 * Componente para renderizar respuestas estructuradas del Coach deportivo.
 * Convierte encabezados ###, viñetas, tips y numeración en elementos limpios y visuales.
 */
export default function CoachMessageRenderer({ content = '', isUser = false }) {
  if (!content) return null;

  if (isUser) {
    return <div className="whitespace-pre-wrap font-sans">{content}</div>;
  }

  const lines = content.split('\n');

  return (
    <div className="space-y-2 font-sans text-xs leading-relaxed select-text">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        // Línea vacía
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Encabezados estilo markdown (### o ##)
        if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
          const title = trimmed.replace(/^#+\s*/, '');
          return (
            <div
              key={idx}
              className="font-extrabold text-sm text-white pt-1.5 pb-0.5 border-b border-zinc-800/80 flex items-center gap-1.5 tracking-tight font-display"
            >
              <span>{renderInlineMarkdown(title)}</span>
            </div>
          );
        }

        // Highlight especial para Tips del Coach
        if (trimmed.toLowerCase().includes('tip del coach')) {
          return (
            <div
              key={idx}
              className="p-2.5 my-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-[11px] flex items-start gap-2 shadow-xs"
            >
              <span className="shrink-0 text-sm">💡</span>
              <div className="flex-1 leading-snug">
                {renderInlineMarkdown(trimmed.replace(/^[\*\-\s]+/, ''))}
              </div>
            </div>
          );
        }

        // Elementos de lista con viñeta (* o -)
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const bulletContent = trimmed.replace(/^[\*\-]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 text-zinc-300">
              <span className="text-emerald-400 text-xs shrink-0 mt-0.5">▪</span>
              <div className="flex-1">{renderInlineMarkdown(bulletContent)}</div>
            </div>
          );
        }

        // Elementos numerados (1. , 2. etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5 pt-1 text-zinc-200">
              <span className="text-emerald-400 font-mono font-bold text-xs shrink-0">
                {numMatch[1]}.
              </span>
              <div className="flex-1 font-medium">{renderInlineMarkdown(numMatch[2])}</div>
            </div>
          );
        }

        // Párrafo normal
        return (
          <p key={idx} className="text-zinc-200">
            {renderInlineMarkdown(line)}
          </p>
        );
      })}
    </div>
  );
}
