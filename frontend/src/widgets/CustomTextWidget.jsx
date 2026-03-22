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
  const color = config.color || '#ffffff';
  const align = config.align || 'center';
  const fontSize = Math.min(containerH * 0.65, 120);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', padding: '0 8px', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ fontSize: fontSize + 'px', color: isBuilder ? '#7ab' : color, fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
        {text}
      </div>
    </div>
  );
}
