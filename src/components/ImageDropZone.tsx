import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";

interface ImageDropZoneProps {
  onImageLoad: (img: HTMLImageElement, file: File) => void;
  label: string;
  previewUrl?: string | null;
}

const ImageDropZone = ({ onImageLoad, label, previewUrl }: ImageDropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const img = new Image();
    img.onload = () => onImageLoad(img, file);
    img.src = URL.createObjectURL(file);
  }, [onImageLoad]);

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
        accept="image/png,image/bmp"
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
            <p className="text-xs text-muted-foreground mt-1">PNG or BMP • Drag & drop or click</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropZone;
