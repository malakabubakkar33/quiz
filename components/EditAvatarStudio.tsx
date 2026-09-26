'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Upload,
  Sparkles,
  Link as LinkIcon,
  Check,
  Loader2,
  Trash2,
  Edit3,
  User,
  ShieldCheck,
  FileImage,
  ArrowRight,
  Eye,
  Gamepad2,
  GraduationCap,
} from 'lucide-react';

interface EditAvatarStudioProps {
  initialAvatar?: string | null;
  initialName?: string | null;
  userEmail?: string | null;
}

const PRESET_AVATARS = [
  {
    id: 'preset-1',
    name: 'Cyberpunk Dev',
    role: 'Full-Stack Prodigy',
    path: '/avatars/presets/preset-1.svg',
  },
  {
    id: 'preset-2',
    name: 'Neon Robot',
    role: 'Algorithm Automator',
    path: '/avatars/presets/preset-2.svg',
  },
  {
    id: 'preset-3',
    name: 'Code Ninja',
    role: 'Bug Hunter',
    path: '/avatars/presets/preset-3.svg',
  },
  {
    id: 'preset-4',
    name: 'Frontend Wizard',
    role: 'CSS & UI Sorcerer',
    path: '/avatars/presets/preset-4.svg',
  },
  {
    id: 'preset-5',
    name: 'Pixel Coder',
    role: 'Retro Architect',
    path: '/avatars/presets/preset-5.svg',
  },
  {
    id: 'preset-6',
    name: 'Quantum Arch',
    role: 'System Optimizer',
    path: '/avatars/presets/preset-6.svg',
  },
  {
    id: 'preset-7',
    name: 'Terminal Ace',
    role: 'DevOps & Shell Master',
    path: '/avatars/presets/preset-7.svg',
  },
  {
    id: 'preset-8',
    name: 'AI Synthesizer',
    role: 'Neural Network Dev',
    path: '/avatars/presets/preset-8.svg',
  },
];

