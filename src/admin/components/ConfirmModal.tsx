export function ConfirmModal({
  isOpen,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  isOpen: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120000] grid place-items-center bg-grove/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.5rem] bg-cream p-6 shadow-[0_24px_80px_rgba(31,77,54,0.24)]">
        <h3 className="font-display text-2xl font-semibold text-grove">{title}</h3>
        {description && <p className="mt-2 text-sm leading-6 text-grove/65">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Annuler
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
