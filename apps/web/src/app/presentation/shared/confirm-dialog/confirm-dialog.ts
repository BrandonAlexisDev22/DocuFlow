import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

/** Modal confirmation built on the native <dialog> element. */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './confirm-dialog.css',
  template: `
    <dialog #dialog class="dialog" (cancel)="onCancel($event)" aria-labelledby="confirm-title">
      <div class="dialog-body">
        <h2 id="confirm-title" class="dialog-title">{{ title() }}</h2>
        <p class="dialog-message">{{ message() }}</p>
      </div>
      <div class="dialog-actions">
        <button type="button" class="btn btn-secondary" [disabled]="busy()" (click)="cancelled.emit()">
          Cancelar
        </button>
        <button type="button" class="btn btn-danger" [disabled]="busy()" (click)="confirmed.emit()">
          @if (busy()) { <span class="spinner"></span> }
          {{ confirmLabel() }}
        </button>
      </div>
    </dialog>
  `,
})
export class ConfirmDialog {
  readonly open = input(false);
  readonly title = input('¿Confirmar acción?');
  readonly message = input('');
  readonly confirmLabel = input('Eliminar');
  readonly busy = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const element = this.dialog().nativeElement;
      if (typeof element.showModal !== 'function') {
        return;
      }
      if (this.open() && !element.open) {
        element.showModal();
      } else if (!this.open() && element.open) {
        element.close();
      }
    });
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    if (!this.busy()) {
      this.cancelled.emit();
    }
  }
}
