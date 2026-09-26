'use client';

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  Sparkles,
  Link as LinkIcon,
  Check,
  X,
  Loader2,
  Trash2,
  Edit3,
  User,
  ShieldCheck,
  FileImage,
} from 'lucide-react';

interface ProfileAvatarModalProps {
  currentAvatar?: string | null;
  currentName?: string | null;
  userEmail?: string | null;
  showEditButton?: boolean;
}

const PRESET_AVATARS = [
  { id: 'preset-1', name: 'Cyberpunk Dev', path: '/avatars/presets/preset-1.svg', color: 'from-cyan-500 to-blue-600' },
  { id: 'preset-2', name: 'Neon Robot', path: '/avatars/presets/preset-2.svg', color: 'from-purple-500 to-pink-600' },
  { id: 'preset-3', name: 'Code Ninja', path: '/avatars/presets/preset-3.svg', color: 'from-emerald-500 to-teal-600' },
  { id: 'preset-4', name: 'Frontend Wizard', path: '/avatars/presets/preset-4.svg', color: 'from-amber-500 to-orange-600' },
  { id: 'preset-5', name: 'Pixel Coder', path: '/avatars/presets/preset-5.svg', color: 'from-sky-400 to-indigo-600' },
  { id: 'preset-6', name: 'Quantum Arch', path: '/avatars/presets/preset-6.svg', color: 'from-rose-500 to-amber-500' },
  { id: 'preset-7', name: 'Terminal Ace', path: '/avatars/presets/preset-7.svg', color: 'from-teal-400 to-emerald-600' },
  { id: 'preset-8', name: 'AI Synthesizer', path: '/avatars/presets/preset-8.svg', color: 'from-violet-500 to-purple-600' },
];

