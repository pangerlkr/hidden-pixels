import { useMemo } from "react";
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Crop, Scaling, FileImage, Paintbrush, Shrink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface StrengthIndicatorProps {
  imageWidth: number;
  imageHeight: number;
  messageLength: number;
  maxChars: number;
  encrypted: boolean;
}

interface ThreatLevel {
  label: string;
  icon: React.ReactNode;
  description: string;
  resistance: "immune" | "high" | "low" | "none";
}

const resistanceColor = {
  immune: "text-primary",
  high: "text-primary",
  low: "text-accent",
  none: "text-destructive",
};

const resistanceBg = {
  immune: "bg-primary/15 border-primary/30",
  high: "bg-primary/10 border-primary/20",
  low: "bg-accent/10 border-accent/20",
  none: "bg-destructive/10 border-destructive/20",
};

const resistanceLabel = {
  immune: "Immune",
  high: "Resistant",
  low: "Vulnerable",
  none: "Destroyed",
};

const StrengthIndicator = ({ imageWidth, imageHeight, messageLength, maxChars, encrypted }: StrengthIndicatorProps) => {
  const analysis = useMemo(() => {
    const usagePercent = messageLength / maxChars * 100;
    const totalPixels = imageWidth * imageHeight;
    const isLargeImage = totalPixels > 1_000_000;
    const isLowUsage = usagePercent < 30;

    const threats: ThreatLevel[] = [
      {
        label: "JPEG Conversion",
        icon: <FileImage className="w-3.5 h-3.5" />,
        description: "JPEG lossy compression alters every pixel's LSB. Message is completely destroyed.",
        resistance: "none",
      },
      {
        label: "Scaling / Resize",
        icon: <Scaling className="w-3.5 h-3.5" />,
        description: "Resampling interpolates pixel values, destroying all LSB data regardless of image size.",
        resistance: "none",
      },
      {
        label: "Cropping",
        icon: <Crop className="w-3.5 h-3.5" />,
        description: isLowUsage
          ? "Message uses few pixels concentrated at the top-left. Even minor cropping from that edge destroys data."
          : "Message spans many pixels. Any crop that removes early pixels destroys the sequential data stream.",
        resistance: "none",
      },
      {
        label: "PNG Re-save",
        icon: <FileImage className="w-3.5 h-3.5" />,
        description: "PNG is lossless. Re-saving preserves all pixel data including hidden bits.",
        resistance: "immune",
      },
      {
        label: "Screenshots",
        icon: <Shrink className="w-3.5 h-3.5" />,
        description: "Screenshots may rescale or compress the image, likely destroying LSB data.",
        resistance: "none",
      },
      {
        label: "Color Adjustment",
        icon: <Paintbrush className="w-3.5 h-3.5" />,
        description: "Brightness, contrast, or filter changes modify pixel values and destroy LSBs.",
        resistance: "none",
      },
    ];

    // Overall score
    const immuneCount = threats.filter(t => t.resistance === "immune").length;
    const noneCount = threats.filter(t => t.resistance === "none").length;

    let overallLabel: string;
    let overallColor: string;
    let overallDescription: string;

    if (encrypted) {
      overallLabel = "Encrypted + Fragile";
      overallColor = "text-accent";
      overallDescription = "Message is AES-256 encrypted (unreadable without password) but LSB encoding is fragile against image transformations.";
    } else {
      overallLabel = "Standard LSB — Fragile";
      overallColor = "text-accent";
      overallDescription = "LSB steganography is invisible to the eye but easily destroyed by any image processing. Always share as original PNG.";
    }

    return { threats, overallLabel, overallColor, overallDescription, isLargeImage };
  }, [imageWidth, imageHeight, messageLength, maxChars, encrypted]);

  return (
    <div className="space-y-3 p-3 rounded-lg bg-secondary/50 border border-border">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          Resilience Analysis
        </span>
        <span className={`text-[10px] font-mono font-semibold ${analysis.overallColor}`}>
          {analysis.overallLabel}
        </span>
      </div>

      <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
        {analysis.overallDescription}
      </p>

      <div className="grid grid-cols-2 gap-1.5">
        {analysis.threats.map((threat) => (
          <Tooltip key={threat.label}>
            <TooltipTrigger asChild>
              <div className={`flex items-center gap-2 px-2 py-1.5 rounded border text-[10px] font-mono cursor-help transition-colors ${resistanceBg[threat.resistance]}`}>
                <span className={resistanceColor[threat.resistance]}>{threat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate">{threat.label}</p>
                  <p className={`${resistanceColor[threat.resistance]} font-semibold`}>
                    {resistanceLabel[threat.resistance]}
                  </p>
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[250px] text-xs font-mono">
              {threat.description}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[9px] font-mono text-muted-foreground pt-1 border-t border-border">
        <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-primary" /> Immune</span>
        <span className="flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-accent" /> Vulnerable</span>
        <span className="flex items-center gap-1"><ShieldX className="w-3 h-3 text-destructive" /> Destroyed</span>
      </div>
    </div>
  );
};

export default StrengthIndicator;
