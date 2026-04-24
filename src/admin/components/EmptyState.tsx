import { Inbox } from 'lucide-react';

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-grove/15 bg-white/70 p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-leaf-50 text-leaf-700">
        <Inbox size={22} />
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-grove">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-grove/60">{description}</p>}
    </div>
  );
}
