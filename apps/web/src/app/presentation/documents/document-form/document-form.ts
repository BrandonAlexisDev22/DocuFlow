import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, map, of, switchMap } from 'rxjs';

import { DOCUMENT_CATEGORIES } from '../../../application/documents/document-categories';
import { DocumentsService } from '../../../application/documents/documents.service';
import { getErrorMessage } from '../../../application/shared/http-error';
import {
  CreateDocumentRequest,
  DocumentCategory,
  DocumentItem,
} from '../../../data/documents/document.models';
import { FilePicker } from '../../shared/file-picker/file-picker';
import { Icon } from '../../shared/icon/icon';
import { FileExtensionPipe, FileSizePipe } from '../../shared/pipes/document-pipes';

/** Creates a document (route /documents/new) or edits one (/documents/:id/edit). */
@Component({
  selector: 'app-document-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Icon,
    FilePicker,
    FileSizePipe,
    FileExtensionPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './document-form.css',
  templateUrl: './document-form.html',
})
export class DocumentForm implements OnInit {
  /** Bound from the `:id` route parameter; undefined when creating. */
  readonly id = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly documentsService = inject(DocumentsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categories = DOCUMENT_CATEGORIES;
  protected readonly isEdit = computed(() => this.id() !== undefined);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: ['', [Validators.maxLength(500)]],
    category: this.fb.control<DocumentCategory | null>(null, Validators.required),
  });

  protected readonly document = signal<DocumentItem | null>(null);
  protected readonly file = signal<File | null>(null);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly loadError = signal<string | null>(null);

  ngOnInit(): void {
    if (this.isEdit()) {
      this.loadDocument();
    }
  }

  protected loadDocument(): void {
    const id = Number(this.id());
    if (!Number.isInteger(id) || id <= 0) {
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
        next: (doc) => {
          this.document.set(doc);
          this.form.setValue({
            name: doc.name,
            description: doc.description ?? '',
            category: doc.category,
          });
        },
        error: (error: unknown) =>
          this.loadError.set(
            getErrorMessage(error, 'No se pudo cargar el documento.'),
          ),
      });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, description, category } = this.form.getRawValue();
    if (!category) {
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const current = this.document();
    const save$ = current
      ? this.documentsService.update(current.id, { name, description, category })
      : this.documentsService.create(this.buildCreateRequest(name, description, category));

    const file = this.file();
    const canUpload = !current?.publicId;

    save$
      .pipe(
        // Upload the file once the metadata is stored. A failed upload does
        // not undo the save: the user lands on the detail page to retry.
        switchMap((saved) =>
          file && canUpload
            ? this.documentsService.uploadFile(saved.id, file).pipe(
                map((doc) => ({ doc, uploadFailed: false })),
                catchError(() => of({ doc: saved, uploadFailed: true })),
              )
            : of({ doc: saved, uploadFailed: false }),
        ),
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ doc, uploadFailed }) =>
          void this.router.navigate(['/documents', doc.id], {
            queryParams: uploadFailed ? { uploadFailed: 1 } : { saved: 1 },
          }),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'No se pudo guardar el documento.'),
          ),
      });
  }

  protected cancel(): void {
    const current = this.document();
    void this.router.navigate(current ? ['/documents', current.id] : ['/documents']);
  }

  protected isInvalid(control: 'name' | 'description' | 'category'): boolean {
    const field = this.form.controls[control];
    return field.invalid && field.touched;
  }

  private buildCreateRequest(
    name: string,
    description: string,
    category: DocumentCategory,
  ): CreateDocumentRequest {
    return description.trim()
      ? { name, description, category }
      : { name, category };
  }
}
