import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';

const AdCarousel = ({ ads, loading }) => {
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-12">
        <div className="w-full aspect-[4/1] bg-muted/50 animate-pulse rounded-xl" />
      </div>
    );
  }
  
  const allImages = ads
    .filter(ad => ad.placement === 'landing_page' && ad.image_urls && ad.image_urls.length > 0)
    .flatMap(ad => 
      ad.image_urls.map((url, index) => ({
        id: `${ad.id}-${index}`,
        title: ad.title,
        link_url: ad.link_url,
        image_url: url
      }))
    );

  if (!allImages || allImages.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop={true}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="rounded-xl overflow-hidden shadow-lg shadow-primary/5 ad-carousel"
      >
        {allImages.map((imageAd) => (
          <SwiperSlide key={imageAd.id}>
            <a href={imageAd.link_url || '#'} target="_blank" rel="noopener noreferrer" className="block aspect-[3/1] md:aspect-[4/1] bg-muted/20">
              <img src={imageAd.image_url} alt={imageAd.title} className="w-full h-full object-cover" />
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </motion.div>
  );
};

export default AdCarousel;