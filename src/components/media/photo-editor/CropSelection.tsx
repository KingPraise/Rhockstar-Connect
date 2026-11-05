
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { CropRect } from "./editor-types";

type DragMode = "move" | "nw" | "ne" | "sw" | "se";

interface CropSelectionProps {
  width: number;
  height: number;
  aspectRatio?: number | null;
  onChange: (crop: CropRect) => void;
}

interface Point {
  x: number;
  y: number;
}

interface DragState {
  mode: DragMode;
  start: Point;
  initial: CropRect;
}

const MIN_CROP_SIZE = 40;

export default function CropSelection({
  width,
  height,
  aspectRatio = null,
  onChange,
}: CropSelectionProps) {
  const [crop, setCrop] = useState<CropRect>(() =>
    createInitialCrop(width, height, aspectRatio)
  );

  const dragRef = useRef<DragState | null>(null);

  // Immediately update the crop frame when the user selects
  // a different aspect ratio.
  useEffect(() => {
    const nextCrop = createInitialCrop(
      width,
      height,
      aspectRatio
    );

    setCrop(nextCrop);
    onChange(nextCrop);
    dragRef.current = null;
  }, [width, height, aspectRatio, onChange]);

  const updateCrop = useCallback(
    (next: CropRect) => {
      setCrop(next);
      onChange(next);
    },
    [onChange]
  );

  const getPoint = (
    event: ReactPointerEvent<HTMLDivElement>
  ): Point => {
    const bounds = event.currentTarget.getBoundingClientRect();

    return {
      x:
        ((event.clientX - bounds.left) / bounds.width) *
        width,
      y:
        ((event.clientY - bounds.top) / bounds.height) *
        height,
    };
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    mode: DragMode
  ) => {
    event.preventDefault();
    event.stopPropagation();

    event.currentTarget.setPointerCapture(event.pointerId);

    dragRef.current = {
      mode,
      start: getPoint(event),
      initial: { ...crop },
    };
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    const drag = dragRef.current;

    if (!drag) return;

    const point = getPoint(event);

    const dx = point.x - drag.start.x;
    const dy = point.y - drag.start.y;

    const initial = drag.initial;

    if (drag.mode === "move") {
      const left = clamp(
        initial.left + dx,
        0,
        width - initial.width
      );

      const top = clamp(
        initial.top + dy,
        0,
        height - initial.height
      );

      updateCrop({
        ...initial,
        left,
        top,
      });

      return;
    }

    const next = resizeCrop(
      initial,
      drag.mode,
      dx,
      dy,
      width,
      height,
      aspectRatio
    );

    updateCrop(next);
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div
      className="absolute inset-0 touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Darken everything outside the crop area. */}
      <div
        className="absolute inset-0 bg-black/55"
        style={{
          clipPath: `polygon(
            0 0,
            100% 0,
            100% 100%,
            0 100%,
            0 0,
            ${percentage(crop.left, width)}% ${percentage(crop.top, height)}%,
            ${percentage(crop.left, width)}% ${percentage(crop.top + crop.height, height)}%,
            ${percentage(crop.left + crop.width, width)}% ${percentage(crop.top + crop.height, height)}%,
            ${percentage(crop.left + crop.width, width)}% ${percentage(crop.top, height)}%,
            ${percentage(crop.left, width)}% ${percentage(crop.top, height)}%
          )`,
          clipRule: "evenodd",
        }}
      />

      {/* Crop frame. */}
      <div
        className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)]"
        style={{
          left: `${percentage(crop.left, width)}%`,
          top: `${percentage(crop.top, height)}%`,
          width: `${percentage(crop.width, width)}%`,
          height: `${percentage(crop.height, height)}%`,
        }}
      >
        {/* Rule-of-thirds guides. */}
        <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
          {Array.from({ length: 9 }, (_, index) => (
            <div
              key={index}
              className="border border-white/30"
            />
          ))}
        </div>

        {/* Move crop area. */}
        <div
          className="absolute inset-0 cursor-move"
          onPointerDown={(event) =>
            handlePointerDown(event, "move")
          }
        />

        {/* Resize handles. */}
        <ResizeHandle
          position="top-0 left-0 -translate-x-1/2 -translate-y-1/2"
          onPointerDown={(event) =>
            handlePointerDown(event, "nw")
          }
        />

        <ResizeHandle
          position="top-0 right-0 translate-x-1/2 -translate-y-1/2"
          onPointerDown={(event) =>
            handlePointerDown(event, "ne")
          }
        />

        <ResizeHandle
          position="bottom-0 left-0 -translate-x-1/2 translate-y-1/2"
          onPointerDown={(event) =>
            handlePointerDown(event, "sw")
          }
        />

        <ResizeHandle
          position="bottom-0 right-0 translate-x-1/2 translate-y-1/2"
          onPointerDown={(event) =>
            handlePointerDown(event, "se")
          }
        />
      </div>
    </div>
  );
}

