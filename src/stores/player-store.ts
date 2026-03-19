import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerState {
  playerId: string | null;
  sessionId: string | null;
  nickname: string;
  avatarId: string;
  setProfile: (nickname: string, avatarId: string) => void;
  setPlayerId: (id: string) => void;
  setSessionId: (id: string) => void;
  reset: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      playerId: null,
      sessionId: null,
      nickname: '',
      avatarId: 'avatar-1',
      setProfile: (nickname, avatarId) => set({ nickname, avatarId }),
      setPlayerId: (id) => set({ playerId: id }),
      setSessionId: (id) => set({ sessionId: id }),
      reset: () => set({ playerId: null, sessionId: null, nickname: '', avatarId: 'avatar-1' }),
    }),
    {
      name: 'imposter-player',
    }
  )
);
