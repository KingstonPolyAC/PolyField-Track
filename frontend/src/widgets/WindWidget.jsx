import React, { useRef, useState, useEffect } from 'react';

export default function WindWidget({ widget, lif, isBuilder }) {
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
  const fontSize = Math.min(containerH * 0.55, 80);
  const wind = isBuilder ? '+1.2 m/s' : (lif?.wind || '—');
  const color = isBuilder ? '#7ab' : '#a0b4c8';

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', justifyContent: 'center', padding: '0 8px', overflow: 'hidden', boxSizing: 'border-box', gap: '2px' }}>
      <div style={{ fontSize: Math.min(containerH * 0.22, 20) + 'px', color: '#607d8b', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Wind</div>
      <div style={{ fontSize: fontSize + 'px', color, fontWeight: 'bold', fontFamily: 'monospace', lineHeight: 1 }}>
        {wind}
      </div>
    </div>
  );
}
