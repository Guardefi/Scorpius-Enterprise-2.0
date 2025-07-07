import React, { useState, useEffect } from "react";

interface HexagonProps {
  x: number;
  y: number;
  value: number;
  size?: number;
}

const Hexagon: React.FC<HexagonProps> = ({ x, y, value, size = 20 }) => {
  const getHexColor = (val: number) => {
    if (val < 0.2) return "#1e40af"; // Blue - Low
    if (val < 0.4) return "#059669"; // Green - Light
    if (val < 0.6) return "#d97706"; // Yellow - Moderate
    if (val < 0.8) return "#dc2626"; // Orange - High
    return "#7c2d12"; // Red - Severe
  };

  const getHexPath = (centerX: number, centerY: number, radius: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const px = centerX + radius * Math.cos(angle);
      const py = centerY + radius * Math.sin(angle);
      points.push(`${px},${py}`);
    }
    return `M ${points.join(" L ")} Z`;
  };

  return (
    <g>
      <path
        d={getHexPath(x, y, size)}
        fill={getHexColor(value)}
        stroke="rgba(0, 255, 255, 0.3)"
        strokeWidth="0.5"
        className="transition-all duration-1000 hover:stroke-cyan-400 hover:stroke-2"
        style={{
          opacity: 0.7 + value * 0.3,
          filter:
            value > 0.7 ? "drop-shadow(0 0 4px rgba(255, 0, 0, 0.5))" : "none",
        }}
      />
      {value > 0.8 && (
        <circle
          cx={x}
          cy={y}
          r="3"
          fill="rgba(255, 255, 255, 0.8)"
          className="animate-pulse"
        />
      )}
    </g>
  );
};

