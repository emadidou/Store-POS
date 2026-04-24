import type { Product } from '../../api/types';
import { EmptyState } from '../EmptyState';
import { PosProductCard } from './PosProductCard';

export function PosProductGrid({
  emptyDescription = 'Essayez une autre recherche ou categorie.',
  onAdd,
  products,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
  emptyDescription?: string;
}) {
  if (products.length === 0) {
    return <EmptyState title="Aucun produit trouve" description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
      {products.map((product) => <PosProductCard key={product.id} product={product} onAdd={onAdd} />)}
    </div>
  );
}
