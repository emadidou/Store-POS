import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder = 'Rechercher...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-grove/40" size={17} />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-full border border-grove/10 bg-white pl-10 pr-4 text-sm font-medium text-grove outline-none transition focus:border-leaf-500 focus:ring-4 focus:ring-leaf-100"
      />
    </label>
  );
}
