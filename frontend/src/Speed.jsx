import React, { useState, useEffect, useRef, useCallback } from 'react';
import polyfieldLogo from './polyfield-logo.png';

const WORLD_RECORDS = {
  60:    { men: { time: 6.34,    athlete: 'Christian Coleman' },       women: { time: 6.92,    athlete: 'Irina Privalova' } },
  100:   { men: { time: 9.58,    athlete: 'Usain Bolt' },             women: { time: 10.49,   athlete: 'Florence Griffith-Joyner' } },
  200:   { men: { time: 19.19,   athlete: 'Usain Bolt' },             women: { time: 21.34,   athlete: 'Florence Griffith-Joyner' } },
  400:   { men: { time: 43.03,   athlete: 'Wayde van Niekerk' },      women: { time: 47.60,   athlete: 'Marita Koch' } },
  800:   { men: { time: 100.91,  athlete: 'David Rudisha' },          women: { time: 113.28,  athlete: 'Jarmila Kratochvílová' } },
  1500:  { men: { time: 206.00,  athlete: 'Hicham El Guerrouj' },     women: { time: 228.68,  athlete: 'Faith Kipyegon' } },
  3000:  { men: { time: 437.55,  athlete: 'Jakob Ingebrigtsen' },     women: { time: 486.11,  athlete: 'Wang Junxia' } },
  5000:  { men: { time: 755.36,  athlete: 'Joshua Cheptegei' },       women: { time: 831.02,  athlete: 'Beatrice Chebet' } },
  10000: { men: { time: 1577.53, athlete: 'Joshua Cheptegei' },       women: { time: 1750.69, athlete: 'Beatrice Chebet' } },
};

const UNIT_CONVERSIONS = {
  mph:  { from: (ms) => ms * 2.23694, label: 'mph' },
  ms:   { from: (ms) => ms,           label: 'm/s' },
  kmh:  { from: (ms) => ms * 3.6,     label: 'km/h' },
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
  if (t === 'DQ' || t === 'DNF' || t === 'DNS' || t === '' || t === '-') return 0;
  const hmsMatch = t.match(/^(\d+):(\d+):(\d+(?:\.\d+)?)$/);
  if (hmsMatch) return parseInt(hmsMatch[1], 10) * 3600 + parseInt(hmsMatch[2], 10) * 60 + parseFloat(hmsMatch[3]);
  const msMatch = t.match(/^(\d+):(\d+(?:\.\d+)?)$/);
  if (msMatch) return parseInt(msMatch[1], 10) * 60 + parseFloat(msMatch[2]);
  const sMatch = t.match(/^(\d+(?:\.\d+)?)$/);
  if (sMatch) return parseFloat(sMatch[1]);
  return 0;
}

function convertSpeed(ms, unit) {
  return UNIT_CONVERSIONS[unit].from(ms);
}

const SegmentedControl = ({ options, selected, onChange }) => (
  <div style={{ border: '1px solid #2a4a6b', borderRadius: 6, overflow: 'hidden', display: 'flex' }}>
    {options.map((opt, i) => (
      <div
        key={opt.value}
        onClick={() => onChange(opt.value)}
        style={{
          flex: 1,
          textAlign: 'center',
          padding: '6px 12px',
          fontSize: '0.8rem',
          cursor: 'pointer',
          backgroundColor: selected === opt.value ? '#2e7d32' : 'transparent',
          color: selected === opt.value ? '#fff' : '#a0b4c8',
          fontWeight: selected === opt.value ? 'bold' : 'normal',
          ...(i > 0 ? { borderLeft: '1px solid #2a4a6b' } : {}),
        }}
      >
        {opt.label}
      </div>
    ))}
  </div>
);