export function ProfileAvatarModal({
  currentAvatar,
  currentName,
  userEmail,
  showEditButton = false,
}: ProfileAvatarModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');

  // Working state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatar || null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>(currentName || '');
  const [isRemoving, setIsRemoving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleOpen = () => {
    setSelectedFile(null);
    setPreviewUrl(currentAvatar || null);
    setSelectedPreset(null);
    setCustomUrlInput('');
    setNameInput(currentName || '');
    setIsRemoving(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsDragging(false);
    setIsOpen(true);
  };

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
    setSelectedPreset(presetPath);
    setSelectedFile(null);
    setIsRemoving(false);
    setPreviewUrl(presetPath);
  };

  const handleUrlApply = () => {
    if (!customUrlInput.trim()) return;
    setSelectedFile(null);
    setSelectedPreset(null);
    setIsRemoving(false);
    setPreviewUrl(customUrlInput.trim());
  };

  const handleResetAvatar = () => {
    setSelectedFile(null);
    setSelectedPreset(null);
    setCustomUrlInput('');
    setPreviewUrl(null);
    setIsRemoving(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();

      if (nameInput.trim() && nameInput.trim() !== currentName) {
        formData.append('name', nameInput.trim());
      }

      if (isRemoving) {
        formData.append('remove', 'true');
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      } else if (selectedPreset) {
        formData.append('preset', selectedPreset);
      } else if (previewUrl && previewUrl !== currentAvatar) {
        formData.append('imageUrl', previewUrl);
      }

      const res = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to update avatar');
      }

      setSuccessMsg('Profile & avatar updated successfully!');
      setTimeout(() => {
        setIsOpen(false);
        router.refresh();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating avatar');
    } finally {
      setLoading(false);
    }
  };

  const initial = (nameInput || currentName || userEmail || 'U')[0]?.toUpperCase() || 'U';

  return (
    <>
      {/* Interactive Trigger Button */}
      <div className="flex flex-col items-center sm:items-start gap-2 shrink-0">
        <div className="relative group">
          <button
            type="button"
            onClick={handleOpen}
            className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-1 shadow-xl shrink-0 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-transform group-hover:scale-[1.02]"
            title="Click to change profile picture"
          >
            {currentAvatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={currentAvatar}
                alt={currentName || 'User Avatar'}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-black text-2xl text-white">
                {initial}
              </div>
            )}

            {/* Hover overlay with camera icon */}
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl text-white">
              <Camera className="w-5 h-5 text-cyan-300 animate-pulse" />
              <span className="text-[10px] font-bold text-cyan-200 mt-1">Change</span>
            </div>
          </button>

          {/* Small edit badge button */}
          <button
            type="button"
            onClick={handleOpen}
            className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-2 border-slate-900 shadow-md transition-transform hover:scale-110 cursor-pointer"
            title="Edit Avatar"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        {showEditButton && (
          <button
            type="button"
            onClick={handleOpen}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 transition-all cursor-pointer shadow-sm"
          >
            <Camera className="w-3 h-3" />
            <span>Edit Avatar</span>
          </button>
        )}
      </div>

      {/* Full-Featured, Expansive Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-[#14213D]/50 backdrop-blur-md animate-fade-in select-none">
          {/* Backdrop Click Dismiss */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => !loading && setIsOpen(false)}
          />

          <div className="relative w-full max-w-3xl sm:max-w-4xl rounded-3xl bg-white border-2 border-[#E5EAF0] shadow-2xl p-5 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto text-[#14213D]">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E5EAF0]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF3FC] border border-[#C8DEF7] flex items-center justify-center text-[#1769E0] shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#14213D] font-serif-title tracking-tight">
                    Customize Profile &amp; Avatar
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#5B667A] pl-10">
                  Upload your photo, select a handcrafted developer avatar, or customize your display identity.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="p-2 rounded-xl text-[#5B667A] hover:text-[#14213D] hover:bg-[#F7F8FA] border border-[#E5EAF0] transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2-Column Responsive Body */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Live Preview & Identity (4 cols) */}
              <div className="md:col-span-4 p-5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] flex flex-col items-center text-center space-y-4">
                <span className="text-[11px] font-bold text-[#5B667A] uppercase tracking-wider">
                  Live Avatar Preview
                </span>

                {/* Big Preview */}
                <div className="relative group">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#EBF3FC] border-2 border-[#C8DEF7] p-1 shadow-md shrink-0 overflow-hidden relative flex items-center justify-center">
                    {previewUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-2xl bg-white"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-[#1769E0] bg-[#EBF3FC] rounded-2xl">
                        {initial}
                      </div>
                    )}
                  </div>

                  {previewUrl && (
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#0F8A52] text-white border-2 border-white shadow-sm" title="Active selection">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Name Input */}
                <div className="w-full space-y-1 text-left">
                  <label className="text-[11px] font-bold text-[#5B667A] uppercase tracking-wider flex items-center justify-between">
                    <span>Display Name</span>
                    <Edit3 className="w-3 h-3 text-[#1769E0]" />
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter display name"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E5EAF0] text-sm font-semibold text-[#14213D] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15 transition-all shadow-2xs"
                  />
                </div>

                {/* Account details badge */}
                <div className="w-full pt-1 space-y-1 text-left">
                  <div className="text-[11px] text-[#5B667A] flex items-center gap-1.5 truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1769E0] shrink-0" />
                    <span className="truncate">{userEmail || 'Student Account'}</span>
                  </div>
                </div>

                {/* Reset button if custom avatar is selected */}
                {(currentAvatar || previewUrl) && (
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    disabled={loading}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-[#D92D20] hover:text-[#B42318] bg-[#FDF2F2] hover:bg-[#FEE4E2] border border-[#FECDCA] transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset to Default Initials</span>
                  </button>
                )}
              </div>

              {/* Right Column: Source Tabs & Controls (8 cols) */}
              <div className="md:col-span-8 space-y-4">
                {/* 3 Tab Buttons */}
                <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] text-xs sm:text-sm font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'upload'
                        ? 'bg-white text-[#1769E0] shadow-xs border border-[#E5EAF0]'
                        : 'text-[#5B667A] hover:text-[#14213D]'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('presets')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'presets'
                        ? 'bg-white text-[#1769E0] shadow-xs border border-[#E5EAF0]'
                        : 'text-[#5B667A] hover:text-[#14213D]'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Developer Avatars</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('url')}
                    className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      activeTab === 'url'
                        ? 'bg-white text-[#1769E0] shadow-xs border border-[#E5EAF0]'
                        : 'text-[#5B667A] hover:text-[#14213D]'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    <span>Image URL</span>
                  </button>
                </div>

                {/* Tab 1: Upload Zone */}
                {activeTab === 'upload' && (
                  <div className="space-y-3">
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
                      className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all ${
                        isDragging
                          ? 'border-[#1769E0] bg-[#EBF3FC] scale-[0.99]'
                          : 'border-[#CBD5E1] hover:border-[#1769E0] bg-[#F7F8FA] hover:bg-white'
                      } group shadow-2xs`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform shadow-xs">
                        <Upload className="w-8 h-8" />
                      </div>

                      {selectedFile ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EBF3FC] border border-[#C8DEF7] text-[#1769E0] font-bold text-xs sm:text-sm">
                            <FileImage className="w-4 h-4" />
                            <span className="truncate max-w-xs">{selectedFile.name}</span>
                          </div>
                          <p className="text-xs text-[#5B667A]">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to save
                          </p>
                          <p className="text-[11px] text-[#1769E0] hover:underline pt-1">
                            Click or drop another file to replace
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="text-sm sm:text-base font-bold text-[#14213D]">
                            Drag &amp; drop your image here, or{' '}
                            <span className="text-[#1769E0] underline underline-offset-4">browse</span>
                          </div>
                          <p className="text-xs text-[#5B667A]">
                            Supports PNG, JPG, WEBP, GIF, SVG (Maximum size: 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: 8 Developer Presets Grid */}
                {activeTab === 'presets' && (
                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-[#5B667A] flex items-center justify-between">
                      <span>Choose from 8 developer personas:</span>
                      <span className="text-[#1769E0] font-bold">1-Click Select</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {PRESET_AVATARS.map((preset) => {
                        const isSelected = previewUrl === preset.path;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handlePresetSelect(preset.path)}
                            className={`group relative p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-2 shadow-2xs ${
                              isSelected
                                ? 'bg-[#EBF3FC] border-2 border-[#1769E0] ring-2 ring-[#1769E0]/15'
                                : 'bg-[#F7F8FA] border-[#E5EAF0] hover:border-[#CBD5E1] hover:bg-white'
                            }`}
                          >
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-1 bg-white border border-[#E5EAF0] flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={preset.path}
                                alt={preset.name}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            <span className="text-[11px] font-bold text-[#14213D] truncate w-full text-center">
                              {preset.name}
                            </span>

                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1769E0] text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tab 3: Direct URL */}
                {activeTab === 'url' && (
                  <div className="p-5 rounded-2xl bg-[#F7F8FA] border border-[#E5EAF0] space-y-3">
                    <label className="text-xs font-bold text-[#14213D] block">
                      Direct Public Image URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={customUrlInput}
                        onChange={(e) => setCustomUrlInput(e.target.value)}
                        placeholder="https://github.com/identicons/username.png"
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E5EAF0] text-sm text-[#14213D] placeholder-[#94A3B8] focus:outline-none focus:border-[#1769E0] focus:ring-2 focus:ring-[#1769E0]/15"
                      />
                      <button
                        type="button"
                        onClick={handleUrlApply}
                        className="px-5 py-2.5 rounded-xl bg-[#1769E0] hover:bg-[#1257BD] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer shrink-0 shadow-md shadow-[#1769E0]/20"
                      >
                        Preview Image
                      </button>
                    </div>
                    <p className="text-[11px] text-[#5B667A]">
                      Paste a direct image link from GitHub, Discord, Gravatar, Unsplash, or any public host.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error or Success feedback banner */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-[#FDF2F2] border border-[#FECDCA] text-[#D92D20] text-xs sm:text-sm font-medium animate-fade-in flex items-center gap-2">
                <X className="w-4 h-4 text-[#D92D20] shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-[#ECFDF3] border border-[#A6F4C5] text-[#027A48] text-xs sm:text-sm font-semibold flex items-center gap-2 animate-fade-in">
                <Check className="w-4 h-4 text-[#027A48] shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Modal Bottom Action Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#E5EAF0]">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#5B667A] hover:text-[#14213D] bg-[#F7F8FA] hover:bg-[#E5EAF0] border border-[#E5EAF0] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#1769E0] hover:bg-[#1257BD] transition-all shadow-md shadow-[#1769E0]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
