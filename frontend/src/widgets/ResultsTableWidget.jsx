import React, { useRef, useState, useEffect } from 'react';
import { THEMES, shortenClub } from '../themes';

const ALL_COLUMNS = ['place', 'bib', 'name', 'affiliation', 'time', 'wind', 'speed'];

const UNIT_CONVERSIONS = {
  kph: (ms) => ms * 3.6,
  mph: (ms) => ms * 2.23694,
  ms:  (ms) => ms,
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

export default function ResultsTableWidget({ widget, lif, theme, customAcronyms, isBuilder }) {
  const containerRef = useRef(null);
  const [containerH, setContainerH] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      setContainerH(entries[0].contentRect.height);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const config = widget.config || {};
  const columns = (config.columns && config.columns.length > 0)
    ? config.columns
    : ['place', 'name', 'time'];
  const showHeader = config.showHeader !== false;
  const maxRows = Math.max(1, Math.min(20, config.maxRows || 8));
  const numRows = showHeader ? maxRows + 1 : maxRows;
  const fontSize = containerH > 0 ? (containerH / numRows) * 0.85 : 16;

  const t = THEMES[theme] || THEMES.classic;
  const acronyms = customAcronyms || {};

  const distanceM = parseDistance(lif?.eventName || '');
  const speedUnit = config.speedUnit || 'kph';
  const convertSpeed = UNIT_CONVERSIONS[speedUnit] || UNIT_CONVERSIONS.kph;

  // Build competitor rows up to maxRows, padding with empty rows
  const rawComps = lif?.competitors || [];
  const competitors = rawComps.slice(0, maxRows);
  while (competitors.length < maxRows) {
    competitors.push({ place: '', id: '', firstName: '', lastName: '', affiliation: '', time: '', wind: '' });
  }

  // Grid column template
  const gridCols = columns.map(col => {
    if (col === 'name') return 'minmax(0, 1fr)';
    if (col === 'affiliation') return 'minmax(0, max-content)';
    if (col === 'spacer') return '0.6em';
    return 'max-content';
  }).join(' ');

  const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: t.evenRowBg,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: `repeat(${numRows}, 1fr)`,
    gridTemplateColumns: gridCols,
    fontSize: fontSize + 'px',
    color: t.rowText,
  };

  const cellStyle = {
    padding: '1px 4px',
    overflow: 'hidden',
    textOverflow: 'clip',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
  };

  const getCellContent = (comp, col) => {
    switch (col) {
      case 'place': return comp.place || '';
      case 'bib': return comp.id || '';
      case 'name': {
        const fn = comp.firstName ? comp.firstName + ' ' : '';
        return fn + (comp.lastName || '');
      }
      case 'affiliation': return shortenClub(comp.affiliation, acronyms) || '';
      case 'time': return comp.time || '';
      case 'wind': return comp.wind || '';
      case 'spacer': return '';
      case 'speed': {
        const timeSec = parseTime(comp.time);
        if (distanceM <= 0 || timeSec <= 0) return '';
        const speedMs = distanceM / timeSec;
        return convertSpeed(speedMs).toFixed(2);
      }
      default: return '';
    }
  };

  if (isBuilder) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#7ab', gap: '4px' }}>
        <div style={{ fontSize: '0.85em', fontWeight: 'bold', letterSpacing: '0.05em' }}>RESULTS TABLE</div>
        <div style={{ fontSize: '0.65em', color: '#556' }}>{columns.join(' · ')}</div>
      </div>
    );
  }

  const headerColCount = columns.length;

  return (
    <div ref={containerRef} style={containerStyle}>
      {showHeader && (
        <>
          <div style={{ ...cellStyle, backgroundColor: t.headerBg, color: t.headerText, fontWeight: 'bold', gridColumn: `1 / ${headerColCount}` }}>
            {lif?.eventName || ''}
          </div>
          <div style={{ ...cellStyle, backgroundColor: t.headerBg, color: t.headerText, justifyContent: 'flex-end' }}>
            {lif?.wind || ''}
          </div>
        </>
      )}
      {competitors.map((comp, idx) => {
        const bg = idx % 2 === 0 ? t.evenRowBg : t.oddRowBg;
        return columns.map((col, ci) => (
          <div key={`${idx}-${ci}`} style={{ ...cellStyle, backgroundColor: bg }}>
            {getCellContent(comp, col)}
          </div>
        ));
      })}
    </div>
  );
}
