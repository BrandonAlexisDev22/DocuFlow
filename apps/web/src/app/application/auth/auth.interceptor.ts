import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

/**
 * Adds the JWT to requests sent to our API and closes the session when the
 * API answers 401. Requests to other hosts never receive the token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const isApiRequest = req.url.startsWith(environment.apiUrl);

  const request =
    token && isApiRequest
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const isAuthEndpoint = /\/auth\/(login|register)$/.test(req.url);
      if (
        isApiRequest &&
        !isAuthEndpoint &&
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        auth.handleUnauthorized();
      }
      return throwError(() => error);
    }),
  );
};