function drawSpeedometer(canvas, athleteName, speedMs, unit, maxSpeed, wrMen, wrWomen) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const gaugeH = h - 70; // reserve 70px at bottom for name/speed/WR text
  const cy = gaugeH * 0.72;
  const radius = Math.min(w * 0.42, gaugeH * 0.55);
  const unitLabel = UNIT_CONVERSIONS[unit].label;
  const speed = convertSpeed(speedMs, unit);

  // Determine scale: next multiple of 5 strictly above the fastest speed
  const rawMax = convertSpeed(maxSpeed, unit);
  const scaleMax = (rawMax % 5 === 0 ? rawMax + 5 : Math.ceil(rawMax / 5) * 5) || 30;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;

  function speedToAngle(s) {
    const ratio = Math.min(s / scaleMax, 1);
    return startAngle + ratio * (endAngle - startAngle);
  }

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.lineWidth = radius * 0.15;
  ctx.strokeStyle = '#1a2d44';
  ctx.stroke();

  // Coloured arc fill (green gradient based on speed)
  const speedAngle = speedToAngle(speed);
  const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
  grad.addColorStop(0, '#1b5e20');
  grad.addColorStop(0.5, '#2e7d32');
  grad.addColorStop(1, '#4caf50');
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, speedAngle);
  ctx.lineWidth = radius * 0.15;
  ctx.strokeStyle = grad;
  ctx.stroke();

  // Tick marks
  const majorEvery = scaleMax <= 20 ? 5 : (scaleMax <= 50 ? 5 : 10);
  for (let s = 0; s <= scaleMax; s += 1) {
    const angle = speedToAngle(s);
    const isMajor = s % majorEvery === 0;
    const innerR = radius - radius * 0.075;
    const outerR = radius + radius * 0.075;
    const tickInner = isMajor ? innerR - radius * 0.06 : innerR;

    ctx.beginPath();
    ctx.moveTo(cx + tickInner * Math.cos(angle), cy + tickInner * Math.sin(angle));
    ctx.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
    ctx.strokeStyle = isMajor ? '#e0e0e0' : '#556677';
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.stroke();

    if (isMajor) {
      const labelR = innerR - radius * 0.14;
      ctx.fillStyle = '#a0b4c8';
      ctx.font = `${Math.max(10, radius * 0.12)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.toString(), cx + labelR * Math.cos(angle), cy + labelR * Math.sin(angle));
    }
  }

  // Draw needle helper
  function drawNeedle(angle, color, lineWidth, length) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + length * Math.cos(angle), cy + length * Math.sin(angle));
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // WR needles (behind athlete needle)
  if (wrMen !== null) {
    const wrMenSpeed = convertSpeed(wrMen, unit);
    drawNeedle(speedToAngle(wrMenSpeed), '#1565c0', 2, radius * 0.85);
  }
  if (wrWomen !== null) {
    const wrWomenSpeed = convertSpeed(wrWomen, unit);
    drawNeedle(speedToAngle(wrWomenSpeed), '#e91e63', 2, radius * 0.85);
  }

  // Athlete needle (bold, green)
  drawNeedle(speedToAngle(speed), '#4caf50', 4, radius * 0.9);

  // Centre dot
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = '#4caf50';
  ctx.fill();

  // Athlete name (wrap to max 2 lines)
  const nameFontSize = Math.max(11, radius * 0.14);
  ctx.fillStyle = '#e0e0e0';
  ctx.font = `bold ${nameFontSize}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const maxTextWidth = w * 0.85;
  let nameLines = [];
  if (ctx.measureText(athleteName).width <= maxTextWidth) {
    nameLines = [athleteName];
  } else {
    const words = athleteName.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxTextWidth && line) {
        nameLines.push(line);
        line = word;
        if (nameLines.length === 2) break;
      } else {
        line = test;
      }
    }
    if (line && nameLines.length < 2) nameLines.push(line);
  }
  const nameLineHeight = nameFontSize * 1.2;
  const nameStartY = cy + radius * 0.15;
  nameLines.forEach((ln, i) => ctx.fillText(ln, cx, nameStartY + i * nameLineHeight));

  // Speed value
  const speedY = nameStartY + nameLines.length * nameLineHeight + 2;
  ctx.fillStyle = '#4caf50';
  ctx.font = `bold ${Math.max(13, radius * 0.18)}px sans-serif`;
  ctx.fillText(`${speed.toFixed(2)} ${unitLabel}`, cx, speedY);

  // %WR line: women% (pink) | "% of WR" (green) | men% (blue)
  if (wrMen !== null || wrWomen !== null) {
    const fontSize = Math.max(13, radius * 0.18);
    ctx.textBaseline = 'top';
    const speedFontSize = Math.max(13, radius * 0.18);
    const y = speedY + speedFontSize * 1.3;

    // Centre label
    ctx.fillStyle = '#ffffff';
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('of WR', cx, y);

    const labelHalfWidth = ctx.measureText('of WR').width / 2;

    if (wrWomen !== null) {
      const pct = ((speedMs / wrWomen) * 100).toFixed(0);
      ctx.fillStyle = '#e91e63';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(pct + '%', cx - labelHalfWidth - 6, y);
    }
    if (wrMen !== null) {
      const pct = ((speedMs / wrMen) * 100).toFixed(0);
      ctx.fillStyle = '#1565c0';
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(pct + '%', cx + labelHalfWidth + 6, y);
    }
  }
}

