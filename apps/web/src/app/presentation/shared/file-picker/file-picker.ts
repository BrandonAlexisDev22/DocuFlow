import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import {
  ACCEPTED_FILE_TYPES,
  formatFileSize,
  getFileExtension,
  validateFile,
} from '../../../application/documents/file-rules';
import { Icon } from '../icon/icon';

/** Drag-and-drop file selector that applies the API's file rules. */
@Component({
  selector: 'app-file-picker',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './file-picker.css',
  templateUrl: './file-picker.html',
})
export class FilePicker {
  readonly file = input<File | null>(null);
  readonly disabled = input(false);
  readonly fileChange = output<File | null>();

  protected readonly accept = ACCEPTED_FILE_TYPES;
  protected readonly error = signal<string | null>(null);
  protected readonly dragging = signal(false);
  protected readonly formatSize = formatFileSize;
  protected readonly extension = getFileExtension;

  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  protected browse(): void {
    if (!this.disabled()) {
      this.inputRef().nativeElement.click();
    }
  }

  protected onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.select(target.files?.item(0) ?? null);
    target.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) {
      this.dragging.set(true);
    }
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled()) {
      this.select(event.dataTransfer?.files.item(0) ?? null);
    }
  }

  protected clear(): void {
    this.error.set(null);
    this.fileChange.emit(null);
  }

  private select(file: File | null): void {
    if (!file) {
      return;
    }
    const error = validateFile(file);
    this.error.set(error);
    this.fileChange.emit(error ? null : file);
  }
}
