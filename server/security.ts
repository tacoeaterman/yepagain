import { z } from 'zod';

// Input sanitization utilities
export class SecurityUtils {
  /**
   * Sanitize string input to prevent XSS and injection attacks
   */
  static sanitizeString(input: string, maxLength: number = 100): string {
    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }
    
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>\"']/g, '') // Remove potential HTML/JS characters
      .replace(/[^\w\s\-\.]/g, ''); // Allow only alphanumeric, spaces, hyphens, dots
  }

  /**
   * Sanitize display name
   */
  static sanitizeDisplayName(name: string): string {
    const sanitized = this.sanitizeString(name, 50);
    if (sanitized.length < 1) {
      throw new Error('Display name must contain at least 1 valid character');
    }
    return sanitized;
  }

  /**
   * Sanitize game name
   */
  static sanitizeGameName(name: string): string {
    const sanitized = this.sanitizeString(name, 100);
    if (sanitized.length < 1) {
      throw new Error('Game name must contain at least 1 valid character');
    }
    return sanitized;
  }

  /**
   * Validate game code format
   */
  static validateGameCode(code: string): string {
    if (typeof code !== 'string' || !/^[A-Z0-9]{6}$/.test(code)) {
      throw new Error('Game code must be 6 uppercase alphanumeric characters');
    }
    return code;
  }

  /**
   * Validate score input
   */
  static validateScore(score: number): number {
    if (typeof score !== 'number' || !Number.isInteger(score)) {
      throw new Error('Score must be an integer');
    }
    if (score < 1 || score > 30) {
      throw new Error('Score must be between 1 and 30');
    }
    return score;
  }

  /**
   * Validate par input
   */
  static validatePar(par: number): number {
    if (typeof par !== 'number' || !Number.isInteger(par)) {
      throw new Error('Par must be an integer');
    }
    if (par < 1 || par > 10) {
      throw new Error('Par must be between 1 and 10');
    }
    return par;
  }

  /**
   * Validate hole number
   */
  static validateHole(hole: number, totalHoles: number = 18): number {
    if (typeof hole !== 'number' || !Number.isInteger(hole)) {
      throw new Error('Hole must be an integer');
    }
    if (hole < 1 || hole > totalHoles) {
      throw new Error(`Hole must be between 1 and ${totalHoles}`);
    }
    return hole;
  }

  /**
   * Rate limiting store
   */
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  /**
   * Check rate limit for user actions
   */
  static checkRateLimit(userId: string, action: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const userLimit = this.rateLimitStore.get(key);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset window
      this.rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (userLimit.count >= maxRequests) {
      return false; // Rate limit exceeded
    }

    userLimit.count++;
    return true;
  }

  /**
   * Clean up expired rate limit entries
   */
  static cleanupRateLimits(): void {
    const now = Date.now();
    for (const [key, limit] of this.rateLimitStore.entries()) {
      if (now > limit.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }
}

// Zod schemas for validation
export const schemas = {
  createGame: z.object({
    gameName: z.string().min(1).max(100),
    totalHoles: z.number().int().min(1).max(18),
    coursePar: z.number().int().min(18).max(180).optional(),
  }),

  joinGame: z.object({
    gameCode: z.string().regex(/^[A-Z0-9]{6}$/),
  }),

  submitScore: z.object({
    gameId: z.string().min(1),
    holeIndex: z.number().int().min(0).max(17),
    score: z.number().int().min(1).max(30),
  }),

  setPar: z.object({
    gameId: z.string().min(1),
    par: z.number().int().min(1).max(10),
  }),

  playCard: z.object({
    gameId: z.string().min(1),
    cardId: z.string().min(1),
    targetPlayerIds: z.array(z.string()).optional(),
  }),

  updateProfile: z.object({
    displayName: z.string().min(1).max(50),
  }),
};

// Periodic cleanup of rate limits (run every 5 minutes)
setInterval(() => {
  SecurityUtils.cleanupRateLimits();
}, 5 * 60 * 1000);
