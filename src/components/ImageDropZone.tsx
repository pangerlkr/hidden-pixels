import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageDropZoneProps {
  onImageLoad: (img: HTMLImageElement, file: File) => void;
  label: string;
  previewUrl?: string | null;
}

const LOSSY_TYPES = ["image/jpeg", "image/webp", "image/gif"];

const ImageDropZone = ({ onImageLoad, label, previewUrl }: ImageDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [jpegWarning, setJpegWarning] = useState<{ file: File; img: HTMLImageElement } | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;

    const img = new Image();
    img.onload = () => {
      if (LOSSY_TYPES.includes(file.type)) {
        setJpegWarning({ file, img });
      } else {
        setJpegWarning(null);
        onImageLoad(img, file);
      }
    };
    img.src = URL.createObjectURL(file);
  }, [onImageLoad]);

  const convertToPng = useCallback(() => {
    if (!jpegWarning) return;
    setIsConverting(true);
    const { img } = jpegWarning;
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngFile = new File([blob], "converted.png", { type: "image/png" });
      const pngImg = new Image();
      pngImg.onload = () => {
        setJpegWarning(null);
        setIsConverting(false);
        onImageLoad(pngImg, pngFile);
      };
      pngImg.src = URL.createObjectURL(blob);
    }, "image/png");
  }, [jpegWarning, onImageLoad]);

  const useAnyway = useCallback(() => {
    if (!jpegWarning) return;
    setJpegWarning(null);
    onImageLoad(jpegWarning.img, jpegWarning.file);
  }, [jpegWarning, onImageLoad]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-300 min-h-[200px] flex items-center justify-center
          ${isDragging
            ? "border-primary bg-primary/5 glow-primary"
            : "border-border hover:border-primary/50 hover:bg-secondary/30"
          }
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-[300px] max-w-full object-contain rounded"
          />
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              {isDragging ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">PNG or BMP recommended • Drag & drop or click</p>
            </div>
          </div>
        )}
      </div>

      {jpegWarning && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <div className="text-xs font-mono space-y-1">
              <p className="text-sm font-semibold text-destructive">
                Lossy format detected ({jpegWarning.file.type.split("/")[1].toUpperCase()})
              </p>
              <p className="text-muted-foreground">
                This format uses lossy compression which can <strong className="text-foreground">corrupt hidden data</strong> when re-saved. 
                Convert to PNG for reliable steganography.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={convertToPng}
              disabled={isConverting}
              size="sm"
              className="flex-1 font-mono bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isConverting ? "animate-spin" : ""}`} />
              {isConverting ? "Converting..." : "Convert to PNG"}
            </Button>
            <Button
              onClick={useAnyway}
              size="sm"
              variant="ghost"
              className="font-mono text-muted-foreground hover:text-foreground"
            >
              Use anyway
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropZone;
