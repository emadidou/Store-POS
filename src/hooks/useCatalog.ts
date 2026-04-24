import { useEffect, useState } from 'react';
import { getCategories, getFeaturedProducts, getProducts } from '../api/products';
import type { UiCategory, UiProduct } from '../api/types';

type AsyncState<T> = {
  data: T;
  isLoading: boolean;
  error: string | null;
};

export function useProducts(currency?: string) {
  const [state, setState] = useState<AsyncState<UiProduct[]>>({ data: [], isLoading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    getProducts({}, currency)
      .then((data) => isMounted && setState({ data, isLoading: false, error: null }))
      .catch(() => isMounted && setState({ data: [], isLoading: false, error: 'Impossible de charger les produits.' }));

    return () => {
      isMounted = false;
    };
  }, [currency]);

  return state;
}

export function useFeaturedProducts(currency?: string) {
  const [state, setState] = useState<AsyncState<UiProduct[]>>({ data: [], isLoading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    getFeaturedProducts(currency)
      .then((data) => isMounted && setState({ data, isLoading: false, error: null }))
      .catch(() => isMounted && setState({ data: [], isLoading: false, error: 'Impossible de charger les produits vedettes.' }));

    return () => {
      isMounted = false;
    };
  }, [currency]);

  return state;
}

export function useCategories(products: UiProduct[] = []) {
  const [state, setState] = useState<AsyncState<UiCategory[]>>({ data: [], isLoading: true, error: null });

  useEffect(() => {
    let isMounted = true;
    getCategories(products)
      .then((data) => isMounted && setState({ data, isLoading: false, error: null }))
      .catch(() => isMounted && setState({ data: [], isLoading: false, error: 'Impossible de charger les categories.' }));

    return () => {
      isMounted = false;
    };
  }, [products]);

  return state;
}
