import { useState, useRef, useCallback } from "react";
import { Lock, Unlock, Download, Copy, RotateCcw, Eye, EyeOff, Info, Gauge, AlertTriangle, Share2, KeyRound, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import ImageDropZone from "./ImageDropZone";
import ImageCompareSlider from "./ImageCompareSlider";
import { encodeMessage, decodeMessage, getMaxMessageLength } from "@/lib/steganography";
import { encryptText, decryptText, ENCRYPTED_PREFIX, isEncrypted } from "@/lib/crypto";
import { supabase } from "@/integrations/supabase/client";

const StegTool = () => {
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  // Encode state
  const [encodeImage, setEncodeImage] = useState<HTMLImageElement | null>(null);
  const [encodePreview, setEncodePreview] = useState<string | null>(null);
  const [secretMessage, setSecretMessage] = useState("");
  const [encodedUrl, setEncodedUrl] = useState<string | null>(null);
  const [maxChars, setMaxChars] = useState(0);
  const [isEncoding, setIsEncoding] = useState(false);

  // Encryption state
  const [useEncryption, setUseEncryption] = useState(false);
  const [encodePassword, setEncodePassword] = useState("");

  // Share state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // Decode state
  const [decodePreview, setDecodePreview] = useState<string | null>(null);
  const [decodedMessage, setDecodedMessage] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Decode encryption state
  const [decodePassword, setDecodePassword] = useState("");
  const [decryptedMessage, setDecryptedMessage] = useState<string | null>(null);
  const [isMessageEncrypted, setIsMessageEncrypted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleEncodeImageLoad = useCallback((img: HTMLImageElement) => {
    setEncodeImage(img);
    setEncodePreview(img.src);
    setEncodedUrl(null);
    setShareUrl(null);
    setMaxChars(getMaxMessageLength(img.width, img.height));
  }, []);

  const handleEncode = useCallback(async () => {
    if (!encodeImage || !secretMessage.trim()) {
      toast.error("Provide an image and a secret message.");
      return;
    }

    setIsEncoding(true);
    try {
      let messageToEncode = secretMessage;
      if (useEncryption && encodePassword) {
        const encrypted = await encryptText(secretMessage, encodePassword);
        messageToEncode = ENCRYPTED_PREFIX + encrypted;
      }

      const canvas = canvasRef.current!;
      canvas.width = encodeImage.width;
      canvas.height = encodeImage.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(encodeImage, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const encoded = encodeMessage(imageData, messageToEncode);
      ctx.putImageData(encoded, 0, 0);
      const url = canvas.toDataURL("image/png");
      setEncodedUrl(url);
      setShareUrl(null);
      toast.success("Message encoded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Encoding failed.");
    } finally {
      setIsEncoding(false);
    }
  }, [encodeImage, secretMessage, useEncryption, encodePassword]);

  const handleDecodeImageLoad = useCallback((img: HTMLImageElement) => {
    setDecodePreview(img.src);
    setDecodedMessage(null);
    setDecryptedMessage(null);
    setIsMessageEncrypted(false);
    setShowMessage(false);
    setDecodePassword("");
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
        if (message && isEncrypted(message)) {
          setDecodedMessage(message);
          setIsMessageEncrypted(true);
          toast.success("Encrypted message found! Enter password to decrypt.");
        } else {
          setDecodedMessage(message || null);
          setIsMessageEncrypted(false);
          if (message) {
            toast.success("Hidden message found!");
          } else {
            toast.info("No hidden message detected.");
          }
        }
      } catch {
        toast.error("Failed to decode image.");
      } finally {
        setIsDecoding(false);
      }
    }, 100);
  }, []);

  const handleDecrypt = useCallback(async () => {
    if (!decodedMessage || !decodePassword) return;
    try {
      const encData = decodedMessage.slice(ENCRYPTED_PREFIX.length);
      const plaintext = await decryptText(encData, decodePassword);
      setDecryptedMessage(plaintext);
      toast.success("Message decrypted!");
    } catch {
      toast.error("Wrong password or corrupted data.");
    }
  }, [decodedMessage, decodePassword]);

  const handleShare = useCallback(async () => {
    if (!encodedUrl) return;
    setIsSharing(true);
    try {
      const { data, error } = await supabase
        .from("shared_images")
        .insert({ image_data: encodedUrl })
        .select("id")
        .single();
      if (error) throw error;
      const url = `${window.location.origin}/shared/${data.id}`;
      setShareUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success("Share link copied! Valid for 7 days.");
    } catch (err: any) {
      toast.error("Failed to create share link.");
    } finally {
      setIsSharing(false);
    }
  }, [encodedUrl]);

  const downloadImage = () => {
    if (!encodedUrl) return;
    const a = document.createElement("a");
    a.href = encodedUrl;
    a.download = "stego-image.png";
    a.click();
  };

  const copyMessage = () => {
    const msg = decryptedMessage || decodedMessage;
    if (!msg) return;
    const text = isMessageEncrypted && !decryptedMessage ? msg : (decryptedMessage || msg);
    navigator.clipboard.writeText(isMessageEncrypted ? (decryptedMessage || "") : msg);
    toast.success("Copied to clipboard!");
  };

  const reset = (target: "encode" | "decode") => {
    if (target === "encode") {
      setEncodeImage(null);
      setEncodePreview(null);
      setSecretMessage("");
      setEncodedUrl(null);
      setMaxChars(0);
      setUseEncryption(false);
      setEncodePassword("");
      setShareUrl(null);
    } else {
      setDecodePreview(null);
      setDecodedMessage(null);
      setDecryptedMessage(null);
      setIsMessageEncrypted(false);
      setShowMessage(false);
      setDecodePassword("");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <canvas ref={canvasRef} className="hidden" />

      {/* Sharing Warning */}
      <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div className="text-xs font-mono space-y-1">
            <p className="text-sm font-semibold text-destructive">Do not share via WhatsApp, Instagram, or Twitter</p>
            <p className="text-muted-foreground">
              These platforms re-compress images to JPEG, which <strong className="text-foreground">destroys hidden data</strong>. 
              Instead, use the <strong className="text-primary">Share Link</strong> button below, or send the PNG as a 
              <strong className="text-foreground"> document attachment</strong> (not photo).
            </p>
          </div>
        </div>
      </div>

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

              {/* Encryption Toggle */}
              <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-mono text-muted-foreground cursor-pointer">
                    <KeyRound className="w-4 h-4 text-accent" />
                    AES-256 Password Encryption
                  </label>
                  <Switch checked={useEncryption} onCheckedChange={setUseEncryption} />
                </div>
                {useEncryption && (
                  <div className="space-y-1">
                    <Input
                      type="password"
                      placeholder="Enter encryption password..."
                      value={encodePassword}
                      onChange={(e) => setEncodePassword(e.target.value)}
                      className="font-mono bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-accent/50"
                    />
                    <p className="text-[10px] text-muted-foreground font-mono">
                      The recipient will need this password to read the message.
                    </p>
                  </div>
                )}
              </div>

              {/* Capacity Meter */}
              {(() => {
                const bitsUsed = secretMessage.length * 8 + 24;
                const totalBits = (encodeImage!.width * encodeImage!.height) * 3;
                const pct = Math.min((bitsUsed / totalBits) * 100, 100);
                const color = pct > 90 ? "bg-destructive" : pct > 60 ? "bg-accent" : "bg-primary";
                const colorText = pct > 90 ? "text-destructive" : pct > 60 ? "text-accent" : "text-primary";
                return (
                  <div className="space-y-2 p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Gauge className="w-3.5 h-3.5" />
                        Bit Capacity
                      </span>
                      <span className={colorText}>
                        {pct.toFixed(1)}% used
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-background overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                      <span>{(bitsUsed).toLocaleString()} bits used</span>
                      <span>{totalBits.toLocaleString()} bits total</span>
                    </div>
                  </div>
                );
              })()}

              <Button
                onClick={handleEncode}
                disabled={!secretMessage.trim() || isEncoding || (useEncryption && !encodePassword)}
                className="w-full font-mono bg-primary text-primary-foreground hover:bg-primary/90 glow-primary"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isEncoding ? "Encoding..." : useEncryption ? "Encrypt & Encode" : "Encode Message"}
              </Button>
            </>
          )}

          {encodedUrl && encodePreview && (
            <div className="space-y-3 p-4 rounded-lg bg-secondary/50 border border-primary/20">
              <div className="flex items-center gap-2 text-primary text-sm font-mono">
                <Eye className="w-4 h-4" />
                Encoded image ready
              </div>
              <ImageCompareSlider originalSrc={encodePreview} encodedSrc={encodedUrl} />
              <div className="flex gap-2">
                <Button onClick={downloadImage} className="flex-1 font-mono bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </Button>
                <Button
                  onClick={handleShare}
                  disabled={isSharing}
                  variant="outline"
                  className="flex-1 font-mono border-accent text-accent hover:bg-accent/10"
                >
                  {isSharing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Share2 className="w-4 h-4 mr-2" />}
                  {isSharing ? "Sharing..." : "Share Link"}
                </Button>
              </div>
              {shareUrl && (
                <div className="p-2 rounded bg-background border border-border">
                  <p className="text-[10px] text-muted-foreground font-mono mb-1">Share this link (expires in 7 days):</p>
                  <p className="text-xs text-primary font-mono break-all select-all">{shareUrl}</p>
                </div>
              )}
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
                  {isMessageEncrypted ? "Encrypted message found" : "Hidden message found"}
                </span>
                {!isMessageEncrypted && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setShowMessage(!showMessage)} className="text-muted-foreground hover:text-foreground">
                      {showMessage ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={copyMessage} className="text-muted-foreground hover:text-foreground">
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {isMessageEncrypted && !decryptedMessage ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                    <KeyRound className="w-3.5 h-3.5 text-accent" />
                    This message is AES-256 encrypted. Enter the password to decrypt.
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Password..."
                      value={decodePassword}
                      onChange={(e) => setDecodePassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleDecrypt()}
                      className="font-mono bg-background border-border text-foreground placeholder:text-muted-foreground focus:ring-accent/50"
                    />
                    <Button onClick={handleDecrypt} disabled={!decodePassword} className="font-mono bg-accent text-accent-foreground hover:bg-accent/90">
                      Decrypt
                    </Button>
                  </div>
                </div>
              ) : isMessageEncrypted && decryptedMessage ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-primary font-mono flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Decrypted
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
                    {decryptedMessage}
                  </div>
                </div>
              ) : (
                <div className={`font-mono text-sm p-3 rounded bg-background border border-border transition-all ${showMessage ? "" : "blur-sm select-none"}`}>
                  {decodedMessage}
                </div>
              )}
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
            <p><strong className="text-foreground">Encryption:</strong> Optionally encrypt your message with AES-256-GCM before encoding for double security.</p>
            <p><strong className="text-foreground">Sharing:</strong> Use the Share Link button to generate a safe link that preserves the original PNG.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StegTool;
