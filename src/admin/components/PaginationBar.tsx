export function PaginationBar({
  currentPage,
  lastPage,
  onPageChange,
  total,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-grove/10 bg-white px-4 py-3 text-sm font-semibold text-grove/70 shadow-soft">
      <span>{total} element{total > 1 ? 's' : ''}</span>
      <div className="flex items-center gap-2">
        <button type="button" className="btn btn-secondary !h-10 !px-4" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
          Precedent
        </button>
        <span>Page {currentPage} / {lastPage}</span>
        <button type="button" className="btn btn-secondary !h-10 !px-4" disabled={currentPage >= lastPage} onClick={() => onPageChange(currentPage + 1)}>
          Suivant
        </button>
      </div>
    </div>
  );
}