function createInitialCrop(
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number | null
): CropRect {
  if (!imageWidth || !imageHeight) {
    return {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };
  }

  // Free mode starts with a generous selection.
  if (!aspectRatio || !Number.isFinite(aspectRatio)) {
    const cropWidth = imageWidth * 0.8;
    const cropHeight = imageHeight * 0.8;

    return {
      left: (imageWidth - cropWidth) / 2,
      top: (imageHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight,
    };
  }

  // Find the largest rectangle with the selected ratio
  // that fits inside the image.
  let cropWidth = imageWidth;
  let cropHeight = cropWidth / aspectRatio;

  if (cropHeight > imageHeight) {
    cropHeight = imageHeight;
    cropWidth = cropHeight * aspectRatio;
  }

  return {
    left: (imageWidth - cropWidth) / 2,
    top: (imageHeight - cropHeight) / 2,
    width: cropWidth,
    height: cropHeight,
  };
}

function ResizeHandle({
  position,
  onPointerDown,
}: {
  position: string;
  onPointerDown: (
    event: ReactPointerEvent<HTMLDivElement>
  ) => void;
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute z-10 h-3.5 w-3.5 rounded-sm border-2 border-violet-500 bg-white ${position}`}
    />
  );
}

function resizeCrop(
  crop: CropRect,
  mode: DragMode,
  dx: number,
  dy: number,
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number | null
): CropRect {
  let left = crop.left;
  let top = crop.top;
  let right = crop.left + crop.width;
  let bottom = crop.top + crop.height;

  if (mode.includes("w")) left += dx;
  if (mode.includes("e")) right += dx;
  if (mode.includes("n")) top += dy;
  if (mode.includes("s")) bottom += dy;

  left = clamp(left, 0, imageWidth);
  right = clamp(right, 0, imageWidth);
  top = clamp(top, 0, imageHeight);
  bottom = clamp(bottom, 0, imageHeight);

  let nextWidth = Math.max(MIN_CROP_SIZE, right - left);
  let nextHeight = Math.max(MIN_CROP_SIZE, bottom - top);

  if (aspectRatio) {
    if (nextWidth / nextHeight > aspectRatio) {
      nextWidth = nextHeight * aspectRatio;
    } else {
      nextHeight = nextWidth / aspectRatio;
    }

    if (mode.includes("w")) {
      left = right - nextWidth;
    } else {
      right = left + nextWidth;
    }

    if (mode.includes("n")) {
      top = bottom - nextHeight;
    } else {
      bottom = top + nextHeight;
    }
  }

  // Keep the crop rectangle inside the image.
  if (left < 0) {
    right -= left;
    left = 0;
  }

  if (top < 0) {
    bottom -= top;
    top = 0;
  }

  if (right > imageWidth) {
    left -= right - imageWidth;
    right = imageWidth;
  }

  if (bottom > imageHeight) {
    top -= bottom - imageHeight;
    bottom = imageHeight;
  }

  left = clamp(left, 0, imageWidth - MIN_CROP_SIZE);
  top = clamp(top, 0, imageHeight - MIN_CROP_SIZE);

  return {
    left,
    top,
    width: Math.max(MIN_CROP_SIZE, right - left),
    height: Math.max(MIN_CROP_SIZE, bottom - top),
  };
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(max, Math.max(min, value));
}

function percentage(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}
