import { Shield } from "lucide-react";
import StegTool from "@/components/StegTool";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="relative text-center mb-10 space-y-4">
          <div className="absolute top-0 right-0">
            <TutorialWalkthrough />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-mono text-muted-foreground">
            <Shield className="w-3 h-3 text-primary" />
            LSB Steganography
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Stego<span className="text-primary">Cipher</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-md mx-auto">
            Hide secret messages inside images. Invisible to the eye, readable only by those who know.
          </p>
        </div>

        {/* Tool */}
        <StegTool />

        {/* Footer */}
        <div className="mt-16 text-center text-xs text-muted-foreground font-mono opacity-50">
          All processing happens locally in your browser. No data leaves your device.
        </div>
      </div>
    </div>
  );
};

export default Index;
