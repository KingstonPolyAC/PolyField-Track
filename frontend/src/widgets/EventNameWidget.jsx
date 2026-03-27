import React, { useRef, useState, useEffect } from 'react';

// source='clock' → live event name from FinishLynx timing feed (event_name)
// source='lif'   → event name from loaded LIF results file (event_name_result)
export default function EventNameWidget({ widget, lif, clock, isBuilder }) {
  const containerRef = useRef(null);
  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => setContainerH(e[0].contentRect.height));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const config = widget.config || {};
  const source = config.source || (widget.type === 'event_name' ? 'clock' : 'lif');
  const align = config.align || 'center';
  const color = isBuilder ? '#7ab' : (config.color || '#ffffff');
  const bg = config.backgroundColor || undefined;
  const fontSizePercent = config.fontSizePercent ?? 65;
  const maxLines = config.maxLines ?? 1;
  const fontSize = Math.min(containerH * (fontSizePercent / 100), 300);

  let text;
  if (isBuilder) {
    text = source === 'clock' ? 'Current Event' : 'Result Event';
  } else {
    text = source === 'clock' ? (clock?.eventName || '') : (lif?.eventName || '');
  }

  const textAlign = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
  const textStyle = maxLines > 1
    ? { whiteSpace: 'normal', wordBreak: 'break-word', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: maxLines, overflow: 'hidden', width: '100%', textAlign }
    : { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center', padding: '0 8px', overflow: 'hidden', boxSizing: 'border-box', backgroundColor: bg }}>
      <div style={{ fontSize: fontSize + 'px', color, fontWeight: 'bold', letterSpacing: '0.04em', ...textStyle }}>
        {text}
      </div>
    </div>
  );
}
