import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface Node {
  id: string;
  status: "active" | "maintenance" | "idle" | "error";
  cpu: number;
  memory: number;
  jobs: number;
  rack: number;
  slot: number;
}

interface ServerRack3DProps {
  nodes: Node[];
  className?: string;
}

export const ServerRack3D = ({ nodes, className }: ServerRack3DProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "active":
          return "#10b981"; // emerald
        case "maintenance":
          return "#f59e0b"; // amber
        case "idle":
          return "#06b6d4"; // cyan
        case "error":
          return "#ef4444"; // red
        default:
          return "#6b7280"; // gray
      }
    };

    const draw3DServer = (
      x: number,
      y: number,
      width: number,
      height: number,
      depth: number,
      node: Node,
    ) => {
      const color = getStatusColor(node.status);

      // Server front face
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x, y, width, height);

      // Server top face (3D effect)
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + depth, y - depth);
      ctx.lineTo(x + width + depth, y - depth);
      ctx.lineTo(x + width, y);
      ctx.closePath();
      ctx.fill();

      // Server right face (3D effect)
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(x + width, y);
      ctx.lineTo(x + width + depth, y - depth);
      ctx.lineTo(x + width + depth, y + height - depth);
      ctx.lineTo(x + width, y + height);
      ctx.closePath();
      ctx.fill();

      // Server outline
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // CPU/Memory indicators (small rectangles)
      const cpuWidth = (width * node.cpu) / 100;
      const memoryWidth = (width * node.memory) / 100;

      ctx.fillStyle = "#00ffff";
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x + 5, y + height - 15, cpuWidth - 10, 4);

      ctx.fillStyle = "#00ff88";
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x + 5, y + height - 8, memoryWidth - 10, 4);

      // Node ID text
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.font = "10px JetBrains Mono";
      ctx.textAlign = "center";
      ctx.fillText(node.id.split("-")[1], x + width / 2, y + height / 2 + 2);

      // Jobs indicator
      if (node.jobs > 0) {
        ctx.fillStyle = "#ff6b6b";
        ctx.beginPath();
        ctx.arc(x + width - 8, y + 8, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "8px JetBrains Mono";
        ctx.textAlign = "center";
        ctx.fillText(node.jobs.toString(), x + width - 8, y + 10);
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background grid
      ctx.strokeStyle = "rgba(0, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      // Group nodes by rack
      const racks = nodes.reduce(
        (acc, node) => {
          if (!acc[node.rack]) acc[node.rack] = [];
          acc[node.rack].push(node);
          return acc;
        },
        {} as Record<number, Node[]>,
      );

      // Draw racks
      const rackWidth = 120;
      const rackHeight = 200;
      const serverHeight = 25;
      const serverDepth = 10;
      const rackSpacing = 150;

      Object.keys(racks).forEach((rackId, rackIndex) => {
        const rackNodes = racks[parseInt(rackId)];
        const rackX = 50 + rackIndex * rackSpacing;
        const rackY = (canvas.height - rackHeight) / 2;

        // Draw rack frame
        ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
        ctx.lineWidth = 2;
        ctx.strokeRect(rackX - 10, rackY - 10, rackWidth + 20, rackHeight + 20);

        // Rack label
        ctx.fillStyle = "#00ffff";
        ctx.font = "12px JetBrains Mono";
        ctx.textAlign = "center";
        ctx.fillText(`Rack ${rackId}`, rackX + rackWidth / 2, rackY - 20);

        // Draw servers in rack
        rackNodes
          .sort((a, b) => a.slot - b.slot)
          .forEach((node, slotIndex) => {
            const serverY = rackY + slotIndex * (serverHeight + 5);
            draw3DServer(
              rackX,
              serverY,
              rackWidth,
              serverHeight,
              serverDepth,
              node,
            );
          });

        // Rack utilization bar
        const totalCpu = rackNodes.reduce((sum, node) => sum + node.cpu, 0);
        const avgCpu = totalCpu / rackNodes.length;
        const utilizationHeight = (rackHeight * avgCpu) / 100;

        ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
        ctx.fillRect(
          rackX + rackWidth + 15,
          rackY + rackHeight - utilizationHeight,
          10,
          utilizationHeight,
        );

        ctx.fillStyle = "#00ffff";
        ctx.font = "10px JetBrains Mono";
        ctx.textAlign = "center";
        ctx.fillText(
          `${Math.round(avgCpu)}%`,
          rackX + rackWidth + 20,
          rackY + rackHeight + 15,
        );
      });

      // Draw connections between racks (network visualization)
      if (Object.keys(racks).length > 1) {
        const rackPositions = Object.keys(racks).map((rackId, index) => ({
          x: 50 + index * rackSpacing + rackWidth / 2,
          y: canvas.height / 2,
        }));

        ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        for (let i = 0; i < rackPositions.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(rackPositions[i].x, rackPositions[i].y);
          ctx.lineTo(rackPositions[i + 1].x, rackPositions[i + 1].y);
          ctx.stroke();

          // Animated data flow
          const time = Date.now() * 0.001;
          const flowX =
            rackPositions[i].x +
            ((rackPositions[i + 1].x - rackPositions[i].x) *
              (Math.sin(time + i) + 1)) /
              2;

          ctx.fillStyle = "#00ffff";
          ctx.beginPath();
          ctx.arc(flowX, rackPositions[i].y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [nodes]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 w-full h-full", className)}
    />
  );
};
