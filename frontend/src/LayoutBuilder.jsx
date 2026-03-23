import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WIDGET_TYPES, widgetToStyle, clamp } from './widgets/WidgetTypes';
import { CONDITION_TYPES } from './widgets/conditions';
import { THEMES } from './themes';
import ResultsTableWidget from './widgets/ResultsTableWidget';
import ClockWidget from './widgets/ClockWidget';
import EventNameWidget from './widgets/EventNameWidget';
import WindWidget from './widgets/WindWidget';
import CustomTextWidget from './widgets/CustomTextWidget';
import CustomLogoWidget from './widgets/CustomLogoWidget';
import TimeOfDayWidget from './widgets/TimeOfDayWidget';
import AreaMaskWidget from './widgets/AreaMaskWidget';
import ClockStoppedWidget from './widgets/ClockStoppedWidget';
import LayoutRenderer from './LayoutRenderer';
import { trimClockTime } from './clockUtils';
import { useTranslation } from './i18n';

const GRID_COLS = 20;
const GRID_ROWS = 20;

const BASE_URL = (() => {
  const h = window.location.hostname;
  const p = window.location.protocol;
  return (h === '' || h === 'wails.localhost' || p === 'wails:') ? 'http://127.0.0.1:3000' : '';
})();

// --- Mock data for 200m Men Olympic Final preview ---
const MOCK_LIF = {
  eventName: '200m Men Final',
  wind: '+0.4',
  competitors: [
    { place: '1', id: '2207', firstName: 'Noah',     lastName: 'Lyles',      affiliation: 'USA', time: '19.70', wind: '+0.4' },
    { place: '2', id: '1547', firstName: 'Kishane',  lastName: 'Thompson',   affiliation: 'JAM', time: '19.72', wind: '+0.4' },
    { place: '3', id: '3891', firstName: 'Letsile',  lastName: 'Tebogo',     affiliation: 'BOT', time: '19.87', wind: '+0.4' },
    { place: '4', id: '2139', firstName: 'Fred',     lastName: 'Kerley',     affiliation: 'USA', time: '19.92', wind: '+0.4' },
    { place: '5', id: '1822', firstName: 'Kenny',    lastName: 'Bednarek',   affiliation: 'USA', time: '19.94', wind: '+0.4' },
    { place: '6', id: '1645', firstName: 'Erriyon',  lastName: 'Knighton',   affiliation: 'USA', time: '20.12', wind: '+0.4' },
    { place: '7', id: '3012', firstName: 'Andre',    lastName: 'De Grasse',  affiliation: 'CAN', time: '20.18', wind: '+0.4' },
    { place: '8', id: '2756', firstName: 'Luxolo',   lastName: 'Adams',      affiliation: 'RSA', time: '20.35', wind: '+0.4' },
  ],
};

const LEAD_TIME = 19.70; // seconds

function formatClockTime(secs) {
  const m = Math.floor(secs / 60);
  const s = (secs % 60).toFixed(2).padStart(5, '0');
  return trimClockTime(`${m}:${s}`);
}

function newId() {
  return crypto.randomUUID();
}

const ASPECT_RATIOS = [
  { label: '16:9 — Widescreen',  value: '16:9',  css: '16 / 9'  },
  { label: '4:3 — Standard',     value: '4:3',   css: '4 / 3'   },
  { label: '21:9 — Ultrawide',   value: '21:9',  css: '21 / 9'  },
  { label: '9:16 — Portrait',    value: '9:16',  css: '9 / 16'  },
  { label: '1:1 — Square',       value: '1:1',   css: '1 / 1'   },
];

function defaultLayout(name) {
  return {
    id: newId(),
    name: name || 'My Layout',
    theme: 'classic',
    aspectRatio: '16:9',
    widgets: [],
  };
}

function renderWidgetPreview(widget) {
  const props = { widget, isBuilder: true, lif: null, clock: null, customAcronyms: {}, theme: 'classic' };
  switch (widget.type) {
    case 'results_table': return <ResultsTableWidget {...props} />;
    case 'clock':         return <ClockWidget {...props} />;
    case 'event_name':        return <EventNameWidget {...props} />;
    case 'event_name_result': return <EventNameWidget {...props} />;
    case 'wind':              return <WindWidget {...props} />;
    case 'wind_current':      return <WindWidget {...props} />;
    case 'custom_text':   return <CustomTextWidget {...props} />;
    case 'custom_logo':   return <CustomLogoWidget {...props} />;
    case 'time_of_day':   return <TimeOfDayWidget {...props} />;
    case 'area_mask':     return <AreaMaskWidget {...props} />;
    case 'stopped_clock': return <ClockStoppedWidget {...props} />;
    default:              return null;
  }
}

// ---- Column editor for results table ----
const ALL_COLUMNS = ['place', 'bib', 'name', 'affiliation', 'time', 'wind', 'speed'];
const COLUMN_LABELS = {
  place: 'Place', bib: 'Bib', name: 'Name',
  affiliation: 'Club', time: 'Time', wind: 'Wind', speed: 'Speed',
};

