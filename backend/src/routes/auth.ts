import { Router, Request, Response } from 'express';
import { AuthenticationService } from '../services/AuthenticationService';

const router = Router();

/**
 * POST /api/auth/google
 * Initiate Google OAuth flow
 */
router.post('/google', (req: Request, res: Response) => {
  const authService = AuthenticationService.getInstance();
  try {
    const authUrl = authService.initiateGoogleAuth();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    res.status(500).json({
      error: 'Authentication Error',
      message: 'Google 인증을 시작할 수 없습니다.'
    });
  }
});

/**
 * GET /api/auth/google/callback
 * Handle OAuth callback from Google
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      error: 'Bad Request',
      message: '인증 코드가 없습니다.'
    });
  }

  try {
    const authService = AuthenticationService.getInstance();
    const userSession = await authService.handleGoogleCallback(code);

    // Store user session
    (req.session as any).userId = userSession.user.id;
    (req.session as any).user = {
      id: userSession.user.id,
      googleId: userSession.user.googleId,
      name: userSession.user.name,
      email: userSession.user.email
    };
    (req.session as any).accessToken = userSession.accessToken;
    (req.session as any).refreshToken = userSession.refreshToken;

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error('Error in Google callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?error=auth_failed`);
  }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', (req: Request, res: Response) => {
  const authService = AuthenticationService.getInstance();
  if (req.session && (req.session as any).userId) {
    const userId = (req.session as any).userId;
    const user = authService.getUserById(userId);

    if (user) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        eventSheetId: user.eventSheetId
      });
    } else {
      res.status(404).json({
        error: 'Not Found',
        message: '사용자를 찾을 수 없습니다.'
      });
    }
  } else {
    res.status(401).json({
      error: 'Unauthorized',
      message: '인증이 필요합니다.'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user and destroy session
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({
        error: 'Logout Error',
        message: '로그아웃 중 오류가 발생했습니다.'
      });
    }

    res.json({ message: '로그아웃되었습니다.' });
  });
});

export default router;
