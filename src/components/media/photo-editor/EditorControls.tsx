
"use client";

import type { ReactNode } from "react";
import type {
  CropPreset,
  EditorTool,
  ImageAdjustments,
} from "./editor-types";

interface EditorControlsProps {
  activeTool: EditorTool;
  onToolChange: (tool: EditorTool) => void;

  cropPreset: CropPreset;
  onCropPresetChange: (preset: CropPreset) => void;
  onApplyCrop: () => void;

  brushColor: string;
  onBrushColorChange: (color: string) => void;
  brushSize: number;
  onBrushSizeChange: (size: number) => void;

  blurSize: number;
  onBlurSizeChange: (size: number) => void;
  onApplyBlur: () => void;

  textValue: string;
  onTextValueChange: (value: string) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  onAddText: () => void;

  adjustments: ImageAdjustments;
  onAdjustmentChange: (
    key: keyof ImageAdjustments,
    value: number
  ) => void;
  onApplyPreset: (preset: ImageAdjustments) => void;
  onResetAdjustments: () => void;

  outputWidth: number;
  outputHeight: number;
  onOutputWidthChange: (value: number) => void;
  onOutputHeightChange: (value: number) => void;
  onApplyResize: () => void;
  lockAspectRatio: boolean;
  onLockAspectRatioChange: (locked: boolean) => void;

