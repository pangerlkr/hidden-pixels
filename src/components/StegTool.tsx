import { useState, useRef, useCallback } from "react";
import { Lock, Unlock, Download, Copy, RotateCcw, Eye, EyeOff, Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ImageDropZone from "./ImageDropZone";
import { encodeMessage, decodeMessage, getMaxMessageLength } from "@/lib/steganography";

const StegTool = () => {
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  // Encode state
  const [encodeImage, setEncodeImage] = useState<HTMLImageElement | null>(null);
  const [encodePreview, setEncodePreview] = useState<string | null>(null);
  const [secretMessage, setSecretMessage] = useState("");
  const [encodedUrl, setEncodedUrl] = useState<string | null>(null);
  const [maxChars, setMaxChars] = useState(0);
  const [isEncoding, setIsEncoding] = useState(false);

  // Decode state
  const [decodePreview, setDecodePreview] = useState<string | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleEncodeImageLoad = useCallback((img: HTMLImageElement) => {
    setEncodeImage(img);
    setEncodePreview(img.src);
    setEncodedUrl(null);
    setMaxChars(getMaxMessageLength(img.width, img.height));
  }, []);

  const handleEncode = useCallback(() => {
    if (!encodeImage || !secretMessage.trim()) {
      toast.error("Provide an image and a secret message.");
      return;
    }

    setIsEncoding(true);
    setTimeout(() => {
      try {
        const canvas = canvasRef.current!;
        canvas.width = encodeImage.width;
        canvas.height = encodeImage.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(encodeImage, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const encoded = encodeMessage(imageData, secretMessage);
        ctx.putImageData(encoded, 0, 0);
        const url = canvas.toDataURL("image/png");
        setEncodedUrl(url);
        toast.success("Message encoded successfully!");
      } catch (err: any) {
        toast.error(err.message || "Encoding failed.");
      } finally {
        setIsEncoding(false);
      }
    }, 100);
  }, [encodeImage, secretMessage]);

  const handleDecodeImageLoad = useCallback((img: HTMLImageElement) => {
    setDecodePreview(img.src);
    setDecodedMessage(null);
    setShowMessage(false);
    setIsDecoding(true);

    setTimeout(() => {
      try {
        const canvas = canvasRef.current!;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const message = decodeMessage(imageData);
        setDecodedMessage(message || null);
        if (message) {
          toast.success("Hidden message found!");
        } else {
          toast.info("No hidden message detected.");
        }
      } catch {
        toast.error("Failed to decode image.");
      } finally {
        setIsDecoding(false);
      }
    }, 100);
  }, []);

  const downloadImage = () => {
    if (!encodedUrl) return;
    const a = document.createElement("a");
    a.href = encodedUrl;
    a.download = "stego-image.png";
    a.click();
  };

  const copyMessage = () => {
    if (!decodedMessage) return;
    navigator.clipboard.writeText(decodedMessage);
    toast.success("Copied to clipboard!");
  };

  const reset = (target: "encode" | "decode") => {
    if (target === "encode") {
      setEncodeImage(null);
      setEncodePreview(null);
      setSecretMessage("");
      setEncodedUrl(null);
      setMaxChars(0);
    } else {
      setDecodePreview(null);
      setDecodedMessage(null);
      setShowMessage(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <canvas ref={canvasRef} className="hidden" />

      <Tabs value={mode} onValueChange={(v) => setMode(v as "encode" | "decode")} className="w-full">
        <TabsList className="w-full bg-secondary border border-border">
          <TabsTrigger value="encode" className="flex-1 gap-2 font-mono data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Lock className="w-4 h-4" />
            Encode
          </TabsTrigger>
          <TabsTrigger value="decode" className="flex-1 gap-2 font-mono data-[state=active]:bg-accent/10 data-[state=active]:text-accent">
            <Unlock className="w-4 h-4" />
            Decode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Step 1 — Select carrier image
            </h3>
            {encodePreview && (
              <Button variant="ghost" size="sm" onClick={() => reset("encode")} className="text-muted-foreground hover:text-foreground">
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            )}
          </div>

          <ImageDropZone
            onImageLoad={handleEncodeImageLoad}
            label="Drop your carrier image here"
            previewUrl={encodePreview}
          />

          {encodeImage && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
                  Step 2 — Enter secret message
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {secretMessage.length} / {maxChars} chars
                </span>
              </div>

              <Textarea
                placeholder="Type your secret message..."
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                className="font-mono bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[100px] resize-none focus:ring-primary/50"
                maxLength={maxChars}
              />

              <Button
                onClick={handleEncode}
                disabled={!secretMessage.trim() || isEncoding}
                className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isEncoding ? "Encoding..." : "Encode Message"}
              </Button>
            </>
          )}

          {encodedUrl && (
            <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-primary/20">
              <div className="flex items-center gap-2 text-primary text-sm font-mono">
                <Eye className="w-4 h-4" />
                Encoded image ready
              </div>
              <img src={encodedUrl} alt="Encoded" className="max-h-[200px] object-contain rounded mx-auto" />
              <Button onClick={downloadImage} className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Download Stego Image
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="decode" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
              Upload image to decode
            </h3>
            {decodePreview && (
              <Button variant="ghost" size="sm" onClick={() => reset("decode")} className="text-muted-foreground hover:text-foreground">
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            )}
          </div>

          <ImageDropZone
            onImageLoad={handleDecodeImageLoad}
            label="Drop a stego image to reveal its secret"
            previewUrl={decodePreview}
          />

          {isDecoding && (
            <div className="text-center py-4">
              <p className="text-sm font-mono text-muted-foreground animate-pulse-glow">Scanning for hidden data...</p>
            </div>
          )}

          {decodedMessage !== null && !isDecoding && (
            <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-accent/20">
              <div className="flex items-center justify-between">
                <span className="text-accent text-sm font-mono flex items-center gap-2">
                  <Unlock className="w-4 h-4" />
                  Hidden message found
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setShowMessage(!showMessage)} className="text-muted-foreground hover:text-foreground">
                    {showMessage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyMessage} className="text-muted-foreground hover:text-foreground">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className={`font-mono text-sm p-3 rounded bg-background border border-border transition-all ${showMessage ? "" : "blur-sm select-none"}`}>
                {decodedMessage}
              </div>
            </div>
          )}

          {decodedMessage === null && decodePreview && !isDecoding && (
            <div className="text-center py-4 text-muted-foreground text-sm font-mono">
              No hidden message detected in this image.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Section */}
      <div className="mt-8 p-4 rounded-lg bg-secondary/30 border border-border">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground font-mono space-y-1">
            <p><strong className="text-foreground">How it works:</strong> LSB steganography replaces the least significant bit of each color channel in every pixel. This change is imperceptible to the human eye but encodes binary data.</p>
            <p>Use <strong className="text-foreground">PNG or BMP</strong> formats — JPEG compression destroys hidden data.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StegTool;
