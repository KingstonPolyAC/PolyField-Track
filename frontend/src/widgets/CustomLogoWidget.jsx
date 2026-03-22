import React from 'react';

export default function CustomLogoWidget({ widget, isBuilder }) {
  const config = widget.config || {};
  const imageBase64 = config.imageBase64 || '';
  const fit = config.fit || 'contain';

  if (isBuilder) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7ab', flexDirection: 'column', gap: '6px' }}>
        {imageBase64 ? (
          <img src={imageBase64} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: fit }} alt="logo" />
        ) : (
          <>
            <div style={{ fontSize: '1.8em' }}>🖼</div>
            <div style={{ fontSize: '0.7em' }}>Logo / Image</div>
          </>
        )}
      </div>
    );
  }

  if (!imageBase64) return <div style={{ width: '100%', height: '100%' }} />;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={imageBase64} style={{ width: '100%', height: '100%', objectFit: fit }} alt="" />
    </div>
  );
}
