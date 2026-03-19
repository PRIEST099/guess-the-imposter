export interface Player {
  id: string;
  nickname: string;
  avatarId: string;
  sessionId: string;
}

export interface PlayerInGame extends Player {
  score: number;
  isReady: boolean;
  isOnline: boolean;
  isHost: boolean;
}
