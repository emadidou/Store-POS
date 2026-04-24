const tabs = [
  { key: 'stock', label: 'Stock' },
  { key: 'statistics', label: 'Statistiques' },
  { key: 'movements', label: 'Mouvements' },
] as const;

export type StockTabKey = (typeof tabs)[number]['key'];

export function StockTabs({
  activeTab,
  onChange,
}: {
  activeTab: StockTabKey;
  onChange: (tab: StockTabKey) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2 rounded-[1.5rem] border border-grove/10 bg-white/85 p-2 shadow-[0_1px_0_rgba(31,77,54,0.08)]">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition ${
              isActive ? 'bg-grove text-cream shadow-soft' : 'text-grove/65 hover:bg-leaf-50 hover:text-grove'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