function Speed() {
  const [lifDataArray, setLifDataArray] = useState([]);
  const [selectedRace, setSelectedRace] = useState('');
  const [unit, setUnit] = useState('mph');
  const canvasRefs = useRef({});

  useEffect(() => {
    async function fetchData() {
      try {
        const hostname = window.location.hostname;
        const isDesktop = hostname === '' || hostname === 'wails.localhost' || window.location.protocol === 'wails:';
        const baseUrl = isDesktop ? 'http://127.0.0.1:3000' : '';
        const response = await fetch(`${baseUrl}/all-lif`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setLifDataArray(data || []);
      } catch (err) {
        console.error('Error fetching LIF data:', err);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Build race data from selected LIF
  const raceData = React.useMemo(() => {
    if (!selectedRace || !lifDataArray.length) return null;
    const lif = lifDataArray.find(l => l.eventName === selectedRace);
    if (!lif) return null;

    const distance = parseDistance(lif.eventName);
    if (distance === 0) return null;

    const wr = WORLD_RECORDS[distance] || null;
    const wrMenMs = wr ? distance / wr.men.time : null;
    const wrWomenMs = wr ? distance / wr.women.time : null;

    const athletes = (lif.competitors || [])
      .filter(c => {
        const t = (c.time || '').trim().toUpperCase();
        return t && t !== 'DQ' && t !== 'DNF' && t !== 'DNS' && t !== '-' && t !== '';
      })
      .map(c => {
        const seconds = parseTime(c.time);
        if (seconds <= 0) return null;
        const speedMs = distance / seconds;
        const fullName = `${c.firstName || ''} ${(c.lastName || '').toUpperCase()}`.trim();
        const name = fullName || c.club || (c.bib ? `Bib ${c.bib}` : '');
        return { name, speedMs, time: c.time };
      })
      .filter(Boolean);

    // Max speed for gauge scale: next 5-increment (in display unit) above fastest
    let fastest = Math.max(...athletes.map(a => a.speedMs), 0);
    if (wrMenMs !== null) fastest = Math.max(fastest, wrMenMs);
    if (wrWomenMs !== null) fastest = Math.max(fastest, wrWomenMs);
    const maxSpeed = fastest;

    return { athletes, maxSpeed, wrMenMs, wrWomenMs, wr, distance };
  }, [selectedRace, lifDataArray]);

  // Draw all speedometers
  const drawAll = useCallback(() => {
    if (!raceData) return;
    raceData.athletes.forEach((a, i) => {
      const canvas = canvasRefs.current[i];
      if (canvas) {
        drawSpeedometer(canvas, a.name, a.speedMs, unit, raceData.maxSpeed, raceData.wrMenMs, raceData.wrWomenMs);
      }
    });
  }, [raceData, unit]);

  useEffect(() => {
    drawAll();
    window.addEventListener('resize', drawAll);
    return () => window.removeEventListener('resize', drawAll);
  }, [drawAll]);

  // Auto-select first race
  useEffect(() => {
    if (lifDataArray.length > 0 && !selectedRace) {
      setSelectedRace(lifDataArray[0].eventName);
    }
  }, [lifDataArray, selectedRace]);

  const wrInfo = raceData?.wr;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #001a33 0%, #003366 100%)',
      color: '#e0e0e0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.3)',
        borderBottom: '1px solid #2a4a6b',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <img src={polyfieldLogo} alt="PolyField" style={{ height: 32 }} />
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#ffffff', whiteSpace: 'nowrap' }}>
            PolyField — Speed
          </h1>
          <select
            value={selectedRace}
            onChange={e => setSelectedRace(e.target.value)}
            style={{
              padding: '8px 32px 8px 14px',
              borderRadius: 8,
              border: '1px solid #2a4a6b',
              background: '#0a1628',
              color: '#e0e0e0',
              fontSize: '0.9rem',
              minWidth: 220,
              appearance: 'none',
              WebkitAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23a0b4c8' viewBox='0 0 16 16'%3E%3Cpath d='M1.5 5.5l6.5 6.5 6.5-6.5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
              cursor: 'pointer',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          >
            <option value="">Select a race...</option>
            {lifDataArray.map((lif, i) => (
              <option key={i} value={lif.eventName}>{lif.eventName}</option>
            ))}
          </select>
        </div>
        <SegmentedControl
          options={[
            { value: 'mph', label: 'mph' },
            { value: 'ms', label: 'm/s' },
            { value: 'kmh', label: 'km/h' },
          ]}
          selected={unit}
          onChange={setUnit}
        />
      </div>

      {/* Speedometer grid */}
      {raceData && raceData.athletes.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          padding: 20,
        }}>
          {raceData.athletes.map((a, i) => (
            <div key={i} style={{
              background: '#0a1628',
              border: '1px solid #2a4a6b',
              borderRadius: 10,
              padding: 12,
            }}>
              <canvas
                ref={el => { canvasRefs.current[i] = el; }}
                style={{ width: '100%', height: 260 }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: 60, color: '#556677', fontSize: '1.1rem' }}>
          {selectedRace ? 'No valid results for this race.' : 'Select a race to view speeds.'}
        </div>
      )}

      {/* Legend bar */}
      {wrInfo && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 30,
          padding: '12px 20px',
          background: 'rgba(0,0,0,0.3)',
          borderTop: '1px solid #2a4a6b',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 24, height: 3, background: '#4caf50', borderRadius: 2 }} />
            Athlete Speed
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 24, height: 3, background: '#1565c0', borderRadius: 2 }} />
            Men's WR — {wrInfo.men.athlete}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ display: 'inline-block', width: 24, height: 3, background: '#e91e63', borderRadius: 2 }} />
            Women's WR — {wrInfo.women.athlete}
          </span>
        </div>
      )}
    </div>
  );
}

export default Speed;
