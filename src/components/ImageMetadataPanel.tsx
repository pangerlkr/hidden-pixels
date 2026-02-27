import { useMemo } from "react";
import { FileImage, Ruler, HardDrive, Palette } from "lucide-react";

interface ImageMetadataPanelProps {
  image: HTMLImageElement;
  file: File | null;
}

const ImageMetadataPanel = ({ image, file }: ImageMetadataPanelProps) => {
  const metadata = useMemo(() => {
    const w = image.width;
    const h = image.height;
    const megapixels = ((w * h) / 1_000_000).toFixed(1);
    const aspectGcd = gcd(w, h);
    const aspectRatio = `${w / aspectGcd}:${h / aspectGcd}`;
    const bitDepth = "8-bit (RGBA)";
    const totalPixels = (w * h).toLocaleString();

    let fileSize = "—";
    let fileType = "—";
    let fileName = "—";
    if (file) {
      fileSize = formatBytes(file.size);
      fileType = file.type || "unknown";
      fileName = file.name;
    }

    return { w, h, megapixels, aspectRatio, bitDepth, totalPixels, fileSize, fileType, fileName };
  }, [image, file]);

  const items = [
    { icon: Ruler, label: "Dimensions", value: `${metadata.w} × ${metadata.h} px` },
    { icon: FileImage, label: "Megapixels", value: `${metadata.megapixels} MP` },
    { icon: Ruler, label: "Aspect Ratio", value: metadata.aspectRatio },
    { icon: Palette, label: "Color Depth", value: metadata.bitDepth },
    { icon: HardDrive, label: "File Size", value: metadata.fileSize },
    { icon: FileImage, label: "Format", value: metadata.fileType.split("/")[1]?.toUpperCase() || "—" },
  ];

  return (
    <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
        Image Metadata
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs font-mono">
            <item.icon className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{item.label}:</span>
            <span className="text-foreground truncate">{item.value}</span>
          </div>
        ))}
      </div>
      {metadata.fileName !== "—" && (
        <p className="text-[10px] font-mono text-muted-foreground truncate">
          {metadata.fileName}
        </p>
      )}
    </div>
  );
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default ImageMetadataPanel;
