import { useState, useRef, useCallback } from "react";
import { Layers, Download, RotateCcw, X, Loader2, KeyRound, CheckCircle2, AlertCircle, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { encodeMessage, getMaxMessageLength } from "@/lib/steganography";
import { encryptText, ENCRYPTED_PREFIX } from "@/lib/crypto";
import JSZip from "jszip";

interface BatchImage {
  id: string;
  file: File;
  img: HTMLImageElement;
  previewUrl: string;
  maxChars: number;
  status: "pending" | "encoding" | "done" | "error";
  error?: string;
  encodedBlob?: Blob;
}

interface BatchEncodeProps {
  onCountChange?: (count: number) => void;
}

const BatchEncode = ({ onCountChange }: BatchEncodeProps) => {
  const [images, _setImages] = useState<BatchImage[]>([]);
  const setImages: typeof _setImages = (update) => {
    _setImages((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      onCountChange?.(next.length);
      return next;
    });
  };
  const [message, setMessage] = useState("");
  const [useEncryption, setUseEncryption] = useState(false);
  const [password, setPassword] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newImages: BatchImage[] = [];
    let loaded = 0;
    const fileArr = Array.from(files).filter(f => f.type.startsWith("image/"));

    if (fileArr.length === 0) return;

    fileArr.forEach((file) => {
      const img = new Image();
      img.onload = () => {
        newImages.push({
          id: crypto.randomUUID(),
          file,
          img,
          previewUrl: img.src,
          maxChars: getMaxMessageLength(img.width, img.height),
          status: "pending",
        });
        loaded++;
        if (loaded === fileArr.length) {
          setImages(prev => [...prev, ...newImages]);
        }
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  }, [handleFiles]);

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
  };

  const handleDragStart = (id: string) => {
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  };

  const handleDragEnd = () => {
    if (draggedId && dragOverId) {
      setImages(prev => {
        const arr = [...prev];
        const fromIdx = arr.findIndex(i => i.id === draggedId);
        const toIdx = arr.findIndex(i => i.id === dragOverId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        const [item] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, item);
        return arr;
      });
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const reset = () => {
    setImages([]);
    setMessage("");
    setPassword("");
    setProgress(0);
  };

  const tooSmall = images.filter(i => {
    const needed = useEncryption ? message.length * 3 : message.length;
    return i.maxChars < needed;
  });

  const handleBatchEncode = useCallback(async () => {
    if (!message.trim() || images.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    let msgToEncode = message;
    if (useEncryption && password) {
      try {
        const encrypted = await encryptText(message, password);
        msgToEncode = ENCRYPTED_PREFIX + encrypted;
      } catch {
        toast.error("Encryption failed.");
        setIsProcessing(false);
        return;
      }
    }

    const canvas = canvasRef.current!;
    const updatedImages = [...images];

    for (let i = 0; i < updatedImages.length; i++) {
      const item = updatedImages[i];
      updatedImages[i] = { ...item, status: "encoding" };
      setImages([...updatedImages]);

      try {
        if (item.maxChars < msgToEncode.length) {
          throw new Error("Image too small for this message");
        }

        canvas.width = item.img.width;
        canvas.height = item.img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(item.img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const encoded = encodeMessage(imageData, msgToEncode);
        ctx.putImageData(encoded, 0, 0);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(b => b ? resolve(b) : reject(new Error("Failed")), "image/png");
        });

        updatedImages[i] = { ...updatedImages[i], status: "done", encodedBlob: blob };
      } catch (err: any) {
        updatedImages[i] = { ...updatedImages[i], status: "error", error: err.message };
      }

      setProgress(((i + 1) / updatedImages.length) * 100);
      setImages([...updatedImages]);
    }

    const successCount = updatedImages.filter(i => i.status === "done").length;
    if (successCount > 0) {
      toast.success(`Encoded ${successCount}/${updatedImages.length} images!`);
    }
    setIsProcessing(false);
  }, [images, message, useEncryption, password]);

  const downloadZip = useCallback(async () => {
    const doneImages = images.filter(i => i.status === "done" && i.encodedBlob);
    if (doneImages.length === 0) return;

    try {
      const zip = new JSZip();
      doneImages.forEach((item, idx) => {
        const name = item.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${name}_stego_${idx + 1}.png`, item.encodedBlob!);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "stego-batch.zip";
      a.click();
      URL.revokeObjectURL(url);

      const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
      toast.success(`ZIP downloaded — ${doneImages.length} images, ${sizeMB} MB`);
    } catch {
      toast.error("Failed to create ZIP file.");
    }
  }, [images]);

  const doneCount = images.filter(i => i.status === "done").length;

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} className="hidden" />

      {/* Drop zone for multiple images */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
          Step 1 — Select images
        </h3>
        {images.length > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        )}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all border-border hover:border-primary/50 hover:bg-secondary/30"
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <Layers className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Drop multiple images here</p>
          <p className="text-xs text-muted-foreground">Select 2+ images • Same message encoded into all</p>
        </div>
      </div>

      {/* Image thumbnails */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {images.map((item) => (
            <div
              key={item.id}
              draggable={item.status === "pending"}
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              onDragLeave={() => setDragOverId(null)}
              className={`relative group rounded-lg overflow-hidden border bg-secondary/50 aspect-square transition-all ${
                dragOverId === item.id ? "border-primary ring-2 ring-primary/30 scale-105" : "border-border"
              } ${draggedId === item.id ? "opacity-40" : ""} ${item.status === "pending" ? "cursor-grab active:cursor-grabbing" : ""}`}
            >
              <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
              {/* Drag handle */}
              {item.status === "pending" && (
                <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-3 h-3 text-muted-foreground" />
                </div>
              )}
              {/* Status overlay */}
              {item.status === "encoding" && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
              )}
              {item.status === "done" && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
              )}
              {item.status === "error" && (
                <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center" title={item.error}>
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
              )}
              {/* Remove button */}
              {item.status === "pending" && (
                <button
                  onClick={() => removeImage(item.id)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-foreground" />
                </button>
              )}
              {/* Size info */}
              <div className="absolute bottom-0 inset-x-0 bg-background/80 px-1 py-0.5 text-[8px] font-mono text-muted-foreground text-center truncate">
                {item.img.width}×{item.img.height}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <>
          {/* Message input */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Step 2 — Enter message
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              {images.length} images selected
            </span>
          </div>

          <Textarea
            placeholder="This message will be hidden in all selected images..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="font-mono bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none focus:ring-primary/50"
          />

          {tooSmall.length > 0 && message.trim() && (
            <p className="text-xs font-mono text-destructive flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              {tooSmall.length} image{tooSmall.length > 1 ? "s" : ""} too small for this message — will be skipped.
            </p>
          )}

          {/* Encryption */}
          <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-mono text-muted-foreground cursor-pointer">
                <KeyRound className="w-4 h-4 text-accent" />
                AES-256 Encryption
              </label>
              <Switch checked={useEncryption} onCheckedChange={setUseEncryption} />
            </div>
            {useEncryption && (
              <Input
                type="password"
                placeholder="Encryption password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="font-mono bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-accent/50"
              />
            )}
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs font-mono text-muted-foreground text-center">
                Encoding... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleBatchEncode}
              disabled={!message.trim() || isProcessing || (useEncryption && !password)}
              className="flex-1 font-mono bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
            >
              <Layers className="w-4 h-4 mr-2" />
              {isProcessing ? "Encoding..." : `Encode ${images.length} Images`}
            </Button>

            {doneCount > 0 && (
              <Button
                onClick={downloadZip}
                className="flex-1 font-mono bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download ZIP ({doneCount})
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BatchEncode;
