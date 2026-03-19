import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeId } from "@/lib/themes";

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "midnight",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "imposter-theme",
    }
  )
);
