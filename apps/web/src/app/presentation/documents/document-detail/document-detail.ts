import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { DocumentsService } from '../../../application/documents/documents.service';
import { getErrorMessage } from '../../../application/shared/http-error';
import { DocumentItem } from '../../../data/documents/document.models';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { FilePicker } from '../../shared/file-picker/file-picker';
import { Icon } from '../../shared/icon/icon';
import {
  CategoryLabelPipe,
  FileExtensionPipe,
  FileSizePipe,
} from '../../shared/pipes/document-pipes';

@Component({
  selector: 'app-document-detail',
  imports: [
    RouterLink,
    DatePipe,
    Icon,
    FilePicker,
    ConfirmDialog,
    CategoryLabelPipe,
    FileSizePipe,
    FileExtensionPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './document-detail.css',
  templateUrl: './document-detail.html',
})
export class DocumentDetail implements OnInit {
  /** Bound from the `:id` route parameter. */
  readonly id = input.required<string>();

  private readonly documentsService = inject(DocumentsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly query = this.route.snapshot.queryParamMap;

  protected readonly document = signal<DocumentItem | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly error = signal<string | null>(
    this.query.has('uploadFailed')
      ? 'El documento se guardó, pero no se pudo subir el archivo. Inténtalo de nuevo.'
      : null,
  );
  protected readonly notice = signal<string | null>(
    this.query.has('saved') ? 'Los cambios se guardaron correctamente.' : null,
  );

  protected readonly file = signal<File | null>(null);
  protected readonly uploading = signal(false);
  protected readonly downloading = signal(false);
  protected readonly confirmOpen = signal(false);
  protected readonly deleting = signal(false);

  ngOnInit(): void {
    this.load();
    // Drop one-time status flags so a reload does not repeat the message.
    if (this.query.has('saved') || this.query.has('uploadFailed')) {
      void this.router.navigate([], {
        relativeTo: this.route,
        replaceUrl: true,
      });
    }
  }

  protected load(): void {
    const id = Number(this.id());
    if (!Number.isInteger(id) || id <= 0) {
      this.loading.set(false);
      this.loadError.set('El documento solicitado no existe.');
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);
    this.documentsService
      .get(id)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (doc) => this.document.set(doc),
        error: (error: unknown) =>
          this.loadError.set(
            getErrorMessage(error, 'No se pudo cargar el documento.'),
          ),
      });
  }

  protected upload(): void {
    const doc = this.document();
    const file = this.file();
    if (!doc || !file) {
      return;
    }

    this.uploading.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.documentsService
      .uploadFile(doc.id, file)
      .pipe(
        finalize(() => this.uploading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updated) => {
          this.document.set(updated);
          this.file.set(null);
          this.notice.set('El archivo se subió correctamente.');
        },
        error: (error: unknown) =>
          this.error.set(getErrorMessage(error, 'No se pudo subir el archivo.')),
      });
  }

  protected download(): void {
    const doc = this.document();
    if (!doc) {
      return;
    }
    this.downloading.set(true);
    this.error.set(null);
    this.documentsService
      .download(doc)
      .pipe(
        finalize(() => this.downloading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'No se pudo descargar el archivo.'),
          ),
      });
  }

  protected remove(): void {
    const doc = this.document();
    if (!doc) {
      return;
    }
    this.deleting.set(true);
    this.documentsService
      .remove(doc.id)
      .pipe(
        finalize(() => this.deleting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.confirmOpen.set(false);
          void this.router.navigate(['/documents']);
        },
        error: (error: unknown) => {
          this.confirmOpen.set(false);
          this.error.set(
            getErrorMessage(error, 'No se pudo eliminar el documento.'),
          );
        },
      });
  }
}
