import { FileText, Upload, X } from 'lucide-react';

export function PurchaseAttachmentUploader({
  file,
  hasExistingAttachment,
  onFileChange,
  onRemoveExistingChange,
  removeExisting,
}: {
  file: File | null;
  hasExistingAttachment: boolean;
  onFileChange: (file: File | null) => void;
  onRemoveExistingChange: (value: boolean) => void;
  removeExisting: boolean;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-grove/15 bg-cream p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-grove shadow-soft">
          <Upload size={18} />
        </span>
        <div>
          <p className="font-semibold text-grove">Facture fournisseur</p>
          <p className="text-sm text-grove/60">PDF, JPG ou PNG, 8 Mo maximum.</p>
        </div>
      </div>
      <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-grove/10 bg-white px-4 py-3 text-sm font-medium text-grove">
        <span>{file ? file.name : 'Choisir un fichier'}</span>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(event) => onFileChange(event.target.files?.[0] ?? null)} />
        <span className="btn btn-secondary py-2">Parcourir</span>
      </label>
      {file && (
        <button type="button" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-tomato" onClick={() => onFileChange(null)}>
          <X size={14} />
          Retirer le nouveau fichier
        </button>
      )}
      {hasExistingAttachment && (
        <label className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-grove">
          <FileText size={16} />
          <span>Une facture est deja enregistree</span>
          <input type="checkbox" checked={removeExisting} onChange={(event) => onRemoveExistingChange(event.target.checked)} />
          <span className="text-grove/55">Supprimer la piece jointe actuelle</span>
        </label>
      )}
    </div>
  );
}
