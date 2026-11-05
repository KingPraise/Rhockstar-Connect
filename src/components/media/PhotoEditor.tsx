"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";
import type { Canvas as FabricCanvas } from "fabric";

import EditorControls from "./photo-editor/EditorControls";
import CropSelection from "./photo-editor/CropSelection";

import type {
    CropPreset,
    CropRect,
    EditorTool,
    ImageAdjustments,
} from "./photo-editor/editor-types";

import {
    applyImageAdjustments,
    applyLocalBlur,
    canvasToFile,
    cropCanvas,
    getAspectCrop,
    loadImageFile,
    resizeCanvas,
    transformCanvas,
} from "./photo-editor/editor-utils";

interface PhotoEditorProps {
    image: File;
    onConfirm: (editedFile: File) => void;
    onClose: () => void;
}

const subscribeToMount = () => () => { };
const getMountSnapshot = () => true;
const getServerMountSnapshot = () => false;

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
};

export default function PhotoEditor({
    image,
    onConfirm,
    onClose,
}: PhotoEditorProps) {
    const canvasElementRef = useRef<HTMLCanvasElement>(null);
    const canvasMountRef = useRef<HTMLDivElement>(null);
    const blurMaskRef = useRef<HTMLCanvasElement>(null);

    const fabricCanvasRef = useRef<FabricCanvas | null>(null);
    const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);

    const objectUrlRef = useRef<string | null>(null);
    const dimensionsRef = useRef({ width: 0, height: 0 });

    const blurDrawingRef = useRef(false);
    const historyRef = useRef<string[]>([]);
    const historyIndexRef = useRef(0);

    const aspectRatioRef = useRef(1);

    const mounted = useSyncExternalStore(
        subscribeToMount,
        getMountSnapshot,
        getServerMountSnapshot
    );

    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [activeTool, setActiveTool] = useState<EditorTool>("select");

    const [cropPreset, setCropPreset] = useState<CropPreset>("free");
    const [cropRect, setCropRect] = useState<CropRect | null>(null);

    const [brushColor, setBrushColor] = useState("#ffffff");
    const [brushSize, setBrushSize] = useState(8);
    const [blurSize, setBlurSize] = useState(36);

    const [textValue, setTextValue] = useState("");

    const [adjustments, setAdjustments] =
        useState<ImageAdjustments>(DEFAULT_ADJUSTMENTS);

    const [outputWidth, setOutputWidth] = useState(0);
    const [outputHeight, setOutputHeight] = useState(0);
    const [lockAspectRatio, setLockAspectRatio] = useState(true);

    // Actual image dimensions, not its CSS display dimensions.
    const [imageDimensions, setImageDimensions] = useState({
        width: 0,
        height: 0,
    });

    // Dimensions of the image as displayed inside the editor workspace.
    const [displaySize, setDisplaySize] = useState({
        width: 0,
        height: 0,
    });

    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);

    const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

    const syncHistoryControls = useCallback(() => {
        setCanUndo(historyIndexRef.current > 0);

        setCanRedo(
            historyIndexRef.current < historyRef.current.length - 1
        );
    }, []);

    const saveHistory = useCallback(() => {
        const canvas = fabricCanvasRef.current;

        if (!canvas) return;

        const snapshot = canvas.toDataURL({
            format: "png",
            multiplier: 1,
        });

        const history = historyRef.current.slice(
            0,
            historyIndexRef.current + 1
        );

        history.push(snapshot);

        // Limit history to prevent excessive memory usage.
        if (history.length > 20) {
            history.shift();
        }

        historyRef.current = history;
        historyIndexRef.current = history.length - 1;

        syncHistoryControls();
    }, [syncHistoryControls]);

    // Fit the actual image into the available workspace without
    // changing its original pixel dimensions.
    const fitCanvas = useCallback(() => {
        const canvas = fabricCanvasRef.current;
        const mount = canvasMountRef.current;

        if (!canvas || !mount) return;

        const { width, height } = dimensionsRef.current;

        if (!width || !height) return;

        const bounds = mount.getBoundingClientRect();

        const availableWidth = Math.max(1, bounds.width - 32);
        const availableHeight = Math.max(1, bounds.height - 32);

        const scale = Math.min(
            availableWidth / width,
            availableHeight / height,
            1
        );

        const displayWidth = Math.max(
            1,
            Math.round(width * scale)
        );

        const displayHeight = Math.max(
            1,
            Math.round(height * scale)
        );

        canvas.setDimensions(
            {
                width: displayWidth,
                height: displayHeight,
            },
            { cssOnly: true }
        );

        setDisplaySize((current) => {
            if (
                current.width === displayWidth &&
                current.height === displayHeight
            ) {
                return current;
            }

            return {
                width: displayWidth,
                height: displayHeight,
            };
        });

        canvas.calcOffset();
    }, []);

    const exportCanvas = useCallback(async () => {
    const canvas = fabricCanvasRef.current;

    if (!canvas) {
        throw new Error("The editor is not ready.");
    }

    const width = dimensionsRef.current.width;
    const height = dimensionsRef.current.height;

    if (!width || !height) {
        throw new Error("The image dimensions are unavailable.");
    }

    const exported = canvas.toCanvasElement(1);

    const result = document.createElement("canvas");
    result.width = width;
    result.height = height;

    const context = result.getContext("2d");

    if (!context) {
        throw new Error("Could not prepare the image for export.");
    }

    context.drawImage(exported, 0, 0, width, height);

    return result;
}, []);

    const replaceCanvasImage = useCallback(
        async (source: HTMLCanvasElement) => {
            const { FabricImage } = await import("fabric");
            const canvas = fabricCanvasRef.current;

            if (!canvas) return;

            const dataUrl = source.toDataURL("image/png");
            const replacement = await FabricImage.fromURL(dataUrl);

            canvas.clear();

            replacement.set({
                left: 0,
                top: 0,
                originX: "left",
                originY: "top",
                selectable: false,
                evented: false,
            });

            canvas.setDimensions({
                width: source.width,
                height: source.height,
            });

            canvas.add(replacement);
            canvas.requestRenderAll();

            dimensionsRef.current = {
                width: source.width,
                height: source.height,
            };

            setImageDimensions({
                width: source.width,
                height: source.height,
            });

            aspectRatioRef.current = source.width / source.height;

            setOutputWidth(source.width);
            setOutputHeight(source.height);

            fitCanvas();
            saveHistory();
        },
        [fitCanvas, saveHistory]
    );

    // Lock page scrolling while the editor is open.
    useEffect(() => {
        if (!mounted) return;

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mounted]);

    // Close with Escape.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isExporting) {
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isExporting, onClose]);

    // Initialise Fabric and load the selected image.
    useEffect(() => {
        if (!mounted || !canvasElementRef.current) return;

        let cancelled = false;
        let resizeObserver: ResizeObserver | null = null;
        let instance: FabricCanvas | null = null;
        let sourceUrl: string | null = null;

        const initialise = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const { Canvas, FabricImage } = await import("fabric");

                const loaded = await loadImageFile(image);

                sourceUrl = loaded.objectUrl;
                objectUrlRef.current = sourceUrl;

                if (cancelled) {
                    URL.revokeObjectURL(sourceUrl);
                    return;
                }

                const width = loaded.image.naturalWidth;
                const height = loaded.image.naturalHeight;

                if (!width || !height) {
                    throw new Error(
                        "The selected image has invalid dimensions."
                    );
                }

                const original = document.createElement("canvas");

                original.width = width;
                original.height = height;

                const originalContext = original.getContext("2d");

                if (!originalContext) {
                    throw new Error("Could not prepare the original image.");
                }

                originalContext.drawImage(loaded.image, 0, 0);

                originalCanvasRef.current = original;

                dimensionsRef.current = { width, height };

                setImageDimensions({ width, height });

                aspectRatioRef.current = width / height;

                setOutputWidth(width);
                setOutputHeight(height);

                instance = new Canvas(canvasElementRef.current!, {
                    width,
                    height,
                    backgroundColor: "#080910",
                    selection: true,
                    preserveObjectStacking: true,
                    enableRetinaScaling: false,
                    renderOnAddRemove: true,
                    allowTouchScrolling: false,
                });

                fabricCanvasRef.current = instance;

                const fabricImage = await FabricImage.fromURL(sourceUrl);

                if (cancelled) return;

                fabricImage.set({
                    left: 0,
                    top: 0,
                    originX: "left",
                    originY: "top",
                    selectable: false,
                    evented: false,
                });

                instance.add(fabricImage);
                instance.requestRenderAll();

                const fit = () => {
                    if (cancelled) return;

                    fitCanvas();
                };

                resizeObserver = new ResizeObserver(fit);

                if (canvasMountRef.current) {
                    resizeObserver.observe(canvasMountRef.current);
                }

                fit();

                historyRef.current = [];
                historyIndexRef.current = -1;

                saveHistory();

                setIsLoading(false);
            } catch (err) {
                console.error("Photo editor initialisation failed:", err);

                if (!cancelled) {
                    setError(
                        "We couldn't open this image. Try selecting another image."
                    );

                    setIsLoading(false);
                }
            }
        };

        void initialise();

        return () => {
            cancelled = true;

            resizeObserver?.disconnect();

            if (fabricCanvasRef.current === instance) {
                fabricCanvasRef.current = null;
            }

            if (instance) {
                void instance.dispose();
            }

            if (sourceUrl) {
                URL.revokeObjectURL(sourceUrl);
            }

            objectUrlRef.current = null;
            originalCanvasRef.current = null;
        };
    }, [image, mounted, fitCanvas, saveHistory]);

    // Configure Fabric drawing mode.
    useEffect(() => {
        const canvas = fabricCanvasRef.current;

        if (!canvas || isLoading) return;

        const configure = async () => {
            if (activeTool === "draw") {
                const { PencilBrush } = await import("fabric");

                if (fabricCanvasRef.current !== canvas) return;

                const brush = new PencilBrush(canvas);

                brush.color = brushColor;
                brush.width = brushSize;

                canvas.freeDrawingBrush = brush;
                canvas.isDrawingMode = true;
                canvas.selection = false;
            } else {
                canvas.isDrawingMode = false;
                canvas.selection = activeTool === "select";
            }

            canvas.requestRenderAll();
        };

        void configure();
    }, [activeTool, brushColor, brushSize, isLoading]);

    // Save completed drawing strokes.
    useEffect(() => {
        const canvas = fabricCanvasRef.current;

        if (!canvas) return;

        const handlePathCreated = () => saveHistory();

        canvas.on("path:created", handlePathCreated);

        return () => {
            canvas.off("path:created", handlePathCreated);
        };
    }, [saveHistory, isLoading]);

    const handleCropPresetChange = useCallback(
        (preset: CropPreset) => {
            setCropPreset(preset);

            const { width, height } = dimensionsRef.current;

            if (!width || !height) return;

            const ratio = (() => {
                switch (preset) {
                    case "1:1":
                        return 1;

                    case "4:5":
                        return 4 / 5;

                    case "16:9":
                        return 16 / 9;

                    case "9:16":
                        return 9 / 16;

                    case "original":
                        return aspectRatioRef.current;

                    default:
                        return null;
                }
            })();

            setCropRect(
                ratio
                    ? getAspectCrop(width, height, ratio)
                    : {
                        left: width * 0.1,
                        top: height * 0.1,
                        width: width * 0.8,
                        height: height * 0.8,
                    }
            );
        },
        []
    );

    const handleApplyCrop = useCallback(async () => {
        if (!cropRect) return;

        try {
            const current = await exportCanvas();
            const cropped = cropCanvas(current, cropRect);

            await replaceCanvasImage(cropped);

            setCropRect(null);
            setCropPreset("free");
            setActiveTool("select");
        } catch (err) {
            console.error("Crop failed:", err);

            setError("We couldn't crop this image. Please try again.");
        }
    }, [cropRect, exportCanvas, replaceCanvasImage]);

    // Rotate the current image by one quarter-turn at a time.
    const handleRotate = useCallback(
        async (direction: 1 | -1) => {
            try {
                const current = await exportCanvas();

                const nextRotation = (
                    (rotation + direction * 90 + 360) % 360
                ) as 0 | 90 | 180 | 270;

                const transformed = transformCanvas(current, {
                    rotation: direction === 1 ? 90 : 270,
                    flipHorizontal: false,
                    flipVertical: false,
                });

                setRotation(nextRotation);

                await replaceCanvasImage(transformed);
            } catch (err) {
                console.error("Rotation failed:", err);

                setError("We couldn't rotate this image.");
            }
        },
        [exportCanvas, rotation, replaceCanvasImage]
    );

    const handleFlipHorizontal = useCallback(async () => {
        try {
            const current = await exportCanvas();

            const transformed = transformCanvas(current, {
                rotation: 0,
                flipHorizontal: true,
                flipVertical: false,
            });

            await replaceCanvasImage(transformed);
        } catch (err) {
            console.error("Horizontal flip failed:", err);

            setError("We couldn't flip this image.");
        }
    }, [exportCanvas, replaceCanvasImage]);

    const handleFlipVertical = useCallback(async () => {
        try {
            const current = await exportCanvas();

            const transformed = transformCanvas(current, {
                rotation: 0,
                flipHorizontal: false,
                flipVertical: true,
            });

            await replaceCanvasImage(transformed);
        } catch (err) {
            console.error("Vertical flip failed:", err);

            setError("We couldn't flip this image.");
        }
    }, [exportCanvas, replaceCanvasImage]);

    const handleAddText = useCallback(async () => {
        if (!textValue.trim()) return;

        try {
            const { IText, Shadow } = await import("fabric");

            const canvas = fabricCanvasRef.current;

            if (!canvas) return;

            const text = new IText(textValue.trim(), {
                left: dimensionsRef.current.width / 2,
                top: dimensionsRef.current.height / 2,
                originX: "center",
                originY: "center",
                fontFamily: "Arial",
                fontSize: Math.max(
                    24,
                    dimensionsRef.current.width * 0.045
                ),
                fill: "#ffffff",
                textAlign: "center",
                editable: true,
                selectable: true,
                shadow: new Shadow({
                    color: "rgba(0, 0, 0, 0.5)",
                    blur: 4,
                    offsetX: 1,
                    offsetY: 2,
                }),
            });

            canvas.add(text);
            canvas.setActiveObject(text);
            canvas.requestRenderAll();

            setTextValue("");
            setActiveTool("select");

            saveHistory();
        } catch (err) {
            console.error("Adding text failed:", err);

            setError("We couldn't add text to this image.");
        }
    }, [textValue, saveHistory]);

    const handleAdjustmentChange = useCallback(
        (key: keyof ImageAdjustments, value: number) => {
            setAdjustments((current) => ({
                ...current,
                [key]: value,
            }));
        },
        []
    );

    const handleResetAdjustments = useCallback(() => {
        setAdjustments(DEFAULT_ADJUSTMENTS);
    }, []);

    const handleOutputWidthChange = useCallback(
        (width: number) => {
            setOutputWidth(width);

            if (lockAspectRatio) {
                setOutputHeight(
                    Math.max(
                        1,
                        Math.round(width / aspectRatioRef.current)
                    )
                );
            }
        },
        [lockAspectRatio]
    );

    const handleOutputHeightChange = useCallback(
        (height: number) => {
            setOutputHeight(height);

            if (lockAspectRatio) {
                setOutputWidth(
                    Math.max(
                        1,
                        Math.round(height * aspectRatioRef.current)
                    )
                );
            }
        },
        [lockAspectRatio]
    );

    const handleApplyResize = useCallback(async () => {
    const width = Math.round(Number(outputWidth));
    const height = Math.round(Number(outputHeight));

    if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width < 1 ||
        height < 1
    ) {
        setError("Enter valid image dimensions.");
        return;
    }

    // Prevent extremely large output dimensions from exhausting memory.
    const MAX_DIMENSION = 12000;
    const MAX_PIXELS = 40_000_000;

    if (
        width > MAX_DIMENSION ||
        height > MAX_DIMENSION ||
        width * height > MAX_PIXELS
    ) {
        setError(
            "Those dimensions are too large. Choose a smaller image size."
        );
        return;
    }

    try {
        setError(null);
        setIsExporting(true);

        const currentCanvas = await exportCanvas();

        const resizedCanvas = resizeCanvas(
            currentCanvas,
            width,
            height
        );

        await replaceCanvasImage(resizedCanvas);

        setOutputWidth(width);
        setOutputHeight(height);

        setActiveTool("select");
    } catch (err) {
        console.error("Resize failed:", err);

        setError(
            err instanceof Error
                ? `Resize failed: ${err.message}`
                : "We couldn't resize this image. Please try again."
        );
    } finally {
        setIsExporting(false);
    }
}, [
    outputWidth,
    outputHeight,
    exportCanvas,
    replaceCanvasImage,
]);
    const handleBlurPointer = useCallback(
        (event: ReactPointerEvent<HTMLCanvasElement>) => {
            const mask = blurMaskRef.current;

            if (!mask) return;

            const bounds = event.currentTarget.getBoundingClientRect();

            if (!bounds.width || !bounds.height) return;

            const scaleX = mask.width / bounds.width;
            const scaleY = mask.height / bounds.height;

            const x = (event.clientX - bounds.left) * scaleX;
            const y = (event.clientY - bounds.top) * scaleY;

            const context = mask.getContext("2d");

            if (!context) return;

            if (event.type === "pointerdown") {
                blurDrawingRef.current = true;

                event.currentTarget.setPointerCapture(event.pointerId);

                context.beginPath();
                context.moveTo(x, y);
            } else if (
                event.type === "pointermove" &&
                blurDrawingRef.current
            ) {
                context.lineTo(x, y);
                context.strokeStyle = "#ffffff";
                context.lineWidth = blurSize * scaleX;
                context.lineCap = "round";
                context.lineJoin = "round";
                context.stroke();
            } else {
                blurDrawingRef.current = false;
            }
        },
        [blurSize]
    );

    const handleApplyBlur = useCallback(async () => {
        const mask = blurMaskRef.current;

        if (!mask) return;

        try {
            const current = await exportCanvas();

            const blurred = applyLocalBlur(
                current,
                mask,
                Math.max(4, blurSize / 2)
            );

            const context = mask.getContext("2d");

            context?.clearRect(0, 0, mask.width, mask.height);

            await replaceCanvasImage(blurred);

            setActiveTool("select");
        } catch (err) {
            console.error("Local blur failed:", err);

            setError("We couldn't apply the blur effect.");
        }
    }, [exportCanvas, blurSize, replaceCanvasImage]);

    // Restore a saved image snapshot from the undo/redo history.
    const restoreHistoryEntry = useCallback(
        async (dataUrl: string) => {
            const { FabricImage } = await import("fabric");

            const canvas = fabricCanvasRef.current;

            if (!canvas) return;

            const restored = await FabricImage.fromURL(dataUrl);

            canvas.clear();

            restored.set({
                left: 0,
                top: 0,
                originX: "left",
                originY: "top",
                selectable: false,
                evented: false,
            });

            canvas.setDimensions({
                width: restored.width,
                height: restored.height,
            });

            canvas.add(restored);
            canvas.requestRenderAll();

            dimensionsRef.current = {
                width: restored.width,
                height: restored.height,
            };

            setImageDimensions({
                width: restored.width,
                height: restored.height,
            });

            aspectRatioRef.current =
                restored.width / restored.height;

            setOutputWidth(restored.width);
            setOutputHeight(restored.height);

            fitCanvas();
        },
        [fitCanvas]
    );

    const handleUndo = useCallback(async () => {
        if (historyIndexRef.current <= 0) return;

        historyIndexRef.current -= 1;

        try {
            await restoreHistoryEntry(
                historyRef.current[historyIndexRef.current]
            );

            syncHistoryControls();
        } catch (err) {
            console.error("Undo failed:", err);

            setError("We couldn't undo that change.");
        }
    }, [restoreHistoryEntry, syncHistoryControls]);

    const handleRedo = useCallback(async () => {
        if (
            historyIndexRef.current >=
            historyRef.current.length - 1
        ) {
            return;
        }

        historyIndexRef.current += 1;

        try {
            await restoreHistoryEntry(
                historyRef.current[historyIndexRef.current]
            );

            syncHistoryControls();
        } catch (err) {
            console.error("Redo failed:", err);

            setError("We couldn't redo that change.");
        }
    }, [restoreHistoryEntry, syncHistoryControls]);

    const handleReset = useCallback(async () => {
        if (!originalCanvasRef.current) return;

        try {
            await replaceCanvasImage(originalCanvasRef.current);

            setAdjustments(DEFAULT_ADJUSTMENTS);
            setRotation(0);
            setCropRect(null);
            setCropPreset("free");
            setActiveTool("select");

            const mask = blurMaskRef.current;
            const context = mask?.getContext("2d");

            if (mask && context) {
                context.clearRect(0, 0, mask.width, mask.height);
            }
        } catch (err) {
            console.error("Reset failed:", err);

            setError("We couldn't reset the image.");
        }
    }, [replaceCanvasImage]);

    const handleConfirm = useCallback(async () => {
        if (isExporting) return;

        try {
            setIsExporting(true);
            setError(null);

            let result = await exportCanvas();

            // Apply pending adjustments once before export.
            if (
                adjustments.brightness !== 0 ||
                adjustments.contrast !== 0 ||
                adjustments.saturation !== 0
            ) {
                result = applyImageAdjustments(result, adjustments);
            }

            // Apply output dimensions if they haven't already been applied.
            if (
                result.width !== outputWidth ||
                result.height !== outputHeight
            ) {
                result = resizeCanvas(
                    result,
                    outputWidth,
                    outputHeight
                );
            }

            const editedFile = await canvasToFile(result, image);

            onConfirm(editedFile);
        } catch (err) {
            console.error("Photo export failed:", err);

            setError("Couldn't export your image. Please try again.");
        } finally {
            setIsExporting(false);
        }
    }, [
        isExporting,
        exportCanvas,
        adjustments,
        outputWidth,
        outputHeight,
        image,
        onConfirm,
    ]);

    if (!mounted) return null;

    const cropAspect = (() => {
        switch (cropPreset) {
            case "1:1":
                return 1;

            case "4:5":
                return 4 / 5;

            case "16:9":
                return 16 / 9;

            case "9:16":
                return 9 / 16;

            case "original":
                return imageDimensions.width && imageDimensions.height
                    ? imageDimensions.width / imageDimensions.height
                    : null;

            default:
                return null;
        }
    })();

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Photo editor"
            className="fixed inset-0 z-[9999] flex flex-col bg-[#080910] text-white"
        >
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#0d0e18] px-4 sm:px-6">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isExporting}
                        aria-label="Close photo editor"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
                    >
                        <span className="text-xl">×</span>
                    </button>

                    <div>
                        <h2 className="text-sm font-semibold sm:text-base">
                            Photo editor
                        </h2>

                        <p className="text-[11px] text-white/40">
                            Edit your image before sharing
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="hidden max-w-48 truncate text-xs text-white/40 sm:block">
                        {image.name}
                    </span>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isLoading || isExporting || !!error}
                        className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
                    >
                        {isExporting ? "Preparing..." : "Use photo"}
                    </button>
                </div>
            </header>

            <main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
                <section className="relative flex min-h-[260px] min-w-0 flex-1 items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.09),_transparent_65%)] p-3 sm:p-6">
                    <div
                        ref={canvasMountRef}
                        className="relative flex h-full w-full items-center justify-center overflow-hidden"
                    >
                        <div
                            className="relative flex shrink-0 items-center justify-center"
                            style={{
                                width: displaySize.width || undefined,
                                height: displaySize.height || undefined,
                                filter: [
                                    `brightness(${1 + adjustments.brightness / 100})`,
                                    `contrast(${1 + adjustments.contrast / 100})`,
                                    `saturate(${1 + adjustments.saturation / 100})`,
                                ].join(" "),
                            }}
                        >
                            <canvas ref={canvasElementRef} />

                            {activeTool === "crop" && cropRect && (
                                <CropSelection
                                    key={`${imageDimensions.width}-${imageDimensions.height}`}
                                    width={imageDimensions.width}
                                    height={imageDimensions.height}
                                    aspectRatio={cropAspect}
                                    onChange={setCropRect}
                                />
                            )}

                            {activeTool === "blur" &&
                                imageDimensions.width > 0 &&
                                imageDimensions.height > 0 && (
                                    <canvas
                                        ref={blurMaskRef}
                                        width={imageDimensions.width}
                                        height={imageDimensions.height}
                                        onPointerDown={handleBlurPointer}
                                        onPointerMove={handleBlurPointer}
                                        onPointerUp={handleBlurPointer}
                                        onPointerCancel={handleBlurPointer}
                                        className="absolute inset-0 h-full w-full touch-none cursor-crosshair"
                                    />
                                )}
                        </div>
                    </div>

                    {isLoading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080910]/80">
                            <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-violet-500" />

                            <p className="text-sm text-white/60">
                                Preparing your photo...
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#080910]/95 px-6 text-center">
                            <p className="max-w-sm text-sm text-red-300">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => setError(null)}
                                className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white hover:bg-white/10"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </section>

                <EditorControls
                    activeTool={activeTool}
                    onToolChange={(tool) => {
                        setActiveTool(tool);

                        if (tool === "crop" && !cropRect) {
                            handleCropPresetChange("free");
                        }

                        if (tool === "blur") {
                            const mask = blurMaskRef.current;
                            const context = mask?.getContext("2d");

                            if (mask && context) {
                                context.clearRect(
                                    0,
                                    0,
                                    mask.width,
                                    mask.height
                                );
                            }
                        }
                    }}
                    cropPreset={cropPreset}
                    onCropPresetChange={handleCropPresetChange}
                    onApplyCrop={handleApplyCrop}
                    brushColor={brushColor}
                    onBrushColorChange={setBrushColor}
                    brushSize={brushSize}
                    onBrushSizeChange={setBrushSize}
                    blurSize={blurSize}
                    onBlurSizeChange={setBlurSize}
                    onApplyBlur={handleApplyBlur}
                    textValue={textValue}
                    onTextValueChange={setTextValue}
                    onAddText={handleAddText}
                    adjustments={adjustments}
                    onAdjustmentChange={handleAdjustmentChange}
                    onResetAdjustments={handleResetAdjustments}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                    onOutputWidthChange={handleOutputWidthChange}
                    onOutputHeightChange={handleOutputHeightChange}
                    onApplyResize={() => void handleApplyResize()}
                    lockAspectRatio={lockAspectRatio}
                    onLockAspectRatioChange={setLockAspectRatio}
                    onRotateLeft={() => void handleRotate(-1)}
                    onRotateRight={() => void handleRotate(1)}
                    onFlipHorizontal={() => void handleFlipHorizontal()}
                    onFlipVertical={() => void handleFlipVertical()}
                    onUndo={() => void handleUndo()}
                    onRedo={() => void handleRedo()}
                    onReset={() => void handleReset()}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    disabled={isLoading || isExporting || !!error}
                />
            </main>
        </div>,
        document.body
    );
}