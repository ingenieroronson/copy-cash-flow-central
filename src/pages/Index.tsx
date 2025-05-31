import React from 'react';

const Index = () => (
  <div
    style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb'
    }}
  >
    <img
      src="/logo192.png"
      alt="App Logo"
      style={{ width: 100, marginBottom: 24 }}
    />
    <h1 style={{ fontSize: 28, marginBottom: 12, color: '#222' }}>
      ¡Bienvenido a Copias App!
    </h1>
    <button
      style={{
        fontSize: 20,
        background: '#2E90FA',
        color: 'white',
        padding: '16px 32px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        marginBottom: 32,
        boxShadow: '0 2px 8px rgba(46, 144, 250, 0.13)'
      }}
      onClick={() => window.location.href = '/settings'}
    >
      Abrir App
    </button>
    <div style={{ marginTop: 20, color: '#666', fontSize: 16, maxWidth: 320, textAlign: 'center' }}>
      Si ves esta pantalla, tu app funciona correctamente.<br />
      Pulsa <b>Abrir App</b> para acceder.<br />
      Si tienes problemas para iniciar sesión, revisa tu conexión o contáctanos.
    </div>
  </div>
);

export default Index;
