import React from 'react';

export default function ProfessionalToast({ visible, title, message, type = 'info', onClose }) {
  if (!visible) return null;

  const bgColor = type === 'success' ? '#1f8a70' : type === 'error' ? '#c62828' : '#374151';
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      minWidth: 320,
      maxWidth: 'clamp(280px, 30vw, 420px)',
      boxShadow: '0 6px 30px rgba(2,6,23,0.4)',
      borderRadius: 12,
      overflow: 'hidden',
      fontFamily: 'Inter, system-ui, -apple-system, Roboto, "Helvetica Neue", Arial'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        background: bgColor,
        color: 'white'
      }}>
        <div style={{ fontSize: 20 }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
          <div style={{ opacity: 0.95, marginTop: 4 }}>{message}</div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.12)',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          padding: '8px 12px',
          cursor: 'pointer'
        }}>OK</button>
      </div>
    </div>
  );
}
