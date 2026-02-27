import { useState, useRef, useCallback, useEffect } from "react";
import { SlidersHorizontal, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCompareSliderProps {
  originalSrc: string;
  encodedSrc: string;
}

type ViewMode = "compare" | "diff";

const ImageCompareSlider = ({ originalSrc, encodedSrc }: ImageCompareSliderProps) => {
  const [position, setPosition] = useState(50);
  const [viewMode, setViewMode] = useState<ViewMode>("compare");
  const [diffSrc, setDiffSrc] = useState<string | null>(null);
  const [diffStats, setDiffStats] = useState<{ changed: number; total: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Generate amplified diff image
  useEffect(() => {
    const origImg = new Image();
    const encImg = new Image();
    let cancelled = false;

    origImg.onload = () => {
      encImg.onload = () => {
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        canvas.width = origImg.width;
        canvas.height = origImg.height;
        const ctx = canvas.getContext("2d")!;

        // Draw original, get data
        ctx.drawImage(origImg, 0, 0);
        const origData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Draw encoded, get data
        ctx.drawImage(encImg, 0, 0);
        const encData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Create diff image
        const diffData = ctx.createImageData(canvas.width, canvas.height);
        let changedPixels = 0;
        const totalPixels = canvas.width * canvas.height;

        for (let i = 0; i < origData.data.length; i += 4) {
          const rDiff = Math.abs((origData.data[i] & 1) - (encData.data[i] & 1));
          const gDiff = Math.abs((origData.data[i + 1] & 1) - (encData.data[i + 1] & 1));
          const bDiff = Math.abs((origData.data[i + 2] & 1) - (encData.data[i + 2] & 1));

          const hasChange = rDiff + gDiff + bDiff > 0;

          if (hasChange) {
            changedPixels++;
            // Amplify: green for changed pixels, intensity based on channels changed
            const intensity = (rDiff + gDiff + bDiff) / 3;
            diffData.data[i] = rDiff ? 255 : 0;       // R channel diff → red
            diffData.data[i + 1] = gDiff ? 255 : 0;   // G channel diff → green
            diffData.data[i + 2] = bDiff ? 255 : 0;    // B channel diff → blue
            diffData.data[i + 3] = 180 + Math.round(intensity * 75);
          } else {
            // Darken unchanged pixels
            diffData.data[i] = encData.data[i] * 0.15;
            diffData.data[i + 1] = encData.data[i + 1] * 0.15;
            diffData.data[i + 2] = encData.data[i + 2] * 0.15;
            diffData.data[i + 3] = 255;
          }
        }

        ctx.putImageData(diffData, 0, 0);
        setDiffSrc(canvas.toDataURL("image/png"));
        setDiffStats({ changed: changedPixels, total: totalPixels });
      };
      encImg.src = encodedSrc;
    };
    origImg.src = originalSrc;

    return () => { cancelled = true; };
  }, [originalSrc, encodedSrc]);

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
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          <Button
            variant={viewMode === "compare" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("compare")}
            className="h-7 text-xs font-mono gap-1.5"
          >
            <SlidersHorizontal className="w-3 h-3" />
            Compare
          </Button>
          <Button
            variant={viewMode === "diff" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("diff")}
            className="h-7 text-xs font-mono gap-1.5"
          >
            <Zap className="w-3 h-3" />
            Pixel Diff
          </Button>
        </div>
        {viewMode === "diff" && diffStats && (
          <span className="text-[10px] font-mono text-primary">
            {diffStats.changed.toLocaleString()} / {diffStats.total.toLocaleString()} pixels modified ({((diffStats.changed / diffStats.total) * 100).toFixed(2)}%)
          </span>
        )}
        {viewMode === "compare" && (
          <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Drag to compare
          </span>
        )}
      </div>

      {viewMode === "compare" ? (
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden rounded-lg border border-border cursor-col-resize select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img src={encodedSrc} alt="Encoded" className="block w-full h-auto" draggable={false} />
          <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
            <img src={originalSrc} alt="Original" className="block w-full h-auto" draggable={false} />
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_8px_hsl(150_100%_50%/0.5)]"
            style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <SlidersHorizontal className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
          {/* Labels */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-background/80 text-[10px] font-mono text-muted-foreground">Original</div>
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-background/80 text-[10px] font-mono text-muted-foreground">Encoded</div>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden rounded-lg border border-border">
          {diffSrc ? (
            <img src={diffSrc} alt="Pixel difference" className="block w-full h-auto" draggable={false} />
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground font-mono text-sm animate-pulse">
              Generating diff...
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
        {viewMode === "compare" ? (
          <span>Visually identical — LSB changes are imperceptible to the human eye.</span>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-red-500" /> R-channel</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-green-500" /> G-channel</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-blue-500" /> B-channel</span>
            <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-muted" /> Unchanged</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompareSlider;
