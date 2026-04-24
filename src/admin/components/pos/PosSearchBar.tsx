import { Search, X } from 'lucide-react';

export function PosSearchBar({ onChange, value }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="group flex h-16 w-full items-center gap-3 rounded-[1.35rem] border border-grove/10 bg-white/95 px-3 shadow-[0_14px_40px_rgba(31,77,54,0.08)] transition focus-within:border-leaf-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-leaf-100">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-leaf-50 text-leaf-700 transition group-focus-within:bg-grove group-focus-within:text-cream">
        <Search size={18} />
      </span>
      <input
        autoFocus
        className="h-full min-w-0 flex-1 border-0 bg-transparent px-1 text-lg font-bold text-grove outline-none placeholder:text-grove/32"
        placeholder="Rechercher un produit..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-grove/8 text-grove/60 transition hover:bg-tomato/10 hover:text-tomato"
          onClick={() => onChange('')}
          aria-label="Effacer la recherche"
        >
          <X size={18} />
        </button>
      )}
    </label>
  );
}
