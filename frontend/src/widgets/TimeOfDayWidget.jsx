import React, { useRef, useState, useEffect } from 'react';

function formatTime(date, format) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return format === 'HH:MM' ? `${hh}:${mm}` : `${hh}:${mm}:${ss}`;
}

export default function TimeOfDayWidget({ widget, isBuilder }) {
  const containerRef = useRef(null);
  const [containerH, setContainerH] = useState(0);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setContainerH(e[0].contentRect.height));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (isBuilder) return;
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, [isBuilder]);

  const config = widget.config || {};
  const format = config.format || 'HH:MM:SS';
  const color = isBuilder ? '#7ab' : (config.color || '#ffffff');
  const align = config.align || 'center';
  const bg = config.backgroundColor || undefined;

  const timeStr = isBuilder ? '12:34:56' : formatTime(now, format);
  const fontSize = Math.min(containerH * 0.65, 120);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', padding: '0 8px', overflow: 'hidden', boxSizing: 'border-box', backgroundColor: bg }}>
      <div style={{ fontSize: fontSize + 'px', color, fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.04em', lineHeight: 1 }}>
        {timeStr}
      </div>
    </div>
  );
}
