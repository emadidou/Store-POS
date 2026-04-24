export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-grove/70">
      {label}
      {children}
      {error && <span className="text-xs font-bold text-tomato">{error}</span>}
    </label>
  );
}

export const adminInputClass =
  'w-full rounded-2xl border border-grove/10 bg-cream px-4 py-3 text-sm font-medium text-grove outline-none transition placeholder:text-grove/35 focus:border-leaf-500 focus:bg-white focus:ring-4 focus:ring-leaf-100';
