import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundEnabled: boolean;
  soundVolume: number; // 0-1

  toggleSound: () => void;
  setVolume: (volume: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      soundVolume: 0.5,

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(1, volume)) }),
    }),
    {
      name: 'imposter-settings',
    }
  )
);
