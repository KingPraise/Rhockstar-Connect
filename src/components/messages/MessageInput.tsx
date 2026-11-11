
"use client";

import { useRef, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
  RefObject,
} from "react";import { db } from "@/lib/firebase";

import {
  FileText,
  Mic,
  Paperclip,
  Send,
  Square,
  Trash2,
  X,
} from "lucide-react";

import PhotoEditor from "@/components/media/PhotoEditor";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (value: string) => void;

  mediaFile: File | null;
  mediaPreviewUrl: string | null;
  setMediaFile: (file: File | null) => void;
  setMediaPreviewUrl: (url: string | null) => void;

  isRecording: boolean;
  recordingTime: number;
  startRecording: () => void;
  stopRecording: () => void;

  onSendMessage: (event: FormEvent<HTMLFormElement>) => void;

  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export default function MessageInput({
  newMessage,
  setNewMessage,
  mediaFile,
  mediaPreviewUrl,
  setMediaFile,
  setMediaPreviewUrl,
  isRecording,
  recordingTime,
  startRecording,
  stopRecording,
  onSendMessage,
  textareaRef,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingImage, setEditingImage] = useState<File | null>(null);

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    // Allow selecting the same file again.
    event.target.value = "";

    if (!file) return;

    if (file.type.startsWith("image/")) {
      setEditingImage(file);
      return;
    }

    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }

    setMediaFile(file);

    // Create a preview URL for audio attachments.
    setMediaPreviewUrl(
      file.type.startsWith("audio/")
        ? URL.createObjectURL(file)
        : null
    );
  };

  const handleEditorConfirm = (editedFile: File) => {
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(editedFile);

    setMediaFile(editedFile);
    setMediaPreviewUrl(previewUrl);
    setEditingImage(null);
  };

  const handleRemoveAttachment = () => {
    if (mediaPreviewUrl) {
      URL.revokeObjectURL(mediaPreviewUrl);
    }

    setMediaFile(null);
    setMediaPreviewUrl(null);
  };

  const handleCancelRecording = () => {
    stopRecording();

    setTimeout(() => {
      setMediaFile(null);
      setMediaPreviewUrl(null);
    }, 50);
  };

  return (
    <>
      {editingImage && (
        <PhotoEditor
          image={editingImage}
          onConfirm={handleEditorConfirm}
          onClose={() => setEditingImage(null)}
        />
      )}

      <form
        onSubmit={onSendMessage}
        className="p-3 sm:p-4 border-t border-white/5 bg-slate-900/95 flex flex-col gap-2.5 shrink-0"
      >
        {/* Attachment Preview */}
        {mediaFile && !isRecording && (
          <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl relative self-start">
            {mediaFile.type.startsWith("image/") ? (
              <img
                src={mediaPreviewUrl || ""}
                alt="Edited attachment preview"
                className="h-16 rounded-md object-cover"
              />
            ) : mediaFile.type.startsWith("audio/") ? (
              mediaPreviewUrl ? (
                <audio
                  src={mediaPreviewUrl}
                  controls
                  className="h-10 w-[250px]"
                />
              ) : (
                <span className="text-sm text-slate-400">Preparing audio preview...</span>
              )
            ) : (
              <div className="flex items-center gap-2 text-slate-300 px-2">
                <FileText className="w-5 h-5 text-brand" />
                <span className="text-sm font-medium truncate max-w-[150px]">
                  {mediaFile.name}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRemoveAttachment}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
              aria-label="Remove attachment"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-3 w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />

          {!isRecording && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 mb-0.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors shrink-0"
              aria-label="Attach a file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          )}

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-2.5 mb-0.5 rounded-xl transition-colors shrink-0 ${
              isRecording
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                : "text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
            }`}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <Square className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          {isRecording ? (
            <div className="flex-1 flex items-center justify-between bg-slate-800 border border-brand/50 rounded-2xl px-4 py-3 min-h-[46px] mb-0.5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />

                <span className="text-red-400 font-mono text-sm font-medium tracking-wider">
                  {Math.floor(recordingTime / 60)}:
                  {(recordingTime % 60).toString().padStart(2, "0")}
                </span>
              </div>

              {/* Animated Sound Waves */}
              <div className="flex items-center gap-1 h-5 overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="w-1 bg-brand rounded-full animate-pulse"
                    style={{
                      height: `${[8, 14, 10, 18, 12, 7][item - 1]}px`,
                      animationDelay: `${item * 0.15}s`,
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleCancelRecording}
                className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                title="Cancel Recording"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Write a message..."
              value={newMessage}
              onChange={(event) => {
                setNewMessage(event.target.value);

                event.target.style.height = "auto";
                event.target.style.height =
                  Math.min(event.target.scrollHeight, 150) + "px";

                if (!event.target.value) {
                  event.target.style.height = "auto";
                }
              }}
              onKeyDown={(event) => {
                const isTouchDevice =
                  typeof window !== "undefined" &&
                  ("ontouchstart" in window ||
                    navigator.maxTouchPoints > 0);

                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.ctrlKey &&
                  !isTouchDevice
                ) {
                  event.preventDefault();
                  onSendMessage(
                    event as unknown as FormEvent<HTMLFormElement>
                  );
                  event.currentTarget.style.height = "auto";
                }
              }}
              className="flex-1 bg-slate-800 border border-white/10 rounded-2xl px-4 py-2.5 sm:py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-brand resize-none min-h-[44px] max-h-[140px] overflow-y-auto"
            />
          )}

          <button
            type="submit"
            disabled={!newMessage.trim() && !mediaFile}
            className="p-3 mb-0.5 bg-brand text-slate-950 font-bold rounded-2xl hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </>
  );
}