function ColumnEditor({ columns, onChange }) {
  const dragItem = useRef(null);
  const dragOver = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDragStart = (e, idx) => {
    dragItem.current = idx;
    e.dataTransfer.effectAllowed = 'move';
    setDragActive(true);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    dragOver.current = idx;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const from = dragItem.current;
    const to = dragOver.current;
    if (from !== null && to !== null && from !== to) {
      const next = [...columns];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onChange(next);
    }
    dragItem.current = null;
    dragOver.current = null;
    setDragActive(false);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    dragOver.current = null;
    setDragActive(false);
  };

  const removeCol = (col) => onChange(columns.filter(c => c !== col));
  const addCol = (col) => onChange([...columns, col]);
  const available = ALL_COLUMNS.filter(c => !columns.includes(c));

  return (
    <div>
      {columns.map((col, idx) => (
        <div
          key={col}
          draggable
          onDragStart={e => handleDragStart(e, idx)}
          onDragOver={e => handleDragOver(e, idx)}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: dragActive && dragOver.current === idx ? '#1e3a5f' : '#0a1e38',
            borderRadius: '4px', padding: '4px 6px', marginBottom: '3px',
            cursor: 'grab', fontSize: '0.78em', color: '#a0b4c8',
            border: '1px solid transparent',
          }}
        >
          <span style={{ color: '#607d8b', fontSize: '1em', userSelect: 'none' }}>⋮⋮</span>
          <span style={{ flex: 1 }}>{COLUMN_LABELS[col] || col}</span>
          <button
            onClick={() => removeCol(col)}
            style={{ background: 'none', border: 'none', color: '#b71c1c', cursor: 'pointer', fontSize: '1em', lineHeight: 1, padding: '0 2px' }}
          >×</button>
        </div>
      ))}
      {available.length > 0 && (
        <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {available.map(col => (
            <button
              key={col}
              onClick={() => addCol(col)}
              style={{
                padding: '2px 8px', backgroundColor: '#1a2a3a',
                border: '1px dashed #1e3a5f', borderRadius: '4px',
                color: '#607d8b', fontSize: '0.72em', cursor: 'pointer',
              }}
            >+ {COLUMN_LABELS[col] || col}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Properties Panel ----
function PropertiesPanel({ widget, onUpdate, onDelete }) {
  if (!widget) {
    return (
      <div style={panelStyle}>
        <div style={{ color: '#607d8b', fontSize: '0.8em', textAlign: 'center', marginTop: '40px' }}>
          Click a widget to edit its properties
        </div>
      </div>
    );
  }

  const config = widget.config || {};
  const update = (key, val) => onUpdate({ ...widget, config: { ...config, [key]: val } });
  const updatePos = (key, val) => onUpdate({ ...widget, [key]: Math.max(0, parseInt(val, 10) || 0) });

  const hasSpeedCol = (config.columns || []).includes('speed');

  return (
    <div style={panelStyle}>
      <div style={{ fontWeight: 'bold', color: '#a0b4c8', marginBottom: '12px', fontSize: '0.85em', letterSpacing: '0.05em' }}>
        {WIDGET_TYPES[widget.type]?.label || widget.type}
      </div>

      {/* Position & size */}
      <div style={{ marginBottom: '14px' }}>
        <div style={sectionLabel}>Position &amp; Size</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {['x', 'y', 'w', 'h'].map(k => (
            <label key={k} style={fieldLabel}>
              {k.toUpperCase()}
              <input type="number" min="0" max="20" value={widget[k]} onChange={e => updatePos(k, e.target.value)} style={inputStyle} />
            </label>
          ))}
        </div>
      </div>

      {/* Results table config */}
      {widget.type === 'results_table' && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionLabel}>Columns</div>
          <div style={{ fontSize: '0.68em', color: '#607d8b', marginBottom: '6px' }}>Drag to reorder · click × to remove</div>
          <ColumnEditor
            columns={config.columns || ['place', 'name', 'time']}
            onChange={cols => update('columns', cols)}
          />

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a0b4c8', fontSize: '0.8em', marginTop: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.showHeader !== false} onChange={e => update('showHeader', e.target.checked)} />
            Show event name header
          </label>

          <div style={{ ...sectionLabel, marginTop: '10px' }}>Rows</div>
          <input
            type="number" min="1" max="20"
            value={config.maxRows || 8}
            onChange={e => update('maxRows', Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 8)))}
            style={{ ...inputStyle, width: '60px' }}
          />

          {hasSpeedCol && (
            <>
              <div style={{ ...sectionLabel, marginTop: '10px' }}>Speed Unit</div>
              {[['kph', 'km/h'], ['mph', 'mph'], ['ms', 'm/s']].map(([u, label]) => (
                <label key={u} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a0b4c8', fontSize: '0.8em', marginBottom: '4px', cursor: 'pointer' }}>
                  <input type="radio" name="speed-unit" checked={(config.speedUnit || 'kph') === u} onChange={() => update('speedUnit', u)} />
                  {label}
                </label>
              ))}
            </>
          )}
        </div>
      )}

      {/* Custom text config */}
      {widget.type === 'custom_text' && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionLabel}>Content</div>
          <label style={fieldLabel}>
            Text
            <input type="text" value={config.text || ''} onChange={e => update('text', e.target.value)} style={{ ...inputStyle, width: '100%' }} />
          </label>
          <label style={{ ...fieldLabel, marginTop: '6px' }}>
            Colour
            <input type="color" value={config.color || '#ffffff'} onChange={e => update('color', e.target.value)} style={{ ...inputStyle, width: '48px', padding: '2px' }} />
          </label>
          <div style={sectionLabel}>Align</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['left', 'center', 'right'].map(a => (
              <button key={a} onClick={() => update('align', a)} style={{ ...smallBtn, backgroundColor: config.align === a ? '#1565c0' : '#1a2a3a' }}>{a}</button>
            ))}
          </div>
        </div>
      )}

      {/* Event name / wind / time of day align */}
      {(widget.type === 'event_name' || widget.type === 'wind' || widget.type === 'wind_current' || widget.type === 'time_of_day') && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionLabel}>Align</div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['left', 'center', 'right'].map(a => (
              <button key={a} onClick={() => update('align', a)} style={{ ...smallBtn, backgroundColor: config.align === a ? '#1565c0' : '#1a2a3a' }}>{a}</button>
            ))}
          </div>
        </div>
      )}

      {/* Time of day format */}
      {widget.type === 'time_of_day' && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionLabel}>Format</div>
          {['HH:MM', 'HH:MM:SS'].map(f => (
            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a0b4c8', fontSize: '0.8em', marginBottom: '4px', cursor: 'pointer' }}>
              <input type="radio" name="tod-format" checked={config.format === f} onChange={() => update('format', f)} />
              {f}
            </label>
          ))}
          <label style={{ ...fieldLabel, marginTop: '6px' }}>
            Colour
            <input type="color" value={config.color || '#ffffff'} onChange={e => update('color', e.target.value)} style={{ ...inputStyle, width: '48px', padding: '2px' }} />
          </label>
        </div>
      )}

      {/* Running clock config */}
      {widget.type === 'clock' && (
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a0b4c8', fontSize: '0.8em', marginTop: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={config.stopOnFinish === true}
              onChange={e => update('stopOnFinish', e.target.checked)}
            />
            Stop clock on finish
          </label>
          <div style={{ fontSize: '0.68em', color: '#607d8b', marginTop: '3px' }}>
            Checked: freezes at the FinishLynx photocell time. Unchecked (default): keeps counting after finish. Both hold until the next event loads.
          </div>
        </div>
      )}

      {/* Stopped clock config */}
      {widget.type === 'stopped_clock' && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionLabel}>Auto-hide after (seconds)</div>
          <div style={{ fontSize: '0.68em', color: '#607d8b', marginBottom: '6px' }}>
            0 = persist until next event is loaded
          </div>
          <input
            type="number" min="0" max="300"
            value={config.displaySeconds ?? 0}
            onChange={e => update('displaySeconds', Math.max(0, parseInt(e.target.value, 10) || 0))}
            style={{ ...inputStyle, width: '70px' }}
          />
          <span style={{ fontSize: '0.75em', color: '#607d8b', marginLeft: '6px' }}>seconds</span>
        </div>
      )}

      {/* Logo config */}
      {widget.type === 'custom_logo' && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionLabel}>Image</div>
          <button style={{ ...smallBtn, marginBottom: '8px' }} onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/png,image/jpeg,image/gif,image/svg+xml';
            input.onchange = e => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => update('imageBase64', ev.target.result);
              reader.readAsDataURL(file);
            };
            input.click();
          }}>Upload Image</button>
          {config.imageBase64 && (
            <>
              <img src={config.imageBase64} style={{ maxWidth: '100%', maxHeight: '80px', objectFit: 'contain', display: 'block', marginBottom: '8px' }} alt="preview" />
              <button style={{ ...smallBtn, backgroundColor: '#7f1d1d' }} onClick={() => update('imageBase64', '')}>Remove</button>
            </>
          )}
          <div style={sectionLabel}>Fit</div>
          {['contain', 'cover', 'fill'].map(f => (
            <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a0b4c8', fontSize: '0.8em', marginBottom: '4px', cursor: 'pointer' }}>
              <input type="radio" name="logo-fit" checked={config.fit === f} onChange={() => update('fit', f)} />
              {f}
            </label>
          ))}
        </div>
      )}

      {/* Colours */}
      <ColourSection widget={widget} config={config} update={update} />

      {/* Visibility Conditions */}
      <ConditionsEditor widget={widget} onUpdate={onUpdate} />

      <button onClick={onDelete} style={{ ...smallBtn, backgroundColor: '#7f1d1d', width: '100%', marginTop: '8px' }}>
        Delete Widget
      </button>
    </div>
  );
}

