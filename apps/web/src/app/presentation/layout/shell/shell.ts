import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';

import { AuthService } from '../../../application/auth/auth.service';
import { Icon, IconName } from '../../shared/icon/icon';

interface NavItem {
  label: string;
  path: string;
  icon: IconName;
  exact: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './shell.css',
  templateUrl: './shell.html',
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly menuOpen = signal(false);
  protected readonly initials = computed(() => {
    const name = this.user()?.name ?? '';
    return (
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]!.toUpperCase())
        .join('') || 'U'
    );
  });

  protected readonly navItems: readonly NavItem[] = [
    { label: 'Panel', path: '/dashboard', icon: 'dashboard', exact: true },
    { label: 'Documentos', path: '/documents', icon: 'files', exact: false },
    { label: 'Mi perfil', path: '/profile', icon: 'user', exact: true },
  ];

  constructor() {
    // Close the mobile menu after each navigation.
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));
  }

  protected logout(): void {
    this.auth.logout();
  }
}
