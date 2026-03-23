import React, { useRef, useState, useEffect } from 'react';

// Wind widget — source='lif' reads from the loaded result file, source='clock' reads live
// wind from the FinishLynx WindReading LSS event. Both wind and wind_current use this component.
export default function WindWidget({ widget, lif, clock, isBuilder }) {
  const containerRef = useRef(null);
  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setContainerH(e[0].contentRect.height));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const config = widget.config || {};
  const source = config.source || 'lif';
  const align = config.align || 'center';
  const color = isBuilder ? '#7ab' : (config.color || '#a0b4c8');
  const bg = config.backgroundColor || undefined;
  const fontSize = Math.min(containerH * 0.65, 80);

  let wind;
  if (isBuilder) {
    wind = '+1.2 m/s';
  } else if (source === 'clock') {
    const raw = clock?.wind || '';
    wind = raw ? raw + ' m/s' : '';
  } else {
    wind = lif?.wind || '';
  }

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', padding: '0 8px', overflow: 'hidden', boxSizing: 'border-box', backgroundColor: bg }}>
      <div style={{ fontSize: fontSize + 'px', color, fontWeight: 'bold', fontFamily: 'monospace', lineHeight: 1 }}>
        {wind}
      </div>
    </div>
  );
}
