import { DocumentCategory } from '../../data/documents/document.models';

export interface CategoryOption {
  value: DocumentCategory;
  label: string;
}

export const DOCUMENT_CATEGORIES: readonly CategoryOption[] = [
  { value: 'CONTRACT', label: 'Contrato' },
  { value: 'INVOICE', label: 'Factura' },
  { value: 'REPORT', label: 'Informe' },
  { value: 'CERTIFICATE', label: 'Certificado' },
  { value: 'OTHER', label: 'Otro' },
];

export function getCategoryLabel(category: DocumentCategory): string {
  return (
    DOCUMENT_CATEGORIES.find((option) => option.value === category)?.label ??
    category
  );
}
