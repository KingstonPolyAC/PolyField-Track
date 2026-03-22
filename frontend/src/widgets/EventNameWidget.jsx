import React, { useRef, useState, useEffect } from 'react';

export default function EventNameWidget({ widget, lif, theme, isBuilder }) {
  const containerRef = useRef(null);
  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setContainerH(e[0].contentRect.height));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const config = widget.config || {};
  const align = config.align || 'center';
  const fontSize = Math.min(containerH * 0.65, 120);
  const text = isBuilder ? 'Event Name' : (lif?.eventName || '—');
  const color = isBuilder ? '#7ab' : '#ffffff';

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', padding: '0 8px', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ fontSize: fontSize + 'px', color, fontWeight: 'bold', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
        {text}
      </div>
    </div>
  );
}
