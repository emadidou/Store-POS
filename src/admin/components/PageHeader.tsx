import { useEffect, useState } from 'react';
import { adminApi } from '../api/client';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const [storeName, setStoreName] = useState('Maison Verde');

  useEffect(() => {
    adminApi.storeSettings().then((settings) => setStoreName(settings.store_name));

    const onStoreSettingsUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ store_name?: string }>).detail;
      if (detail?.store_name) setStoreName(detail.store_name);
    };

    window.addEventListener('store-settings-updated', onStoreSettingsUpdated);

    return () => window.removeEventListener('store-settings-updated', onStoreSettingsUpdated);
  }, []);

  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-leaf-700">Admin {storeName}</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-grove sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-grove/65">{description}</p>}
      </div>
      {action}
    </div>
  );
}
