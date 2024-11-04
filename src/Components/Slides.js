import React, { useState, useEffect, useRef } from 'react';
import { useUser } from "../context/userContext";

const slides = [
  {
    title: 'DAILY CHECKIN',
    description: 'Claim daily checkin rewards',
    action: 'checkin',
  },
  {
    title: '$RSC COMMUNITY',
    description: 'Join RISINGCOIN community channel',
    link: 'https://t.me/risingcoin_rsc',
  },
  {
    title: 'SHARE ON WHATSAPP',
    description: 'Share with friends on WhatsApp to earn rewards',
    action: 'whatsappShare',
  },
  {
    title: 'SHARE ON TELEGRAM',
    description: 'Share with friends on Telegram to earn rewards',
    action: 'telegramShare', // New action for Telegram share
  },
];

const CommunitySlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const { id } = useUser();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const userReferralCode = `https://t.me/Risingcoin_appbot?start=r${id}\n`;

  const startSlideInterval = () => {
    slideInterval.current = setInterval(() => {
      handleNextSlide();
    }, 5000);
  };

  const stopSlideInterval = () => {
    clearInterval(slideInterval.current);
  };

  useEffect(() => {
    startSlideInterval();
    return () => stopSlideInterval();
  }, []);

  const handleNextSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prevSlide) => prevSlide + 1);
  };

  const handlePrevSlide = () => {
    setIsTransitioning(true);
    setCurrentSlide((prevSlide) => prevSlide - 1);
  };

  const handleDotClick = (index) => {
    stopSlideInterval();
    setIsTransitioning(true);
    setCurrentSlide(index);
    startSlideInterval();
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipe();
  };

  const handleSwipe = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNextSlide();
    } else if (touchEndX.current - touchStartX.current > 50) {
      handlePrevSlide();
    }
  };

  const handleWhatsAppShare = async () => {
    const referralImageUrl = `/share-image.jpg`;
    const shareText = `Join the RisingCoin community and earn rewards! ${userReferralCode}`;

    try {
      const response = await fetch(referralImageUrl);
      const blob = await response.blob();
      const file = new File([blob], "referral.jpg", { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Join Our Community!",
          text: shareText,
          files: [file],
        });
      } else {
        throw new Error("Image sharing not supported");
      }
    } catch (error) {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleTelegramShare = () => {
    const shareText = `Join the RisingCoin community and earn rewards! ${userReferralCode}`;
    const imageUrl = 'https://example.com/path-to-your-image.jpg'; // Replace with your image URL
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
  };

  const handleSlideAction = (slide) => {
    if (slide.action === 'whatsappShare') {
      handleWhatsAppShare();
    } else if (slide.action === 'telegramShare') {
      handleTelegramShare(); // Add this line for Telegram share
    } else if (slide.action === 'checkin') {
      console.log("Daily check-in claimed!");
    }
  };

  useEffect(() => {
    if (isTransitioning) {
      const transitionEnd = setTimeout(() => {
        setIsTransitioning(false);
        if (currentSlide >= slides.length) {
          setCurrentSlide(0);
        } else if (currentSlide < 0) {
          setCurrentSlide(slides.length - 1);
        }
      }, 500);
      return () => clearTimeout(transitionEnd);
    }
  }, [currentSlide, isTransitioning]);

  return (
    <div className="relative w-full max-w-xl mx-auto overflow-hidden">
      <div
        className={`flex ${isTransitioning ? 'transition-transform duration-500' : ''}`}
        style={{ transform: `translateX(-${(currentSlide % slides.length) * 90}%)` }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {slides.concat(slides[0]).map((slide, index) => (
          <div key={index} className="min-w-[90%]">
            <div className="bg-[#17181A] mr-4 rounded-[12px] py-6 px-4 flex flex-col">
              <h2 className="font-medium">{slide.title}</h2>
              <p className="pb-2 text-[14px]">{slide.description}</p>

              {slide.action === 'whatsappShare' ? (
                <button
                  onClick={() => handleSlideAction(slide)}
                  className="bg-green-500 py-1 px-3 text-[16px] font-semibold w-fit rounded-[30px] text-white"
                >
                  Share
                </button>
              ) : slide.action === 'telegramShare' ? ( // Button for Telegram share
                <button
                  onClick={() => handleSlideAction(slide)}
                  className="bg-blue-500 py-1 px-3 text-[16px] font-semibold w-fit rounded-[30px] text-white"
                >
                  Share
                </button>
              ) : slide.action === 'checkin' ? (
                <button
                  onClick={() => handleSlideAction(slide)}
                  className="bg-blue-500 py-1 px-3 text-[16px] font-semibold w-fit rounded-[30px] text-white"
                >
                  Claim
                </button>
              ) : slide.link ? (
                <a
                  href={slide.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-btn4 py-1 px-3 text-[16px] font-semibold w-fit rounded-[30px]"
                >
                  Join
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center py-4">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`cursor-pointer w-2 h-2 mx-1 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-gray-600'}`}
            onClick={() => handleDotClick(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default CommunitySlider;
