import React from 'react';
    import { Link } from 'react-router-dom';
    import { Loader2, ArrowRight } from 'lucide-react';
    import MarketplaceProductCard from '@/components/MarketplaceProductCard';
    import { Button } from '@/components/ui/button';

    const MarketplaceSection = ({ products, loading }) => {
      return (
        <section id="marketplace" className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Découvrez notre Marketplace</h2>
              <p className="mt-4 text-lg text-muted-foreground">Explorez les produits uniques proposés par notre communauté d'entrepreneurs.</p>
            </div>
            {loading ? (
              <div className="flex justify-center items-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {products.map((product, index) => (
                  <MarketplaceProductCard key={product.id} product={product} delay={index * 0.1} />
                ))}
              </div>
            )}
            <div className="mt-12 text-center">
              <Button asChild size="lg" variant="outline">
                <Link to="/marketplace">
                  Explorer tous les produits <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      );
    };

    export default MarketplaceSection;