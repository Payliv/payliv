import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

const AdSlideshow = ({ ad }) => {
  if (!ad || !ad.image_urls || ad.image_urls.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-8 group"
    >
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="block relative rounded-lg overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          loop={true}
          className="w-full"
        >
          {ad.image_urls.map((url, index) => (
            <SwiperSlide key={index}>
              <img src={url} alt={`${ad.title} - slide ${index + 1}`} className="w-full h-auto object-cover aspect-[3/1] sm:aspect-[4/1]" />
            </SwiperSlide>
          ))}
        </Swiper>
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center z-10">
          <Megaphone className="w-3 h-3 mr-1" />
          Publicité
        </div>
      </a>
    </motion.div>
  );
};

export default AdSlideshow;