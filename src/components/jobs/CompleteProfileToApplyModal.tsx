"use client";

import { X, AlertCircle, ArrowRight, UserCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { MissingFieldDetail } from "@/lib/utils/profileProgress";
import { useRouter } from "next/navigation";

interface CompleteProfileToApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  companyName?: string;
  percentage: number;
  missingFields: MissingFieldDetail[];
  onOpenEditProfile?: () => void;
}

export default function CompleteProfileToApplyModal({
  isOpen,
  onClose,
  jobTitle,
  companyName,
  percentage,
  missingFields,
  onOpenEditProfile,
}: CompleteProfileToApplyModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpdateClick = () => {
    onClose();
    if (onOpenEditProfile) {
      onOpenEditProfile();
    } else {
      router.push("/profile?edit=true");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col gap-5 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Tag */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Update Required
            </span>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Please update your profile first
            </h2>
          </div>
        </div>

        {/* Message Notice */}
        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 space-y-2">
          <p className="text-sm font-semibold text-purple-200 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-400 shrink-0" />
            Applying for {jobTitle ? <span className="text-white font-bold">{jobTitle}</span> : "this role"}{companyName ? ` at ${companyName}` : ""}:
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Employers on Rhockstar Connect require a complete professional profile to evaluate your qualifications and experience. An updated profile gives you a <strong>5x higher chance</strong> of getting interviewed!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-400">Current Profile Strength</span>
            <span className="font-bold text-purple-400">{percentage}% Complete</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-400 transition-all duration-500" 
              style={{ width: `${Math.max(percentage, 5)}%` }} 
            />
          </div>
        </div>

        {/* Missing Fields Checklist */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Items to complete before applying:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {missingFields.map((field) => (
              <div 
                key={field.key} 
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-white/5"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold shrink-0 mt-0.5">
                  !
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white">{field.label}</p>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{field.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleUpdateClick}
            className="flex-1 py-3 px-5 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
          >
            <span>Update Profile Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-sm border border-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
