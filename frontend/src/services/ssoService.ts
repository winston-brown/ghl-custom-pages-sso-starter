import type { SSOLoginResponse, SSOSessionResponse } from '../types/sso';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Request encrypted SSO key from GHL parent window via postMessage.
 *
 * The GHL CRM parent window responds with REQUEST_USER_DATA_RESPONSE
 * containing a base64-encoded AES-encrypted payload.
 */
export async function requestSSOKey(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    window.parent.postMessage({ message: 'REQUEST_USER_DATA' }, '*');

    const timeout = setTimeout(() => {
      window.removeEventListener('message', listener);
      reject(new Error('SSO response timed out after 10 seconds'));
    }, 10_000);

    const listener = (event: MessageEvent) => {
      // TODO: Validate event.origin in production
      // if (event.origin !== 'https://app.gohighlevel.com') return;

      if (event.data.message === 'REQUEST_USER_DATA_RESPONSE') {
        clearTimeout(timeout);
        window.removeEventListener('message', listener);
        resolve(event.data.payload);
      }
    };

    window.addEventListener('message', listener);
  });
}

/**
 * Send encrypted SSO key to backend for decryption and JWT creation.
 * Stores the returned JWT in sessionStorage.
 */
export async function validateSSOKey(ssoKey: string): Promise<void> {
  const response = await fetch(`${API_BASE}/sso/decrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: ssoKey }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'SSO validation failed');
  }

  const data: SSOLoginResponse = await response.json();
  sessionStorage.setItem('access_token', data.access_token);
}

/**
 * Fetch current session info using stored JWT.
 */
export async function fetchSession(): Promise<SSOSessionResponse> {
  const token = sessionStorage.getItem('access_token');
  if (!token) throw new Error('No access token found');

  const response = await fetch(`${API_BASE}/sso/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    sessionStorage.removeItem('access_token');
    throw new Error('Session expired');
  }

  if (!response.ok) {
    throw new Error(`Session fetch failed: ${response.status}`);
  }

  return response.json();
}

export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('access_token');
}

export function logout(): void {
  sessionStorage.removeItem('access_token');
}
