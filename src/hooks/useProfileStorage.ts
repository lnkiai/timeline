import { useState, useEffect, useCallback } from 'react';

interface ProfileData {
    title: string;
    description: string;
    iconUrl: string;
}

const STORAGE_KEY = 'timeline-profile';

const DEFAULT_PROFILE: ProfileData = {
    title: "Hi, I'm catnose",
    description: "Designer, developer, maker, dog & cat lover.",
    iconUrl: "/icon.png",
};

export const useProfileStorage = () => {
    const [profile, setProfileState] = useState<ProfileData>(DEFAULT_PROFILE);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setProfileState({ ...DEFAULT_PROFILE, ...parsed });
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage
    const setProfile = useCallback((data: ProfileData) => {
        setProfileState(data);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save profile:', error);
        }
    }, []);

    const updateProfile = useCallback((updates: Partial<ProfileData>) => {
        setProfile({ ...profile, ...updates });
    }, [profile, setProfile]);

    const resetProfile = useCallback(() => {
        setProfile(DEFAULT_PROFILE);
    }, [setProfile]);

    return {
        profile,
        isLoaded,
        setProfile,
        updateProfile,
        resetProfile,
    };
};
