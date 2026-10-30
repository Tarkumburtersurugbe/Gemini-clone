import React, { useState } from 'react';
import { X, UserPlus, Shield, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (profile: UserProfile) => void;
  defaultEmail?: string;
}

export function GoogleSignInModal({
  isOpen,
  onClose,
  onSignIn,
  defaultEmail = 'tarkumbur74@gmail.com',
}: GoogleSignInModalProps) {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleSelectDefault = () => {
    const profile: UserProfile = {
      id: 'google-user-default',
      name: defaultEmail.split('@')[0].replace(/[._]/g, ' '),
      email: defaultEmail,
      signedInAt: Date.now(),
    };
    onSignIn(profile);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const profile: UserProfile = {
      id: `google-user-${Date.now()}`,
      name: customName.trim() || customEmail.split('@')[0],
      email: customEmail.trim(),
      signedInAt: Date.now(),
    };
    onSignIn(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-3xl border border-[#3c4043] bg-[#202124] p-7 shadow-2xl text-[#e8eaed]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-1.5 text-[#9aa0a6] hover:bg-[#303134] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="flex flex-col items-center text-center">
          {/* Google G Logo */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md mb-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-medium text-white">Choose an account</h2>
          <p className="mt-1 text-sm text-[#9aa0a6]">to continue to Google Gemini AI</p>
        </div>

        {/* Account List */}
        <div className="mt-6 space-y-2">
          {/* Primary Account Card */}
          <button
            onClick={handleSelectDefault}
            className="group w-full flex items-center gap-3.5 rounded-2xl border border-[#3c4043] bg-[#282a2c] p-3 text-left hover:bg-[#303134] hover:border-[#8ab4f8] transition-all"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#4285F4] to-[#9B72CB] text-base font-bold text-white shadow-inner uppercase">
              {defaultEmail[0]}
            </div>
            <div className="flex-1 truncate">
              <div className="font-semibold text-white text-sm capitalize truncate">
                {defaultEmail.split('@')[0]}
              </div>
              <div className="text-xs text-[#9aa0a6] truncate">{defaultEmail}</div>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              Active
            </span>
          </button>

          {/* Use another account option */}
          {!showCustomInput ? (
            <button
              onClick={() => setShowCustomInput(true)}
              className="w-full flex items-center gap-3.5 rounded-2xl border border-dashed border-[#3c4043] p-3 text-left text-xs font-medium text-[#8ab4f8] hover:bg-[#282a2c] hover:border-[#8ab4f8] transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#303134] text-[#8ab4f8]">
                <UserPlus className="w-5 h-5" />
              </div>
              <span>Use another Google or Gmail account</span>
            </button>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3 rounded-2xl border border-[#3c4043] bg-[#1a1b1e] p-4 animate-in fade-in">
              <div>
                <label className="text-[11px] font-medium text-[#9aa0a6] block mb-1">
                  Gmail / Google Account Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#3c4043] bg-[#282a2c] px-3 py-2 text-xs text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-[#9aa0a6] block mb-1">
                  Full Name (optional)
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-xl border border-[#3c4043] bg-[#282a2c] px-3 py-2 text-xs text-white placeholder-[#9aa0a6] focus:border-[#8ab4f8] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomInput(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-[#9aa0a6] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#8ab4f8] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#aecbfa]"
                >
                  Continue
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Privacy Note */}
        <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-[#282a2c]/60 p-3 text-[11px] text-[#9aa0a6] border border-[#303134]">
          <Shield className="w-4 h-4 shrink-0 text-[#8ab4f8] mt-0.5" />
          <p>
            To continue, Google will share your name and email address with Gemini Studio. You have full privacy control to delete your prompt history at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
