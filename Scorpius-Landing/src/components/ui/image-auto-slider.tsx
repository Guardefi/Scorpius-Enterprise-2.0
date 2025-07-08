import React from "react";

export const ImageAutoSlider = () => {
  const images = [
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop",
  ];

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center overflow-hidden relative">
      {/* Title Section */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 text-center">
        <h2 className="text-4xl md:text-6xl font-command font-bold text-cyber-cyan-bright mb-4">
          Digital Arsenal Gallery
        </h2>
        <p className="text-xl text-cyber-cyan-base/80 font-terminal">
          Weapons of Cyber Warfare
        </p>
      </div>

      {/* Scrolling Container */}
      <div className="relative w-full h-96 flex items-center justify-center">
        <div className="scrolling-images flex gap-8">
          {[...images, ...images].map((src, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 h-80 rounded-2xl overflow-hidden border-2 border-cyber-cyan-dim/30 hover:border-cyber-cyan-bright/60 transition-all duration-300 hover:scale-105"
            >
              <img
                src={src}
                alt={`Cybersecurity asset ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none" />

      <style jsx>{`
        .scrolling-images {
          animation: scroll-left 25s linear infinite;
          width: fit-content;
        }

        @keyframes scroll-left {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .scrolling-images:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default ImageAutoSlider;
