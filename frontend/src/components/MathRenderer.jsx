import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import preprocessMath from './MathPreprocessor.js';

const MathRenderer = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return <span>{content}</span>;
  }

  let processed = preprocessMath(content);
  // Convert $$ to \[ \] and $ to \( \) PERMANENTLY
  processed = processed
    .replace(/\\\$\\\$([\s\S]*?)\\\$\\\$/g, '\\[$1\\]')
    .replace(/\\\$(.+?)\\\$(?!\\)/g, '\\($1\\)')
    .replace(/\\\$(.+?)\\\$/g, '\\[$1\\]');

  // Split all math delimiters with greedy matching
  const parts = processed.split(/(\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/);

  return (
    <span>
      {parts.map((part, index) => {
        const trimmed = part.trim();
        if (trimmed.startsWith('\\(') && trimmed.endsWith('\\)')) {
          const math = trimmed.slice(2, -2).trim();
          let html;
          try {
            html = katex.renderToString(math, {
              throwOnError: false,
              output: 'html',
              displayMode: false,
              macros: {
                '\\RR': '\\mathbb{R}',
                '\\N': '\\mathbb{N}',
                '\\text': '\\text',
                '\\xrightarrow': '\\xrightarrow',
                '\\ce': '\\ce',
                '\\lim': '\\lim',
                '\\to': '\\to',
                '\\lim_': '\\lim_',
                '\\sin': '\\sin',
                '\\cos': '\\cos',
                '\\tan': '\\tan',
                '\\cot': '\\cot',
                '\\sec': '\\sec',
                '\\csc': '\\csc',
                '\\log': '\\log',
                '\\ln': '\\ln',
                '\\frac': '\\frac',
                '\\sqrt': '\\sqrt',
                '\\int': '\\int',
                '\\sum': '\\sum',
                '\\prod': '\\prod',
                '\\pi': '\\pi',
                '\\theta': '\\theta',
                '\\phi': '\\phi',
                '\\alpha': '\\alpha',
                '\\beta': '\\beta',
                '\\gamma': '\\gamma',
                '\\delta': '\\delta',
                '\\epsilon': '\\epsilon',
                '\\zeta': '\\zeta',
                '\\eta': '\\eta',
                '\\Delta': '\\Delta',
                '\\infty': '\\infty',
                '\\partial': '\\partial',
                '\\nabla': '\\nabla',
                '\\mathrm': '\\mathrm',
                '\\mathbf': '\\mathbf',
                '\\hat': '\\hat',
                '\\vec': '\\vec',
                '\\overline': '\\overline',
                '\\underline': '\\underline'
              },
              trust: true
            });
          } catch {
            html = '';
          }
          if (!html) {
            return <span key={index} style={{color: 'red', padding: '2px 4px', background: '#fed7d7', borderRadius: '4px', fontSize: '0.85em'}}>[Math failed: {math.slice(0,30)}...]</span>;
          }
          return <span key={index} dangerouslySetInnerHTML={{__html: html}} />;
        }
        if (trimmed.startsWith('\\[') && trimmed.endsWith('\\]')) {
          const math = trimmed.slice(2, -2).trim();
          let html;
          try {
            html = katex.renderToString(math, {
              throwOnError: false,
              output: 'html',
              displayMode: true,
              macros: {
                '\\RR': '\\mathbb{R}',
                '\\N': '\\mathbb{N}',
                '\\text': '\\text',
                '\\xrightarrow': '\\xrightarrow',
                '\\ce': '\\ce',
                '\\lim': '\\lim',
                '\\to': '\\to',
                '\\lim_': '\\lim_',
                '\\sin': '\\sin',
                '\\cos': '\\cos',
                '\\tan': '\\tan',
                '\\cot': '\\cot',
                '\\sec': '\\sec',
                '\\csc': '\\csc',
                '\\log': '\\log',
                '\\ln': '\\ln',
                '\\frac': '\\frac',
                '\\sqrt': '\\sqrt',
                '\\int': '\\int',
                '\\sum': '\\sum',
                '\\prod': '\\prod',
                '\\pi': '\\pi',
                '\\theta': '\\theta',
                '\\phi': '\\phi',
                '\\alpha': '\\alpha',
                '\\beta': '\\beta',
                '\\gamma': '\\gamma',
                '\\delta': '\\delta',
                '\\epsilon': '\\epsilon',
                '\\zeta': '\\zeta',
                '\\eta': '\\eta',
                '\\Delta': '\\Delta',
                '\\infty': '\\infty',
                '\\partial': '\\partial',
                '\\nabla': '\\nabla',
                '\\mathrm': '\\mathrm',
                '\\mathbf': '\\mathbf',
                '\\hat': '\\hat',
                '\\vec': '\\vec',
                '\\overline': '\\overline',
                '\\underline': '\\underline'
              },
              trust: true
            });
          } catch {
            html = '';
          }
          if (!html) {
            return <div key={index} style={{color: 'red', padding: '4px', background: '#fed7d7', borderRadius: '4px'}}>[Display Math failed: {math.slice(0,30)}...]</div>;
          }
          return <div key={index} dangerouslySetInnerHTML={{__html: html}} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default MathRenderer;
