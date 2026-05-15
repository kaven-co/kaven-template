/**
 * LGPD Compliance Test Helpers
 *
 * Reusable functions for testing LGPD Art. 18 endpoints:
 *   GET  /api/users/:id/consents
 *   POST /api/users/:id/consents
 *   DEL  /api/users/:id/consents/:purpose
 *   GET  /api/users/:id/export
 *   POST /api/users/:id/gdpr-erase
 */

import { app } from '../../src/app';

export async function listConsents(userId: string, token: string) {
  const res = await app.inject({
    method: 'GET',
    url: `/api/users/${userId}/consents`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.statusCode, body: JSON.parse(res.payload) };
}

export async function grantConsent(
  userId: string,
  token: string,
  purpose: string,
  version: string,
) {
  const res = await app.inject({
    method: 'POST',
    url: `/api/users/${userId}/consents`,
    headers: { Authorization: `Bearer ${token}` },
    payload: { purpose, version },
  });
  return { status: res.statusCode, body: JSON.parse(res.payload) };
}

export async function revokeConsent(userId: string, token: string, purpose: string) {
  const res = await app.inject({
    method: 'DELETE',
    url: `/api/users/${userId}/consents/${purpose}`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.statusCode, body: JSON.parse(res.payload) };
}

export async function exportData(userId: string, token: string) {
  const res = await app.inject({
    method: 'GET',
    url: `/api/users/${userId}/export`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.statusCode, body: JSON.parse(res.payload) };
}

export async function requestErasure(userId: string, token: string) {
  const res = await app.inject({
    method: 'POST',
    url: `/api/users/${userId}/gdpr-erase`,
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.statusCode, body: JSON.parse(res.payload) };
}
