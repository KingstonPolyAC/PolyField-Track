import React, { useRef, useState, useEffect } from 'react';

const UNIT_CONVERSIONS = {
  kph: { from: (ms) => ms * 3.6,     label: 'km/h' },
  mph: { from: (ms) => ms * 2.23694, label: 'mph'  },
  ms:  { from: (ms) => ms,           label: 'm/s'  },
};

function parseDistance(eventName) {
  if (!eventName) return 0;
  const name = eventName.toUpperCase();
  if (/\bMILE\b/.test(name)) return 1609;
  const relayMatch = name.match(/(\d+)\s*[xX]\s*(\d+)/);
  if (relayMatch) return parseInt(relayMatch[1], 10) * parseInt(relayMatch[2], 10);
  const commaMatch = name.match(/\b(\d{1,3}(?:,\d{3})+)\s*(?:M(?:H)?|H)?\b/);
  if (commaMatch) return parseInt(commaMatch[1].replace(/,/g, ''), 10);
  const match = name.match(/\b(\d+)\s*(?:M(?:H)?|H)\b/);
  if (match) return parseInt(match[1], 10);
  const bareMatch = name.match(/\b(\d+)\b/);
  if (bareMatch) {
    const val = parseInt(bareMatch[1], 10);
    if (val >= 50) return val;
  }
  return 0;
}

function parseTime(timeStr) {
  if (!timeStr) return 0;
  const t = timeStr.trim().toUpperCase();
  if (!t || t === 'DQ' || t === 'DNF' || t === 'DNS' || t === '-' || t === '—') return 0;
  const hms = t.match(/^(\d+):(\d+):(\d+(?:\.\d+)?)$/);
  if (hms) return parseInt(hms[1], 10) * 3600 + parseInt(hms[2], 10) * 60 + parseFloat(hms[3]);
  const ms = t.match(/^(\d+):(\d+(?:\.\d+)?)$/);
  if (ms) return parseInt(ms[1], 10) * 60 + parseFloat(ms[2]);
  const s = t.match(/^(\d+(?:\.\d+)?)$/);
  if (s) return parseFloat(s[1]);
  return 0;
}

export default function AthleteSpeedWidget({ widget, lif, isBuilder }) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(e => {
      setContainerSize({ w: e[0].contentRect.width, h: e[0].contentRect.height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const config = widget.config || {};
  const unit = config.unit || 'kph';
  const maxRows = config.maxRows || 8;
  const { label: unitLabel, from: convert } = UNIT_CONVERSIONS[unit] || UNIT_CONVERSIONS.kph;

  // Mock data for builder preview
  const competitors = isBuilder
    ? [
        { place: '1', firstName: 'Athlete', lastName: 'One',   time: '10.50' },
        { place: '2', firstName: 'Athlete', lastName: 'Two',   time: '10.75' },
        { place: '3', firstName: 'Athlete', lastName: 'Three', time: '11.00' },
      ]
    : (lif?.competitors || []);

  const eventName = isBuilder ? '100m Men Final' : (lif?.eventName || '');
  const distanceM = parseDistance(eventName);

  // Calculate speeds; filter out athletes with no valid time or no distance
  const rows = competitors
    .slice(0, maxRows)
    .map(c => {
      const timeSec = parseTime(c.time);
      const speedMs = (distanceM > 0 && timeSec > 0) ? distanceM / timeSec : null;
      const speedDisplay = speedMs !== null ? convert(speedMs).toFixed(2) : '—';
      const name = c.firstName ? `${c.firstName} ${c.lastName}` : (c.lastName || '');
      const maxSpeedMs = distanceM > 0 ? distanceM / 9 : null; // rough max for bar scaling
      const pct = (speedMs !== null && maxSpeedMs) ? Math.min(100, (speedMs / maxSpeedMs) * 100) : 0;
      return { place: c.place, name, speedDisplay, pct, hasSpeed: speedMs !== null };
    });

  const numRows = rows.length + 1; // +1 for header
  const rowH = containerSize.h > 0 ? containerSize.h / numRows : 30;
  const fontSize = Math.max(10, rowH * 0.55);

  const theme = {
    headerBg: '#003366',
    headerText: '#ffffff',
    evenBg: '#191970',
    oddBg: '#4682B4',
    text: '#ffffff',
    bar: '#1e88e5',
  };

  const cell = { display: 'flex', alignItems: 'center', padding: '0 6px', overflow: 'hidden', whiteSpace: 'nowrap', fontSize: fontSize + 'px' };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ height: rowH + 'px', display: 'grid', gridTemplateColumns: 'max-content 1fr max-content', backgroundColor: theme.headerBg, color: theme.headerText, fontWeight: 'bold', flexShrink: 0 }}>
        <div style={cell}>#</div>
        <div style={cell}>{eventName || 'Speed'}</div>
        <div style={{ ...cell, justifyContent: 'flex-end' }}>{unitLabel}</div>
      </div>

      {/* Rows */}
      {rows.map((row, idx) => {
        const bg = idx % 2 === 0 ? theme.evenBg : theme.oddBg;
        return (
          <div key={idx} style={{ height: rowH + 'px', display: 'grid', gridTemplateColumns: 'max-content 1fr max-content', backgroundColor: bg, color: theme.text, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
            {/* Speed bar */}
            {row.hasSpeed && (
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: row.pct + '%', backgroundColor: 'rgba(30,136,229,0.18)', pointerEvents: 'none' }} />
            )}
            <div style={{ ...cell, color: '#a0c4e8', minWidth: '2.5em', justifyContent: 'center' }}>{row.place}</div>
            <div style={cell}>{row.name}</div>
            <div style={{ ...cell, justifyContent: 'flex-end', fontFamily: 'monospace' }}>{row.speedDisplay}</div>
          </div>
        );
      })}
    </div>
  );
}
