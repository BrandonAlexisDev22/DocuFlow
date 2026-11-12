import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { DOCUMENT_CATEGORIES } from '../../../application/documents/document-categories';
import { DocumentsService } from '../../../application/documents/documents.service';
import { getErrorMessage } from '../../../application/shared/http-error';
import {
  DocumentCategory,
  DocumentItem,
} from '../../../data/documents/document.models';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { Icon } from '../../shared/icon/icon';
import {
  CategoryLabelPipe,
  FileExtensionPipe,
  FileSizePipe,
} from '../../shared/pipes/document-pipes';

type CategoryFilter = DocumentCategory | 'ALL';

@Component({
  selector: 'app-document-list',
  imports: [
    RouterLink,
    DatePipe,
    Icon,
    ConfirmDialog,
    CategoryLabelPipe,
    FileSizePipe,
    FileExtensionPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './document-list.css',
  templateUrl: './document-list.html',
})
export class DocumentList implements OnInit {
  private readonly documentsService = inject(DocumentsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly categories = DOCUMENT_CATEGORIES;
  protected readonly documents = signal<DocumentItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly search = signal('');
  protected readonly category = signal<CategoryFilter>(this.readCategory());

  protected readonly toDelete = signal<DocumentItem | null>(null);
  protected readonly deleting = signal(false);
  protected readonly downloadingId = signal<number | null>(null);

  protected readonly filtered = computed(() => {
    const term = normalizeText(this.search());
    const category = this.category();
    return this.documents().filter((doc) => {
      if (category !== 'ALL' && doc.category !== category) {
        return false;
      }
      if (!term) {
        return true;
      }
      return [doc.name, doc.description ?? '', doc.fileName ?? ''].some(
        (value) => normalizeText(value).includes(term),
      );
    });
  });

  protected readonly hasFilters = computed(
    () => this.search().trim() !== '' || this.category() !== 'ALL',
  );

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.documentsService
      .list()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (docs) => this.documents.set(docs),
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'No se pudieron cargar los documentos.'),
          ),
      });
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as CategoryFilter;
    this.category.set(value);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: value === 'ALL' ? null : value },
      replaceUrl: true,
    });
  }

  protected clearFilters(): void {
    this.search.set('');
    this.category.set('ALL');
    void this.router.navigate([], { relativeTo: this.route, replaceUrl: true });
  }

  protected download(doc: DocumentItem): void {
    this.downloadingId.set(doc.id);
    this.error.set(null);
    this.documentsService
      .download(doc)
      .pipe(
        finalize(() => this.downloadingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (error: unknown) =>
          this.error.set(
            getErrorMessage(error, 'No se pudo descargar el archivo.'),
          ),
      });
  }

  protected confirmDelete(): void {
    const doc = this.toDelete();
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
          this.documents.update((docs) => docs.filter((d) => d.id !== doc.id));
          this.toDelete.set(null);
          this.notice.set(`Se eliminó «${doc.name}».`);
        },
        error: (error: unknown) => {
          this.toDelete.set(null);
          this.error.set(
            getErrorMessage(error, 'No se pudo eliminar el documento.'),
          );
        },
      });
  }

  private readCategory(): CategoryFilter {
    const value = this.route.snapshot.queryParamMap.get('category');
    return DOCUMENT_CATEGORIES.some((option) => option.value === value)
      ? (value as DocumentCategory)
      : 'ALL';
  }
}

/** Lowercases and strips accents so "factura" matches "Factúra". */
function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
