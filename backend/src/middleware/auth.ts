import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user session
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        googleId: string;
        name: string;
        email: string;
      };
    }
  }
}

/**
 * Authentication middleware for protected routes
 * Checks if user is authenticated via session
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.status(401).json({
      error: 'Unauthorized',
      message: '인증이 필요합니다. 로그인해주세요.'
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if authenticated, but doesn't block
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && (req.session as any).userId) {
    // User is authenticated, attach user info
    req.user = (req.session as any).user;
  }
  next();
};