export function EditAvatarStudio({
  initialAvatar,
  initialName,
  userEmail,
}: EditAvatarStudioProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialAvatar || null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>(initialName || '');
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size cannot exceed 5MB.');
      return;
    }

    setSelectedFile(file);
    setSelectedPreset(null);
    setIsRemoving(false);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handlePresetSelect = (presetPath: string) => {
    setErrorMsg(null);
    setSelectedPreset(presetPath);
    setSelectedFile(null);
    setIsRemoving(false);
    setPreviewUrl(presetPath);
  };

  const handleApplyUrl = () => {
    setErrorMsg(null);
    if (!customUrlInput.trim()) {
      setErrorMsg('Please paste a direct image URL.');
      return;
    }

    try {
      const url = new URL(customUrlInput.trim());
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        setErrorMsg('Please enter a valid HTTP/HTTPS URL.');
        return;
      }
      setSelectedFile(null);
      setSelectedPreset(null);
      setIsRemoving(false);
      setPreviewUrl(customUrlInput.trim());
    } catch {
      setErrorMsg('Invalid URL format.');
    }
  };

  const handleResetAvatar = () => {
    setSelectedFile(null);
    setSelectedPreset(null);
    setCustomUrlInput('');
    setPreviewUrl(null);
    setIsRemoving(true);
    setErrorMsg(null);
  };

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      let finalAvatarUrl = previewUrl;

      // If user uploaded a new local file, upload via formData
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch('/api/user/avatar/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || uploadData.error) {
          throw new Error(uploadData.error || 'Failed to upload photo.');
        }

        finalAvatarUrl = uploadData.avatarUrl;
      }

      // If user explicitly chose to reset
      if (isRemoving) {
        finalAvatarUrl = null;
      }

      // Update User Profile in DB
      const updateRes = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar: finalAvatarUrl,
          name: nameInput.trim() || undefined,
        }),
      });

      const updateData = await updateRes.json();
      if (!updateRes.ok || updateData.error) {
        throw new Error(updateData.error || 'Failed to update profile.');
      }

      setSuccessMsg('Profile and avatar successfully updated!');

      // Dispatch global change events
      window.dispatchEvent(new Event('cq-auth-change'));

      setTimeout(() => {
        router.push('/profile');
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error saving avatar.');
      setLoading(false);
    }
  };

  const displayName = nameInput.trim() || initialName || 'Developer';
  const initial = displayName[0]?.toUpperCase() || 'D';

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 animate-fade-in text-[#14213D]">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#5B667A] hover:text-[#14213D] bg-white border border-[#E5EAF0] hover:border-[#CBD5E1] transition-all cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Profile</span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-[#5B667A]">
          <span>Profile</span>
          <span>/</span>
          <span className="text-[#1769E0] font-bold">Avatar Studio</span>
        </div>
      </div>

      {/* Main Studio Title Card */}
      <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#1769E0] bg-[#EBF3FC] border border-[#C8DEF7]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Customization Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#14213D] font-serif-title tracking-tight">
            Customize Your Avatar &amp; Identity
          </h1>
          <p className="text-xs sm:text-sm text-[#5B667A] max-w-2xl leading-relaxed">
            Upload your custom photo, choose from developer personas, or link a public image. Your avatar updates across all live multiplayer rooms, lobbies, and campus leaderboards.
          </p>
        </div>
      </div>

      {/* 2-Column Responsive Studio Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Real-Time Preview & Room Mockup (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Avatar Card */}
          <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-7 shadow-xs text-center space-y-5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
              <span className="text-xs font-bold text-[#5B667A] uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#1769E0]" />
                <span>Live Preview</span>
              </span>
              <span className="text-[11px] font-semibold text-[#0F8A52] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0F8A52] animate-pulse" />
                <span>Real-Time</span>
              </span>
            </div>

            {/* Giant Circular Avatar */}
            <div className="relative mx-auto w-36 h-36 sm:w-40 sm:h-40 my-2">
              <div className="relative w-full h-full rounded-3xl bg-[#EBF3FC] border-2 border-[#C8DEF7] p-1 shadow-md overflow-hidden flex items-center justify-center">
                {previewUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover rounded-2xl bg-white"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-5xl text-[#1769E0] bg-[#EBF3FC] rounded-2xl">
                    {initial}
                  </div>
                )}
              </div>

              {previewUrl && (
                <div
                  className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0F8A52] text-white border-2 border-white shadow-md"
                  title="Active Selection"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </div>
              )}
            </div>

            {/* Identity Text */}
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#14213D] truncate">
                {displayName}
              </h3>
              <p className="text-xs text-[#5B667A] flex items-center justify-center gap-1.5 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1769E0] shrink-0" />
                <span className="truncate">{userEmail || 'student@quizcode.dev'}</span>
              </p>
            </div>

            {/* Live Multiplayer Lobby Mockup Preview */}
            <div className="p-4 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] text-left space-y-2">
              <div className="text-[11px] font-bold text-[#5B667A] uppercase tracking-wider flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-[#1769E0]" />
                <span>Multiplayer Room Appearance</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-[#E5EAF0] flex items-center gap-3 shadow-2xs">
                <div className="relative w-8 h-8 rounded-lg bg-[#EBF3FC] border border-[#C8DEF7] shrink-0 overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl}
                      alt="Mini"
                      className="w-full h-full object-cover rounded-[6px]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#1769E0]">
                      {initial}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#14213D] truncate">{displayName}</div>
                  <div className="text-[10px] text-[#0F8A52] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0F8A52]" />
                    <span>Ready in Arena</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#1769E0] bg-[#EBF3FC] px-2 py-0.5 rounded-md border border-[#C8DEF7]">
                  Player
                </span>
              </div>
            </div>

            {/* Reset Button */}
            {(initialAvatar || previewUrl) && (
              <button
                type="button"
                onClick={handleResetAvatar}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-[#D92D20] hover:text-[#B42318] bg-[#FDF2F2] hover:bg-[#FEE4E2] border border-[#FECDCA] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset to Default Initials</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Editor Controls & Tabs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl bg-white border-2 border-[#E5EAF0] p-6 sm:p-7 shadow-xs space-y-6">
            {/* Display Name Input Section */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider flex items-center justify-between">
                <span>Display Name</span>
                <span className="text-[11px] text-[#5B667A] font-normal">Visible in leaderboards</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={40}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] text-sm font-semibold text-[#14213D] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
                />
                <Edit3 className="w-4 h-4 text-[#94A3B8] absolute right-4 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Tab Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block">
                Choose Avatar Source
              </label>
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] text-xs sm:text-sm font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-white text-[#1769E0] shadow-xs border border-[#E5EAF0]'
                      : 'text-[#5B667A] hover:text-[#14213D]'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('presets')}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'presets'
                      ? 'bg-white text-[#1769E0] shadow-xs border border-[#E5EAF0]'
                      : 'text-[#5B667A] hover:text-[#14213D]'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Developer Personas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('url')}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'url'
                      ? 'bg-white text-[#1769E0] shadow-xs border border-[#E5EAF0]'
                      : 'text-[#5B667A] hover:text-[#14213D]'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  <span>Image URL</span>
                </button>
              </div>
            </div>

            {/* TAB 1: Upload File */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-[#1769E0] bg-[#EBF3FC] scale-[0.99]'
                      : 'border-[#CBD5E1] hover:border-[#1769E0] bg-[#F7F8FA] hover:bg-white'
                  } group shadow-2xs`}
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-xs">
                    <Upload className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>

                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] font-bold text-sm">
                        <FileImage className="w-4 h-4" />
                        <span className="truncate max-w-xs">{selectedFile.name}</span>
                      </div>
                      <p className="text-xs text-[#5B667A]">
                        Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to save
                      </p>
                      <p className="text-xs text-[#1769E0] font-semibold hover:underline">
                        Click or drag another file to replace
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-base sm:text-lg font-bold text-[#14213D]">
                        Drag and drop your image here, or{' '}
                        <span className="text-[#1769E0] underline underline-offset-4">browse files</span>
                      </div>
                      <p className="text-xs text-[#5B667A]">
                        Supported formats: PNG, JPG, WEBP, GIF, SVG (Max file size: 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: 8 Developer Presets */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#5B667A] font-medium">
                  <span>Click any persona to select:</span>
                  <span className="text-[#1769E0] font-bold">8 Handcrafted Avatars</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRESET_AVATARS.map((preset) => {
                    const isSelected = previewUrl === preset.path;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset.path)}
                        className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2 text-center shadow-2xs ${
                          isSelected
                            ? 'bg-[#EBF3FC] border-2 border-[#1769E0] ring-2 ring-[#1769E0]/15'
                            : 'bg-[#F7F8FA] border-[#E5EAF0] hover:border-[#CBD5E1] hover:bg-white'
                        }`}
                      >
                        <div className="w-16 h-16 rounded-2xl p-1 bg-white border border-[#E5EAF0] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preset.path}
                            alt={preset.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="space-y-0.5 w-full">
                          <div className="text-xs font-bold text-[#14213D] truncate">
                            {preset.name}
                          </div>
                          <div className="text-[10px] text-[#5B667A] truncate">
                            {preset.role}
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#1769E0] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Direct URL */}
            {activeTab === 'url' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#14213D] uppercase tracking-wider block">
                    Public Image Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#F7F8FA] border border-[#E5EAF0] text-sm text-[#14213D] placeholder-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleApplyUrl}
                      className="px-5 py-2.5 rounded-xl bg-[#1769E0] hover:bg-[#1257BD] text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-[#1769E0]/20"
                    >
                      Preview
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5B667A]">
                    Paste any public image link (GitHub avatar, Gravatar, Unsplash, etc.)
                  </p>
                </div>
              </div>
            )}

            {/* Notifications */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-[#ECFDF3] border border-[#A6F4C5] text-[#027A48] text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-[#027A48]" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Save Actions Bar */}
            <div className="pt-4 border-t border-[#E5EAF0] flex flex-col sm:flex-row items-center gap-3 justify-end">
              <Link
                href="/profile"
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA] transition-colors text-center border border-[#E5EAF0]"
              >
                Cancel
              </Link>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Avatar...</span>
                  </>
                ) : (
                  <>
                    <span>Save Avatar to Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
