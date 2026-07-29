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
  alpha: PsdAlphaCoverage;
  buffer: Buffer;
};

export type PsdAlphaPolicy = "preserve" | "remove_edge_white_matte";

export type PsdAlphaCoverage = {
  hasAlpha: boolean;
  transparentPixelCount: number;
  partialPixelCount: number;
  opaquePixelCount: number;
};

export type PsdGameDerivativeSet = {
  source: {
    width: number;
    height: number;
    checksum: string;
    bytes: number;
    alphaPolicy: PsdAlphaPolicy;
    alpha: PsdAlphaCoverage;
  };
  derivatives: PsdGameDerivative[];
};

type PsdDerivativeSize = {
  width: number;
  height: number;
  fit?: "inside" | "contain" | "cover";
};

function removeEdgeConnectedWhiteMatte(
  source: Buffer,
  width: number,
  height: number
) {
  const rgba = Buffer.from(source);
  const pixelCount = width * height;
  const visited = new Uint8Array(pixelCount);
  const queue = new Int32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const isMatte = (pixel: number) => {
    const offset = pixel * 4;
    const red = rgba[offset];
    const green = rgba[offset + 1];
    const blue = rgba[offset + 2];
    const highest = Math.max(red, green, blue);
    const lowest = Math.min(red, green, blue);
    return lowest >= 220 && highest - lowest <= 24;
  };

  const enqueue = (pixel: number) => {
    if (visited[pixel] || !isMatte(pixel)) return;
    visited[pixel] = 1;
    queue[tail] = pixel;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x);
    enqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(y * width);
    enqueue(y * width + width - 1);
  }

  while (head < tail) {
    const pixel = queue[head];
    head += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    if (x > 0) enqueue(pixel - 1);
    if (x + 1 < width) enqueue(pixel + 1);
    if (y > 0) enqueue(pixel - width);
    if (y + 1 < height) enqueue(pixel + width);
  }

  for (let pixel = 0; pixel < pixelCount; pixel += 1) {
    if (!visited[pixel]) continue;
    const offset = pixel * 4;
    rgba[offset] = 0;
    rgba[offset + 1] = 0;
    rgba[offset + 2] = 0;
    rgba[offset + 3] = 0;
  }

  return rgba;
}

function checksum(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function alphaCoverage(rgba: Uint8Array, channels = 4): PsdAlphaCoverage {
  let transparentPixelCount = 0;
  let partialPixelCount = 0;
  let opaquePixelCount = 0;

  for (let offset = 3; offset < rgba.length; offset += channels) {
    const alpha = rgba[offset];
    if (alpha === 0) transparentPixelCount += 1;
    else if (alpha === 255) opaquePixelCount += 1;
    else partialPixelCount += 1;
  }

  return {
    hasAlpha: channels === 4,
    transparentPixelCount,
    partialPixelCount,
    opaquePixelCount
  };
}

async function derivativeAlphaCoverage(buffer: Buffer) {
  const metadata = await sharp(buffer).metadata();
  const raw = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return {
    ...alphaCoverage(raw.data, raw.info.channels),
    hasAlpha: metadata.hasAlpha === true
  };
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

async function derivative(
  id: PsdGameDerivative["id"],
  filename: string,
  format: PsdGameDerivative["format"],
  mimeType: PsdGameDerivative["mimeType"],
  buffer: Buffer,
  width: number,
  height: number
): Promise<PsdGameDerivative> {
  return {
    id,
    filename,
    format,
    mimeType,
    width,
    height,
    bytes: buffer.byteLength,
    checksum: checksum(buffer),
    alpha: await derivativeAlphaCoverage(buffer),
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
    alphaPolicy?: PsdAlphaPolicy;
    requireTransparentPixels?: boolean;
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
  const sourceRgba = toEightBitRgba(imageData.data, width, height);
  const alphaPolicy = options.alphaPolicy ?? "preserve";
  const rgba = alphaPolicy === "remove_edge_white_matte"
    ? removeEdgeConnectedWhiteMatte(sourceRgba, width, height)
    : sourceRgba;
  const processedAlpha = alphaCoverage(rgba);
  if (options.requireTransparentPixels && processedAlpha.transparentPixelCount === 0) {
    throw new Error(`PSD derivative ${options.basename} requires transparency but no transparent pixels were produced.`);
  }
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
      bytes: sourceBuffer.byteLength,
      alphaPolicy,
      alpha: processedAlpha
    },
    derivatives: [
      await derivative(
        "game_png",
        `${options.basename}.png`,
        "PNG",
        "image/png",
        gamePng.data,
        gamePng.info.width,
        gamePng.info.height
      ),
      await derivative(
        "web_preview",
        `${options.basename}-preview.webp`,
        "WebP",
        "image/webp",
        preview.data,
        preview.info.width,
        preview.info.height
      ),
      await derivative(
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
