import type { Category } from '../../api/types';

export function PosCategoryFilter({
  active,
  categories,
  counts,
  onChange,
}: {
  active: string;
  categories: Category[];
  counts?: Record<string, number>;
  onChange: (slug: string) => void;
}) {
  const total = Object.values(counts ?? {}).reduce((sum, value) => sum + value, 0);

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button type="button" className={buttonClass(active === 'all')} onClick={() => onChange('all')}>
        Tous{counts ? <Counter value={total} active={active === 'all'} /> : null}
      </button>
      {categories.map((category) => (
        <button key={category.id} type="button" className={buttonClass(active === category.slug)} onClick={() => onChange(category.slug)}>
          {category.name}
          {counts ? <Counter value={counts[category.slug] ?? 0} active={active === category.slug} /> : null}
        </button>
      ))}
    </div>
  );
}

function buttonClass(isActive: boolean) {
  return `inline-flex h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-bold transition ${
    isActive ? 'bg-grove text-cream shadow-soft' : 'border border-grove/10 bg-white/85 text-grove/70 hover:bg-leaf-50'
  }`;
}

function Counter({ active, value }: { active: boolean; value: number }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${active ? 'bg-cream/15 text-cream' : 'bg-cream text-grove/55'}`}>
      {value}
    </span>
  );
}
