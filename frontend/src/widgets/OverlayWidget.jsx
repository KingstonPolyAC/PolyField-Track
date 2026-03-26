import React, { useRef, useState, useEffect } from 'react';

const BUILDER_META = {
  text_overlay:       { label: 'TEXT OVERLAY',  color: '#4caf50' },
  screensaver_overlay:{ label: 'SCREENSAVER',   color: '#9c27b0' },
  lineview_overlay:   { label: 'LINE VIEW',     color: '#ff9800' },
};

export default function OverlayWidget({ widget, isBuilder, displayMode, activeText, imageBase64 }) {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState(32);
  const [frozenImage, setFrozenImage] = useState('');

  useEffect(() => {
    if (widget.type !== 'text_overlay' || !containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setFontSize(Math.min(height * 0.18, width * 0.08, 120));
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [widget.type]);

  // Freeze the last lineview image so the overlay persists through desktop rotation cycles.
  // Clears only when imageBase64 is empty (desktop disabled line view / new LIF saved).
  useEffect(() => {
    if (widget.type !== 'lineview_overlay') return;
    if (displayMode === 'lineview' && imageBase64) {
      setFrozenImage(imageBase64);
    } else if (!imageBase64) {
      setFrozenImage('');
    }
  }, [displayMode, imageBase64, widget.type]);

  if (isBuilder) {
    const { label, color } = BUILDER_META[widget.type] || { label: widget.type, color: '#607d8b' };
    return (
      <div style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', border: `2px dashed ${color}`,
        backgroundColor: `${color}18`, boxSizing: 'border-box',
      }}>
        <span style={{ color, fontSize: '0.75em', fontWeight: 'bold', letterSpacing: '0.08em' }}>
          {label}
        </span>
      </div>
    );
  }

  if (widget.type === 'text_overlay') {
    if (displayMode !== 'text' || !activeText) return null;
    return (
      <div ref={containerRef} style={{
        width: '100%', height: '100%', backgroundColor: '#000', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '4%', boxSizing: 'border-box',
        whiteSpace: 'pre-line', overflow: 'hidden', fontSize: fontSize + 'px',
      }}>
        {activeText}
      </div>
    );
  }

  if (widget.type === 'screensaver_overlay') {
    if (displayMode !== 'screensaver' || !imageBase64) return null;
    return (
      <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
        <img src={imageBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    );
  }

  if (widget.type === 'lineview_overlay') {
    const showRotation = widget.config?.showRotation === true;
    if (showRotation) {
      // Follow desktop rotation — only visible when server is actively in lineview mode
      if (displayMode !== 'lineview' || !imageBase64) return null;
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
          <img src={imageBase64} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      );
    } else {
      // Maintain image — persist through rotation until desktop clears line view
      if (!frozenImage) return null;
      return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#000' }}>
          <img src={frozenImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
      );
    }
  }

  return null;
}
