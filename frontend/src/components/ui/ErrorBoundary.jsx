import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  handleReset = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } catch {
      /* ignore */
    }
    this.setState({ error: null });
    window.location.href = '/';
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0a0e1a',
          color: '#f8fafc',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            FanConnect — erreur de chargement
          </h1>
          <p style={{ color: '#94a3b8', marginBottom: '1rem', lineHeight: 1.6 }}>
            L&apos;application n&apos;a pas pu démarrer. Cela arrive souvent si les données
            de session dans le navigateur sont corrompues.
          </p>
          <pre
            style={{
              textAlign: 'left',
              fontSize: '0.75rem',
              padding: '1rem',
              borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.06)',
              overflow: 'auto',
              marginBottom: '1.5rem',
            }}
          >
            {error?.message || String(error)}
          </pre>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: '#0f9f58',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Réinitialiser et recharger
          </button>
        </div>
      </div>
    );
  }
}