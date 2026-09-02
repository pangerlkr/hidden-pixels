import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Shield, Github, Mail, ExternalLink, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import StegTool from "@/components/StegTool";
import TutorialWalkthrough from "@/components/TutorialWalkthrough";
import KeyboardShortcutsHelp from "@/components/KeyboardShortcutsHelp";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const Index = () => {
  const [mode, setMode] = useState<"encode" | "decode" | "batch">("encode");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useKeyboardShortcuts([
    { key: "e", ctrl: true, handler: useCallback(() => setMode("encode"), []) },
    { key: "d", ctrl: true, handler: useCallback(() => setMode("decode"), []) },
    { key: "b", ctrl: true, handler: useCallback(() => setMode("batch"), []) },
    { key: "?", handler: useCallback(() => setShortcutsOpen((o) => !o), []) },
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="relative text-center mb-10 space-y-4">
          <div className="absolute top-0 right-0 flex items-center gap-1">
            <KeyboardShortcutsHelp open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
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
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/how-it-works" className="inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> How it works
              </Link>
            </Button>
          </div>
        </div>

        {/* Tool */}
        <StegTool mode={mode} onModeChange={setMode} />

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-6 pb-2 text-center text-xs text-muted-foreground font-mono">
          <p className="mb-3 max-w-2xl mx-auto">
            For educational purposes only. Built to teach data encoding, image file formats, and how information can be embedded in digital media.
          </p>
          <p className="mb-3 font-semibold text-foreground">
            NEXUSCIPHERGUARD INDIA -{" "}
            <a
              href="https://nexuscipherguard.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              nexuscipherguard.in <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <p className="mb-3">
            Designed by Pangerkumzuk Longkumer (Panger Lkr) -{" "}
            <a
              href="https://pangerlkr.link"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              pangerlkr.link <ExternalLink className="w-3 h-3" />
            </a>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-3">
            <a
              href="mailto:contact@pangerlkr.link"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="w-3 h-3" /> contact@pangerlkr.link
            </a>
            <a
              href="mailto:support@nexuscipherguard.in"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Mail className="w-3 h-3" /> support@nexuscipherguard.in
            </a>
            <a
              href="https://github.com/pangerlkr/hidden-pixels"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Github className="w-3 h-3" /> GitHub
            </a>
          </div>
          <p className="opacity-60">
            Reach out for support, contributions, or suggestions. All processing happens locally in your browser.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
