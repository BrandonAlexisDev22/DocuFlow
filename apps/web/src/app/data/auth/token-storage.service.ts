import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

import { AuthUser } from './auth.models';

const TOKEN_KEY = 'docuflow.accessToken';
const USER_KEY = 'docuflow.user';

/**
 * Persists the session in localStorage. Every access is guarded so the
 * service is a no-op during server-side rendering.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  getToken(): string | null {
    return this.read(TOKEN_KEY);
  }

  getUser(): AuthUser | null {
    const raw = this.read(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      return isAuthUser(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  save(token: string, user: AuthUser): void {
    this.write(TOKEN_KEY, token);
    this.write(USER_KEY, JSON.stringify(user));
  }

  saveUser(user: AuthUser): void {
    this.write(USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // Storage unavailable: nothing to clear.
    }
  }

  private read(key: string): string | null {
    if (!this.isBrowser) {
      return null;
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    if (!this.isBrowser) {
      return;
    }
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage full or blocked: the session lives only in memory.
    }
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['id'] === 'number' &&
    typeof candidate['name'] === 'string' &&
    typeof candidate['email'] === 'string'
  );
}
