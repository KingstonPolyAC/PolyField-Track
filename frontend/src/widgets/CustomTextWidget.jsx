import React, { useRef, useState, useEffect } from 'react';

export default function CustomTextWidget({ widget, isBuilder }) {
  const containerRef = useRef(null);
  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setContainerH(e[0].contentRect.height));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const config = widget.config || {};
  const text = config.text || (isBuilder ? 'Custom Text' : '');
  const color = isBuilder ? '#7ab' : (config.color || '#ffffff');
  const align = config.align || 'center';
  const bg = config.backgroundColor || undefined;
  const fontSizePercent = config.fontSizePercent ?? 65;
  const maxLines = config.maxLines ?? 1;
  const fontSize = Math.min(containerH * (fontSizePercent / 100), 300);

  const textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
  const textStyle = maxLines > 1
    ? { whiteSpace: 'normal', wordBreak: 'break-word', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: maxLines, overflow: 'hidden', width: '100%', textAlign }
    : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', padding: '0 8px', overflow: 'hidden', boxSizing: 'border-box', backgroundColor: bg }}>
      <div style={{ fontSize: fontSize + 'px', color, fontWeight: 'bold', ...textStyle }}>
        {text}
      </div>
    </div>
  );
}
