"use client";

import { useState, useRef } from "react";
import { Sparkles, FileText, Upload, CheckCircle2, ArrowRight, X, AlertCircle, Copy, RefreshCw } from "lucide-react";
import { parseJobListingText, ParsedJobData } from "@/lib/utils/jobParser";
import toast from "react-hot-toast";

interface JobImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: ParsedJobData) => void;
}

const SAMPLE_JOB = `Hiring: Business Development Associate at Rainha Hair

Location: Hybrid / Lagos, Nigeria 
Compensation: ₦150,000–₦200,000 per month 

We are looking for a proactive and resourceful Business Development Associate to identify new business opportunities, research potential customers, and establish connections with businesses that could become wholesale buyers for Rainha Hair. 

Responsibilities:
● Research and identify potential wholesale customers, bulk buyers, distributors, hair vendors, salons, and retailers across local and international markets, particularly within the UK hair and beauty industry. 
● Use LinkedIn, Instagram, Google, business directories, and other relevant channels to identify suitable businesses, key decision-makers, and their professional contact details. 
● Build and maintain an organised database of qualified prospects, explore new customer segments, and identify opportunities to expand Rainha Hair’s wholesale customer base. 

Requirements: 
● Minimum of 2 years’ experience in business development, lead generation, B2B sales, market research, or a related field, with the ability to identify and engage potential business customers. 
● Strong online research, communication, and relationship-building skills, with confidence in conducting cold outreach and following up with prospects. 
● Proficiency in ClickUp, CRM systems, and Microsoft Office and/or Google Workspace, with strong organisational and record-keeping skills. 

How to Apply Interested candidates should send their CV to halovestea@gmail.com with the subject line: Business Development Associate — Rainha Hair`;

export default function JobImportModal({ isOpen, onClose, onImport }: JobImportModalProps) {
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<ParsedJobData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!rawText.trim()) {
      toast.error("Please paste or upload a job listing first");
      return;
    }

    setParsing(true);
    try {
      const parsed = parseJobListingText(rawText);
      setParsedPreview(parsed);
      toast.success("Job listing analyzed! Review details below.");
    } catch (e: any) {
      toast.error("Failed to parse text: " + (e?.message || "Unknown error"));
    } finally {
      setParsing(false);
    }
  };

  const handleApplyImport = () => {
    if (!parsedPreview) return;
    onImport(parsedPreview);
    toast.success("Form pre-filled! Review and publish when ready.");
    onClose();
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        setRawText(content);
        toast.success(`Loaded "${file.name}"`);
        // Automatically parse on file load
        const parsed = parseJobListingText(content);
        setParsedPreview(parsed);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const loadSample = () => {
    setRawText(SAMPLE_JOB);
    const parsed = parseJobListingText(SAMPLE_JOB);
    setParsedPreview(parsed);
    toast.success("Sample Rainha Hair job listing loaded!");
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-brand/30 rounded-3xl shadow-[0_0_60px_rgba(56,189,248,0.2)] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand/20 to-purple-500/20 text-brand flex items-center justify-center border border-brand/30 shadow-inner">
              <Sparkles className="w-5 h-5 text-brand animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Smart Import & Auto-Fill
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-brand/20 text-brand border border-brand/30">
                  Instant
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Paste or drop any raw job listing (WhatsApp, LinkedIn, Email, or File)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          
          {/* File Dropzone & Actions */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isDragging 
                ? "border-brand bg-brand/10 scale-[0.99]" 
                : "border-white/10 bg-slate-950/40 hover:border-brand/40 hover:bg-slate-950/60"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.md,.doc,.docx,text/plain"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>
            <div className="text-xs text-slate-300">
              <span className="font-bold text-brand">Click to upload</span> or drag and drop a job spec (<span className="text-slate-400 font-mono">.txt, .md, .doc</span>)
            </div>
          </div>

          {/* Raw Text Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-brand" /> Paste Raw Listing Text:
              </label>
              <button 
                type="button"
                onClick={loadSample}
                className="text-brand hover:underline font-semibold flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Load Sample Job
              </button>
            </div>
            
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                if (parsedPreview) setParsedPreview(null);
              }}
              placeholder={`Paste any job description here, for example:\n\nHiring: Business Development Associate at Rainha Hair\nLocation: Hybrid / Lagos, Nigeria\nCompensation: ₦150,000–₦200,000 per month\n\nWe are looking for...`}
              rows={7}
              className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-4 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand font-mono custom-scrollbar leading-relaxed resize-y"
            ></textarea>
          </div>

          {/* Action Button */}
          {!parsedPreview && (
            <button
              type="button"
              onClick={handleParse}
              disabled={parsing || !rawText.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-brand to-purple-600 hover:from-brand-hover hover:to-purple-500 text-slate-950 font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(56,189,248,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              {parsing ? "Parsing with AI..." : "Analyze & Extract Fields"}
            </button>
          )}

          {/* Parsed Preview Card */}
          {parsedPreview && (
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Successfully Extracted
                </div>
                <button
                  type="button"
                  onClick={handleParse}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Re-parse
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Job Title</span>
                  <span className="font-bold text-white text-sm">{parsedPreview.title || "—"}</span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Company / Client</span>
                  <span className="font-bold text-white text-sm">{parsedPreview.company || "Your Company"}</span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Location</span>
                  <span className="font-bold text-brand">{parsedPreview.location || "—"}</span>
                </div>

                <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px] mb-0.5">Type & Salary</span>
                  <span className="font-bold text-emerald-400">{parsedPreview.type} • {parsedPreview.salary || "Not specified"}</span>
                </div>
              </div>

              {parsedPreview.contactEmail && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-white/5">
                  <span className="text-purple-400 font-bold">Applicant Email:</span>
                  <span className="text-slate-200">{parsedPreview.contactEmail}</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 line-clamp-3 bg-slate-900/30 p-2 rounded-lg italic">
                "{parsedPreview.description.slice(0, 150)}..."
              </div>

              <button
                type="button"
                onClick={handleApplyImport}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 fill-slate-950 text-emerald-500" />
                Auto-Fill Form Fields Now
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900/90 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            You can still edit any field freely after auto-filling.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
