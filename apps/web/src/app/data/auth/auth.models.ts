export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface UserProfile extends AuthUser {
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Response returned by POST /auth/login and POST /auth/register. */
export interface AuthResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
}
