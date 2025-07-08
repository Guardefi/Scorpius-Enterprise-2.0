"use client";
import React from "react";

export const CyberpunkImageSlider = () => {
  // Cybersecurity and tech-themed images from Unsplash
  const images = [
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=2152&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1482881497185-d4a9ddbe4151?q=80&w=1965&auto=format&fit=crop&ixlib=rb-4.1.0",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&crop=center",
  ];

  // Duplicate images for seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <>
      <style>{`
        @keyframes cyber-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .cyber-infinite-scroll {
          animation: cyber-scroll 25s linear infinite;
        }

        .cyber-scroll-container {
          mask: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0, 212, 212, 0.3) 5%,
            rgba(0, 212, 212, 1) 15%,
            rgba(0, 212, 212, 1) 85%,
            rgba(0, 212, 212, 0.3) 95%,
            transparent 100%
          );
          -webkit-mask: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0, 212, 212, 0.3) 5%,
            rgba(0, 212, 212, 1) 15%,
            rgba(0, 212, 212, 1) 85%,
            rgba(0, 212, 212, 0.3) 95%,
            transparent 100%
          );
        }

        .cyber-image-item {
          transition: all 0.3s ease;
          position: relative;
        }

        .cyber-image-item:hover {
          transform: scale(1.05);
          filter: brightness(1.2) saturate(1.3);
        }

        .cyber-image-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid transparent;
          border-radius: 12px;
          background: linear-gradient(45deg, #00d4d4, #008b8b, #004d4d, #00d4d4) border-box;
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask-composite: xor;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .cyber-image-item:hover::before {
          opacity: 0.8;
        }

        .scan-line {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #00ffff, transparent);
          animation: scan 3s linear infinite;
        }

        @keyframes scan {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>

      <div className="w-screen bg-war-room-abyss relative overflow-hidden py-24 -mx-[50vw] left-1/2 right-1/2">
        {/* Cyber grid background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                   linear-gradient(rgba(0, 212, 212, 0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(0, 212, 212, 0.1) 1px, transparent 1px)
                 `,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        {/* Scrolling images container */}
        <div className="relative z-10 w-full flex items-center justify-center">
          <div className="cyber-scroll-container w-full">
            <div className="cyber-infinite-scroll flex gap-12 w-max">
              {duplicatedImages.map((image, index) => (
                <div
                  key={index}
                  className="cyber-image-item flex-shrink-0 w-80 h-80 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] xl:w-[32rem] xl:h-[32rem] rounded-xl overflow-hidden relative"
                >
                  <img
                    src={image}
                    alt={`Cyber defense interface ${(index % images.length) + 1}`}
                    className="w-full h-full object-cover opacity-40"
                    loading="lazy"
                  />
                  {/* Cyber overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-cyan-400/10"></div>
                  {/* Scanning line effect */}
                  <div className="scan-line"></div>
                  {/* Corner accents */}
                  <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-cyan-400"></div>
                  <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-cyan-400"></div>
                  <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-cyan-400"></div>
                  <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-cyan-400"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cyber glow effects */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>
      </div>
    </>
  );
};
