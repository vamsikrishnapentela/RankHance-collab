import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathRenderer = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return <span>{content}</span>;
  }

  // Split into text + math parts
  const parts = content.split(/(\\\[.*?\\\]|\\\(.*?\\\))/gs);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const math = part.slice(2, -2);
          const html = katex.renderToString(math, {
            throwOnError: false,
            output: 'html'
          });
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        }

        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const math = part.slice(2, -2);
          const html = katex.renderToString(math, {
            displayMode: true,
            throwOnError: false,
            output: 'html'
          });
          return <div key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        }

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default MathRenderer;

