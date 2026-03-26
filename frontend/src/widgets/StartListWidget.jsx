import React, { useRef, useState, useEffect } from 'react';
import { THEMES, shortenClub } from '../themes';

const ALL_COLUMNS = ['lane', 'bib', 'name', 'affiliation', 'spacer'];

export { ALL_COLUMNS as ALL_STARTLIST_COLUMNS };

export default function StartListWidget({ widget, startList, theme, customAcronyms, isBuilder }) {
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
  const maxRows = Math.max(1, Math.min(30, config.maxRows || 8));
  const showHeader = config.showHeader !== false;

  // Determine effective columns — hide 'lane' if no lanes are assigned in the data
  const hasLanes = startList?.hasLanes ?? false;
  const configuredCols = (config.columns && config.columns.length > 0)
    ? config.columns
    : ['lane', 'name', 'bib', 'affiliation'];
  const columns = configuredCols.filter(col => col !== 'lane' || hasLanes);

  const numRows = showHeader ? maxRows + 1 : maxRows;
  const fontSize = containerH > 0 ? (containerH / numRows) * 0.85 : 16;

  const t = THEMES[theme] || THEMES.classic;
  const acronyms = customAcronyms || {};

  const rawEntries = startList?.entries || [];
  const entries = rawEntries.slice(0, maxRows);
  while (entries.length < maxRows) {
    entries.push({ lane: '', id: '', firstName: '', lastName: '', affiliation: '' });
  }

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

  const getCellContent = (entry, col) => {
    switch (col) {
      case 'lane': return entry.lane || '';
      case 'bib': return entry.id || '';
      case 'name': {
        const fn = entry.firstName ? entry.firstName + ' ' : '';
        return fn + (entry.lastName || '');
      }
      case 'affiliation': return shortenClub(entry.affiliation, acronyms) || '';
      case 'spacer': return '';
      default: return '';
    }
  };

  if (isBuilder) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#7ab', gap: '4px' }}>
        <div style={{ fontSize: '0.85em', fontWeight: 'bold', letterSpacing: '0.05em' }}>START LIST</div>
        <div style={{ fontSize: '0.65em', color: '#556' }}>{configuredCols.join(' · ')}</div>
      </div>
    );
  }

  const headerColCount = columns.length;

  return (
    <div ref={containerRef} style={containerStyle}>
      {showHeader && (
        <div style={{ ...cellStyle, backgroundColor: t.headerBg, color: t.headerText, fontWeight: 'bold', gridColumn: `1 / ${headerColCount + 1}` }}>
          {startList?.eventName || ''}
        </div>
      )}
      {entries.map((entry, idx) => {
        const bg = idx % 2 === 0 ? t.evenRowBg : t.oddRowBg;
        return columns.map((col, ci) => (
          <div key={`${idx}-${ci}`} style={{ ...cellStyle, backgroundColor: bg }}>
            {getCellContent(entry, col)}
          </div>
        ));
      })}
    </div>
  );
}