  onRotateLeft: () => void;
  onRotateRight: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;

  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;

  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

const toolOptions: {
  id: EditorTool;
  label: string;
  icon: string;
}[] = [
  { id: "select", label: "Select", icon: "↖" },
  { id: "crop", label: "Crop", icon: "⌗" },
  { id: "draw", label: "Draw", icon: "✎" },
  { id: "blur", label: "Blur", icon: "◌" },
  { id: "text", label: "Text", icon: "T" },
  { id: "adjust", label: "Adjust", icon: "☷" },
];

const cropOptions: {
  value: CropPreset;
  label: string;
}[] = [
  { value: "free", label: "Free" },
  { value: "original", label: "Original" },
  { value: "1:1", label: "1:1" },
  { value: "4:5", label: "4:5" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
];

const COLOR_SWATCHES = [
  "#ffffff",
  "#0f172a",
  "#ef4444",
  "#facc15",
  "#22c55e",
  "#38bdf8",
  "#a855f7",
];

const FILTER_PRESETS: {
  label: string;
  values: ImageAdjustments;
}[] = [
  { label: "Original", values: { brightness: 0, contrast: 0, saturation: 0 } },
  { label: "Vivid", values: { brightness: 5, contrast: 18, saturation: 35 } },
  { label: "Warm", values: { brightness: 8, contrast: 8, saturation: 22 } },
  { label: "Cool", values: { brightness: 2, contrast: 12, saturation: -12 } },
  { label: "B&W", values: { brightness: 4, contrast: 22, saturation: -100 } },
  { label: "Dramatic", values: { brightness: -8, contrast: 36, saturation: 14 } },
];

export default function EditorControls({
  activeTool,
  onToolChange,

  cropPreset,
  onCropPresetChange,
  onApplyCrop,

  brushColor,
  onBrushColorChange,
  brushSize,
  onBrushSizeChange,

  blurSize,
  onBlurSizeChange,
  onApplyBlur,

  textValue,
  onTextValueChange,
  textColor,
  onTextColorChange,
  onAddText,

  adjustments,
  onAdjustmentChange,
  onApplyPreset,
  onResetAdjustments,

  outputWidth,
  outputHeight,
  onOutputWidthChange,
  onOutputHeightChange,
  onApplyResize,
  lockAspectRatio,
  onLockAspectRatioChange,

  onRotateLeft,
  onRotateRight,
  onFlipHorizontal,
  onFlipVertical,

  onUndo,
  onRedo,
  onReset,

  canUndo,
  canRedo,
  disabled = false,
}: EditorControlsProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-white/10 bg-[#0d0e18] lg:w-[280px] lg:border-l lg:border-t-0">
      {/* Tool navigation */}
      <div className="grid grid-cols-6 gap-1 border-b border-white/10 p-2 lg:grid-cols-3 lg:p-3">
        {toolOptions.map((tool) => {
          const active = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              disabled={disabled}
              onClick={() => onToolChange(tool.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs transition ${
                active
                  ? "bg-violet-600/20 text-violet-300 ring-1 ring-violet-500/40"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <span className="text-xl leading-none">
                {tool.icon}
              </span>
              {tool.label}
            </button>
          );
        })}
      </div>

      {/* Scrollable settings */}
      <div className="max-h-[42vh] flex-1 space-y-5 overflow-y-auto p-4 lg:max-h-none">
        {activeTool === "select" && (
          <section className="space-y-4">
            <PanelHeading>Transform</PanelHeading>

            <div className="grid grid-cols-2 gap-2">
              <ActionButton onClick={onRotateLeft} disabled={disabled}>
                ↶ Rotate left
              </ActionButton>

              <ActionButton onClick={onRotateRight} disabled={disabled}>
                ↷ Rotate right
              </ActionButton>

              <ActionButton onClick={onFlipHorizontal} disabled={disabled}>
                ⇆ Flip horizontal
              </ActionButton>

              <ActionButton onClick={onFlipVertical} disabled={disabled}>
                ⇅ Flip vertical
              </ActionButton>
            </div>

            <div className="space-y-3">
              <PanelHeading>Output dimensions</PanelHeading>

              <div className="grid grid-cols-2 gap-2">
                <NumberField
                  label="Width"
                  value={outputWidth}
                  onChange={onOutputWidthChange}
                  disabled={disabled}
                />

                <NumberField
                  label="Height"
                  value={outputHeight}
                  onChange={onOutputHeightChange}
                  disabled={disabled}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={lockAspectRatio}
                  onChange={(event) =>
                    onLockAspectRatioChange(event.target.checked)
                  }
                  disabled={disabled}
                  className="accent-violet-500"
                />
                Lock aspect ratio
              </label>

              <ActionButton
                onClick={onApplyResize}
                disabled={disabled}
                primary
                fullWidth
              >
                Apply resize
              </ActionButton>
            </div>
          </section>
        )}

        {activeTool === "crop" && (
          <section className="space-y-4">
            <PanelHeading>Crop image</PanelHeading>

            <div className="grid grid-cols-3 gap-2">
              {cropOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => onCropPresetChange(option.value)}
                  className={`rounded-lg border px-2 py-2 text-xs transition ${
                    cropPreset === option.value
                      ? "border-violet-500 bg-violet-500/15 text-violet-300"
                      : "border-white/10 text-white/60 hover:bg-white/5"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <p className="text-xs leading-5 text-white/40">
              Choose an aspect ratio, position the crop area on the
              image, then apply your crop.
            </p>

            <ActionButton
              onClick={onApplyCrop}
              disabled={disabled}
              primary
              fullWidth
            >
              Apply crop
            </ActionButton>
          </section>
        )}

        {activeTool === "draw" && (
          <section className="space-y-4">
            <PanelHeading>Drawing brush</PanelHeading>

            <div className="space-y-2.5">
              <FieldLabel>Brush colour</FieldLabel>

              <div className="flex flex-wrap items-center gap-2">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    disabled={disabled}
                    onClick={() => onBrushColorChange(swatch)}
                    style={{ backgroundColor: swatch }}
                    className={`h-7 w-7 rounded-full border transition ${
                      brushColor.toLowerCase() === swatch
                        ? "scale-110 border-violet-400 ring-2 ring-violet-500/50"
                        : "border-white/25 opacity-80 hover:opacity-100"
                    }`}
                    aria-label={`Select brush color ${swatch}`}
                  />
                ))}
                <input
                  type="color"
                  value={brushColor}
                  onChange={(event) =>
                    onBrushColorChange(event.target.value)
                  }
                  disabled={disabled}
                  className="h-8 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
              </div>
            </div>

            <RangeField
              label="Brush size"
              value={brushSize}
              min={1}
              max={80}
              onChange={onBrushSizeChange}
              disabled={disabled}
            />
          </section>
        )}

        {activeTool === "blur" && (
          <section className="space-y-4">
            <PanelHeading>Local blur brush</PanelHeading>

            <p className="text-xs leading-5 text-white/40">
              Tap or paint over areas you want to blur (highlighted in purple), then tap Apply.
            </p>

            <RangeField
              label="Brush size"
              value={blurSize}
              min={8}
              max={120}
              onChange={onBlurSizeChange}
              disabled={disabled}
            />

            <ActionButton
              onClick={onApplyBlur}
              disabled={disabled}
              primary
              fullWidth
            >
              Apply local blur
            </ActionButton>
          </section>
        )}

        {activeTool === "text" && (
          <section className="space-y-4">
            <PanelHeading>Add text</PanelHeading>

            <textarea
              value={textValue}
              onChange={(event) =>
                onTextValueChange(event.target.value)
              }
              placeholder="Write something..."
              rows={3}
              disabled={disabled}
              className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-500"
            />

            <div className="space-y-2">
              <FieldLabel>Text colour</FieldLabel>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    disabled={disabled}
                    onClick={() => onTextColorChange(swatch)}
                    style={{ backgroundColor: swatch }}
                    className={`h-7 w-7 rounded-full border transition ${
                      textColor.toLowerCase() === swatch
                        ? "scale-110 border-violet-400 ring-2 ring-violet-500/50"
                        : "border-white/25 opacity-80 hover:opacity-100"
                    }`}
                    aria-label={`Select text color ${swatch}`}
                  />
                ))}
                <input
                  type="color"
                  value={textColor}
                  onChange={(event) => onTextColorChange(event.target.value)}
                  disabled={disabled}
                  className="h-8 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
              </div>
            </div>

            <ActionButton
              onClick={onAddText}
              disabled={disabled || !textValue.trim()}
              primary
              fullWidth
            >
              Add to photo
            </ActionButton>

            <p className="text-xs text-white/40">
              Once added, select the text on the image to move, rotate, or resize it.
            </p>
          </section>
        )}

        {activeTool === "adjust" && (
          <section className="space-y-5">
            <div className="space-y-2.5">
              <PanelHeading>Filter presets</PanelHeading>
              <div className="grid grid-cols-3 gap-1.5">
                {FILTER_PRESETS.map((preset) => {
                  const isSelected =
                    adjustments.brightness === preset.values.brightness &&
                    adjustments.contrast === preset.values.contrast &&
                    adjustments.saturation === preset.values.saturation;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      disabled={disabled}
                      onClick={() => onApplyPreset(preset.values)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                        isSelected
                          ? "border-violet-500 bg-violet-500/20 text-violet-200"
                          : "border-white/10 text-white/65 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10">
              <PanelHeading>Fine adjustments</PanelHeading>

              <button
                type="button"
                onClick={onResetAdjustments}
                disabled={disabled}
                className="text-xs text-violet-300 hover:text-violet-200 disabled:opacity-40"
              >
                Reset
              </button>
            </div>

            <RangeField
              label="Brightness"
              value={adjustments.brightness}
              min={-100}
              max={100}
              onChange={(value) =>
                onAdjustmentChange("brightness", value)
              }
              disabled={disabled}
            />

            <RangeField
              label="Contrast"
              value={adjustments.contrast}
              min={-100}
              max={100}
              onChange={(value) =>
                onAdjustmentChange("contrast", value)
              }
              disabled={disabled}
            />

            <RangeField
              label="Saturation"
              value={adjustments.saturation}
              min={-100}
              max={100}
              onChange={(value) =>
                onAdjustmentChange("saturation", value)
              }
              disabled={disabled}
            />
          </section>
        )}
      </div>

      {/* History actions */}
      <div className="grid grid-cols-3 gap-2 border-t border-white/10 p-3">
        <ActionButton onClick={onUndo} disabled={disabled || !canUndo}>
          ↶ Undo
        </ActionButton>

        <ActionButton onClick={onRedo} disabled={disabled || !canRedo}>
          ↷ Redo
        </ActionButton>

        <ActionButton onClick={onReset} disabled={disabled}>
          Reset all
        </ActionButton>
      </div>
    </aside>
  );
}

function PanelHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-white/80">
      {children}
    </h3>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <span className="block text-xs text-white/50">
      {children}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  primary = false,
  fullWidth = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-35 ${
        fullWidth ? "w-full" : ""
      } ${
        primary
          ? "border-violet-500 bg-violet-600 text-white hover:bg-violet-500"
          : "border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <span className="text-xs tabular-nums text-white/50">
          {value}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        disabled={disabled}
        className="w-full cursor-pointer accent-violet-500 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <label className="space-y-1">
      <FieldLabel>{label}</FieldLabel>

      <input
        type="number"
        min={1}
        max={12000}
        value={value}
        onChange={(event) =>
          onChange(Math.max(1, Number(event.target.value) || 1))
        }
        disabled={disabled}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 disabled:opacity-40"
      />
    </label>
  );
}
