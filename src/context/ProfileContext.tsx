import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Profile = 'Tommy' | 'Meghan';

const STORAGE_KEY = 'slicelog:active-profile';

interface ProfileContextValue {
  activeProfile: Profile | null;
  setActiveProfile: (profile: Profile) => void;
  isLoaded: boolean;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

// Purely local to this device — intentionally not synced to Supabase. It's
// just "who's holding the phone right now," not an account.
export function ProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfile, setActiveProfileState] = useState<Profile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'Tommy' || stored === 'Meghan') {
        setActiveProfileState(stored);
      }
      setIsLoaded(true);
    });
  }, []);

  function setActiveProfile(profile: Profile) {
    setActiveProfileState(profile);
    AsyncStorage.setItem(STORAGE_KEY, profile);
  }

  return (
    <ProfileContext.Provider value={{ activeProfile, setActiveProfile, isLoaded }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
