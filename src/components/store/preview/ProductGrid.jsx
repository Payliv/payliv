import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, store }) => {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold text-foreground">Aucun produit à afficher</h2>
        <p className="text-muted-foreground mt-2">Revenez bientôt pour découvrir nos nouveautés !</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} store={store} delay={index} />
      ))}
    </div>
  );
};

export default ProductGrid;