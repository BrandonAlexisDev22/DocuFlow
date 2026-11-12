import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Icon } from '../shared/icon/icon';

/** Left-hand brand panel shared by the login and register pages. */
@Component({
  selector: 'app-auth-brand',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './auth-brand.css',
  template: `
    <div class="brand">
      <span class="brand-mark"><app-icon name="files" /></span>
      DocuFlow
    </div>
    <div class="brand-copy">
      <h2>Gestión documental clara para equipos que avanzan.</h2>
      <p>Organiza, protege y encuentra los documentos de tu empresa desde un solo lugar.</p>
      <ul class="features">
        <li><app-icon name="check" /> Documentos clasificados por categoría</li>
        <li><app-icon name="check" /> Archivos PDF y Word almacenados de forma segura</li>
        <li><app-icon name="check" /> Descargas mediante enlaces temporales</li>
      </ul>
    </div>
    <p class="brand-footer">© {{ year }} DocuFlow</p>
  `,
})
export class AuthBrand {
  protected readonly year = new Date().getFullYear();
}
