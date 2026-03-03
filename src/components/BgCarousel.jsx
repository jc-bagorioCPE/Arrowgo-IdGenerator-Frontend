import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../components/ui/carousel";

import bg1 from "../assets/bg1.png";
import bg2 from "../assets/bg2.png";
import bg3 from "../assets/bg3.png";
import bg4 from "../assets/bg4.png";

const backgrounds = [bg1, bg2, bg3, bg4];

export default function BgCarousel() {
  const autoplay = Autoplay({
    delay: 2000, // 2 seconds
    stopOnInteraction: false,
  });

  return (
    <Carousel
      plugins={[autoplay]}
      opts={{ loop: true }}
      className="absolute inset-0 -z-10"
    >
      <CarouselContent className="h-full">
        {backgrounds.map((bg, index) => (
          <CarouselItem key={index} className="h-full">
            <div
              className="w-full min-h-[100svh]"
              style={{
                backgroundImage: `url(${bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
