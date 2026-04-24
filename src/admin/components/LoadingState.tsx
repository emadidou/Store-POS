export function LoadingState({ label = 'Chargement...' }: { label?: string }) {
  return (
    <div className="grid min-h-[280px] place-items-center rounded-[1.5rem] border border-grove/10 bg-white/80 p-8 text-center shadow-soft">
      <div>
        <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-leaf-200 border-t-leaf-600" />
        <p className="mt-4 text-sm font-semibold text-grove/65">{label}</p>
      </div>
    </div>
  );
}
