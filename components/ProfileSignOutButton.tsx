'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/app/actions/auth';
import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';

export function ProfileSignOutButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signOut } = useClerk();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      try {
        await signOut({ redirectUrl: '/login' });
      } catch (clerkErr) {
        console.warn('Clerk signOut error, continuing fallback:', clerkErr);
      }
      await logoutUser();
      window.dispatchEvent(new Event('cq-auth-change'));
      setShowModal(false);
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#D92D20] hover:text-[#B42318] bg-[#FDF2F2] hover:bg-[#FCE8E6] border border-[#FECDCA] transition-colors cursor-pointer shadow-2xs"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Sign Out</span>
      </button>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showModal}
        variant="danger"
        title="Sign Out of QuizCode?"
        message="Are you sure you want to sign out? You will need to sign back in to access saved assessment stats, MMR ratings, and custom duels."
        confirmText="Yes, Sign Out"
        cancelText="Cancel"
        isLoading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
}