function ColorField({ label, value, onChange, onClear }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
      <span style={{ flex: 1, color: '#a0b4c8', fontSize: '0.78em' }}>{label}</span>
      <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
        style={{ width: '36px', height: '22px', padding: '1px 2px', border: '1px solid #1e3a5f', borderRadius: '3px', backgroundColor: '#0a1628', cursor: 'pointer' }} />
      {onClear && (
        <button onClick={onClear} title="Remove" style={{ background: 'none', border: 'none', color: '#607d8b', cursor: 'pointer', fontSize: '0.9em', padding: '0 2px', lineHeight: 1 }}>✕</button>
      )}
    </div>
  );
}

function ColourSection({ widget, config, update }) {
  const bg = config.backgroundColor;
  const hasBg = bg !== undefined && bg !== '';

  return (
    <div style={{ marginTop: '14px', borderTop: '1px solid #1e3a5f', paddingTop: '10px', marginBottom: '14px' }}>
      <div style={sectionLabel}>Colours</div>

      {/* Background — all widgets */}
      <ColorField
        label="Background"
        value={hasBg ? bg : '#000000'}
        onChange={v => update('backgroundColor', v)}
        onClear={hasBg ? () => update('backgroundColor', '') : undefined}
      />
      {!hasBg && <div style={{ fontSize: '0.65em', color: '#607d8b', marginBottom: '6px', marginTop: '-2px' }}>Click colour to add background</div>}

      {/* Text colour — single-colour text widgets */}
      {['event_name', 'wind', 'wind_current', 'custom_text', 'time_of_day'].includes(widget.type) && (
        <ColorField label="Text" value={config.color || '#ffffff'} onChange={v => update('color', v)} />
      )}

      {/* Stopped clock text colour */}
      {widget.type === 'stopped_clock' && (
        <ColorField label="Text" value={config.color || '#e0e0e0'} onChange={v => update('color', v)} />
      )}

      {/* Running clock per-state colours */}
      {widget.type === 'clock' && (
        <>
          <ColorField label="Running"     value={config.colorRunning   || '#1e88e5'} onChange={v => update('colorRunning',   v)} />
          <ColorField label="Stopped"     value={config.colorStopped   || '#e0e0e0'} onChange={v => update('colorStopped',   v)} />
          <ColorField label="Ready"       value={config.colorReady     || '#607d8b'} onChange={v => update('colorReady',     v)} />
          <ColorField label="Time of Day" value={config.colorTimeOfDay || '#e0e0e0'} onChange={v => update('colorTimeOfDay', v)} />
        </>
      )}
    </div>
  );
}

