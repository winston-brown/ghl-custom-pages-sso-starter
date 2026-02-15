import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestSSOKey, validateSSOKey, fetchSession } from '../services/ssoService';

export default function SSOPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Initializing SSO...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setStatus('Requesting SSO key from GHL...');
        const ssoKey = await requestSSOKey();

        setStatus('Validating credentials...');
        await validateSSOKey(ssoKey);

        setStatus('Loading session...');
        const session = await fetchSession();

        if (session.data.activeLocation) {
          navigate(`/location/${session.data.activeLocation}`, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    init();
  }, [navigate]);

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
        <h2>Authentication Failed</h2>
        <p style={{ color: '#dc2626' }}>{error}</p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Make sure this page is loaded inside a GHL Custom Page iframe.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>&#8987;</div>
      <p>{status}</p>
    </div>
  );
}
