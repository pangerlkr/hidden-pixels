# StegoCipher — LSB Image Steganography

> **Hide secret messages inside images. Invisible to the eye, readable only by those who know.**

StegoCipher is a fully client-side steganography tool that embeds text into PNG images using the **Least Significant Bit (LSB)** technique. An optional **AES-256-GCM** encryption layer lets you add a password on top of the hidden data. All processing happens locally in your browser — no data ever leaves your device.

---

## Table of Contents

- [Features](#features)
- [How It Works](#how-it-works)
  - [LSB Steganography](#lsb-steganography)
  - [AES-256-GCM Encryption](#aes-256-gcm-encryption)
- [Modes](#modes)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
  - [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Image Format Compatibility](#image-format-compatibility)
- [Security Notes](#security-notes)
- [Sharing Images](#sharing-images)
- [Contributing](#contributing)

---

## Features

| Feature | Description |
|---|---|
| 🖼️ LSB Steganography | Encodes text into the least significant bit of each RGB channel |
| 🔐 AES-256-GCM Encryption | Optionally encrypt the message with a password before embedding |
| 📦 Batch Encoding | Embed the same message into multiple images at once; download as ZIP |
| 🔗 Share Links | Upload an encoded image to get a shareable link (expires in 7 days) |
| 🛡️ EXIF Stripping | Output PNG contains no EXIF metadata (location, camera, timestamps) |
| 💻 100% Client-Side | All encoding/decoding runs in the browser — nothing is sent to any server |
| 📊 Capacity Meter | Real-time bit-usage gauge so you know when the image is nearing capacity |
| ⚖️ Strength Indicator | Visual score of how detectable the stego data might be |
| ⌨️ Keyboard Shortcuts | Quick-switch between modes without touching the mouse |

---

## How It Works

### LSB Steganography

Every pixel in a PNG image stores colour in three channels: **Red**, **Green**, and **Blue** (each 0–255). The **least significant bit** of each channel value contributes only `1` unit of colour difference — imperceptible to human vision.

StegoCipher replaces those bits with the binary representation of the secret message:

```
Pixel byte (original): 10110110  (decimal 182)
Message bit to embed:          1
Pixel byte (modified): 10110111  (decimal 183)  ← 1-unit difference, invisible
```

A three-null-byte delimiter (`\0\0\0`) marks the end of the message so the decoder knows where to stop reading.

**Capacity formula:**

```
max_chars = floor((width × height × 3) / 8) − 3
```

A 1920 × 1080 image can hold approximately **777,597 characters** (≈ 760 KB of text).

### AES-256-GCM Encryption

When a password is provided, the plaintext is encrypted with **AES-256-GCM** using the Web Crypto API before being embedded. The key is derived from the password with **PBKDF2** (SHA-256, 100,000 iterations).

| Parameter | Value |
|---|---|
| Algorithm | AES-GCM |
| Key length | 256 bits |
| Key derivation | PBKDF2 |
| KDF hash | SHA-256 |
| KDF iterations | 100,000 |
| Salt length | 16 bytes (random) |
| IV length | 12 bytes (random) |

The salt and IV are prepended to the ciphertext and Base64-encoded into a single string. An emoji prefix (`🔐ENC:`) is added so the decoder can identify encrypted payloads automatically.

---

## Modes

| Mode | Description |
|---|---|
| **Encode** | Upload a carrier PNG → type a secret message → optionally encrypt → download stego PNG |
| **Decode** | Upload a stego PNG → message is extracted automatically → optionally decrypt with password |
| **Batch** | Upload multiple images → embed the same message in all → download as a ZIP archive |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 18](https://react.dev/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Build tool | [Vite 5](https://vitejs.dev/) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com/) |
| Component library | [shadcn/ui](https://ui.shadcn.com/) (Radix UI primitives) |
| Form validation | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| Backend / sharing | [Supabase](https://supabase.com/) (Postgres + storage) |
| Cryptography | [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (built-in browser) |
| ZIP packaging | [JSZip](https://stuk.github.io/jszip/) |
| EXIF reading | [exifr](https://github.com/MikeKovarik/exifr) |
| Testing | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) |
| Router | [React Router v6](https://reactrouter.com/) |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9  
  Recommended: install via [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
nvm install --lts
nvm use --lts
```

### Installation

```sh
# Clone the repository
git clone https://github.com/pangerlkr/hidden-pixels.git
cd hidden-pixels

# Install dependencies
npm install
```

### Running the App

```sh
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Production build (output in `dist/`) |
| `npm run build:dev` | Development build (unminified) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest test suite once |
| `npm run test:watch` | Run tests in watch mode |

### Running Tests

```sh
npm test
```

Tests are located in `src/test/` and use Vitest with jsdom.

---

## Project Structure

```
hidden-pixels/
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── ui/               # shadcn/ui components
│   │   ├── BatchEncode.tsx   # Batch mode: encode multiple images → ZIP
│   │   ├── ImageCompareSlider.tsx  # Before/after slider
│   │   ├── ImageDropZone.tsx # Drag-and-drop image uploader
│   │   ├── ImageMetadataPanel.tsx  # EXIF/dimensions info
│   │   ├── KeyboardShortcutsHelp.tsx
│   │   ├── StrengthIndicator.tsx   # Steganography detectability score
│   │   ├── StegTool.tsx      # Main encode/decode UI
│   │   └── TutorialWalkthrough.tsx
│   ├── hooks/
│   │   └── use-keyboard-shortcuts.ts
│   ├── integrations/
│   │   └── supabase/         # Supabase client & type definitions
│   ├── lib/
│   │   ├── crypto.ts         # AES-256-GCM encrypt/decrypt (Web Crypto)
│   │   ├── steganography.ts  # LSB encode/decode engine
│   │   └── utils.ts          # Tailwind class helpers
│   ├── pages/
│   │   ├── Index.tsx         # Home page
│   │   ├── SharedImage.tsx   # /shared/:id — view a shared stego image
│   │   └── NotFound.tsx
│   ├── test/                 # Vitest tests
│   ├── App.tsx
│   └── main.tsx
├── supabase/                 # Supabase migrations & config
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + E` | Switch to **Encode** mode |
| `Ctrl + D` | Switch to **Decode** mode |
| `Ctrl + B` | Switch to **Batch** mode |
| `?` | Toggle keyboard shortcut help panel |

---

## Image Format Compatibility

| Format | Encode | Decode | Notes |
|---|---|---|---|
| PNG | ✅ | ✅ | Lossless — fully supported |
| BMP | ✅ | ✅ | Lossless — fully supported |
| JPEG / JPG | ⚠️ | ⚠️ | Lossy compression destroys hidden data |
| WebP | ⚠️ | ⚠️ | Depends on browser codec; lossless WebP may work |

> **Important:** Do **not** share stego images via WhatsApp, Instagram, X (Twitter), or any platform that re-compresses uploaded photos to JPEG. Use the built-in **Share Link** feature, or send the PNG as a *document attachment* (not a photo) to preserve pixel data.

---

## Security Notes

- **No server-side processing.** The steganography and cryptography engines run entirely in your browser using the Canvas API and Web Crypto API. Images are never uploaded unless you explicitly click **Share Link**.
- **AES-256-GCM** provides authenticated encryption — any tampering with the ciphertext will cause decryption to fail.
- **PBKDF2** with 100,000 iterations makes brute-force attacks on the password computationally expensive.
- **EXIF metadata** is automatically stripped from the output PNG because the Canvas API re-renders the image from raw pixel data.
- The Share Link feature stores the image in Supabase and **expires after 7 days**.
- LSB steganography is **security through obscurity** — the hidden data is not protected unless AES encryption is enabled. Enable encryption whenever confidentiality matters.

---

## Sharing Images

1. Encode your message and click **Share Link**.
2. The encoded PNG is uploaded to Supabase and a unique URL is generated.
3. Copy the link and share it — the recipient opens the URL, downloads the PNG, and decodes it with StegoCipher.
4. Links expire automatically after **7 days**.

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`).
2. Make your changes and add tests where applicable.
3. Run `npm test` and `npm run lint` to verify everything passes.
4. Open a pull request describing what you changed and why.

---

## References

- [Petitcolas, F. A. P., Anderson, R. J., & Kuhn, M. G. (1999). *Information hiding — a survey.* Proceedings of the IEEE.](https://doi.org/10.1109/5.771065)
- [MDN Web Docs — Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [MDN Web Docs — Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [NIST SP 800-38D — Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM)](https://csrc.nist.gov/publications/detail/sp/800-38d/final)
- [RFC 2898 — PKCS #5: Password-Based Cryptography Specification](https://datatracker.ietf.org/doc/html/rfc2898)
