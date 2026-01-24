import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import "./slideshow.css";

interface SlideshowProps {
  images: string[];
  autoplayDelay?: number;
  className?: string;
}

const Slideshow: React.FC<SlideshowProps> = ({
  images,
  autoplayDelay = 4000,
  className = "",
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: false,
      skipSnaps: false,
    },
    [
      Autoplay({
        delay: autoplayDelay,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  return (
    <div className={`slideshow-container ${className}`}>
      <div className="slideshow-glass-frame">
        {/* SVG filter for liquid glass effect */}
        <svg style={{ display: "none" }}>
          <filter id="slideshowDisplacementFilter">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.01"
              numOctaves="2"
              result="turbulence"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>

        {/* Embla carousel */}
        <div className="slideshow-viewport" ref={emblaRef}>
          <div className="slideshow-track">
            {images.map((image, index) => (
              <div
                key={index}
                className={`slideshow-slide ${
                  index === selectedIndex ? "active" : ""
                }`}
              >
                <div className="slideshow-slide-inner">
                  <img
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="slideshow-image"
                    draggable={false}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slideshow;
