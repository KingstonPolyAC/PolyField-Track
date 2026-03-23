import React, { useState, useEffect } from 'react';
import LayoutRenderer from './LayoutRenderer';
import { useRunningClock } from './clockUtils';

const BASE_URL = (() => {
  const h = window.location.hostname;
  const p = window.location.protocol;
  return (h === '' || h === 'wails.localhost' || p === 'wails:') ? 'http://127.0.0.1:3000' : '';
})();

// Dedicated full-screen scoreboard page — always shows the activated custom layout.
// Accessible at /scoreboard on the LAN web interface (port 3000).
export default function Scoreboard() {
  const [layout, setLayout] = useState(null);
  const [currentLIF, setCurrentLIF] = useState(null);
  const [customAcronyms, setCustomAcronyms] = useState({});
  const runningClock = useRunningClock(BASE_URL);

  // Poll display state + layout config every 3s to pick up layout changes
  useEffect(() => {
    async function fetchLayout() {
      try {
        const [stateRes, configRes] = await Promise.all([
          fetch(`${BASE_URL}/display-state`),
          fetch(`${BASE_URL}/layout-config`),
        ]);
        if (!stateRes.ok || !configRes.ok) return;
        const state = await stateRes.json();
        const config = await configRes.json();
        if (!config?.layouts) return;
        const layoutId = state.activeLayoutId || config.activeLayoutId;
        const found = config.layouts.find(l => l.id === layoutId);
        if (found) setLayout(found);
        if (state.currentLIF) setCurrentLIF(state.currentLIF);
      } catch (err) {
        // silently fail — server may be starting up
      }
    }
    fetchLayout();
    const interval = setInterval(fetchLayout, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch club acronyms once
  useEffect(() => {
    fetch(`${BASE_URL}/club-acronyms`)
      .then(r => r.ok ? r.json() : {})
      .then(data => setCustomAcronyms(data || {}))
      .catch(() => {});
  }, []);

  if (!layout) {
    return (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: '#000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#607d8b', fontFamily: 'monospace', fontSize: '1.1rem',
        textAlign: 'center', padding: '2rem',
      }}>
        No layout activated — open Layout Builder and click Activate
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#000' }}>
      <LayoutRenderer
        layout={layout}
        lif={currentLIF}
        clock={runningClock}
        customAcronyms={customAcronyms}
        containerStyle={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
