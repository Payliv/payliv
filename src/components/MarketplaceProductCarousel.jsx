import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { supabase } from '@/lib/customSupabaseClient';
import MarketplaceProductCard from '@/components/MarketplaceProductCard';
import { Loader2 } from 'lucide-react';

const MarketplaceProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, stores!inner(name, slug, status)')
        .eq('stores.status', 'published')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error("Error fetching carousel products:", error);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">Nouveautés sur la Marketplace</h2>
      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="pb-10"
      >
        {products.map((product, index) => (
          <SwiperSlide key={product.id} className="h-full">
            <MarketplaceProductCard product={product} delay={index * 0.1} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MarketplaceProductCarousel;