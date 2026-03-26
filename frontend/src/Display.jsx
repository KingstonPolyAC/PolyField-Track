import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LayoutRenderer from './LayoutRenderer';
import { useRunningClock } from './clockUtils';

const BASE_URL = (() => {
  const h = window.location.hostname;
  const p = window.location.protocol;
  return (h === '' || h === 'wails.localhost' || p === 'wails:') ? 'http://127.0.0.1:3000' : '';
})();

// Generic display page — shows layout by its 1-based index in the layout list.
// Accessible at /display/1, /display/2, etc. on the LAN web interface (port 3000).
// Each screen points at its own URL; no activation needed.
export default function Display() {
  const { index } = useParams();
  const [layout, setLayout] = useState(null);
  const [currentLIF, setCurrentLIF] = useState(null);
  const [startList, setStartList] = useState(null);
  const [customAcronyms, setCustomAcronyms] = useState({});
  const [displayMode, setDisplayMode] = useState('lif');
  const [activeText, setActiveText] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const runningClock = useRunningClock(BASE_URL);

  useEffect(() => {
    const idx = Math.max(0, parseInt(index, 10) - 1); // 1-based URL → 0-based array

    async function fetchLayout() {
      try {
        const [stateRes, configRes, slRes] = await Promise.all([
          fetch(`${BASE_URL}/display-state`),
          fetch(`${BASE_URL}/layout-config`),
          fetch(`${BASE_URL}/startlist`),
        ]);
        if (!stateRes.ok || !configRes.ok) return;
        const state = await stateRes.json();
        const config = await configRes.json();
        if (!config?.layouts) return;
        setLayout(config.layouts[idx] || null);
        if (state.currentLIF) setCurrentLIF(state.currentLIF);
        if (slRes.ok) setStartList(await slRes.json());
        setDisplayMode(state.mode || 'lif');
        setActiveText(state.activeText || '');
        setImageBase64(state.imageBase64 || '');
      } catch (err) {
        // silently fail
      }
    }
    fetchLayout();
    const interval = setInterval(fetchLayout, 3000);
    return () => clearInterval(interval);
  }, [index]);

  useEffect(() => {
    fetch(`${BASE_URL}/club-acronyms`)
      .then(r => r.ok ? r.json() : {})
      .then(data => setCustomAcronyms(data || {}))
      .catch(() => {});
  }, []);

  if (!layout) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: '#000', display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#607d8b', fontFamily: 'monospace',
        fontSize: '1.1rem', textAlign: 'center', padding: '2rem',
      }}>
        Layout {index} not found — add more layouts in the Layout Builder
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <LayoutRenderer
        layout={layout}
        lif={currentLIF}
        clock={runningClock}
        startList={startList}
        customAcronyms={customAcronyms}
        displayMode={displayMode}
        activeText={activeText}
        imageBase64={imageBase64}
        containerStyle={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
