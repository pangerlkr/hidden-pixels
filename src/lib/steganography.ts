// LSB Steganography Engine

const DELIMITER = '\0\0\0'; // End-of-message marker

export function encodeMessage(imageData: ImageData, message: string): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const fullMessage = message + DELIMITER;
  const binaryMessage = textToBinary(fullMessage);

  // Each pixel has RGBA (4 channels), we use RGB (3 channels) for encoding
  const maxBits = (data.length / 4) * 3;
  if (binaryMessage.length > maxBits) {
    throw new Error(`Message too long. Max ~${Math.floor(maxBits / 8)} characters for this image.`);
  }

  let bitIndex = 0;
  for (let i = 0; i < data.length && bitIndex < binaryMessage.length; i++) {
    // Skip alpha channel (every 4th byte)
    if ((i + 1) % 4 === 0) continue;

    // Replace the LSB
    const bit = parseInt(binaryMessage[bitIndex], 2);
    data[i] = (data[i] & 0xFE) | bit;
    bitIndex++;
  }

  return new ImageData(data, imageData.width, imageData.height);
}

export function decodeMessage(imageData: ImageData): string {
  const data = imageData.data;
  let binaryString = '';
  let result = '';

  for (let i = 0; i < data.length; i++) {
    if ((i + 1) % 4 === 0) continue;

    binaryString += (data[i] & 1).toString();

    // Every 8 bits, convert to character
    if (binaryString.length === 8) {
      const char = String.fromCharCode(parseInt(binaryString, 2));
      result += char;
      binaryString = '';

      // Check for delimiter
      if (result.endsWith(DELIMITER)) {
        return result.slice(0, -DELIMITER.length);
      }
    }
  }

  return ''; // No hidden message found
}

function textToBinary(text: string): string {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

export function getMaxMessageLength(width: number, height: number): number {
  const totalPixels = width * height;
  const usableBits = totalPixels * 3; // RGB channels
  const usableBytes = Math.floor(usableBits / 8);
  return usableBytes - 3; // Subtract delimiter length
}
