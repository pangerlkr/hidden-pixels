import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Binary,
  Eye,
  EyeOff,
  Lock,
  ShieldAlert,
  FileImage,
  MessageSquare,
  Fingerprint,
  CheckCircle2,
  XCircle,
  Terminal,
  ScanEye,
  Swords,
} from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to StegoCipher
            </Link>
          </Button>
        </div>

        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border text-xs font-mono text-muted-foreground">
            <Binary className="w-3 h-3 text-primary" />
            Educational Deep Dive
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            How Stego<span className="text-primary">Cipher</span> Works
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-2xl mx-auto">
            A plain-language look at the math, cryptography, and cybersecurity behind hiding messages inside images.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <EyeOff className="w-6 h-6 text-primary" />
                What is Steganography?
              </CardTitle>
              <CardDescription>
                Steganography is the practice of hiding information inside something else so that the very existence of the
                message remains a secret.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Unlike encryption, which scrambles a message so it cannot be read without a key, steganography hides the
                message in plain sight. A casual observer sees only an ordinary image. Only someone who knows where to look
                can extract the hidden payload.
              </p>
              <p>
                StegoCipher uses a technique called <strong>Least Significant Bit (LSB)</strong> steganography. It changes the
                tiniest, least-noticeable bits of each pixel's color value to store your message. Because human eyes are not
                very sensitive to minute color changes, the image looks almost identical before and after encoding.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <FileImage className="w-6 h-6 text-primary" />
                The LSB Mechanism: Bit by Bit
              </CardTitle>
              <CardDescription>
                Digital images are grids of pixels. Each pixel contains red, green, and blue channels. Every channel is stored
                as an 8-bit number (0-255).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <p className="font-semibold text-sm">Example pixel channel</p>
                  <p className="font-mono text-sm">
                    Red value = <span className="text-primary font-bold">203</span>
                  </p>
                  <p className="font-mono text-sm">
                    Binary = <span className="font-bold">1100101</span>
                    <span className="text-primary font-bold">1</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The last bit (highlighted) is the Least Significant Bit. Flipping it from 1 to 0 changes the color from
                    203 to 202 - a difference impossible to see.
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <p className="font-semibold text-sm">Storing one letter</p>
                  <p className="font-mono text-sm">
                    Letter "A" = <span className="font-bold">01000001</span> (8 bits)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    To store "A", the encoder flips 8 LSBs across 8 different color channels. Three channels per pixel mean
                    roughly 3 bits can be hidden per pixel.
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold">Encode pipeline</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    The image is loaded into an HTML5 canvas. The Canvas API gives us direct access to every pixel's RGBA
                    values.
                  </li>
                  <li>Your text is converted from characters into a stream of bits (UTF-8 binary).</li>
                  <li>
                    Optionally, your message is encrypted with AES-256-GCM, producing ciphertext bytes that are then
                    converted to bits.
                  </li>
                  <li>
                    The encoder walks through pixels left-to-right, top-to-bottom and replaces the LSB of each Red, Green,
                    and Blue channel with the next bit of the message.
                  </li>
                  <li>
                    A special null-byte delimiter (24 bits of zeroes) is appended so the decoder knows where the message
                    ends.
                  </li>
                  <li>The modified pixel data is written back to a PNG file, ready to download or share.</li>
                </ol>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold">Decode pipeline</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>The stego-image is loaded into a canvas.</li>
                  <li>The decoder reads the LSB of every RGB channel and rebuilds the original bitstream.</li>
                  <li>When it finds the null-byte delimiter, it stops and converts the collected bits back into text.</li>
                  <li>If the text contains the encrypted payload marker "🔐ENC:", the app asks for your password and decrypts the ciphertext using AES-256-GCM.</li>
                </ol>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4 text-sm">
                <Terminal className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p>
                  <strong>Capacity formula:</strong> A color image of width W and height H has W × H pixels. With 3
                  channels per pixel and 1 bit per channel, total capacity = W × H × 3 bits. A 1920 × 1080 image
                  can theoretically hide about 760 KB of raw text.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lock className="w-6 h-6 text-primary" />
                The Encryption Layer
              </CardTitle>
              <CardDescription>
                Steganography hides the message. Encryption protects the message even if it is found.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                StegoCipher uses the Web Crypto API to perform <strong>AES-256-GCM</strong> encryption directly in your
                browser. No data is sent to a server. The password you type is run through PBKDF2 key derivation to produce
                a strong 256-bit key.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">What AES-256-GCM does</h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Confidentiality: ciphertext cannot be read without the password.</li>
                    <li>Authentication: tampered data is detected during decryption.</li>
                    <li>Random IV: the same message encrypts differently every time.</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2">Why it matters</h4>
                  <p className="text-sm">
                    If someone extracts the hidden bits, they still cannot read the original message without your password.
                    This combines the privacy of steganography with the protection of modern encryption.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <MessageSquare className="w-6 h-6 text-primary" />
                Real-World Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    icon: ShieldAlert,
                    title: "Private Communication",
                    desc: "Send a sensitive note inside a vacation photo when normal messaging feels too exposed.",
                  },
                  {
                    icon: Fingerprint,
                    title: "Digital Watermarking",
                    desc: "Embed ownership data or timestamps into images to prove provenance.",
                  },
                  {
                    icon: Terminal,
                    title: "CTFs & Education",
                    desc: "A classic challenge in cybersecurity competitions and university labs.",
                  },
                  {
                    icon: ScanEye,
                    title: "Whistleblowing",
                    desc: "Journalists and activists can hide metadata or testimony in innocuous media files.",
                  },
                  {
                    icon: Eye,
                    title: "Authentication Tokens",
                    desc: "Store invisible verification codes in printed or shared images.",
                  },
                  {
                    icon: Binary,
                    title: "Data Exfiltration Research",
                    desc: "Red teams study how attackers might sneak data past naive content filters.",
                  },
                ].map((use) => (
                  <div key={use.title} className="rounded-lg border p-4 space-y-2">
                    <use.icon className="w-5 h-5 text-primary" />
                    <h4 className="font-semibold text-sm">{use.title}</h4>
                    <p className="text-xs text-muted-foreground">{use.desc}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CheckCircle2 className="w-6 h-6 text-primary" />
                Pros & Cons
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Advantages
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Messages are invisible to casual inspection.</li>
                    <li>Does not raise suspicion the way encrypted files or suspicious attachments might.</li>
                    <li>Works entirely in the browser with no backend dependency for encoding.</li>
                    <li>PNG and BMP formats preserve hidden data losslessly.</li>
                    <li>Combines well with strong encryption for defense-in-depth.</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-destructive" /> Limitations
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                    <li>Lossy compression (JPEG, WebP, re-compressed WhatsApp images) destroys LSB data.</li>
                    <li>Even small image edits, cropping, or scaling can corrupt the hidden message.</li>
                    <li>Large messages need large images.</li>
                    <li>Statistical analysis can sometimes detect LSB modifications.</li>
                    <li>Does not provide anonymity - file transfer logs still exist.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Swords className="w-6 h-6 text-primary" />
                From a Cybersecurity Perspective
              </CardTitle>
              <CardDescription>
                Why steganography matters to attackers, defenders, and everyday users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p>
                In cybersecurity, steganography sits at the intersection of confidentiality and evasion. It is used by both
                defenders (watermarking, covert channels research) and adversaries (hiding payloads, exfiltrating data). The
                key is understanding its strengths, its weaknesses, and the legal and ethical boundaries.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="secondary">Defense</Badge>
                    What blue teams watch for
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Unusually large image files relative to their visual dimensions.</li>
                    <li>Images with high entropy or altered LSB histograms.</li>
                    <li>Users downloading images from untrusted domains and extracting them.</li>
                    <li>Steganography combined with exfiltration over trusted platforms like cloud storage or social media.</li>
                  </ul>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Badge variant="destructive">Offense</Badge>
                    What red teams simulate
                  </h4>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Hiding C2 commands or small payloads in legitimate-looking media.</li>
                    <li>Exfiltrating secrets through channels that appear benign.</li>
                    <li>Testing DLP (Data Loss Prevention) tools for blind spots.</li>
                    <li>Social engineering with "innocent" images containing secret instructions.</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="font-semibold">Detection: Steganalysis</h4>
                <p className="text-sm">
                  Security researchers use <strong>steganalysis</strong> to detect hidden data. Common methods include:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>
                    <strong>Visual attacks:</strong> Amplifying LSB planes can reveal unnatural patterns or "snow" caused by
                    embedding.
                  </li>
                  <li>
                    <strong>Statistical attacks:</strong> Chi-square tests, RS analysis, and histogram comparisons detect
                    irregular LSB distributions.
                  </li>
                  <li>
                    <strong>Machine learning:</strong> Classifiers trained on thousands of cover vs. stego images can spot
                    subtle artifacts.
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  Simple LSB steganography like this tool is educational and functional, but not robust against a determined
                  analyst. For higher security, use advanced algorithms such as LSB matching, spread-spectrum embedding, or
                  wet-paper codes.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-lg bg-secondary/50 p-4 text-sm">
                <ShieldAlert className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Responsible use</p>
                  <p>
                    StegoCipher is intended for education, research, privacy practice, and authorized security testing. Do
                    not use it to hide malicious payloads, bypass laws, or infringe on others' rights. With knowledge comes
                    responsibility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-6">
            <Button asChild size="lg">
              <Link to="/">Try it now</Link>
            </Button>
          </div>
        </div>

        <footer className="mt-16 border-t border-border pt-6 pb-2 text-center text-xs text-muted-foreground font-mono">
          <p className="mb-3">
            For educational purposes only. NEXUSCIPHERGUARD INDIA -{" "}
            <a
              href="https://nexuscipherguard.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              nexuscipherguard.in
            </a>
          </p>
          <p className="opacity-60">
            Designed by Pangerkumzuk Longkumer (Panger Lkr) -{" "}
            <a href="https://pangerlkr.link" target="_blank" rel="noopener noreferrer" className="hover:underline">
              pangerlkr.link
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HowItWorks;
