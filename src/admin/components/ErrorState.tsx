type ErrorStateProps = {
  title?: string;
  description?: string;
};

export function ErrorState({ title = 'Une erreur est survenue', description = 'Impossible de charger les donnees pour le moment.' }: ErrorStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-tomato/15 bg-white p-8 text-center shadow-soft">
      <p className="font-display text-2xl font-semibold text-grove">{title}</p>
      <p className="mt-2 text-sm text-grove/60">{description}</p>
    </div>
  );
}
