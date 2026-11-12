import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { AuthApiService } from '../../data/auth/auth-api.service';
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  UserProfile,
} from '../../data/auth/auth.models';
import { TokenStorageService } from '../../data/auth/token-storage.service';
import { isTokenExpired } from './jwt';

/** Owns the session state of the application. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(AuthApiService);
  private readonly storage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly tokenState = signal<string | null>(null);
  private readonly userState = signal<AuthUser | null>(null);

  readonly user = this.userState.asReadonly();
  readonly isAuthenticated = computed(() => this.tokenState() !== null);

  constructor() {
    this.restoreSession();
  }

  get token(): string | null {
    return this.tokenState();
  }

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.api.login(credentials).pipe(
      tap((response) => this.startSession(response)),
      map((response) => response.user),
    );
  }

  register(data: RegisterRequest): Observable<AuthUser> {
    return this.api.register(data).pipe(
      tap((response) => this.startSession(response)),
      map((response) => response.user),
    );
  }

  /** Fetches the profile and refreshes the cached user data. */
  loadProfile(): Observable<UserProfile> {
    return this.api.getProfile().pipe(
      tap((profile) => {
        const user: AuthUser = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
        };
        this.userState.set(user);
        this.storage.saveUser(user);
      }),
    );
  }

  logout(redirect = true): void {
    this.storage.clear();
    this.tokenState.set(null);
    this.userState.set(null);
    if (redirect) {
      void this.router.navigate(['/auth/login']);
    }
  }

  /** Drops the session when the API reports the token is no longer valid. */
  handleUnauthorized(): void {
    if (!this.isAuthenticated()) {
      return;
    }
    this.logout(false);
    void this.router.navigate(['/auth/login'], {
      queryParams: { expired: 1 },
    });
  }

  private startSession(response: AuthResponse): void {
    const user: AuthUser = {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
    };
    this.storage.save(response.accessToken, user);
    this.tokenState.set(response.accessToken);
    this.userState.set(user);
  }

  private restoreSession(): void {
    const token = this.storage.getToken();
    const user = this.storage.getUser();

    if (!token || !user || isTokenExpired(token)) {
      this.storage.clear();
      return;
    }

    this.tokenState.set(token);
    this.userState.set(user);
  }
}
