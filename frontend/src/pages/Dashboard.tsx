import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSession, logout } from '../services/ssoService';
import type { SSOSessionResponse } from '../types/sso';

export default function Dashboard() {
  const { locationId } = useParams();
  const [session, setSession] = useState<SSOSessionResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSession()
      .then((res) => setSession(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
        <h2>Session Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!session) {
    return <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      {locationId && (
        <p style={{ color: '#6b7280' }}>Location: {locationId}</p>
      )}
      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '1.5rem', marginTop: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>Session Info</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {Object.entries(session).map(([key, value]) =>
              value != null ? (
                <tr key={key} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '0.5rem 0', fontWeight: 600 }}>{key}</td>
                  <td style={{ padding: '0.5rem 0' }}>{String(value)}</td>
                </tr>
              ) : null
            )}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => { logout(); window.location.href = '/'; }}
        style={{
          marginTop: '1.5rem',
          padding: '0.5rem 1rem',
          background: '#dc2626',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </div>
  );
}
