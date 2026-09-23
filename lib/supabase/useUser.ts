'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';

export interface AppUser {
  id: string;
  userId: string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  institutionType?: string;
  institutionName?: string;
  codingLevel?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    username?: string;
    avatar_url?: string;
    institution_type?: string;
    institution_name?: string;
    coding_level?: string;
  };
}

export function useUser() {
  const clerk = useClerkUser();
  const [dbUserData, setDbUserData] = useState<Partial<AppUser> | null>(null);

  const fetchDbUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json().catch(() => ({ user: null }));
      if (data?.user) {
        setDbUserData(data.user);
      } else {
        setDbUserData(null);
      }
    } catch {
      setDbUserData(null);
    }
  }, []);

  useEffect(() => {
    if (clerk.isLoaded && clerk.isSignedIn) {
      fetchDbUser();
    } else if (clerk.isLoaded && !clerk.isSignedIn) {
      setDbUserData(null);
    }
  }, [clerk.isLoaded, clerk.isSignedIn, fetchDbUser]);

  let user: AppUser | null = null;

  if (clerk.isLoaded && clerk.user) {
    const cUser = clerk.user;
    const email = cUser.primaryEmailAddress?.emailAddress || '';
    const name = cUser.fullName || cUser.firstName || cUser.username || email.split('@')[0] || 'Developer';
    const username = cUser.username || dbUserData?.username || email.split('@')[0];
    const avatar = cUser.imageUrl || dbUserData?.avatar;

    user = {
      id: cUser.id,
      userId: cUser.id,
      name,
      email,
      username,
      avatar,
      institutionType: dbUserData?.institutionType,
      institutionName: dbUserData?.institutionName,
      codingLevel: dbUserData?.codingLevel,
      user_metadata: {
        full_name: name,
        name,
        username,
        avatar_url: avatar,
        institution_type: dbUserData?.institutionType,
        institution_name: dbUserData?.institutionName,
        coding_level: dbUserData?.codingLevel,
      },
    };
  } else if (dbUserData?.userId) {
    user = dbUserData as AppUser;
  }

  return {
    user,
    isLoaded: clerk.isLoaded,
    isSignedIn: clerk.isLoaded ? !!clerk.isSignedIn : false,
    refreshUser: fetchDbUser,
  };
}
