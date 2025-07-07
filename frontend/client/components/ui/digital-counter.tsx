"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DigitalCounterProps {
  value: number;
  label: string;
  color?: string;
  digits?: number;
  size?: "sm" | "md" | "lg";
}

// 7-segment display mapping for each digit
const segmentMaps: { [key: number]: string[] } = {
  0: ["a", "b", "c", "d", "e", "f"],
  1: ["b", "c"],
  2: ["a", "b", "g", "e", "d"],
  3: ["a", "b", "g", "c", "d"],
  4: ["f", "g", "b", "c"],
  5: ["a", "f", "g", "c", "d"],
  6: ["a", "f", "g", "e", "d", "c"],
  7: ["a", "b", "c"],
  8: ["a", "b", "c", "d", "e", "f", "g"],
  9: ["a", "b", "c", "d", "f", "g"],
};

interface DigitDisplayProps {
  digit: number;
  color: string;
  size: "sm" | "md" | "lg";
  isAnimating?: boolean;
}

const DigitDisplay: React.FC<DigitDisplayProps> = ({
  digit,
  color,
  size,
  isAnimating = false,
}) => {
  const activeSegments = segmentMaps[digit] || [];

  const sizeConfig = {
    sm: { width: "w-8", height: "h-12", segmentThickness: "2px" },
    md: { width: "w-10", height: "h-16", segmentThickness: "3px" },
    lg: { width: "w-12", height: "h-20", segmentThickness: "4px" },
  };

  const config = sizeConfig[size];

  // Define 7-segment paths
  const segments = {
    a: "M10 5 L45 5 L40 10 L15 10 Z",
    b: "M45 5 L50 10 L50 25 L45 30 L40 25 L40 10 Z",
    c: "M45 30 L50 35 L50 50 L45 55 L40 50 L40 35 Z",
    d: "M40 55 L15 55 L10 50 L45 50 Z",
    e: "M10 35 L15 30 L20 35 L20 50 L15 55 L10 50 Z",
    f: "M10 10 L15 5 L20 10 L20 25 L15 30 L10 25 Z",
    g: "M15 25 L40 25 L45 30 L40 35 L15 35 L10 30 Z",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-black rounded-lg border",
        config.width,
        config.height,
        isAnimating ? "animate-pulse" : "",
        color === "blue-400"
          ? "border-blue-400/30 shadow-blue-400/20"
          : color === "green-400"
            ? "border-green-400/30 shadow-green-400/20"
            : color === "purple-400"
              ? "border-purple-400/30 shadow-purple-400/20"
              : color === "red-400"
                ? "border-red-400/30 shadow-red-400/20"
                : color === "yellow-400"
                  ? "border-yellow-400/30 shadow-yellow-400/20"
                  : color === "cyan-400"
                    ? "border-cyan-400/30 shadow-cyan-400/20"
                    : "border-green-400/30 shadow-green-400/20",
      )}
    >
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-1 rounded"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 255, 0.1) 2px,
                rgba(0, 255, 255, 0.1) 3px
              ),
              repeating-linear-gradient(
                90deg,
                transparent,
                transparent 2px,
                rgba(0, 255, 255, 0.1) 2px,
                rgba(0, 255, 255, 0.1) 3px
              )
            `,
          }}
        />
      </div>

      {/* 7-segment display */}
      <svg
        viewBox="0 0 60 60"
        className="w-full h-full p-1"
        style={{ filter: `drop-shadow(0 0 4px currentColor)` }}
      >
        {Object.entries(segments).map(([segmentKey, path]) => {
          const isActive = activeSegments.includes(segmentKey);
          return (
            <path
              key={segmentKey}
              d={path}
              fill={isActive ? "currentColor" : "rgba(255,255,255,0.1)"}
              className={cn(
                "transition-all duration-200",
                color === "blue-400"
                  ? "text-blue-400"
                  : color === "green-400"
                    ? "text-green-400"
                    : color === "purple-400"
                      ? "text-purple-400"
                      : color === "red-400"
                        ? "text-red-400"
                        : color === "yellow-400"
                          ? "text-yellow-400"
                          : color === "cyan-400"
                            ? "text-cyan-400"
                            : "text-green-400",
                isActive ? "opacity-100" : "opacity-20",
              )}
              style={{
                filter: isActive
                  ? `
                  drop-shadow(0 0 2px currentColor) 
                  drop-shadow(0 0 4px currentColor)
                  drop-shadow(0 0 6px currentColor)
                `
                  : "none",
              }}
            />
          );
        })}
      </svg>

      {/* LED-style dots in corners */}
      <div className="absolute top-1 left-1 w-1 h-1 bg-current rounded-full opacity-40" />
      <div className="absolute top-1 right-1 w-1 h-1 bg-current rounded-full opacity-40" />
      <div className="absolute bottom-1 left-1 w-1 h-1 bg-current rounded-full opacity-40" />
      <div className="absolute bottom-1 right-1 w-1 h-1 bg-current rounded-full opacity-40" />

      {/* Power indicator */}
      <div
        className={cn(
          "absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse",
          color === "blue-400"
            ? "bg-blue-400"
            : color === "green-400"
              ? "bg-green-400"
              : color === "purple-400"
                ? "bg-purple-400"
                : color === "red-400"
                  ? "bg-red-400"
                  : color === "yellow-400"
                    ? "bg-yellow-400"
                    : color === "cyan-400"
                      ? "bg-cyan-400"
                      : "bg-green-400",
        )}
      />
    </div>
  );
};

export const DigitalCounter: React.FC<DigitalCounterProps> = ({
  value,
  label,
  color = "green-400",
  digits = 6,
  size = "md",
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [animatingDigits, setAnimatingDigits] = useState<boolean[]>([]);

  useEffect(() => {
    if (value !== displayValue) {
      const oldStr = displayValue.toString().padStart(digits, "0");
      const newStr = value.toString().padStart(digits, "0");

      const animating = oldStr.split("").map((digit, i) => digit !== newStr[i]);
      setAnimatingDigits(animating);

      // Quick digital update
      setTimeout(() => {
        setDisplayValue(value);
        setTimeout(() => setAnimatingDigits([]), 150);
      }, 50);
    }
  }, [value, displayValue, digits]);

  const digitArray = displayValue
    .toString()
    .padStart(digits, "0")
    .split("")
    .map((d) => parseInt(d));

  return (
    <div className="text-center space-y-4">
      {/* Digital Display Panel */}
      <div
        className={cn(
          "relative bg-black/90 rounded-xl p-3 border-2",
          color === "blue-400"
            ? "border-blue-400/50 shadow-lg shadow-blue-400/20"
            : color === "green-400"
              ? "border-green-400/50 shadow-lg shadow-green-400/20"
              : color === "purple-400"
                ? "border-purple-400/50 shadow-lg shadow-purple-400/20"
                : color === "red-400"
                  ? "border-red-400/50 shadow-lg shadow-red-400/20"
                  : color === "yellow-400"
                    ? "border-yellow-400/50 shadow-lg shadow-yellow-400/20"
                    : color === "cyan-400"
                      ? "border-cyan-400/50 shadow-lg shadow-cyan-400/20"
                      : "border-green-400/50 shadow-lg shadow-green-400/20",
        )}
      >
        {/* LCD Panel Header */}
        <div className="text-xs font-mono text-center mb-2 opacity-60">
          <div
            className={cn(
              "inline-block px-2 py-1 rounded-sm bg-black/60",
              color === "blue-400"
                ? "text-blue-400"
                : color === "green-400"
                  ? "text-green-400"
                  : color === "purple-400"
                    ? "text-purple-400"
                    : color === "red-400"
                      ? "text-red-400"
                      : color === "yellow-400"
                        ? "text-yellow-400"
                        : color === "cyan-400"
                          ? "text-cyan-400"
                          : "text-green-400",
            )}
          >
            DIGITAL DISPLAY
          </div>
        </div>

        {/* Main Counter Display */}
        <div className="flex justify-center gap-1 mb-3">
          {digitArray.map((digit, i) => (
            <DigitDisplay
              key={i}
              digit={digit}
              color={color}
              size={size}
              isAnimating={animatingDigits[i]}
            />
          ))}
        </div>

        {/* Status bar */}
        <div className="flex justify-between items-center text-xs font-mono opacity-50">
          <span
            className={cn(
              color === "blue-400"
                ? "text-blue-400"
                : color === "green-400"
                  ? "text-green-400"
                  : color === "purple-400"
                    ? "text-purple-400"
                    : color === "red-400"
                      ? "text-red-400"
                      : color === "yellow-400"
                        ? "text-yellow-400"
                        : color === "cyan-400"
                          ? "text-cyan-400"
                          : "text-green-400",
            )}
          >
            ●LIVE
          </span>
          <span className="text-white/40">{value.toLocaleString()}</span>
        </div>
      </div>

      {/* Digital Label */}
      <div className="relative">
        <div
          className={cn(
            "text-sm uppercase tracking-widest font-mono font-bold px-4 py-2 rounded-lg border",
            "bg-black/40 backdrop-blur-sm",
            color === "blue-400"
              ? "text-blue-400 border-blue-400/30 shadow-blue-400/20"
              : color === "green-400"
                ? "text-green-400 border-green-400/30 shadow-green-400/20"
                : color === "purple-400"
                  ? "text-purple-400 border-purple-400/30 shadow-purple-400/20"
                  : color === "red-400"
                    ? "text-red-400 border-red-400/30 shadow-red-400/20"
                    : color === "yellow-400"
                      ? "text-yellow-400 border-yellow-400/30 shadow-yellow-400/20"
                      : color === "cyan-400"
                        ? "text-cyan-400 border-cyan-400/30 shadow-cyan-400/20"
                        : "text-green-400 border-green-400/30 shadow-green-400/20",
          )}
        >
          {label}
        </div>

        {/* Digital glow effect */}
        <div
          className={cn(
            "absolute inset-0 text-sm uppercase tracking-widest font-mono font-bold px-4 py-2 rounded-lg blur-sm opacity-30",
            color === "blue-400"
              ? "text-blue-400"
              : color === "green-400"
                ? "text-green-400"
                : color === "purple-400"
                  ? "text-purple-400"
                  : color === "red-400"
                    ? "text-red-400"
                    : color === "yellow-400"
                      ? "text-yellow-400"
                      : color === "cyan-400"
                        ? "text-cyan-400"
                        : "text-green-400",
          )}
        >
          {label}
        </div>
      </div>
    </div>
  );
};