export const HexagonHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<
    { x: number; y: number; value: number; type: string; metadata: any }[]
  >([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [scanLine, setScanLine] = useState(0);

  // Realistic threat data sources
  const threatSources = [
    { name: "Bot Activity", weight: 0.7, pattern: "clustered" },
    { name: "Phishing Attempts", weight: 0.5, pattern: "scattered" },
    { name: "DDoS Origins", weight: 0.9, pattern: "concentrated" },
    { name: "Malware C2", weight: 0.8, pattern: "linear" },
    { name: "Data Exfiltration", weight: 0.6, pattern: "dispersed" },
  ];

  useEffect(() => {
    const generateRealisticHeatmapData = () => {
      const hexagons: {
        x: number;
        y: number;
        value: number;
        type: string;
        metadata: any;
      }[] = [];
      const hexSize = 22;
      const hexWidth = hexSize * 2;
      const hexHeight = hexSize * Math.sqrt(3);

      // Create realistic threat distribution
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 14; col++) {
          const x = col * (hexWidth * 0.75) + 40;
          const y = row * hexHeight + (col % 2) * (hexHeight / 2) + 40;

          let threatValue = 0;
          let primaryThreat = "Normal";

          // Simulate realistic threat patterns
          threatSources.forEach((threat, index) => {
            let contribution = 0;

            switch (threat.pattern) {
              case "clustered":
                // Bot networks cluster around specific regions
                const clusterCenters = [
                  [3, 2],
                  [10, 7],
                  [6, 5],
                ];
                clusterCenters.forEach(([centerX, centerY]) => {
                  const dist = Math.sqrt(
                    (col - centerX) ** 2 + (row - centerY) ** 2,
                  );
                  contribution += Math.exp(-dist * 0.5) * threat.weight;
                });
                break;

              case "scattered":
                // Phishing attempts are more random
                contribution = Math.random() * threat.weight * 0.4;
                break;

              case "concentrated":
                // DDoS from specific points
                if ((col === 8 && row === 3) || (col === 2 && row === 7)) {
                  contribution = threat.weight * (0.8 + Math.random() * 0.2);
                }
                break;

              case "linear":
                // C2 communications follow network paths
                if (Math.abs(col - row * 0.8) < 1.5) {
                  contribution = threat.weight * 0.6;
                }
                break;

              case "dispersed":
                // Data exfiltration is more evenly distributed
                contribution =
                  (Math.sin(col * 0.5) + Math.cos(row * 0.7)) *
                  threat.weight *
                  0.3;
                break;
            }

            if (contribution > threatValue) {
              threatValue = contribution;
              primaryThreat = threat.name;
            }
          });

          // Add temporal variations and network traffic simulation
          const timeVariation =
            Math.sin(Date.now() * 0.0005 + col * 0.3 + row * 0.2) * 0.15;
          threatValue += timeVariation + Math.random() * 0.1;

          // Clamp values
          threatValue = Math.max(0, Math.min(1, threatValue));

          hexagons.push({
            x,
            y,
            value: threatValue,
            type: primaryThreat,
            metadata: {
              connections: Math.floor(Math.random() * 1000),
              packets: Math.floor(Math.random() * 50000),
              bandwidth: (Math.random() * 100).toFixed(1) + " MB/s",
            },
          });
        }
      }

      return hexagons;
    };

    const updateData = () => {
      setHeatmapData(generateRealisticHeatmapData());
      setLastUpdate(new Date());
    };

    // Scanning line animation
    const scanAnimation = setInterval(() => {
      setScanLine((prev) => (prev + 2) % 400);
    }, 50);

    updateData();
    const interval = setInterval(updateData, 3000);
    return () => {
      clearInterval(interval);
      clearInterval(scanAnimation);
    };
  }, []);

  const getThreatLevel = (value: number) => {
    if (value < 0.2) return { level: "LOW", color: "text-blue-400" };
    if (value < 0.4) return { level: "NORMAL", color: "text-green-400" };
    if (value < 0.6) return { level: "ELEVATED", color: "text-yellow-400" };
    if (value < 0.8) return { level: "HIGH", color: "text-orange-400" };
    return { level: "CRITICAL", color: "text-red-400" };
  };

  const averageThreat =
    heatmapData.reduce((sum, hex) => sum + hex.value, 0) / heatmapData.length;
  const maxThreat = Math.max(...heatmapData.map((hex) => hex.value));
  const threatCount = heatmapData.filter((hex) => hex.value > 0.6).length;

  return (
    <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-lg overflow-hidden">
      {/* Hexagon Grid */}
      <div className="relative h-64 w-full">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 250">
          <defs>
            <filter id="hexGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background grid */}
          <rect width="400" height="250" fill="rgba(0, 20, 20, 0.9)" />

          {/* Hexagon cells */}
          {heatmapData.map((hex, i) => (
            <Hexagon key={i} x={hex.x} y={hex.y} value={hex.value} size={18} />
          ))}

          {/* Threat zone highlights */}
          {heatmapData
            .filter((hex) => hex.value > 0.8)
            .map((hex, i) => (
              <circle
                key={`alert-${i}`}
                cx={hex.x}
                cy={hex.y}
                r="25"
                fill="none"
                stroke="rgba(255, 0, 0, 0.4)"
                strokeWidth="2"
                strokeDasharray="4,4"
                className="animate-pulse"
              />
            ))}

          {/* Grid coordinates */}
          <g className="opacity-30">
            {Array.from({ length: 5 }, (_, i) => (
              <line
                key={`v-${i}`}
                x1={50 + i * 80}
                y1={30}
                x2={50 + i * 80}
                y2={220}
                stroke="rgba(0, 255, 255, 0.2)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}
            {Array.from({ length: 4 }, (_, i) => (
              <line
                key={`h-${i}`}
                x1={30}
                y1={50 + i * 50}
                x2={370}
                y2={50 + i * 50}
                stroke="rgba(0, 255, 255, 0.2)"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}
          </g>
        </svg>

        {/* Threat level indicators */}
        <div className="absolute top-2 left-2 space-y-1">
          <div className="text-xs font-mono text-cyan-400 bg-black/60 px-2 py-1 rounded">
            AVG: {(averageThreat * 100).toFixed(1)}%
          </div>
          <div className="text-xs font-mono text-red-400 bg-black/60 px-2 py-1 rounded">
            MAX: {(maxThreat * 100).toFixed(1)}%
          </div>
          <div className="text-xs font-mono text-yellow-400 bg-black/60 px-2 py-1 rounded">
            ALERTS: {threatCount}
          </div>
        </div>

        {/* Current threat level */}
        <div className="absolute top-2 right-2">
          <div
            className={`text-sm font-mono font-bold bg-black/60 px-3 py-2 rounded ${getThreatLevel(averageThreat).color}`}
          >
            {getThreatLevel(averageThreat).level}
          </div>
        </div>

        {/* Scanning beam effect */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-1 h-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent animate-cyber-scan"
            style={{ left: "10%" }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-between items-center text-xs bg-black/40 p-3 rounded">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-3 bg-blue-600 border border-cyan-400/50"
              style={{
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              }}
            ></div>
            <span className="text-blue-400">Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-3 bg-green-600 border border-cyan-400/50"
              style={{
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              }}
            ></div>
            <span className="text-green-400">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-3 bg-yellow-600 border border-cyan-400/50"
              style={{
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              }}
            ></div>
            <span className="text-yellow-400">Elevated</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-3 bg-orange-600 border border-cyan-400/50"
              style={{
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              }}
            ></div>
            <span className="text-orange-400">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-3 bg-red-600 border border-cyan-400/50"
              style={{
                clipPath:
                  "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
              }}
            ></div>
            <span className="text-red-400">Critical</span>
          </div>
        </div>
        <div className="text-muted-foreground font-mono">
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
