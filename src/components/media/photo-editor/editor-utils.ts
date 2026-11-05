
import type {
    CropRect,
    ImageAdjustments,
} from "./editor-types";

/**
 * Load a File into an HTMLImageElement.
 *
 * The returned object URL must be revoked by the caller
 * when the image is no longer needed.
 */
export function loadImageFile(
    file: File
): Promise<{
    image: HTMLImageElement;
    objectUrl: string;
}> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            resolve({
                image,
                objectUrl,
            });
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("The selected image could not be loaded."));
        };

        image.src = objectUrl;
    });
}

/**
 * Calculate a centred crop rectangle for a target aspect ratio.
 */
export function getAspectCrop(
    imageWidth: number,
    imageHeight: number,
    aspectRatio: number
): CropRect {
    if (
        imageWidth <= 0 ||
        imageHeight <= 0 ||
        aspectRatio <= 0
    ) {
        throw new Error("Invalid image dimensions or aspect ratio.");
    }

    const imageRatio = imageWidth / imageHeight;

    if (imageRatio > aspectRatio) {
        const width = imageHeight * aspectRatio;

        return {
            left: (imageWidth - width) / 2,
            top: 0,
            width,
            height: imageHeight,
        };
    }

    const height = imageWidth / aspectRatio;

    return {
        left: 0,
        top: (imageHeight - height) / 2,
        width: imageWidth,
        height,
    };
}

/**
 * Create a new canvas containing only the selected crop.
 * The source canvas is never modified.
 */
export function cropCanvas(
    source: HTMLCanvasElement,
    crop: CropRect
): HTMLCanvasElement {
    const left = Math.max(
        0,
        Math.min(source.width - 1, Math.floor(crop.left))
    );

    const top = Math.max(
        0,
        Math.min(source.height - 1, Math.floor(crop.top))
    );

    const width = Math.min(
        source.width - left,
        Math.max(1, Math.round(crop.width))
    );

    const height = Math.min(
        source.height - top,
        Math.max(1, Math.round(crop.height))
    );

    if (width <= 0 || height <= 0) {
        throw new Error("The selected crop area is outside the image.");
    }

    const result = document.createElement("canvas");

    result.width = width;
    result.height = height;

    const context = result.getContext("2d");

    if (!context) {
        throw new Error("Could not prepare the cropped image.");
    }

    context.drawImage(
        source,
        left,
        top,
        width,
        height,
        0,
        0,
        width,
        height
    );

    return result;
}

/**
 * Apply brightness, contrast and saturation to a copy of a canvas.
 *
 * Values use a range of -100 to 100.
 * The original canvas remains unchanged.
 */
export function applyImageAdjustments(
    source: HTMLCanvasElement,
    adjustments: ImageAdjustments
): HTMLCanvasElement {
    const result = document.createElement("canvas");

    result.width = source.width;
    result.height = source.height;

    const context = result.getContext("2d", {
        willReadFrequently: true,
    });

    if (!context) {
        throw new Error("Could not prepare image adjustments.");
    }

    context.drawImage(source, 0, 0);

    const imageData = context.getImageData(
        0,
        0,
        result.width,
        result.height
    );

    const pixels = imageData.data;

    const brightness = adjustments.brightness / 100;
    const saturation = adjustments.saturation / 100;

    const contrastAmount = adjustments.contrast * 2.55;

    const contrastFactor =
        (259 * (contrastAmount + 255)) /
        (255 * (259 - contrastAmount));

    const brightnessOffset = brightness * 255;
    const saturationFactor = 1 + saturation;

    for (let index = 0; index < pixels.length; index += 4) {
        let red = pixels[index];
        let green = pixels[index + 1];
        let blue = pixels[index + 2];

        // Brightness.
        red += brightnessOffset;
        green += brightnessOffset;
        blue += brightnessOffset;

        // Contrast, centred around middle grey.
        red = (red - 128) * contrastFactor + 128;
        green = (green - 128) * contrastFactor + 128;
        blue = (blue - 128) * contrastFactor + 128;

        // Saturation.
        const grey =
            0.2126 * red +
            0.7152 * green +
            0.0722 * blue;

        red = grey + (red - grey) * saturationFactor;
        green = grey + (green - grey) * saturationFactor;
        blue = grey + (blue - grey) * saturationFactor;

        pixels[index] = clampChannel(red);
        pixels[index + 1] = clampChannel(green);
        pixels[index + 2] = clampChannel(blue);
    }

    context.putImageData(imageData, 0, 0);

    return result;
}

/**
 * Apply blur only where the supplied mask has visible pixels.
 *
 * The mask should be a same-sized canvas with white/opaque
 * strokes where the user painted the blur effect.
 */
