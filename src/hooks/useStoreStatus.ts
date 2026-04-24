import { useEffect, useState } from 'react';
import { getStoreStatus } from '../api/store';

export type StoreStatus = {
  isOpen: boolean;
  label: string;
  detail: string | null;
  ariaLabel: string;
  nextOpenAt: Date | null;
  closesAt: Date | null;
  timezone: string | null;
  isLoading: boolean;
  error: string | null;
};

const REFRESH_INTERVAL_MS = 60_000;

const initialStatus: StoreStatus = {
  isOpen: false,
  label: 'Chargement du magasin',
  detail: null,
  ariaLabel: 'Chargement de l etat du magasin.',
  nextOpenAt: null,
  closesAt: null,
  timezone: null,
  isLoading: true,
  error: null,
};

function toDate(value?: string | null) {
  return value ? new Date(value) : null;
}

function mapStatus(payload: Awaited<ReturnType<typeof getStoreStatus>>): StoreStatus {
  const isOpen = Boolean(payload.is_open);
  const label = payload.message || (isOpen ? 'Commandes en cours' : 'Magasin ferme');
  const detail = isOpen
    ? payload.closes_at ? `Fermeture a ${new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(payload.closes_at))}` : null
    : payload.opens_at ? `Prochaine ouverture le ${new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(payload.opens_at))}` : null;

  return {
    isOpen,
    label,
    detail,
    ariaLabel: `${isOpen ? 'Magasin ouvert' : 'Magasin ferme'}. ${label}.${detail ? ` ${detail}.` : ''}`,
    nextOpenAt: toDate(payload.opens_at),
    closesAt: toDate(payload.closes_at),
    timezone: payload.timezone,
    isLoading: false,
    error: null,
  };
}

export function useStoreStatus() {
  const [status, setStatus] = useState<StoreStatus>(initialStatus);

  useEffect(() => {
    let isMounted = true;

    const refresh = async () => {
      try {
        const payload = await getStoreStatus();
        if (isMounted) {
          setStatus(mapStatus(payload));
        }
      } catch {
        if (isMounted) {
          setStatus((current) => ({
            ...current,
            isLoading: false,
            error: 'Impossible de charger l etat du magasin.',
            label: current.label === initialStatus.label ? 'Magasin indisponible' : current.label,
            ariaLabel: 'Impossible de charger l etat du magasin.',
          }));
        }
      }
    };

    refresh();
    const intervalId = window.setInterval(refresh, REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return status;
}
