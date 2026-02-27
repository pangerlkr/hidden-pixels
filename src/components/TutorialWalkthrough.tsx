import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Upload, MessageSquare, Lock, Download, Unlock, Eye, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  tip?: string;
}

const STEPS: TutorialStep[] = [
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: "Welcome to StegoCipher",
    description: "This tool lets you hide secret messages inside images using LSB steganography. The changes are invisible to the human eye — only someone who knows to look can extract them.",
    tip: "All processing happens in your browser. Nothing is uploaded to any server.",
  },
  {
    icon: <Upload className="w-5 h-5" />,
    title: "Step 1 — Choose a Carrier Image",
    description: "Start by dropping or selecting a PNG or BMP image in the Encode tab. This is the \"carrier\" — the image that will secretly hold your message.",
    tip: "Use PNG format. JPEG uses lossy compression that destroys hidden data. If you upload a JPEG, StegoCipher can auto-convert it.",
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Step 2 — Type Your Secret",
    description: "Enter the message you want to hide. The capacity meter shows how much of the image is being used — larger images can hold longer messages.",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Step 3 — Encrypt (Optional)",
    description: "Toggle on AES-256 encryption and set a password for double security. Even if someone extracts the data, they can't read it without the password.",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Step 4 — Download or Share",
    description: "Click \"Encode\" to embed your message, then download the stego image as PNG. Use the Share Link button to get a safe URL — don't share via WhatsApp or social media as they re-compress images.",
    tip: "Send images as document attachments, not as photos, to preserve the hidden data.",
  },
  {
    icon: <Unlock className="w-5 h-5" />,
    title: "Step 5 — Decode a Message",
    description: "Switch to the Decode tab and drop in a stego image. StegoCipher will scan for hidden data and reveal the message. If it's encrypted, you'll be prompted for the password.",
  },
  {
    icon: <Eye className="w-5 h-5" />,
    title: "Pixel Diff & Comparison",
    description: "After encoding, use the Compare slider to see that the original and encoded images look identical. Switch to Pixel Diff to visualize exactly which bits changed — color-coded by channel.",
    tip: "The Batch tab lets you encode the same message into multiple images at once and download them all as a ZIP.",
  },
];

const STORAGE_KEY = "stego-tutorial-seen";

const TutorialWalkthrough = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const close = () => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else close();
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const reopen = () => {
    setStep(0);
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={reopen}
        className="text-muted-foreground hover:text-foreground font-mono text-xs gap-1.5"
      >
        <Sparkles className="w-3.5 h-3.5" />
        Tutorial
      </Button>
    );
  }

  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={close} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-xl bg-card border-2 border-primary/30 shadow-[0_0_40px_hsl(150_100%_50%/0.1),0_20px_60px_-15px_hsl(0_0%_0%/0.5)] overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 shadow-[0_0_8px_hsl(150_100%_50%/0.5)]"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close */}
        <button onClick={close} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 space-y-4">
          {/* Icon + step count */}
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
              {current.icon}
            </div>
            <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded-full border border-border bg-secondary/50">
              {step + 1} / {STEPS.length}
            </span>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground font-mono">{current.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
          </div>

          {/* Tip */}
          {current.tip && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs font-mono text-primary">
                💡 {current.tip}
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={prev}
              disabled={step === 0}
              className="font-mono text-muted-foreground hover:text-foreground gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === step ? "bg-primary w-4" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button
              size="sm"
              onClick={next}
              className="font-mono bg-primary text-primary-foreground hover:bg-primary/90 gap-1"
            >
              {step === STEPS.length - 1 ? "Get Started" : "Next"}
              {step < STEPS.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorialWalkthrough;
