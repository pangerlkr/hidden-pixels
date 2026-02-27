import { useState, useRef, useCallback } from "react";
import { SlidersHorizontal } from "lucide-react";

interface ImageCompareSliderProps {
  originalSrc: string;
  encodedSrc: string;
}

const ImageCompareSlider = ({ originalSrc, encodedSrc }: ImageCompareSliderProps) => {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
        <span>Original</span>
        <span className="flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3" />
          Drag to compare
        </span>
        <span>Encoded</span>
      </div>
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border border-border cursor-col-resize select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Encoded (bottom layer) */}
        <img
          src={encodedSrc}
          alt="Encoded"
          className="block w-full h-auto"
          draggable={false}
        />

        {/* Original (top layer, clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        >
          <img
            src={originalSrc}
            alt="Original"
            className="block w-full h-auto"
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_8px_hsl(150_100%_50%/0.5)]"
          style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        >
          {/* Handle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <SlidersHorizontal className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
      <p className="text-[10px] font-mono text-muted-foreground text-center">
        The images are visually identical — the hidden data only changes the least significant bits.
      </p>
    </div>
  );
};

export default ImageCompareSlider;
