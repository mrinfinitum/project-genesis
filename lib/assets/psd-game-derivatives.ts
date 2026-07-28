import { createHash } from "node:crypto";
import sharp from "sharp";
import { getCompositeImageData, initializeCanvas, readPsd } from "ag-psd";

initializeCanvas(
  () => {
    throw new Error("Canvas rendering is not available during PSD conversion.");
  },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }) as ImageData
);

export type PsdGameDerivative = {
  id: "game_png" | "web_preview" | "library_thumbnail";
  filename: string;
  format: "PNG" | "WebP";
  mimeType: "image/png" | "image/webp";
  width: number;
  height: number;
  bytes: number;
  checksum: string;
  buffer: Buffer;
};

export type PsdGameDerivativeSet = {
  source: {
    width: number;
    height: number;
    checksum: string;
    bytes: number;
  };
  derivatives: PsdGameDerivative[];
};

type PsdDerivativeSize = {
  width: number;
  height: number;
  fit?: "inside" | "contain" | "cover";
};

function checksum(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function toEightBitRgba(
  data: Uint8Array | Uint8ClampedArray | Uint16Array | Float32Array,
  width: number,
  height: number
) {
  if (data instanceof Uint16Array) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let index = 0; index < rgba.length; index += 1) rgba[index] = Math.round(data[index] / 257);
    return rgba;
  }

  if (data instanceof Float32Array) {
    const rgba = Buffer.alloc(width * height * 4);
    for (let index = 0; index < rgba.length; index += 1) {
      rgba[index] = Math.max(0, Math.min(255, Math.round(data[index] * 255)));
    }
    return rgba;
  }

  return Buffer.from(data);
}

function derivative(
  id: PsdGameDerivative["id"],
  filename: string,
  format: PsdGameDerivative["format"],
  mimeType: PsdGameDerivative["mimeType"],
  buffer: Buffer,
  width: number,
  height: number
): PsdGameDerivative {
  return {
    id,
    filename,
    format,
    mimeType,
    width,
    height,
    bytes: buffer.byteLength,
    checksum: checksum(buffer),
    buffer
  };
}

export async function generatePsdGameDerivatives(
  sourceBuffer: Buffer,
  options: {
    basename: string;
    previewMax?: number;
    gameOutput?: PsdDerivativeSize;
    previewOutput?: PsdDerivativeSize;
    thumbnailOutput?: PsdDerivativeSize;
  }
): Promise<PsdGameDerivativeSet> {
  const psd = readPsd(sourceBuffer, {
    useImageData: true,
    skipLayerImageData: true,
    skipThumbnail: true,
    throwForMissingFeatures: false
  });
  const imageData = psd.imageData ?? getCompositeImageData(psd);

  if (!imageData?.data) {
    throw new Error("PSD has no readable composite. Re-save it with Photoshop compatibility enabled.");
  }

  const width = imageData.width || psd.width;
  const height = imageData.height || psd.height;
  const rgba = toEightBitRgba(imageData.data, width, height);
  const input = sharp(rgba, { raw: { width, height, channels: 4 } });
  const gameInput = options.gameOutput
    ? input.clone().resize({
        width: options.gameOutput.width,
        height: options.gameOutput.height,
        fit: options.gameOutput.fit ?? "cover",
        position: "centre",
        withoutEnlargement: true
      })
    : input.clone();
  const gamePng = await gameInput
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer({ resolveWithObject: true });
  const previewSize = options.previewOutput ?? {
    width: options.previewMax ?? 1600,
    height: options.previewMax ?? 1600,
    fit: "inside" as const
  };
  const preview = await input.clone()
    .resize({
      width: previewSize.width,
      height: previewSize.height,
      fit: previewSize.fit ?? "inside",
      position: "centre",
      withoutEnlargement: true
    })
    .webp({ quality: 84, alphaQuality: 95, effort: 5 })
    .toBuffer({ resolveWithObject: true });
  const thumbnailSize = options.thumbnailOutput ?? {
    width: 480,
    height: 270,
    fit: "contain" as const
  };
  const thumbnail = await input
    .clone()
    .resize({
      width: thumbnailSize.width,
      height: thumbnailSize.height,
      fit: thumbnailSize.fit ?? "contain",
      position: "centre",
      background: { r: 3, g: 10, b: 22, alpha: 0 }
    })
    .webp({ quality: 80, alphaQuality: 92, effort: 5 })
    .toBuffer({ resolveWithObject: true });

  return {
    source: {
      width,
      height,
      checksum: checksum(sourceBuffer),
      bytes: sourceBuffer.byteLength
    },
    derivatives: [
      derivative(
        "game_png",
        `${options.basename}.png`,
        "PNG",
        "image/png",
        gamePng.data,
        gamePng.info.width,
        gamePng.info.height
      ),
      derivative(
        "web_preview",
        `${options.basename}-preview.webp`,
        "WebP",
        "image/webp",
        preview.data,
        preview.info.width,
        preview.info.height
      ),
      derivative(
        "library_thumbnail",
        `${options.basename}-thumbnail.webp`,
        "WebP",
        "image/webp",
        thumbnail.data,
        thumbnail.info.width,
        thumbnail.info.height
      )
    ]
  };
}
