/**
 * Reads the `exp` claim of a JWT without verifying it (verification is the
 * backend's job). Returns null when the token cannot be decoded.
 */
export function getTokenExpiration(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded: unknown = JSON.parse(atob(normalized));
    if (typeof decoded === 'object' && decoded !== null) {
      const exp = (decoded as Record<string, unknown>)['exp'];
      return typeof exp === 'number' ? exp * 1000 : null;
    }
    return null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  // Tokens without `exp` are treated as valid; the API will reject them if not.
  return expiration !== null && expiration <= Date.now();
}