export function applyLocalBlur(
    source: HTMLCanvasElement,
    mask: HTMLCanvasElement,
    blurRadius: number
): HTMLCanvasElement {
    if (
        source.width !== mask.width ||
        source.height !== mask.height
    ) {
        throw new Error("The blur mask dimensions do not match the image.");
    }

    const result = document.createElement("canvas");

    result.width = source.width;
    result.height = source.height;

    const context = result.getContext("2d");

    if (!context) {
        throw new Error("Could not prepare the blur effect.");
    }

    // Start with the unchanged photo.
    context.drawImage(source, 0, 0);

    // Render a blurred copy separately.
    const blurred = document.createElement("canvas");

    blurred.width = source.width;
    blurred.height = source.height;

    const blurredContext = blurred.getContext("2d");

    if (!blurredContext) {
        throw new Error("Could not prepare the blur layer.");
    }

    const safeRadius = Math.max(0, blurRadius);

    blurredContext.filter = `blur(${safeRadius}px)`;
    blurredContext.drawImage(source, 0, 0);
    blurredContext.filter = "none";

    // Keep the blurred pixels only inside the painted mask.
    blurredContext.globalCompositeOperation = "destination-in";
    blurredContext.drawImage(mask, 0, 0);
    blurredContext.globalCompositeOperation = "source-over";

    // Place the masked blur over the original photo.
    context.drawImage(blurred, 0, 0);

    return result;
}

/**
 * Resize a canvas without changing its source.
 */
export function resizeCanvas(
    source: HTMLCanvasElement,
    width: number,
    height: number
): HTMLCanvasElement {
    const safeWidth = Math.max(1, Math.round(width));
    const safeHeight = Math.max(1, Math.round(height));

    const result = document.createElement("canvas");

    result.width = safeWidth;
    result.height = safeHeight;

    const context = result.getContext("2d");

    if (!context) {
        throw new Error("Could not resize the image.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    context.drawImage(
        source,
        0,
        0,
        safeWidth,
        safeHeight
    );

    return result;
}

/**
 * Convert a canvas into a File.
 *
 * PNG remains PNG to preserve transparency.
 * WebP remains WebP when supported by the browser.
 * Other formats are exported as JPEG.
 */
export async function canvasToFile(
    canvas: HTMLCanvasElement,
    originalFile: File
): Promise<File> {
    const supportedTypes = [
        "image/png",
        "image/jpeg",
        "image/webp",
    ];

    const requestedType = supportedTypes.includes(originalFile.type)
        ? originalFile.type
        : "image/jpeg";

    const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(
            resolve,
            requestedType,
            requestedType === "image/jpeg" ||
                requestedType === "image/webp"
                ? 0.94
                : undefined
        );
    });

    if (!blob) {
        throw new Error("The edited image could not be exported.");
    }

    // Use the actual MIME type returned by the browser.
    const finalMimeType = blob.type || requestedType;

    const extension =
        finalMimeType === "image/png"
            ? "png"
            : finalMimeType === "image/webp"
                ? "webp"
                : "jpg";

    const baseName =
        originalFile.name.replace(/\.[^/.]+$/, "") ||
        "rhockstar-image";

    return new File(
        [blob],
        `${baseName}-edited.${extension}`,
        {
            type: finalMimeType,
            lastModified: Date.now(),
        }
    );
}

/**
 * Keep colour channel values within the valid 0–255 range.
 */
function clampChannel(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

export interface ImageTransform {
    rotation: 0 | 90 | 180 | 270;
    flipHorizontal: boolean;
    flipVertical: boolean;
}

/**
 * Rotate and flip an image on a new canvas.
 *
 * The original canvas is never modified.
 * The resulting canvas dimensions are adjusted for
 * quarter-turn rotations.
 */
export function transformCanvas(
    source: HTMLCanvasElement,
    transform: ImageTransform
): HTMLCanvasElement {
    const {
        rotation,
        flipHorizontal,
        flipVertical,
    } = transform;

    const sideways = rotation === 90 || rotation === 270;

    const result = document.createElement("canvas");

    result.width = sideways ? source.height : source.width;
    result.height = sideways ? source.width : source.height;

    const context = result.getContext("2d");

    if (!context) {
        throw new Error("Could not prepare the image transformation.");
    }

    context.translate(result.width / 2, result.height / 2);

    context.rotate((rotation * Math.PI) / 180);

    context.scale(
        flipHorizontal ? -1 : 1,
        flipVertical ? -1 : 1
    );

    context.drawImage(
        source,
        -source.width / 2,
        -source.height / 2
    );

    return result;
}

/**
 * Return a canvas at the requested output dimensions.
 *
 * The caller is responsible for calculating the correct
 * height when the aspect ratio is locked.
 */
export function createOutputCanvas(
    source: HTMLCanvasElement,
    width: number,
    height: number
): HTMLCanvasElement {
    return resizeCanvas(source, width, height);
}
