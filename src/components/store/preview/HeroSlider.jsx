import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

const HeroSlider = ({ store }) => {
    const coverImages = store?.cover_images;
    if (!coverImages || coverImages.length === 0) {
        return null;
    }
  
    return (
      <div className="absolute inset-0 w-full h-full">
        <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            spaceBetween={0}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            className="h-full"
        >
            {coverImages.map((img, index) => (
            <SwiperSlide key={index}>
                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
            </SwiperSlide>
            ))}
        </Swiper>
      </div>
    );
};

export default HeroSlider;