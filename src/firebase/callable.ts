import { functionsOrigin } from './config';
import type { AuthSession } from './auth';

export async function callFunction<T>(
  name: string,
  session: AuthSession,
  data: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(`${functionsOrigin}/${name}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session.idToken}`,
    },
    body: JSON.stringify({ data }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) throw new Error(body?.error?.message || 'FUNCTION_CALL_FAILED');
  return (body.result ?? body.data) as T;
}
