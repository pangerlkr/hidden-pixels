import { Shield, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import MatrixBackground from "@/components/MatrixBackground";
import StegTool from "@/components/StegTool";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import { useTheme } from "@/components/ThemeProvider";

const Index = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen bg-background transition-colors duration-300">
      {theme === "dark" && <MatrixBackground />}
      <div className="relative z-10 scanline min-h-screen">
        <div className="container max-w-3xl mx-auto px-4 py-12">
          {/* Header */}
          <div className="relative text-center mb-10 space-y-4">
            {/* Top-right controls */}
            <div className="absolute top-0 right-0 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <TutorialWalkthrough />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-mono text-muted-foreground">
              <Shield className="w-3 h-3 text-primary" />
              LSB Steganography
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground text-glow">
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
    </div>
  );
};

export default Index;
