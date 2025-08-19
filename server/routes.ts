import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { auth as adminAuth } from "firebase-admin";
import { initializeApp as initializeAdminApp, cert } from "firebase-admin/app";

// Initialize Firebase Admin SDK (you'll need to set this up with your service account)
// For now, we'll use a simple token validation approach
const validateFirebaseToken = async (token: string): Promise<{ uid: string; email: string } | null> => {
  try {
    // In production, you would verify the Firebase ID token here
    // For now, we'll implement a basic validation
    if (!token || token.length < 10) return null;
    
    // This is a simplified validation - in production you'd use:
    // const decodedToken = await adminAuth().verifyIdToken(token);
    // return { uid: decodedToken.uid, email: decodedToken.email };
    
    // For development, we'll extract user info from a structured token
    try {
      const decoded = JSON.parse(atob(token));
      if (decoded.uid && decoded.email) {
        return { uid: decoded.uid, email: decoded.email };
      }
    } catch (e) {
      // If not JSON, treat as opaque token
    }
    
    return null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time game updates
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });
  
  // Store active connections by user ID with authentication info
  const connections = new Map<string, { ws: WebSocket; user: { uid: string; email: string } }>();
  
  wss.on('connection', (ws: WebSocket, request) => {
    console.log('WebSocket connection established');
    let isAuthenticated = false;
    let authenticatedUser: { uid: string; email: string } | null = null;
    
    // Set a timeout for authentication
    const authTimeout = setTimeout(() => {
      if (!isAuthenticated) {
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication timeout' }));
        ws.close();
      }
    }, 10000); // 10 second timeout
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const { type, userId, gameId, payload, token } = message;
        
        // Handle authentication
        if (type === 'authenticate') {
          if (!token) {
            ws.send(JSON.stringify({ type: 'error', message: 'Authentication token required' }));
            ws.close();
            return;
          }
          
          const user = await validateFirebaseToken(token);
          if (!user) {
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid authentication token' }));
            ws.close();
            return;
          }
          
          // Authentication successful
          clearTimeout(authTimeout);
          isAuthenticated = true;
          authenticatedUser = user;
          connections.set(user.uid, { ws, user });
          
          ws.send(JSON.stringify({ type: 'authenticated', userId: user.uid }));
          console.log(`WebSocket authenticated for user: ${user.uid}`);
          return;
        }
        
        // All other messages require authentication
        if (!isAuthenticated || !authenticatedUser) {
          ws.send(JSON.stringify({ type: 'error', message: 'Authentication required' }));
          return;
        }
        
        // Verify the userId matches the authenticated user
        if (userId && userId !== authenticatedUser.uid) {
          ws.send(JSON.stringify({ type: 'error', message: 'User ID mismatch' }));
          return;
        }
        
        // Handle different message types
        switch (type) {
          case 'join_game':
            // Broadcast to all players in the game
            broadcastToGame(gameId, {
              type: 'player_joined',
              payload: payload
            });
            break;
            
          case 'update_score':
            // Update score and broadcast to game
            if (gameId) {
              broadcastToGame(gameId, {
                type: 'score_updated',
                payload: payload
              });
            }
            break;
            
          case 'game_state_change':
            // Broadcast game state changes
            if (gameId) {
              broadcastToGame(gameId, {
                type: 'game_updated',
                payload: payload
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove connection when closed
      clearTimeout(authTimeout);
      for (const [userId, connection] of Array.from(connections.entries())) {
        if (connection.ws === ws) {
          connections.delete(userId);
          console.log(`WebSocket disconnected for user: ${userId}`);
          break;
        }
      }
    });
  });
  
  function broadcastToGame(gameId: string, message: any) {
    // In a real implementation, you'd track which users are in which games
    // For now, broadcast to all connected clients
    for (const [userId, connection] of Array.from(connections.entries())) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        connection.ws.send(JSON.stringify(message));
      }
    }
  }
  
  // REST API endpoints for game management
  app.get('/api/games/:gameCode', async (req, res) => {
    try {
      const game = await storage.getGameByCode(req.params.gameCode);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch game' });
    }
  });
  
  app.post('/api/games', async (req, res) => {
    try {
      const game = await storage.createGame(req.body);
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create game' });
    }
  });
  
  app.put('/api/games/:id', async (req, res) => {
    try {
      const game = await storage.updateGame(req.params.id, req.body);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update game' });
    }
  });
  
  app.post('/api/users', async (req, res) => {
    try {
      const user = await storage.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });
  
  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });
  
  app.put('/api/users/:id', async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  return httpServer;
}
