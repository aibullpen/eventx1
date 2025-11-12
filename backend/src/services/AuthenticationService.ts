import { google } from 'googleapis';
import { User, GoogleProfile, UserSession } from '../models/User';
import { GoogleSheetsService } from './GoogleSheetsService';

export class AuthenticationService {
  private oauth2Client;
  private users: Map<string, User> = new Map(); // In-memory storage for now

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Initiate Google OAuth flow
   * Returns the authorization URL for the user to visit
   */
  initiateGoogleAuth(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/gmail.send'
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    return authUrl;
  }

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  async handleGoogleCallback(code: string): Promise<UserSession> {
    try {
      // Exchange authorization code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get user profile from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      const googleProfile: GoogleProfile = {
        id: data.id!,
        displayName: data.name!,
        emails: [{ value: data.email!, verified: data.verified_email! }]
      };

      // Check if user exists
      let user = this.getUser(googleProfile.id);

      if (!user) {
        // Create new user
        user = await this.createUser(googleProfile);
      } else {
        // Update last login
        user.updatedAt = new Date();
      }

      // Store tokens with user
      user.accessToken = tokens.access_token!;
      user.refreshToken = tokens.refresh_token || user.refreshToken || '';
      this.users.set(user.googleId, user);

      return {
        user,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token || ''
      };
    } catch (error) {
      console.error('Error handling Google callback:', error);
      throw new Error('Failed to authenticate with Google');
    }
  }

  /**
   * Create new user account
   * Creates user record and initializes Google Sheets for event management
   */
  async createUser(googleProfile: GoogleProfile): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const email = googleProfile.emails[0].value;

    // Create Google Sheets for event management
    const sheetsService = new GoogleSheetsService(this.oauth2Client);
    const eventSheetId = await sheetsService.createEventSheet(userId, googleProfile.displayName);

    const user: User = {
      id: userId,
      googleId: googleProfile.id,
      name: googleProfile.displayName,
      email: email,
      eventSheetId: eventSheetId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.googleId, user);
    console.log(`Created user ${userId} with Event Sheet ${eventSheetId}`);
    return user;
  }

  /**
   * Get existing user by Google ID
   */
  getUser(googleId: string): User | null {
    return this.users.get(googleId) || null;
  }

  /**
   * Get user by user ID
   */
  getUserById(userId: string): User | null {
    for (const user of this.users.values()) {
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  }

  /**
   * Get OAuth2 client for making authenticated requests
   */
  getOAuth2Client() {
    return this.oauth2Client;
  }

  /**
   * Get all users
   * Used for webhook processing to find events by form ID
   */
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
}
