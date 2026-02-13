import { useRef, useEffect, useState, useCallback } from "react";
import type { Restaurant, WheelSlice } from "../types";
import { WHEEL_COLORS } from "../utils/constants";

interface SpinWheelProps {
  restaurants: Restaurant[];
  onResult: (restaurant: Restaurant) => void;
  spinning: boolean;
  onSpinEnd: () => void;
}

function buildSlices(restaurants: Restaurant[]): WheelSlice[] {
  const sliceAngle = (2 * Math.PI) / restaurants.length;
  return restaurants.map((restaurant, i) => ({
    restaurant,
    color: WHEEL_COLORS[i % WHEEL_COLORS.length],
    startAngle: i * sliceAngle,
    endAngle: (i + 1) * sliceAngle,
  }));
}

export function SpinWheel({
  restaurants,
  onResult,
  spinning,
  onSpinEnd,
}: SpinWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationRef = useRef<number>(0);
  const [slices, setSlices] = useState<WheelSlice[]>([]);

  useEffect(() => {
    setSlices(buildSlices(restaurants));
  }, [restaurants]);

  const drawWheel = useCallback(
    (ctx: CanvasRenderingContext2D, size: number, rotation: number) => {
      const center = size / 2;
      const radius = center - 10;

      ctx.clearRect(0, 0, size, size);

      if (slices.length === 0) {
        ctx.fillStyle = "#2d2d2d";
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("No restaurants", center, center);
        return;
      }

      slices.forEach((slice) => {
        const start = slice.startAngle + rotation;
        const end = slice.endAngle + rotation;

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, start, end);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(start + (end - start) / 2);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "right";
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 3;
        const label =
          slice.restaurant.name.length > 18
            ? slice.restaurant.name.slice(0, 16) + "..."
            : slice.restaurant.name;
        ctx.fillText(label, radius - 15, 5);
        ctx.restore();
      });

      // Center circle
      ctx.beginPath();
      ctx.arc(center, center, 22, 0, 2 * Math.PI);
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      ctx.strokeStyle = "#FFD43B";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Pointer (top)
      ctx.beginPath();
      ctx.moveTo(center - 12, 2);
      ctx.lineTo(center + 12, 2);
      ctx.lineTo(center, 28);
      ctx.closePath();
      ctx.fillStyle = "#FFD43B";
      ctx.fill();
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 2;
      ctx.stroke();
    },
    [slices]
  );

  // Render static wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawWheel(ctx, canvas.width, rotationRef.current);
  }, [drawWheel]);

  // Spin animation
  useEffect(() => {
    if (!spinning || slices.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const winnerIndex = Math.floor(Math.random() * slices.length);
    const sliceAngle = (2 * Math.PI) / slices.length;
    const targetAngle =
      -(winnerIndex * sliceAngle + sliceAngle / 2) - Math.PI / 2;
    const extraSpins = (4 + Math.random() * 2) * 2 * Math.PI;
    const totalRotation = targetAngle + extraSpins - rotationRef.current;

    const duration = 3000 + Math.random() * 2000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    function easeOutCubic(t: number): number {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      rotationRef.current = startRotation + totalRotation * eased;
      drawWheel(ctx!, canvas!.width, rotationRef.current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        onResult(slices[winnerIndex].restaurant);
        onSpinEnd();
      }
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [spinning, slices, drawWheel, onResult, onSpinEnd]);

  return (
    <canvas
      ref={canvasRef}
      width={380}
      height={380}
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}
