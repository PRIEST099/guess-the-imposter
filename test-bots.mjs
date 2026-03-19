import { io } from "socket.io-client";

const SERVER = "http://localhost:3000";
const ROOM_CODE = process.argv[2];
const NUM_BOTS = parseInt(process.argv[3] || "2");

if (!ROOM_CODE) {
  console.log("Usage: node test-bots.mjs <ROOM_CODE> [NUM_BOTS]");
  process.exit(1);
}

const bots = [];

function createBot(name, avatarId) {
  return new Promise((resolve) => {
    const socket = io(SERVER, { transports: ["websocket"] });
    let myPlayerId = null;
    let myRole = null;
    let myPrompt = null;
    let players = [];

    socket.on("connect", () => {
      console.log(`[${name}] Connected (${socket.id})`);
      socket.emit("auth:register", { nickname: name, avatarId });
    });

    socket.on("auth:registered", (data) => {
      myPlayerId = data.player.id;
      console.log(`[${name}] Registered as ${myPlayerId}`);
      socket.emit("lobby:join", { roomCode: ROOM_CODE });
    });

    socket.on("lobby:joined", (data) => {
      players = data.game.players;
      console.log(`[${name}] Joined room ${data.game.roomCode} (${data.game.players.length} players)`);
      setTimeout(() => {
        socket.emit("lobby:ready", { isReady: true });
        console.log(`[${name}] Ready!`);
        resolve({ socket, name, getPlayerId: () => myPlayerId });
      }, 1000);
    });

    socket.on("lobby:player-joined", (data) => {
      if (data.players) players = data.players;
    });

    socket.on("lobby:player-updated", (data) => {
      if (data.players) players = data.players;
    });

    socket.on("error", (data) => {
      console.error(`[${name}] Error: ${data.code} - ${data.message}`);
    });

    // Role assignment
    socket.on("game:role-assigned", (data) => {
      myRole = data.role;
      myPrompt = data.prompt;
      console.log(`[${name}] Role: ${myRole}, Prompt: ${myPrompt || "(none - imposter)"}`);
    });

    socket.on("game:round-start", (data) => {
      console.log(`[${name}] Round ${data.roundNumber} started!`);
    });

    // Turn-based drawing: draw strokes when it's my turn, then signal done
    socket.on("task:turn-start", (data) => {
      console.log(`[${name}] Turn ${data.turnNumber}/${data.totalTurns} — Drawer: ${data.drawerId} ${data.drawerId === myPlayerId ? "(ME!)" : ""}`);

      if (data.drawerId === myPlayerId) {
        // It's my turn — draw some strokes after a delay, then signal done
        setTimeout(() => {
          for (let i = 0; i < 3; i++) {
            const stroke = {
              points: [
                { x: 80 + i * 60 + Math.random() * 40, y: 80 + i * 40 + Math.random() * 40, pressure: 0.5 },
                { x: 150 + i * 60 + Math.random() * 40, y: 120 + i * 40 + Math.random() * 40, pressure: 0.5 },
                { x: 220 + i * 60 + Math.random() * 40, y: 100 + i * 40 + Math.random() * 40, pressure: 0.5 },
              ],
              color: ["#00f0ff", "#b44aff", "#ff2d7c"][i % 3],
              width: 4,
              tool: "pen",
            };
            socket.emit("task:canvas-stroke", { stroke });
          }
          console.log(`[${name}] Drew strokes, finishing turn...`);
          // End turn after drawing
          setTimeout(() => {
            socket.emit("task:turn-done");
            console.log(`[${name}] Turn done!`);
          }, 2000);
        }, 1500);
      }
    });

    socket.on("game:phase-change", (data) => {
      console.log(`[${name}] Phase: ${data.phase}`);

      // Auto-vote during voting phase
      if (data.phase === "VOTING") {
        setTimeout(() => {
          const others = players.filter(p => p.id !== myPlayerId);
          if (others.length > 0) {
            const target = others[Math.floor(Math.random() * others.length)];
            socket.emit("vote:cast", { votedPlayerId: target.id });
            console.log(`[${name}] Voted for ${target.nickname || target.id}`);
          }
        }, 2000);
      }
    });

    socket.on("task:canvas-stroke", (data) => {
      console.log(`[${name}] Received stroke from ${data.playerId}`);
    });

    socket.on("task:turn-timer", (data) => {
      if (data.secondsRemaining % 5 === 0) {
        console.log(`[${name}] Turn timer: ${data.secondsRemaining}s`);
      }
    });

    socket.on("task:all-submitted", (data) => {
      console.log(`[${name}] All submissions received (${data.submissions.length})`);
    });

    socket.on("vote:results", (data) => {
      console.log(`[${name}] Vote results: imposterFound=${data.imposterWasFound}, imposter=${data.imposterId}`);
    });

    socket.on("timer:sync", (data) => {
      if (data.secondsRemaining % 15 === 0) {
        console.log(`[${name}] Timer: ${data.secondsRemaining}s`);
      }
    });

    socket.on("game:ended", (data) => {
      console.log(`[${name}] Game over! Winner: ${data.winner}`);
    });

    socket.on("disconnect", () => {
      console.log(`[${name}] Disconnected`);
    });
  });
}

async function main() {
  console.log(`Creating ${NUM_BOTS} bots to join room ${ROOM_CODE}...`);

  for (let i = 0; i < NUM_BOTS; i++) {
    const name = `Bot${i + 1}`;
    const avatarId = `avatar-${i + 3}`;
    const bot = await createBot(name, avatarId);
    bots.push(bot);
    console.log(`---`);
  }

  console.log(`\nAll ${NUM_BOTS} bots joined and ready! Waiting for game events...`);
  console.log("Press Ctrl+C to disconnect all bots.\n");
}

main().catch(console.error);
