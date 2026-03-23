import React from 'react';

// In display mode this widget is invisible — its position/size is read by the
// renderer to know where to clip screensaver and text overlays.
// In builder mode it shows as an amber outline so the user can position it.
export default function AreaMaskWidget({ widget, isBuilder }) {
  if (!isBuilder) {
    return <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }} />;
  }

  return (
    <div style={{ width: '100%', height: '100%', border: '2px dashed #f59e0b', backgroundColor: 'rgba(245,158,11,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}>
      <div style={{ color: '#f59e0b', fontSize: '0.75em', fontWeight: 'bold', letterSpacing: '0.08em', textAlign: 'center' }}>
        OVERLAY AREA<br />
        <span style={{ fontSize: '0.8em', fontWeight: 'normal', opacity: 0.7 }}>Screensaver &amp; text appear here</span>
      </div>
    </div>
  );
}
