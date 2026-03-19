"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NicknameInput } from "@/components/profile/nickname-input";
import { AvatarPicker } from "@/components/profile/avatar-picker";
import { usePlayerStore } from "@/stores/player-store";
import { Plus, LogIn, Gamepad2, Sparkles, Globe } from "lucide-react";
import { GlassButton } from "@/components/shared/glass-button";

export function JoinForm() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const { nickname, avatarId, setProfile } = usePlayerStore();
  const [localNickname, setLocalNickname] = useState(nickname);
  const [localAvatar, setLocalAvatar] = useState(avatarId);

  const handleCreate = () => {
    if (!localNickname.trim()) return;
    setProfile(localNickname.trim(), localAvatar);
    setCreateOpen(false);
    router.push("/lobby/create");
  };

  const handleJoin = () => {
    if (!localNickname.trim() || !roomCode.trim()) return;
    setProfile(localNickname.trim(), localAvatar);
    setJoinOpen(false);
    router.push(`/lobby/${roomCode.toUpperCase()}`);
  };

  const ProfileSetup = ({ onSubmit, submitLabel, showRoomCode = false }: { onSubmit: () => void; submitLabel: string; showRoomCode?: boolean }) => (
    <div className="space-y-6">
      <NicknameInput value={localNickname} onChange={setLocalNickname} />

      <div className="space-y-2">
        <label className="text-sm font-medium text-white/35">Choose Avatar</label>
        <AvatarPicker selectedId={localAvatar} onSelect={setLocalAvatar} />
      </div>

      {showRoomCode && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/35">Room Code</label>
          <Input
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
            placeholder="Enter 6-digit code..."
            className="bg-white/[0.03] border-white/[0.08] focus:border-accent-sky/30 text-foreground font-mono text-center text-xl tracking-[0.3em] uppercase placeholder:text-white/15 placeholder:tracking-normal placeholder:text-sm h-14 rounded-xl"
            maxLength={6}
          />
        </div>
      )}

      <GlassButton
        variant="sky"
        size="lg"
        onClick={onSubmit}
        disabled={!localNickname.trim() || (showRoomCode && roomCode.length < 6)}
        className="w-full"
      >
        <Sparkles className="w-4 h-4" />
        {submitLabel}
      </GlassButton>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
      className="relative z-10 flex flex-col sm:flex-row items-center gap-4 justify-center -mt-20 pb-8 px-6 sm:px-4 w-full max-w-md sm:max-w-none mx-auto"
    >
      {/* Create Game Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="w-full sm:w-auto"
      >
        <Button
          size="lg"
          onClick={() => setCreateOpen(true)}
          className="relative w-full sm:w-auto bg-accent-sky/15 text-accent-sky border border-accent-sky/25 font-bold text-lg px-10 py-7 hover:bg-accent-sky/25 hover:border-accent-sky/40 transition-all duration-400 hover:scale-[1.02] active:scale-95 font-[family-name:var(--font-outfit)] rounded-2xl shimmer-btn min-h-[52px]"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Game
        </Button>
      </motion.div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-white/[0.08] bg-[#0c0c14]/95 backdrop-blur-[40px] sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-outfit)] text-xl flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-accent-sky" />
              Create New Game
            </DialogTitle>
          </DialogHeader>
          <ProfileSetup onSubmit={handleCreate} submitLabel="Create Game" />
        </DialogContent>
      </Dialog>

      {/* Join Game Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full sm:w-auto"
      >
        <Button
          size="lg"
          variant="outline"
          onClick={() => setJoinOpen(true)}
          className="relative w-full sm:w-auto border-white/[0.08] bg-white/[0.03] text-white/70 font-bold text-lg px-10 py-7 hover:bg-white/[0.06] hover:text-white/90 hover:border-white/[0.12] transition-all duration-400 hover:scale-[1.02] active:scale-95 font-[family-name:var(--font-outfit)] rounded-2xl min-h-[52px]"
        >
          <LogIn className="w-5 h-5 mr-2" />
          Join Game
        </Button>
      </motion.div>

      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="border-white/[0.08] bg-[#0c0c14]/95 backdrop-blur-[40px] sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-[family-name:var(--font-outfit)] text-xl flex items-center gap-2">
              <LogIn className="w-5 h-5 text-accent-lavender" />
              Join Game
            </DialogTitle>
          </DialogHeader>
          <ProfileSetup onSubmit={handleJoin} submitLabel="Join Game" showRoomCode />
        </DialogContent>
      </Dialog>

      {/* Public Lobbies Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="w-full sm:w-auto"
      >
        <Button
          size="lg"
          variant="outline"
          onClick={() => router.push("/lobbies")}
          className="relative w-full sm:w-auto border-accent-lavender/15 bg-accent-lavender/[0.04] text-accent-lavender/80 font-bold text-lg px-10 py-7 hover:bg-accent-lavender/[0.08] hover:text-accent-lavender hover:border-accent-lavender/25 transition-all duration-400 hover:scale-[1.02] active:scale-95 font-[family-name:var(--font-outfit)] rounded-2xl min-h-[52px]"
        >
          <Globe className="w-5 h-5 mr-2" />
          Public Lobbies
        </Button>
      </motion.div>
    </motion.div>
  );
}
