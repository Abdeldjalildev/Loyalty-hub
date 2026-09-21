import { firebaseApiKey } from './config';

const AUTH_BASE = 'https://identitytoolkit.googleapis.com/v1';
const REFRESH_BASE = 'https://securetoken.googleapis.com/v1/token';
const STORAGE_KEY = 'loyaltyhub.auth.session';
const CUSTOMER_STORAGE_KEY = 'loyaltyhub.customer.auth.session';

export interface AuthSession {
  uid: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  displayName: string;
}
interface AuthResponse {
  localId: string;
  email?: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
  displayName?: string;
}
async function request<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.error?.message || 'AUTH_REQUEST_FAILED');
  return body as T;
}
function toSession(response: AuthResponse, displayName = ''): AuthSession {
  return {
    uid: response.localId,
    email: response.email || '',
    idToken: response.idToken,
    refreshToken: response.refreshToken,
    expiresAt: Date.now() + Number(response.expiresIn) * 1000,
    displayName: response.displayName || displayName,
  };
}
function save(session: AuthSession, storageKey = STORAGE_KEY) {
  localStorage.setItem(storageKey, JSON.stringify(session));
}
export function loadSession(storageKey = STORAGE_KEY): AuthSession | null {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthSession; }
  catch { localStorage.removeItem(storageKey); return null; }
}
export function clearSession(storageKey = STORAGE_KEY) { localStorage.removeItem(storageKey); }

export async function signUp(email: string, password: string, displayName: string) {
  if (!firebaseApiKey) throw new Error('FIREBASE_API_KEY_MISSING');
  const response = await request<AuthResponse>(
    `${AUTH_BASE}/accounts:signUp?key=${encodeURIComponent(firebaseApiKey)}`,
    { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }) },
  );
  const profile = await request<AuthResponse>(
    `${AUTH_BASE}/accounts:update?key=${encodeURIComponent(firebaseApiKey)}`,
    { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: response.idToken, displayName, returnSecureToken: true }) },
  );
  const session = toSession(profile, displayName);
  save(session);
  return session;
}
export async function signIn(email: string, password: string) {
  if (!firebaseApiKey) throw new Error('FIREBASE_API_KEY_MISSING');
  const response = await request<AuthResponse>(
    `${AUTH_BASE}/accounts:signInWithPassword?key=${encodeURIComponent(firebaseApiKey)}`,
    { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }) },
  );
  const session = toSession(response, response.displayName || '');
  save(session);
  return session;
}
export async function refreshSession(session: AuthSession): Promise<AuthSession> {
  if (!firebaseApiKey) throw new Error('FIREBASE_API_KEY_MISSING');
  const form = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: session.refreshToken });
  const response = await request<{ id_token: string; refresh_token: string; user_id: string; expires_in: string }>(
    `${REFRESH_BASE}?key=${encodeURIComponent(firebaseApiKey)}`,
    { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: form },
  );
  const next = { ...session, uid: response.user_id, idToken: response.id_token,
    refreshToken: response.refresh_token, expiresAt: Date.now() + Number(response.expires_in) * 1000 };
  save(next);
  return next;
}

export async function signUpCustomer(email: string, password: string, displayName: string) {
  if (!firebaseApiKey) throw new Error('FIREBASE_API_KEY_MISSING');
  const response = await request<AuthResponse>(
    `${AUTH_BASE}/accounts:signUp?key=${encodeURIComponent(firebaseApiKey)}`,
    { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }) },
  );
  const profile = await request<AuthResponse>(
    `${AUTH_BASE}/accounts:update?key=${encodeURIComponent(firebaseApiKey)}`,
    { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: response.idToken, displayName, returnSecureToken: true }) },
  );
  const session = toSession(profile, displayName);
  save(session, CUSTOMER_STORAGE_KEY);
  return session;
}
export async function signInCustomer(email: string, password: string) {
  if (!firebaseApiKey) throw new Error('FIREBASE_API_KEY_MISSING');
  const response = await request<AuthResponse>(
    `${AUTH_BASE}/accounts:signInWithPassword?key=${encodeURIComponent(firebaseApiKey)}`,
    { method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }) },
  );
  const session = toSession(response, response.displayName || '');
  save(session, CUSTOMER_STORAGE_KEY);
  return session;
}
export function loadCustomerSession() { return loadSession(CUSTOMER_STORAGE_KEY); }
export function clearCustomerSession() { clearSession(CUSTOMER_STORAGE_KEY); }
