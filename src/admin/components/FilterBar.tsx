export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 flex flex-col gap-3 rounded-[1.25rem] border border-grove/10 bg-white/80 p-3 shadow-[0_1px_0_rgba(31,77,54,0.08)] sm:flex-row sm:items-center">{children}</div>;
}
