import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = (() => {
  const h = window.location.hostname;
  const p = window.location.protocol;
  return (h === '' || h === 'wails.localhost' || p === 'wails:') ? 'http://127.0.0.1:3000' : '';
})();

export default function DisplayIndex() {
  const navigate = useNavigate();
  const [layouts, setLayouts] = useState([]);
  const [activeLayoutId, setActiveLayoutId] = useState(null);

  useEffect(() => {
    async function fetch_() {
      try {
        const [stateRes, configRes] = await Promise.all([
          fetch(`${BASE_URL}/display-state`),
          fetch(`${BASE_URL}/layout-config`),
        ]);
        if (stateRes.ok) {
          const state = await stateRes.json();
          setActiveLayoutId(state.activeLayoutId || null);
        }
        if (configRes.ok) {
          const config = await configRes.json();
          setLayouts(config?.layouts || []);
        }
      } catch (err) {}
    }
    fetch_();
  }, []);

  const origin = window.location.origin;

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#0a1628', color: '#fff',
      fontFamily: 'sans-serif', padding: '40px 32px',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px', color: '#e0e0e0' }}>
          Display Layouts
        </h1>
        <p style={{ color: '#607d8b', marginBottom: '32px', fontSize: '0.9rem' }}>
          Select a layout to open it full-screen. Point each display device at its own URL.
        </p>

        {layouts.length === 0 ? (
          <div style={{ color: '#607d8b', textAlign: 'center', paddingTop: '60px' }}>
            No layouts configured — open the Layout Builder to create one.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {layouts.map((layout, i) => {
              const index = i + 1;
              const url = `/display/${index}`;
              const isActive = layout.id === activeLayoutId;

              return (
                <div
                  key={layout.id}
                  onClick={() => navigate(url)}
                  style={{
                    backgroundColor: '#0d1b2a',
                    border: `2px solid ${isActive ? '#2e7d32' : '#1e3a5f'}`,
                    borderRadius: '10px',
                    padding: '24px 20px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#112236'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0d1b2a'}
                >
                  {/* Index badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
                      color: '#607d8b', textTransform: 'uppercase',
                    }}>
                      Display {index}
                    </span>
                    {isActive && (
                      <span style={{
                        fontSize: '0.65rem', backgroundColor: '#2e7d32', color: '#fff',
                        padding: '2px 8px', borderRadius: '999px', fontWeight: 600,
                      }}>
                        Active
                      </span>
                    )}
                  </div>

                  {/* Layout name */}
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#e0e0e0' }}>
                    {layout.name || `Layout ${index}`}
                  </div>

                  {/* Widget count */}
                  <div style={{ fontSize: '0.78rem', color: '#607d8b' }}>
                    {(layout.widgets || []).length} widget{(layout.widgets || []).length !== 1 ? 's' : ''}
                    {layout.theme ? ` · ${layout.theme}` : ''}
                  </div>

                  {/* URL */}
                  <div style={{
                    fontSize: '0.75rem', color: '#4a9',
                    fontFamily: 'monospace', wordBreak: 'break-all',
                    marginTop: '4px',
                  }}>
                    {origin}{url}
                  </div>

                  {/* Open button */}
                  <div style={{
                    marginTop: '4px', textAlign: 'right',
                    fontSize: '0.8rem', color: '#1e88e5', fontWeight: 600,
                  }}>
                    Open full-screen →
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: '40px', borderTop: '1px solid #1e3a5f', paddingTop: '20px', fontSize: '0.8rem', color: '#607d8b' }}>
          Manage layouts in the{' '}
          <span
            onClick={() => navigate('/layout-builder')}
            style={{ color: '#1e88e5', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Layout Builder
          </span>
        </div>
      </div>
    </div>
  );
}
