export interface Theme {
  id: string;
  name: string;
  class: string;
  preview: string; // Preview color for theme switcher
  description: string;
}

export const THEMES: Theme[] = [
  {
    id: "midnight",
    name: "Midnight",
    class: "theme-midnight",
    preview: "#7dd3fc",
    description: "Deep space with cool blue accents",
  },
  {
    id: "ocean",
    name: "Ocean",
    class: "theme-ocean",
    preview: "#22d3ee",
    description: "Deep sea with cyan and teal tones",
  },
  {
    id: "sunset",
    name: "Sunset",
    class: "theme-sunset",
    preview: "#fb923c",
    description: "Warm dusk with orange and coral hues",
  },
  {
    id: "forest",
    name: "Forest",
    class: "theme-forest",
    preview: "#4ade80",
    description: "Enchanted woods with emerald greens",
  },
] as const;

export type ThemeId = "midnight" | "ocean" | "sunset" | "forest";

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
