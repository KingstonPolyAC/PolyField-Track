import React, { useRef, useState, useEffect } from 'react';
import { THEMES, shortenClub } from '../themes';

const ALL_COLUMNS = ['place', 'bib', 'name', 'affiliation', 'time', 'wind'];

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
  const numRows = showHeader ? 9 : 8;
  const fontSize = containerH > 0 ? (containerH / numRows) * 0.85 : 16;

  const t = THEMES[theme] || THEMES.classic;
  const acronyms = customAcronyms || {};

  // Build 8 competitor rows (pad with empty rows)
  const rawComps = lif?.competitors || [];
  const competitors = [...rawComps];
  while (competitors.length < 8) {
    competitors.push({ place: '', id: '', firstName: '', lastName: '', affiliation: '', time: '', wind: '' });
  }

  // Grid column template
  const gridCols = columns.map(col => {
    if (col === 'name') return 'minmax(0, 1fr)';
    if (col === 'affiliation') return 'minmax(0, max-content)';
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
            {lif?.eventName || '—'}
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
