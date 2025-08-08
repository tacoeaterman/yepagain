// server/index-prod.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  games;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.games = /* @__PURE__ */ new Map();
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      hasHostingPrivilege: insertUser.hasHostingPrivilege ?? false,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Game operations
  async getGame(id) {
    return this.games.get(id);
  }
  async getGameByCode(gameCode) {
    return Array.from(this.games.values()).find(
      (game) => game.gameCode === gameCode.toUpperCase()
    );
  }
  async createGame(insertGame) {
    const id = randomUUID();
    const gameCode = this.generateGameCode();
    const game = {
      ...insertGame,
      id,
      gameCode,
      courseName: insertGame.courseName ?? null,
      currentHole: insertGame.currentHole ?? 1,
      currentPar: insertGame.currentPar ?? 3,
      gamePhase: insertGame.gamePhase ?? "lobby",
      players: insertGame.players ?? {},
      scores: insertGame.scores ?? {},
      gameActivity: insertGame.gameActivity ?? [],
      createdAt: /* @__PURE__ */ new Date()
    };
    this.games.set(id, game);
    return game;
  }
  async updateGame(id, updates) {
    const game = this.games.get(id);
    if (!game) return void 0;
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }
  async deleteGame(id) {
    return this.games.delete(id);
  }
  generateGameCode() {
    let code;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (Array.from(this.games.values()).some((game) => game.gameCode === code));
    return code;
  }
};
var storage = new MemStorage();

// server/routes.ts
async function registerRoutes(app) {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws"
  });
  const connections = /* @__PURE__ */ new Map();
  wss.on("connection", (ws, request) => {
    console.log("WebSocket connection established");
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { type, userId, gameId, payload } = message;
        if (userId && type === "authenticate") {
          connections.set(userId, ws);
        }
        switch (type) {
          case "join_game":
            broadcastToGame(gameId, {
              type: "player_joined",
              payload
            });
            break;
          case "update_score":
            if (gameId) {
              broadcastToGame(gameId, {
                type: "score_updated",
                payload
              });
            }
            break;
          case "game_state_change":
            if (gameId) {
              broadcastToGame(gameId, {
                type: "game_updated",
                payload
              });
            }
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      for (const [userId, connection] of Array.from(connections.entries())) {
        if (connection === ws) {
          connections.delete(userId);
          break;
        }
      }
    });
  });
  function broadcastToGame(gameId, message) {
    for (const [userId, ws] of Array.from(connections.entries())) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }
  app.get("/api/games/:gameCode", async (req, res) => {
    try {
      const game = await storage.getGameByCode(req.params.gameCode);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });
  app.post("/api/games", async (req, res) => {
    try {
      const game = await storage.createGame(req.body);
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to create game" });
    }
  });
  app.put("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.updateGame(req.params.id, req.body);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to update game" });
    }
  });
  app.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  app.put("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  return httpServer;
}

// server/vite-prod.ts
import express from "express";
import fs from "fs";
import path from "path";
function serveStatic(app) {
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

// server/index-prod.ts
async function startServer() {
  const app = express2();
  app.use(express2.json());
  registerRoutes(app);
  serveStatic(app);
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });
  const port = process.env.PORT || 3e3;
  app.listen(port, () => {
    console.log(`\u{1F680} Server running on port ${port}`);
  });
}
startServer().catch(console.error);
