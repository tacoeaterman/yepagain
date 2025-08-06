var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default;
var init_vite_config = __esm({
  async "vite.config.ts"() {
    "use strict";
    vite_config_default = defineConfig({
      plugins: [
        react(),
        runtimeErrorOverlay(),
        ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
          await import("@replit/vite-plugin-cartographer").then(
            (m) => m.cartographer()
          )
        ] : []
      ],
      resolve: {
        alias: {
          "@": path.resolve(import.meta.dirname, "client", "src"),
          "@shared": path.resolve(import.meta.dirname, "shared"),
          "@assets": path.resolve(import.meta.dirname, "attached_assets")
        }
      },
      root: path.resolve(import.meta.dirname, "client"),
      build: {
        outDir: path.resolve(import.meta.dirname, "dist/public"),
        emptyOutDir: true
      },
      server: {
        fs: {
          strict: true,
          deny: ["**/.*"]
        }
      }
    });
  }
});

// server/vite-dev.ts
var vite_dev_exports = {};
__export(vite_dev_exports, {
  setupViteDev: () => setupViteDev
});
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { nanoid } from "nanoid";
async function setupViteDev(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
var viteLogger;
var init_vite_dev = __esm({
  async "server/vite-dev.ts"() {
    "use strict";
    await init_vite_config();
    viteLogger = createLogger();
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  log: () => log,
  serveStatic: () => serveStatic,
  setupVite: () => setupVite
});
import express from "express";
import fs2 from "fs";
import path3 from "path";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  if (process.env.NODE_ENV !== "development") {
    throw new Error("setupVite should only be called in development mode");
  }
  const { setupViteDev: setupViteDev2 } = await init_vite_dev().then(() => vite_dev_exports);
  return setupViteDev2(app2, server);
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
  }
});

// server/vite-prod.ts
var vite_prod_exports = {};
__export(vite_prod_exports, {
  log: () => log2,
  serveStatic: () => serveStatic2,
  setupVite: () => setupVite2
});
import express2 from "express";
import fs3 from "fs";
import path4 from "path";
function log2(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite2(app2, server) {
  throw new Error("setupVite should only be called in development mode");
}
function serveStatic2(app2) {
  const distPath = path4.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}
var init_vite_prod = __esm({
  "server/vite-prod.ts"() {
    "use strict";
  }
});

// server/index.ts
import express3 from "express";

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
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
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
  app2.get("/api/games/:gameCode", async (req, res) => {
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
  app2.post("/api/games", async (req, res) => {
    try {
      const game = await storage.createGame(req.body);
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to create game" });
    }
  });
  app2.put("/api/games/:id", async (req, res) => {
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
  app2.post("/api/users", async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
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
  app2.put("/api/users/:id", async (req, res) => {
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

// server/index.ts
var setupVite3;
var serveStatic3;
var log3;
if (process.env.NODE_ENV === "development") {
  const viteModule = await Promise.resolve().then(() => (init_vite(), vite_exports));
  setupVite3 = viteModule.setupVite;
  serveStatic3 = viteModule.serveStatic;
  log3 = viteModule.log;
} else {
  const viteModule = await Promise.resolve().then(() => (init_vite_prod(), vite_prod_exports));
  setupVite3 = viteModule.setupVite;
  serveStatic3 = viteModule.serveStatic;
  log3 = viteModule.log;
}
var app = express3();
app.use(express3.json());
app.use(express3.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log3(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite3(app, server);
  } else {
    serveStatic3(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log3(`serving on port ${port}`);
  });
})();
