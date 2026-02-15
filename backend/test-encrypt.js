/**
 * Test utility to generate encrypted SSO payloads for local development.
 *
 * Usage:
 *   npm install crypto-js
 *   node test-encrypt.js
 *
 * Copy the output and POST it to /sso/decrypt to verify the pipeline.
 */

const CryptoJS = require('crypto-js');

const SHARED_SECRET = process.env.GHL_SHARED_SECRET || 'your-shared-secret-from-ghl-advanced-settings';

const testPayload = {
  userId: 'test-user-123',
  companyId: 'test-company-456',
  role: 'admin',
  type: 'agency',
  userName: 'Test User',
  email: 'test@example.com',
  isAgencyOwner: true,
  versionId: 'test-version-789',
  appStatus: 'live',
  whitelabelDetails: {
    domain: 'example.com',
    logoUrl: 'https://example.com/logo.png',
  },
};

const encrypted = CryptoJS.AES.encrypt(
  JSON.stringify(testPayload),
  SHARED_SECRET
).toString();

console.log('Encrypted payload:');
console.log(encrypted);
console.log();
console.log('Test with curl:');
console.log(
  `curl -X POST http://localhost:8000/sso/decrypt -H "Content-Type: application/json" -d '{"key": "${encrypted}"}'`
);
