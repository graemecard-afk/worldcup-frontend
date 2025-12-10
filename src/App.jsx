import React, { useEffect, useState } from 'react';

const API_BASE = 'https://worldcup-backend-s7ej.onrender.com';

export default function App() {
  const [status, setStatus] = useState('Checking backend...');
  const [error, setError] = useState('');

  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch(API_BASE + '/');
        const text = await res.text();
        setStatus(text);
      } catch (err) {
        console.error(err);
        setError('Could not reach backend');
      }
    }
    checkBackend();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0b1020',
      color: '#f5f5f5'
    }}>
      <div style={{
        background: '#151a30',
        padding: '24px 32px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ marginBottom: '12px', fontSize: '1.6rem' }}>
          World Cup Predictor
        </h1>
        <p style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: '16px' }}>
          Frontend ↔ Backend connectivity check
        </p>
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          background: '#1f2440',
          fontFamily: 'monospace',
          fontSize: '0.9rem',
          wordBreak: 'break-word'
        }}>
          {error ? (
            <span style={{ color: '#ff6b6b' }}>{error}</span>
          ) : (
            <span>{status}</span>
          )}
        </div>
        <p style={{ marginTop: '16px', fontSize: '0.8rem', opacity: 0.8 }}>
          Backend URL: <br />
          <span style={{ fontFamily: 'monospace' }}>{API_BASE}</span>
        </p>
      </div>
    </div>
  );
}
