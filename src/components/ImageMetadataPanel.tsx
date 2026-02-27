import { useMemo, useState, useEffect } from "react";
import { FileImage, Ruler, HardDrive, Palette, Camera, Calendar, MapPin, Aperture, ChevronDown, ChevronUp } from "lucide-react";
import exifr from "exifr";

interface ImageMetadataPanelProps {
  image: HTMLImageElement;
  file: File | null;
}

interface ExifData {
  camera?: string;
  lens?: string;
  dateTaken?: string;
  iso?: number;
  focalLength?: string;
  aperture?: string;
  exposure?: string;
  gps?: { lat: number; lng: number };
  software?: string;
}

const ImageMetadataPanel = ({ image, file }: ImageMetadataPanelProps) => {
  const [exif, setExif] = useState<ExifData | null>(null);
  const [showExif, setShowExif] = useState(false);

  const metadata = useMemo(() => {
    const w = image.width;
    const h = image.height;
    const megapixels = ((w * h) / 1_000_000).toFixed(1);
    const aspectGcd = gcd(w, h);
    const aspectRatio = `${w / aspectGcd}:${h / aspectGcd}`;
    const bitDepth = "8-bit (RGBA)";

    let fileSize = "—";
    let fileType = "—";
    let fileName = "—";
    if (file) {
      fileSize = formatBytes(file.size);
      fileType = file.type || "unknown";
      fileName = file.name;
    }

    return { w, h, megapixels, aspectRatio, bitDepth, fileSize, fileType, fileName };
  }, [image, file]);

  useEffect(() => {
    if (!file) { setExif(null); return; }

    exifr.parse(file, {
      pick: [
        "Make", "Model", "LensModel", "DateTimeOriginal",
        "ISO", "FocalLength", "FNumber", "ExposureTime",
        "GPSLatitude", "GPSLongitude", "Software",
      ],
      gps: true,
    }).then((data) => {
      if (!data) { setExif(null); return; }

      const parsed: ExifData = {};
      if (data.Make || data.Model) {
        parsed.camera = [data.Make, data.Model].filter(Boolean).join(" ");
      }
      if (data.LensModel) parsed.lens = data.LensModel;
      if (data.DateTimeOriginal) {
        parsed.dateTaken = new Date(data.DateTimeOriginal).toLocaleString();
      }
      if (data.ISO) parsed.iso = data.ISO;
      if (data.FocalLength) parsed.focalLength = `${data.FocalLength}mm`;
      if (data.FNumber) parsed.aperture = `f/${data.FNumber}`;
      if (data.ExposureTime) {
        parsed.exposure = data.ExposureTime < 1
          ? `1/${Math.round(1 / data.ExposureTime)}s`
          : `${data.ExposureTime}s`;
      }
      if (data.latitude && data.longitude) {
        parsed.gps = { lat: data.latitude, lng: data.longitude };
      }
      if (data.Software) parsed.software = data.Software;

      const hasData = Object.keys(parsed).length > 0;
      setExif(hasData ? parsed : null);
    }).catch(() => setExif(null));
  }, [file]);

  const basicItems = [
    { icon: Ruler, label: "Dimensions", value: `${metadata.w} × ${metadata.h} px` },
    { icon: FileImage, label: "Megapixels", value: `${metadata.megapixels} MP` },
    { icon: Ruler, label: "Aspect Ratio", value: metadata.aspectRatio },
    { icon: Palette, label: "Color Depth", value: metadata.bitDepth },
    { icon: HardDrive, label: "File Size", value: metadata.fileSize },
    { icon: FileImage, label: "Format", value: metadata.fileType.split("/")[1]?.toUpperCase() || "—" },
  ];

  const exifItems = exif ? [
    exif.camera && { icon: Camera, label: "Camera", value: exif.camera },
    exif.lens && { icon: Camera, label: "Lens", value: exif.lens },
    exif.dateTaken && { icon: Calendar, label: "Date Taken", value: exif.dateTaken },
    exif.aperture && { icon: Aperture, label: "Aperture", value: exif.aperture },
    exif.exposure && { icon: Aperture, label: "Exposure", value: exif.exposure },
    exif.iso && { icon: Aperture, label: "ISO", value: String(exif.iso) },
    exif.focalLength && { icon: Aperture, label: "Focal Length", value: exif.focalLength },
    exif.software && { icon: FileImage, label: "Software", value: exif.software },
    exif.gps && { icon: MapPin, label: "GPS", value: `${exif.gps.lat.toFixed(4)}, ${exif.gps.lng.toFixed(4)}` },
  ].filter(Boolean) as { icon: any; label: string; value: string }[] : [];

  return (
    <div className="p-3 rounded-lg bg-secondary/50 border border-border space-y-2">
      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
        Image Metadata
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {basicItems.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs font-mono">
            <item.icon className="w-3 h-3 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">{item.label}:</span>
            <span className="text-foreground truncate">{item.value}</span>
          </div>
        ))}
      </div>

      {exifItems.length > 0 && (
        <>
          <button
            onClick={() => setShowExif(!showExif)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-primary hover:text-primary/80 transition-colors"
          >
            {showExif ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            EXIF Data ({exifItems.length} fields)
          </button>
          {showExif && (
            <div className="space-y-2 pt-1 border-t border-border">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {exifItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-xs font-mono">
                    <item.icon className="w-3 h-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className="text-foreground truncate">{item.value}</span>
                  </div>
                ))}
              </div>
              {exif?.gps && (
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Photo Location
                  </p>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${exif.gps.lat}&mlon=${exif.gps.lng}#map=15/${exif.gps.lat}/${exif.gps.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                  >
                    <iframe
                      title="Photo location"
                      width="100%"
                      height="150"
                      style={{ border: 0, pointerEvents: "none" }}
                      loading="lazy"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${exif.gps.lng - 0.01},${exif.gps.lat - 0.01},${exif.gps.lng + 0.01},${exif.gps.lat + 0.01}&layer=mapnik&marker=${exif.gps.lat},${exif.gps.lng}`}
                    />
                  </a>
                  <p className="text-[9px] font-mono text-muted-foreground text-center">
                    Click to open in OpenStreetMap
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {metadata.fileName !== "—" && (
        <p className="text-[10px] font-mono text-muted-foreground truncate">
          {metadata.fileName}
        </p>
      )}
    </div>
  );
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default ImageMetadataPanel;
