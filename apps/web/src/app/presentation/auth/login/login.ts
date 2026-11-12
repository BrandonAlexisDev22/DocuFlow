import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../application/auth/auth.service';
import { getErrorMessage } from '../../../application/shared/http-error';
import { AuthBrand } from '../auth-brand';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthBrand],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: '../auth-page.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly showPassword = signal(false);
  protected readonly sessionExpired =
    this.route.snapshot.queryParamMap.has('expired');

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();

    this.auth
      .login({ email: email.trim().toLowerCase(), password })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl(this.getReturnUrl()),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'No se pudo iniciar sesión.'),
          ),
      });
  }

  protected isInvalid(control: 'email' | 'password'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  /** Only allows internal paths to avoid open redirects. */
  private getReturnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') && !url.startsWith('//')
      ? url
      : '/dashboard';
  }
}
