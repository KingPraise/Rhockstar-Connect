"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { updateUserProfile } from "@/lib/services/users";
import { uploadMediaToCloudinary } from "@/lib/services/cloudinary";
import { Heart, Loader2, Save, Upload, Plus, Trash2, Mic, Settings, X, ChevronDown, Target, Shield, Lock, Square, Volume2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import PremiumLockModal from "@/components/ui/PremiumLockModal";
import toast from "react-hot-toast";

const PROMPTS = [
  "A shower thought I recently had...",
  "My most controversial opinion is...",
  "Two truths and a lie:",
  "I'm looking for...",
  "The best way to ask me out is...",
  "A typical Sunday for me looks like..."
];

const VIBE_CHECK_PROMPTS = [
  "Hot take on love 🔥",
  "My weekend vibe in 15 seconds 🎶",
  "Say hi & introduce your energy 🎙️",
  "Green flags I always look for 💚",
  "The quickest way to win my heart 💖"
];

const GOALS = [
  "Long-term relationship",
  "Casual dating",
  "New friends",
  "Networking",
  "Not sure yet"
];


const ObjectUrlImage = ({ file, alt, className }: { file: File, alt: string, className: string }) => {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? <img src={url} alt={alt} className={className} /> : null;
};

const ObjectUrlAudio = ({ file, className }: { file: File | Blob, className: string }) => {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? <audio controls src={url} className={className} /> : null;
};

export default function DatingProfileSetup() {
  const { profile, setProfile } = useAuthStore();
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [datingActive, setDatingActive] = useState(false);
  const [datingIncognito, setDatingIncognito] = useState(false);
  const [premiumLockOpen, setPremiumLockOpen] = useState(false);
  const [interests, setInterests] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [prompts, setPrompts] = useState<Array<{ prompt: string; answer: string }>>([]);
  
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  
  const [vibePrompt, setVibePrompt] = useState(VIBE_CHECK_PROMPTS[0]);
  const [voiceIntroFile, setVoiceIntroFile] = useState<File | Blob | null>(null);
  const [existingVoiceIntro, setExistingVoiceIntro] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isPaidSubscriber = profile?.subscriptionTier === 'pro' || profile?.subscriptionTier === 'elite' || profile?.role === 'admin';

  useEffect(() => {
    if (profile) {
      setDatingActive(profile.datingActive || false);
      setDatingIncognito(Boolean(profile.datingIncognito && isPaidSubscriber));
      setInterests(profile.datingInterests?.join(", ") || "");
      setGoal(profile.datingGoals || GOALS[0]);
      setPrompts(profile.datingPrompts || []);
      setExistingPhotos(profile.datingPhotos || []);
      setExistingVoiceIntro(profile.datingIcebreaker?.audioUrl || profile.datingVoiceIntro || null);
      if (profile.datingIcebreaker?.prompt) {
        setVibePrompt(profile.datingIcebreaker.prompt);
      }
    }
  }, [profile, isPaidSubscriber]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  if (!profile) return null;

  const startLiveRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        setVoiceIntroFile(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 14) {
            stopLiveRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone access denied or unavailable. You can still upload an audio file!");
    }
  };

  const stopLiveRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalPhotos = existingPhotos.length + newPhotos.length + files.length;
      if (totalPhotos > 4) {
        toast.error("You can only have up to 4 dating photos.");
        return;
      }
      setNewPhotos(prev => [...prev, ...files]);
    }
  };

  const removeNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingPhoto = (index: number) => {
    setExistingPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const addPrompt = () => {
    if (prompts.length >= 3) {
      toast.error("You can only have up to 3 prompts.");
      return;
    }
    setPrompts([...prompts, { prompt: PROMPTS[0], answer: "" }]);
  };

  const updatePrompt = (index: number, field: 'prompt' | 'answer', value: string) => {
    const updated = [...prompts];
    updated[index][field] = value;
    setPrompts(updated);
  };

  const removePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (datingActive && existingPhotos.length === 0 && newPhotos.length === 0 && !profile.avatar) {
      toast.error("You must have at least one photo (Profile Avatar or Dating Photo) to activate your dating profile.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Upload new photos
      const uploadedPhotoUrls: string[] = [];
      for (const file of newPhotos) {
        const url = await uploadMediaToCloudinary(file, 'dating_photos', 'image');
        uploadedPhotoUrls.push(url);
      }

      // 2. Upload voice intro / Vibe Check if exists
      let finalVoiceIntro = existingVoiceIntro;
      if (voiceIntroFile) {
        finalVoiceIntro = await uploadMediaToCloudinary(voiceIntroFile, 'dating_voice', 'auto');
      }

      const allPhotos = [...existingPhotos, ...uploadedPhotoUrls];
      
      const updateData: Record<string, any> = {
        datingActive,
        datingIncognito: isPaidSubscriber ? datingIncognito : false,
        datingInterests: interests.split(',').map(i => i.trim()).filter(Boolean),
        datingGoals: goal,
        datingPrompts: prompts.filter(p => p.answer.trim() !== ''),
        datingPhotos: allPhotos,
        ...(finalVoiceIntro && {
          datingVoiceIntro: finalVoiceIntro,
          datingIcebreaker: {
            prompt: vibePrompt,
            audioUrl: finalVoiceIntro,
            duration: recordingSeconds || 15
          }
        })
      };

      const result = await updateUserProfile(profile.uid, updateData);
      
      if (result.success) {
        setProfile({ ...profile, ...updateData } as any);
        toast.success("Dating profile saved successfully!");
        router.push('/dating');
      } else {
        toast.error("Failed to save dating profile.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto p-4 lg:p-8 relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-purple/20 to-brand/20 flex items-center justify-center border border-white/5">
            <Settings className="w-7 h-7 text-brand-purple" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Dating Profile Setup</h1>
            <p className="text-slate-400 font-medium">Showcase your personality and find better matches.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Photos */}
          <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Dating Photos (Max 4)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {existingPhotos.map((url, i) => (
                <div key={`existing-${i}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden group/photo">
                  <img src={url} alt="Dating Photo" className="w-full h-full object-cover" />
                  <button onClick={() => removeExistingPhoto(i)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {newPhotos.map((file, i) => (
                <div key={`new-${i}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden group/photo">
                  <ObjectUrlImage file={file} alt="New Dating Photo" className="w-full h-full object-cover" />
                  <button onClick={() => removeNewPhoto(i)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {(existingPhotos.length + newPhotos.length) < 4 && (
                <label className="relative aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 hover:border-brand-purple/50 bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoAdd} />
                  <Plus className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-400 font-medium">Add Photo</span>
                </label>
              )}
            </div>
          </div>

          {/* "Vibe Check" 15s Audio Icebreaker */}
          <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mic className="w-5 h-5 text-brand" /> &ldquo;Vibe Check&rdquo; Audio Icebreaker
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand/20 text-brand border border-brand/30 uppercase">
                15s Max
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              Pick an icebreaker prompt and record a 15-second voice answer so daters can hear your real vibe and charisma.
            </p>
            
            <div className="flex flex-col gap-4">
              {/* Vibe Check Prompt Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose Icebreaker Prompt</label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-brand absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={vibePrompt}
                    onChange={(e) => setVibePrompt(e.target.value)}
                    className="neo-input pl-11 pr-10 bg-slate-900 text-brand font-bold border-white/10 appearance-none cursor-pointer"
                  >
                    {VIBE_CHECK_PROMPTS.map(vp => (
                      <option key={vp} value={vp} className="bg-slate-900 text-white">{vp}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {existingVoiceIntro && !voiceIntroFile && (
                <div className="p-4 rounded-xl bg-brand/10 border border-brand/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-brand flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4" /> Current Vibe Check: {vibePrompt}
                    </p>
                  </div>
                  <audio controls src={existingVoiceIntro} className="w-full h-10" />
                </div>
              )}
              
              {voiceIntroFile && (
                <div className="p-4 rounded-xl bg-brand-purple/10 border border-brand-purple/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-brand-purple font-bold text-xs">New 15s Vibe Check ready to save:</p>
                    <button
                      onClick={() => setVoiceIntroFile(null)}
                      className="text-xs text-rose-400 hover:underline font-bold"
                    >
                      Discard
                    </button>
                  </div>
                  <ObjectUrlAudio file={voiceIntroFile} className="w-full h-10" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startLiveRecording}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand to-brand-purple text-white font-bold text-xs shadow-lg hover:opacity-90 transition-all inline-flex items-center gap-2"
                  >
                    <Mic className="w-4 h-4" /> Record 15s Voice Answer
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopLiveRecording}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg animate-pulse inline-flex items-center gap-2"
                  >
                    <Square className="w-4 h-4 fill-white" /> Stop Recording ({recordingSeconds}s / 15s)
                  </button>
                )}

                <input type="file" accept="audio/*" id="voiceUpload" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setVoiceIntroFile(e.target.files[0]);
                }} />
                <label htmlFor="voiceUpload" className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 cursor-pointer border border-white/10 text-slate-200 font-bold text-xs inline-flex items-center gap-2 transition-colors">
                  <Upload className="w-4 h-4" /> Upload Audio File
                </label>
              </div>
            </div>
          </div>

          {/* Prompts */}
          <div className="neo-card p-6 relative overflow-hidden group bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Profile Prompts (Max 3)</h2>
              {prompts.length < 3 && (
                <button onClick={addPrompt} className="neo-button text-xs py-1.5 px-3">
                  <Plus className="w-3 h-3 mr-1" /> Add Prompt
                </button>
              )}
            </div>
            
            <div className="flex flex-col gap-6">
              {prompts.map((p, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex flex-col gap-3 relative">
                  <button onClick={() => removePrompt(i)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <X className="w-3 h-3" />
                  </button>
                  <div className="relative">
                    <select 
                      value={p.prompt} 
                      onChange={(e) => updatePrompt(i, 'prompt', e.target.value)}
                      className="neo-input pr-10 bg-slate-900 text-brand-purple font-bold border-transparent appearance-none cursor-pointer"
                    >
                      {PROMPTS.map(pr => (
                        <option key={pr} value={pr} className="bg-slate-900 text-brand-purple">{pr}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <textarea 
                    value={p.answer}
                    onChange={(e) => updatePrompt(i, 'answer', e.target.value)}
                    className="neo-input min-h-[80px]"
                    placeholder="Your witty answer..."
                  />
                </div>
              ))}
              {prompts.length === 0 && (
                <p className="text-slate-400 text-center py-4">No prompts added yet. Stand out by answering a few prompts!</p>
              )}
            </div>
          </div>

        </div>

        {/* Sidebar Settings */}
        <div className="flex flex-col gap-8">
          <div className="neo-card p-6 relative overflow-hidden group bg-gradient-to-b from-brand-purple/10 to-transparent border-brand-purple/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] space-y-4">
            <h2 className="text-xl font-bold text-white mb-2">Dating Status & Privacy</h2>
            
            <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-brand-purple/50 transition-colors">
              <div>
                <p className="text-white font-bold">Active in Dating</p>
                <p className="text-xs text-slate-400">Show my profile to others</p>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${datingActive ? 'bg-brand-purple' : 'bg-slate-600'}`}>
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${datingActive ? 'left-7' : 'left-1'}`} />
              </div>
              <input type="checkbox" className="hidden" checked={datingActive} onChange={(e) => setDatingActive(e.target.checked)} />
            </label>

            {/* Double-Blind Incognito Mode (Exclusive Pro/Elite Perk) */}
            <div
              onClick={() => {
                if (!isPaidSubscriber) {
                  setPremiumLockOpen(true);
                  return;
                }
                setDatingIncognito(!datingIncognito);
              }}
              className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-slate-900/70 border border-brand/20 hover:border-brand/50 transition-colors"
            >
              <div className="pr-3">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-brand shrink-0" />
                  <p className="text-white font-bold text-sm">Incognito Mode</p>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                    Pro / Elite
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Double-Blind shield: Only reveal my profile to people I&apos;ve liked first or verified members.
                </p>
              </div>
              {isPaidSubscriber ? (
                <div className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${datingIncognito ? 'bg-brand' : 'bg-slate-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${datingIncognito ? 'left-7' : 'left-1'}`} />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>

          <div className="neo-card p-6 bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Interests & Goals</h2>
            
            <div className="flex flex-col gap-1 mb-6">
              <label className="text-sm font-medium text-secondary ml-1">Relationship Goals</label>
              <div className="relative">
                <Target className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 z-10" />
                <select 
                  value={goal} 
                  onChange={(e) => setGoal(e.target.value)}
                  className="neo-input pl-11 pr-10 bg-slate-900 cursor-pointer appearance-none text-white"
                >
                  {GOALS.map(g => (
                    <option key={g} value={g} className="bg-slate-900 text-white">{g}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-secondary ml-1">Interests (Comma separated)</label>
              <textarea 
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="neo-input min-h-[100px]"
                placeholder="Travel, Coffee, Web3, Gym..."
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="sticky top-24">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full neo-button-primary py-4 text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] flex justify-center items-center group hover:scale-[1.02]"
            >
              {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  <Save className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" /> Save Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <PremiumLockModal
        isOpen={premiumLockOpen}
        onClose={() => setPremiumLockOpen(false)}
        title="Unlock Double-Blind Incognito Mode"
        description="Incognito Mode is an exclusive Pro & Elite perk. Hide your dating profile from public discovery and only reveal yourself to people you've liked first or verified members!"
      />
    </div>
  );
}

