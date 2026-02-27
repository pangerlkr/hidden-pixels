import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Shield, Download, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import MatrixBackground from "@/components/MatrixBackground";

const SharedImage = () => {
  const { id } = useParams<{ id: string }>();
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchImage() {
      if (!id) { setError("No image ID"); setLoading(false); return; }
      const { data, error: err } = await supabase
        .from("shared_images")
        .select("image_data, expires_at")
        .eq("id", id)
        .single();
      if (err || !data) {
        setError("Image not found or has expired.");
      } else if (new Date(data.expires_at) < new Date()) {
        setError("This shared image has expired.");
      } else {
        setImageData(data.image_data);
      }
      setLoading(false);
    }
    fetchImage();
  }, [id]);

  const downloadImage = () => {
    if (!imageData) return;
    const a = document.createElement("a");
    a.href = imageData;
    a.download = "stego-image.png";
    a.click();
  };

  return (
    <div className="relative min-h-screen bg-background">
      <MatrixBackground />
      <div className="relative z-10 scanline min-h-screen">
        <div className="container max-w-2xl mx-auto px-4 py-12">
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-mono text-muted-foreground">
              <Shield className="w-3 h-3 text-primary" />
              Shared Stego Image
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-glow">
              Stego<span className="text-primary">Cipher</span>
            </h1>
          </div>

          {loading && (
            <p className="text-center text-muted-foreground font-mono animate-pulse">Loading...</p>
          )}
          {error && (
            <div className="text-center space-y-4">
              <p className="text-destructive font-mono">{error}</p>
              <a href="/">
                <Button variant="ghost" className="font-mono text-muted-foreground">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Go to StegoCipher
                </Button>
              </a>
            </div>
          )}
          {imageData && (
            <div className="space-y-4 p-4 rounded-lg bg-secondary/50 border border-primary/20">
              <img src={imageData} alt="Shared stego image" className="max-w-full rounded mx-auto" />
              <p className="text-xs text-muted-foreground font-mono text-center">
                Download this image and use StegoCipher to decode the hidden message.
              </p>
              <div className="flex gap-3">
                <Button onClick={downloadImage} className="flex-1 font-mono bg-primary text-primary-foreground hover:bg-primary/90">
                  <Download className="w-4 h-4 mr-2" /> Download PNG
                </Button>
                <a href="/" className="flex-1">
                  <Button variant="outline" className="w-full font-mono border-border text-foreground hover:bg-secondary">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Decode it
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedImage;
