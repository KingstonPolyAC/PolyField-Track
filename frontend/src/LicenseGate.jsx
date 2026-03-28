import React, { useState } from 'react';
import { ActivateLicense } from '../wailsjs/go/main/App';
import polyfieldLogo from './polyfield-logo.png';

export default function LicenseGate({ onActivated }) {
  const [key, setKey] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'activating' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleActivate = async () => {
    if (!key.trim()) return;
    setStatus('activating');
    setErrorMsg('');
    try {
      const result = await ActivateLicense(key.trim());
      if (result.activated) {
        onActivated(result);
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'Activation failed');
      }
    } catch (e) {
      setStatus('error');
      setErrorMsg('Unexpected error — please try again');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleActivate();
  };

  return (
    <div style={{
      width: '100vw', height: '100vh',
      backgroundColor: '#060f1e',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        width: 420,
        backgroundColor: '#0d1f35',
        border: '1px solid #1a3a5c',
        borderRadius: 12,
        padding: '40px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
      }}>
        <img src={polyfieldLogo} alt="PolyField" style={{ height: 48, marginBottom: 4 }} />
        <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: '#e0eaf4', letterSpacing: '0.02em' }}>
          PolyField Track
        </div>
        <div style={{ fontSize: '0.85em', color: '#7a9ab8', textAlign: 'center', lineHeight: 1.5 }}>
          Enter your license key to activate.<br />
          Get a free key at{' '}
          <span style={{ color: '#4a9ade' }}>polyfield.co.uk</span>
        </div>

        <input
          type="text"
          value={key}
          onChange={e => { setKey(e.target.value); setStatus('idle'); setErrorMsg(''); }}
          onKeyDown={handleKeyDown}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '1em',
            fontFamily: 'monospace',
            letterSpacing: '0.06em',
            backgroundColor: '#060f1e',
            border: status === 'error' ? '1px solid #e53935' : '1px solid #1a3a5c',
            borderRadius: 6,
            color: '#e0eaf4',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          autoFocus
        />

        {status === 'error' && (
          <div style={{ color: '#ef5350', fontSize: '0.82em', textAlign: 'center', marginTop: -10 }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleActivate}
          disabled={status === 'activating' || !key.trim()}
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '0.95em',
            fontWeight: 'bold',
            backgroundColor: status === 'activating' ? '#1a3a5c' : '#1565c0',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: status === 'activating' || !key.trim() ? 'default' : 'pointer',
            opacity: !key.trim() ? 0.5 : 1,
            transition: 'background-color 0.15s',
          }}
        >
          {status === 'activating' ? 'Activating…' : 'Activate'}
        </button>

        <div style={{ fontSize: '0.72em', color: '#4a6a88', textAlign: 'center', lineHeight: 1.5 }}>
          PolyField Track is free for athletics clubs and nonprofits.<br />
          Donations to Kingston &amp; Polytechnic AC are appreciated.
        </div>
      </div>
    </div>
  );
}
