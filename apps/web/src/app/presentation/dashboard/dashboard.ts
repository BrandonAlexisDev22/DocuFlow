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
import { RouterLink } from '@angular/router';

import { AuthService } from '../../application/auth/auth.service';
import { DOCUMENT_CATEGORIES } from '../../application/documents/document-categories';
import { DocumentsService } from '../../application/documents/documents.service';
import { getErrorMessage } from '../../application/shared/http-error';
import { DocumentItem } from '../../data/documents/document.models';
import { Icon } from '../shared/icon/icon';
import {
  CategoryLabelPipe,
  FileExtensionPipe,
  FileSizePipe,
} from '../shared/pipes/document-pipes';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    Icon,
    CategoryLabelPipe,
    FileSizePipe,
    FileExtensionPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly documentsService = inject(DocumentsService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly user = inject(AuthService).user;
  protected readonly documents = signal<DocumentItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly firstName = computed(
    () => this.user()?.name.split(/\s+/)[0] ?? '',
  );

  protected readonly stats = computed(() => {
    const docs = this.documents();
    const withFile = docs.filter((doc) => doc.publicId !== null);
    return {
      total: docs.length,
      withFile: withFile.length,
      withoutFile: docs.length - withFile.length,
      storage: withFile.reduce((sum, doc) => sum + (doc.fileSize ?? 0), 0),
    };
  });

  protected readonly byCategory = computed(() => {
    const docs = this.documents();
    return DOCUMENT_CATEGORIES.map((category) => {
      const count = docs.filter((doc) => doc.category === category.value).length;
      return {
        ...category,
        count,
        percent: docs.length ? Math.round((count / docs.length) * 100) : 0,
      };
    });
  });

  /** The API already returns documents ordered by creation date (desc). */
  protected readonly recent = computed(() => this.documents().slice(0, 5));

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.documentsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (docs) => {
          this.documents.set(docs);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.error.set(
            getErrorMessage(error, 'No se pudieron cargar los documentos.'),
          );
          this.loading.set(false);
        },
      });
  }
}