function ConditionsEditor({ widget, onUpdate }) {
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState('hasWind');
  const [newValue, setNewValue] = useState('');

  const conditions = widget.conditions || [];
  const def = CONDITION_TYPES[newType];

  const addCondition = () => {
    const c = { id: crypto.randomUUID(), type: newType, value: newValue };
    onUpdate({ ...widget, conditions: [...conditions, c] });
    setAdding(false);
    setNewValue('');
  };

  const removeCondition = (id) => {
    onUpdate({ ...widget, conditions: conditions.filter(c => c.id !== id) });
  };

  return (
    <div style={{ marginTop: '14px', borderTop: '1px solid #1e3a5f', paddingTop: '10px' }}>
      <div style={sectionLabel}>Visibility Conditions</div>
      <div style={{ fontSize: '0.7em', color: '#607d8b', marginBottom: '8px' }}>
        {conditions.length === 0 ? 'Always visible' : 'Visible when ALL conditions pass'}
      </div>

      {conditions.map(c => {
        const label = CONDITION_TYPES[c.type]?.label || c.type;
        return (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0a1e38', borderRadius: '4px', padding: '4px 6px', marginBottom: '4px', fontSize: '0.72em', color: '#a0b4c8' }}>
            <span>{label}{c.value ? `: "${c.value}"` : ''}</span>
            <button onClick={() => removeCondition(c.id)} style={{ background: 'none', border: 'none', color: '#b71c1c', cursor: 'pointer', fontSize: '1em', lineHeight: 1, padding: '0 2px' }}>×</button>
          </div>
        );
      })}

      {adding ? (
        <div style={{ backgroundColor: '#0a1e38', borderRadius: '5px', padding: '8px', marginTop: '4px' }}>
          <select value={newType} onChange={e => { setNewType(e.target.value); setNewValue(''); }} style={{ ...inputStyle, width: '100%', marginBottom: '6px' }}>
            {Object.entries(CONDITION_TYPES).map(([key, d]) => (
              <option key={key} value={key}>{d.label}</option>
            ))}
          </select>
          {def?.hasValue && (
            def.valueOptions ? (
              <select value={newValue} onChange={e => setNewValue(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: '6px' }}>
                <option value="">— select —</option>
                {def.valueOptions.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            ) : (
              <input type="text" placeholder={def.valueLabel} value={newValue} onChange={e => setNewValue(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: '6px' }} />
            )
          )}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={addCondition} disabled={def?.hasValue && !newValue} style={{ ...smallBtn, flex: 1, backgroundColor: '#1565c0' }}>Add</button>
            <button onClick={() => setAdding(false)} style={{ ...smallBtn, flex: 1 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{ ...smallBtn, width: '100%', marginTop: '4px' }}>+ Add Condition</button>
      )}
    </div>
  );
}

const panelStyle = { width: '220px', minWidth: '220px', backgroundColor: '#0d1b2a', borderLeft: '1px solid #1e3a5f', padding: '14px', overflowY: 'auto', flexShrink: 0 };
const sectionLabel = { fontSize: '0.7em', color: '#607d8b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', marginTop: '10px' };
const fieldLabel = { display: 'flex', flexDirection: 'column', gap: '2px', color: '#a0b4c8', fontSize: '0.78em' };
const inputStyle = { backgroundColor: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '4px', color: '#e0e8f0', padding: '3px 6px', fontSize: '0.85em' };
const smallBtn = { border: 'none', borderRadius: '4px', color: '#fff', padding: '4px 10px', cursor: 'pointer', fontSize: '0.78em', backgroundColor: '#1a3050' };

// ---- Main LayoutBuilder ----
export default function LayoutBuilder() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [layoutConfig, setLayoutConfig] = useState({ version: 1, activeLayoutId: null, layouts: [] });
  const [selectedLayoutId, setSelectedLayoutId] = useState(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isActive, setIsActive] = useState(false);

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false);
  const [mockClock, setMockClock] = useState({ state: 'idle', time: '' });
  const previewTimers = useRef([]);

  const canvasRef = useRef(null);
  const dragging = useRef(null);
  const resizing = useRef(null);
  const saveTimer = useRef(null);

  // ---- Load config on mount ----
  useEffect(() => {
    fetch(`${BASE_URL}/layout-config`)
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        if (data && data.layouts) {
          setLayoutConfig(data);
          const firstId = data.activeLayoutId || data.layouts[0]?.id || null;
          setSelectedLayoutId(firstId);
        } else {
          const first = defaultLayout('Default Layout');
          const cfg = { version: 1, activeLayoutId: first.id, layouts: [first] };
          setLayoutConfig(cfg);
          setSelectedLayoutId(first.id);
        }
      })
      .catch(() => {
        const first = defaultLayout('Default Layout');
        const cfg = { version: 1, activeLayoutId: first.id, layouts: [first] };
        setLayoutConfig(cfg);
        setSelectedLayoutId(first.id);
      });

    fetch(`${BASE_URL}/display-state`)
      .then(r => r.json())
      .then(s => setIsActive(s.mode === 'custom'))
      .catch(() => {});
  }, []);

  // Cleanup preview timers on unmount
  useEffect(() => {
    return () => {
      previewTimers.current.forEach(id => clearTimeout(id));
    };
  }, []);

  // ---- Preview clock animation ----
  const startPreview = useCallback(() => {
    // Cancel any running timers
    previewTimers.current.forEach(id => clearTimeout(id));
    previewTimers.current = [];

    setPreviewMode(true);
    setMockClock({ state: 'idle', time: '' });

    const t1 = setTimeout(() => {
      setMockClock({ state: 'armed', time: 'READY' });

      const t2 = setTimeout(() => {
        const startMs = Date.now();
        setMockClock({ state: 'running', time: '0:00.00' });

        const tick = () => {
          const elapsed = (Date.now() - startMs) / 1000;
          if (elapsed >= LEAD_TIME) {
            setMockClock({ state: 'stopped', time: trimClockTime(`0:${LEAD_TIME.toFixed(2).padStart(5, '0')}`), wind: '+0.4' });
            return;
          }
          setMockClock({ state: 'running', time: formatClockTime(elapsed) });
          const tN = setTimeout(tick, 50);
          previewTimers.current.push(tN);
        };
        const tN = setTimeout(tick, 50);
        previewTimers.current.push(tN);
      }, 800);
      previewTimers.current.push(t2);
    }, 600);
    previewTimers.current.push(t1);
  }, []);

  const stopPreview = useCallback(() => {
    previewTimers.current.forEach(id => clearTimeout(id));
    previewTimers.current = [];
    setPreviewMode(false);
    setMockClock({ state: 'idle', time: '' });
  }, []);

  // ---- Debounced save ----
  const scheduleSave = useCallback((cfg) => {
    setSaveStatus('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await fetch(`${BASE_URL}/layout-config`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cfg),
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('unsaved');
      }
    }, 600);
  }, []);

  const updateConfig = useCallback((newCfg) => {
    setLayoutConfig(newCfg);
    scheduleSave(newCfg);
  }, [scheduleSave]);

  // ---- Current layout helpers ----
  const currentLayout = layoutConfig.layouts.find(l => l.id === selectedLayoutId) || null;
  const selectedWidget = currentLayout?.widgets.find(w => w.id === selectedWidgetId) || null;

  const updateCurrentLayout = useCallback((updatedLayout) => {
    const newCfg = {
      ...layoutConfig,
      layouts: layoutConfig.layouts.map(l => l.id === updatedLayout.id ? updatedLayout : l),
    };
    updateConfig(newCfg);
  }, [layoutConfig, updateConfig]);

  const updateWidget = useCallback((updatedWidget) => {
    if (!currentLayout) return;
    const newLayout = {
      ...currentLayout,
      widgets: currentLayout.widgets.map(w => w.id === updatedWidget.id ? updatedWidget : w),
    };
    updateCurrentLayout(newLayout);
  }, [currentLayout, updateCurrentLayout]);

  // ---- Grid math ----
  const canvasToGrid = (clientX, clientY) => {
    if (!canvasRef.current) return { gx: 0, gy: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    return {
      gx: clamp(Math.round(relX / rect.width * GRID_COLS), 0, GRID_COLS),
      gy: clamp(Math.round(relY / rect.height * GRID_ROWS), 0, GRID_ROWS),
    };
  };

  // ---- Drag handlers ----
  const handleWidgetMouseDown = (e, widget) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    setSelectedWidgetId(widget.id);
    const { gx, gy } = canvasToGrid(e.clientX, e.clientY);
    dragging.current = { widgetId: widget.id, offsetX: gx - widget.x, offsetY: gy - widget.y };
  };

  const handleResizeMouseDown = (e, widget) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    resizing.current = { widgetId: widget.id };
  };

  const handleMouseMove = useCallback((e) => {
    const { gx, gy } = canvasToGrid(e.clientX, e.clientY);

    if (dragging.current && currentLayout) {
      const { widgetId, offsetX, offsetY } = dragging.current;
      const widget = currentLayout.widgets.find(w => w.id === widgetId);
      if (!widget) return;
      const newX = clamp(gx - offsetX, 0, GRID_COLS - widget.w);
      const newY = clamp(gy - offsetY, 0, GRID_ROWS - widget.h);
      if (newX !== widget.x || newY !== widget.y) {
        setLayoutConfig(prev => ({
          ...prev,
          layouts: prev.layouts.map(l => l.id === selectedLayoutId
            ? { ...l, widgets: l.widgets.map(w => w.id === widgetId ? { ...w, x: newX, y: newY } : w) }
            : l),
        }));
      }
    }

    if (resizing.current && currentLayout) {
      const { widgetId } = resizing.current;
      const widget = currentLayout.widgets.find(w => w.id === widgetId);
      if (!widget) return;
      const newW = clamp(gx - widget.x, 1, GRID_COLS - widget.x);
      const newH = clamp(gy - widget.y, 1, GRID_ROWS - widget.y);
      if (newW !== widget.w || newH !== widget.h) {
        setLayoutConfig(prev => ({
          ...prev,
          layouts: prev.layouts.map(l => l.id === selectedLayoutId
            ? { ...l, widgets: l.widgets.map(w => w.id === widgetId ? { ...w, w: newW, h: newH } : w) }
            : l),
        }));
      }
    }
  }, [currentLayout, selectedLayoutId]);

  const handleMouseUp = useCallback(() => {
    if (dragging.current || resizing.current) {
      dragging.current = null;
      resizing.current = null;
      setLayoutConfig(prev => {
        scheduleSave(prev);
        return prev;
      });
    }
  }, [scheduleSave]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ---- Widget operations ----
  const addWidget = (type) => {
    if (!currentLayout) return;
    const def = WIDGET_TYPES[type];
    const widget = {
      id: newId(),
      type,
      x: 0,
      y: 0,
      w: def.defaultW,
      h: def.defaultH,
      config: { ...def.defaultConfig },
    };
    const newLayout = { ...currentLayout, widgets: [...currentLayout.widgets, widget] };
    updateCurrentLayout(newLayout);
    setSelectedWidgetId(widget.id);
  };

  const deleteWidget = () => {
    if (!currentLayout || !selectedWidgetId) return;
    const newLayout = { ...currentLayout, widgets: currentLayout.widgets.filter(w => w.id !== selectedWidgetId) };
    setSelectedWidgetId(null);
    updateCurrentLayout(newLayout);
  };

  // ---- Layout operations ----
  const addLayout = () => {
    const layout = defaultLayout(`Layout ${layoutConfig.layouts.length + 1}`);
    const newCfg = { ...layoutConfig, layouts: [...layoutConfig.layouts, layout] };
    updateConfig(newCfg);
    setSelectedLayoutId(layout.id);
    setSelectedWidgetId(null);
  };

  const deleteLayout = () => {
    if (layoutConfig.layouts.length <= 1) return;
    const remaining = layoutConfig.layouts.filter(l => l.id !== selectedLayoutId);
    const newCfg = { ...layoutConfig, layouts: remaining, activeLayoutId: remaining[0].id };
    updateConfig(newCfg);
    setSelectedLayoutId(remaining[0].id);
    setSelectedWidgetId(null);
  };

  const renameLayout = (name) => {
    if (!currentLayout) return;
    updateCurrentLayout({ ...currentLayout, name });
  };

  const setTheme = (theme) => {
    if (!currentLayout) return;
    updateCurrentLayout({ ...currentLayout, theme });
  };

  const setAspectRatio = (ar) => {
    if (!currentLayout) return;
    updateCurrentLayout({ ...currentLayout, aspectRatio: ar });
  };

  // ---- Activate / Deactivate ----
  const toggleActivate = async () => {
    const newActive = !isActive;
    const mode = newActive ? 'custom' : 'lif';
    const body = { mode };
    if (newActive) body.activeLayoutId = selectedLayoutId;
    await fetch(`${BASE_URL}/display-state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setIsActive(newActive);
    // Always persist the activated flag so it survives restarts
    const newCfg = { ...layoutConfig, activeLayoutId: selectedLayoutId, activated: newActive };
    updateConfig(newCfg);
  };

  // ---- Export / Import ----
  const exportConfig = () => {
    const blob = new Blob([JSON.stringify(layoutConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'polyfield-layouts.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importConfig = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (parsed.layouts) {
            updateConfig(parsed);
            setSelectedLayoutId(parsed.activeLayoutId || parsed.layouts[0]?.id || null);
            setSelectedWidgetId(null);
          }
        } catch {
          alert('Invalid layout file');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // ---- Grid overlay lines ----
  const GridLines = () => (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
      {Array.from({ length: GRID_COLS - 1 }, (_, i) => (
        <div key={`v${i}`} style={{ position: 'absolute', left: `${((i + 1) / GRID_COLS) * 100}%`, top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
      ))}
      {Array.from({ length: GRID_ROWS - 1 }, (_, i) => (
        <div key={`h${i}`} style={{ position: 'absolute', top: `${((i + 1) / GRID_ROWS) * 100}%`, left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />
      ))}
    </div>
  );

  // ---- Render ----
  const statusColor = saveStatus === 'saved' ? '#2e7d32' : saveStatus === 'saving' ? '#e6a817' : '#b71c1c';
  const statusLabel = saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving…' : 'Unsaved';

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a1628', color: '#e0e8f0', overflow: 'hidden', fontFamily: 'sans-serif' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', backgroundColor: '#0d1b2a', borderBottom: '1px solid #1e3a5f', flexShrink: 0, flexWrap: 'wrap' }}>
        <button onClick={() => { stopPreview(); navigate('/'); }} style={{ ...topBtn, backgroundColor: '#1a2a3a' }}>← Back</button>

        <select value={selectedLayoutId || ''} onChange={e => { setSelectedLayoutId(e.target.value); setSelectedWidgetId(null); }} style={{ ...selectStyle, maxWidth: '180px' }}>
          {layoutConfig.layouts.map((l, i) => (
            <option key={l.id} value={l.id}>{l.name} — /display/{i + 1}</option>
          ))}
        </select>

        {currentLayout && (
          <input
            type="text"
            value={currentLayout.name}
            onChange={e => renameLayout(e.target.value)}
            style={{ ...inputStyle, width: '140px' }}
            placeholder="Layout name"
          />
        )}

        <button onClick={addLayout} style={topBtn}>+ New</button>
        <button onClick={deleteLayout} disabled={layoutConfig.layouts.length <= 1} style={{ ...topBtn, backgroundColor: '#7f1d1d', opacity: layoutConfig.layouts.length <= 1 ? 0.4 : 1 }}>Delete</button>

        {currentLayout && (
          <>
            <select value={currentLayout.theme} onChange={e => setTheme(e.target.value)} style={selectStyle}>
              {Object.entries(THEMES).map(([key, th]) => (
                <option key={key} value={key}>{th.name}</option>
              ))}
            </select>
            <select value={currentLayout.aspectRatio || '16:9'} onChange={e => setAspectRatio(e.target.value)} style={selectStyle} title="Canvas aspect ratio">
              {ASPECT_RATIOS.map(ar => (
                <option key={ar.value} value={ar.value}>{ar.label}</option>
              ))}
            </select>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.72em', color: statusColor }}>● {statusLabel}</span>

          {previewMode ? (
            <>
              <button onClick={startPreview} style={{ ...topBtn, backgroundColor: '#1a3a1a' }}>↺ Restart</button>
              <button onClick={stopPreview} style={{ ...topBtn, backgroundColor: '#4a1a00' }}>Exit Preview</button>
            </>
          ) : (
            <button onClick={startPreview} style={{ ...topBtn, backgroundColor: '#1a3050' }}>Preview</button>
          )}

          <button onClick={exportConfig} style={topBtn}>Export</button>
          <button onClick={importConfig} style={topBtn}>Import</button>
          <button onClick={toggleActivate} style={{ ...topBtn, backgroundColor: isActive ? '#2e7d32' : '#1565c0', minWidth: '90px' }}>
            {isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button onClick={() => navigate('/display')} style={{ ...topBtn, backgroundColor: '#1a3a1a' }} title="View all displays">
            &#128250; Displays
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Widget palette — hidden in preview mode */}
        {!previewMode && (
          <div style={{ width: '150px', minWidth: '150px', backgroundColor: '#0d1b2a', borderRight: '1px solid #1e3a5f', padding: '10px', overflowY: 'auto', flexShrink: 0 }}>
            <div style={{ fontSize: '0.7em', color: '#607d8b', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>Add Widget</div>
            {Object.entries(WIDGET_TYPES).map(([type, def]) => (
              <button
                key={type}
                onClick={() => addWidget(type)}
                style={{ display: 'block', width: '100%', marginBottom: '6px', padding: '7px 10px', backgroundColor: '#1a2a3a', border: '1px solid #1e3a5f', borderRadius: '5px', color: '#a0b4c8', cursor: 'pointer', fontSize: '0.78em', textAlign: 'left' }}
              >
                + {def.label}
              </button>
            ))}
          </div>
        )}

        {/* Canvas / Preview */}
        {(() => {
          const arValue = currentLayout?.aspectRatio || '16:9';
          const arDef = ASPECT_RATIOS.find(a => a.value === arValue) || ASPECT_RATIOS[0];
          const [arW, arH] = arDef.css.split('/').map(n => parseFloat(n.trim()));
          const isPortrait = arH > arW;
          return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#060e1a' }}>
          <div style={{ aspectRatio: arDef.css, width: isPortrait ? 'auto' : '100%', height: isPortrait ? '100%' : 'auto', maxWidth: '100%', maxHeight: '100%', position: 'relative', backgroundColor: '#000', outline: '1px solid #1e3a5f', overflow: 'hidden' }}>
          {previewMode ? (
            /* Preview: render layout with mock data */
            <div style={{ position: 'absolute', inset: 0 }}>
              {currentLayout ? (
                <LayoutRenderer
                  layout={currentLayout}
                  lif={MOCK_LIF}
                  clock={mockClock}
                  customAcronyms={{}}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#607d8b' }}>
                  No layout selected
                </div>
              )}
              {/* Preview overlay: mock data label */}
              <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', color: '#607d8b', fontSize: '0.7em', padding: '4px 12px', borderRadius: '12px', pointerEvents: 'none', letterSpacing: '0.06em' }}>
                PREVIEW · 200m Men Final · Paris 2024
              </div>
            </div>
          ) : (
            /* Builder canvas */
            <div
              ref={canvasRef}
              style={{ position: 'absolute', inset: 0, cursor: dragging.current ? 'grabbing' : 'default' }}
              onClick={() => setSelectedWidgetId(null)}
            >
              <GridLines />

              {currentLayout?.widgets.map(widget => {
                const isSelected = widget.id === selectedWidgetId;
                return (
                  <div
                    key={widget.id}
                    style={{
                      ...widgetToStyle(widget),
                      border: isSelected ? '2px solid #1e88e5' : '1px solid #1e3a5f',
                      cursor: 'grab',
                      zIndex: isSelected ? 5 : 1,
                      boxSizing: 'border-box',
                    }}
                    onMouseDown={e => handleWidgetMouseDown(e, widget)}
                    onClick={e => { e.stopPropagation(); setSelectedWidgetId(widget.id); }}
                  >
                    {renderWidgetPreview(widget)}

                    {/* Widget label */}
                    <div style={{ position: 'absolute', top: 2, left: 4, fontSize: '9px', color: '#607d8b', pointerEvents: 'none', userSelect: 'none', letterSpacing: '0.05em' }}>
                      {WIDGET_TYPES[widget.type]?.label}
                    </div>

                    {/* Resize handle */}
                    <div
                      style={{ position: 'absolute', bottom: 0, right: 0, width: '14px', height: '14px', cursor: 'nwse-resize', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseDown={e => handleResizeMouseDown(e, widget)}
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 7L7 1M4 7L7 4M7 7L7 7" stroke="#607d8b" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
          );
        })()}

        {/* Properties panel — hidden in preview mode */}
        {!previewMode && (
          <PropertiesPanel
            widget={selectedWidget}
            onUpdate={updateWidget}
            onDelete={deleteWidget}
          />
        )}
      </div>
    </div>
  );
}

const topBtn = { border: 'none', borderRadius: '5px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.8em', color: '#fff', backgroundColor: '#1a3050' };
const selectStyle = { backgroundColor: '#0a1628', border: '1px solid #1e3a5f', borderRadius: '4px', color: '#e0e8f0', padding: '4px 8px', fontSize: '0.8em' };
