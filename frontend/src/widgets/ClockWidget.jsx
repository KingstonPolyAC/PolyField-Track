import React, { useRef, useState, useEffect } from 'react';

export default function ClockWidget({ widget, clock, isBuilder }) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ w: width, h: height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (isBuilder) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#4a9', gap: '4px' }}>
        <div style={{ fontSize: '0.85em', fontWeight: 'bold', letterSpacing: '0.05em' }}>RUNNING CLOCK</div>
        <div style={{ fontSize: '1.4em', fontFamily: 'monospace', color: '#1e88e5' }}>0:00.00</div>
      </div>
    );
  }

  const state = clock?.state || 'idle';
  const isRunning = state === 'running';
  const isStopped = state === 'stopped';
  const isArmed = state === 'armed';
  const isTimeOfDay = state === 'timeofday';

  // Time of day: show the TOD string FinishLynx sent, styled differently
  if (isTimeOfDay && clock?.time) {
    const todStr = clock.time;
    const charCount = todStr.length || 5;
    const hBased = containerSize.h * 0.55;
    const wBased = containerSize.w / (charCount * 0.62);
    const fontSize = Math.min(hBased, wBased, 200);
    return (
      <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', overflow: 'hidden' }}>
        <div style={{ fontSize: Math.min(containerSize.h * 0.1, 28) + 'px', color: '#607d8b', letterSpacing: '0.12em', marginBottom: '4px' }}>
          TIME OF DAY
        </div>
        <div style={{ fontSize: fontSize + 'px', fontWeight: 'bold', fontFamily: 'monospace', color: '#e0e0e0', lineHeight: 1, letterSpacing: '0.02em' }}>
          {todStr}
        </div>
      </div>
    );
  }

  const timeStr = clock?.time || (isArmed ? 'READY' : '—');
  const charCount = timeStr.length || 4;
  const hBased = containerSize.h * 0.6;
  const wBased = containerSize.w / (charCount * 0.6);
  const fontSize = Math.min(hBased, wBased, 200);
  const color = isRunning ? '#1e88e5' : isStopped ? '#e0e0e0' : '#607d8b';
  const eventName = clock?.eventName || '';

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', overflow: 'hidden' }}>
      {eventName && (
        <div style={{ fontSize: Math.min(containerSize.h * 0.1, 32) + 'px', color: '#a0b4c8', letterSpacing: '0.05em', textAlign: 'center', padding: '0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
          {eventName}
        </div>
      )}
      <div style={{ fontSize: fontSize + 'px', fontWeight: 'bold', fontFamily: 'monospace', color, lineHeight: 1, letterSpacing: '0.02em' }}>
        {timeStr}
      </div>
      {(isRunning || isStopped) && (
        <div style={{ fontSize: Math.min(containerSize.h * 0.08, 18) + 'px', color: '#f59e0b', letterSpacing: '0.15em', marginTop: '4px' }}>
          UNOFFICIAL TIME
        </div>
      )}
    </div>
  );
}
