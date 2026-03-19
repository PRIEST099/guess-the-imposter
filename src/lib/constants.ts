import { GameMode, GameSettings } from '@/types/game';

export const DEFAULT_SETTINGS: GameSettings = {
  gameMode: GameMode.SKETCH_OFF,
  maxPlayers: 8,
  totalRounds: 3,
  taskDuration: 30, // per-turn inactivity timeout in SKETCH_OFF
  discussionDuration: 90,
  votingDuration: 30,
  turnsPerRound: 1,
};

/** Auto-assigned colors for SKETCH_OFF players (up to 8 players) */
export const PLAYER_PALETTE = [
  '#7dd3fc', // sky blue
  '#fda4af', // rose
  '#86efac', // mint
  '#c4b5fd', // lavender
  '#fde68a', // amber
  '#f472b6', // pink
  '#a78bfa', // violet
  '#34d399', // emerald
] as const;

/** Fixed brush width for SKETCH_OFF (no user choice) */
export const SKETCH_BRUSH_WIDTH = 4;

export const MIN_PLAYERS = 3;
export const MAX_PLAYERS = 8;
export const ROOM_CODE_LENGTH = 6;

export const PHASE_DURATIONS = {
  ROLE_REVEAL: 5,
  ROUND_RESULTS: 8,
} as const;

export const GAME_MODE_INFO: Record<GameMode, { name: string; description: string; icon: string }> = {
  [GameMode.WORD_PLAY]: {
    name: 'Word Play',
    description: 'Describe a word without saying it. The imposter has a different word!',
    icon: '✏️',
  },
  [GameMode.SKETCH_OFF]: {
    name: 'Sketch-Off',
    description: 'Draw on a shared canvas. The imposter doesn\'t know the prompt!',
    icon: '🎨',
  },
  [GameMode.TRIVIA_TWIST]: {
    name: 'Trivia Twist',
    description: 'Answer trivia questions. The imposter sees a different question!',
    icon: '🧠',
  },
  [GameMode.CAPTION_CHAOS]: {
    name: 'Caption Chaos',
    description: 'Caption an image. The imposter sees a different image!',
    icon: '📸',
  },
  [GameMode.ODD_ONE_OUT]: {
    name: 'Odd One Out',
    description: 'Rank items by a criterion. The imposter has a different criterion!',
    icon: '📊',
  },
  [GameMode.RANDOM]: {
    name: 'Random Mode',
    description: 'A different game mode each round! Keeps things unpredictable.',
    icon: '🎲',
  },
};

/** All concrete (non-RANDOM) game modes for mode rotation */
export const CONCRETE_MODES = [
  GameMode.WORD_PLAY,
  GameMode.SKETCH_OFF,
  GameMode.TRIVIA_TWIST,
  GameMode.CAPTION_CHAOS,
  GameMode.ODD_ONE_OUT,
] as const;

export const SCORING = {
  CORRECT_VOTE: 100,
  IMPOSTER_SURVIVES: 150,
  IMPOSTER_GUESS_PROMPT: 50,
  WRONG_VOTE: -25,
  SPEED_BONUS_MAX: 30,
  SPEED_BONUS_MIN: 10,
} as const;

export const AVATARS = Array.from({ length: 24 }, (_, i) => ({
  id: `avatar-${i + 1}`,
  color: ['#7dd3fc', '#c4b5fd', '#fda4af', '#86efac', '#fde68a', '#fda4af'][i % 6],
}));
