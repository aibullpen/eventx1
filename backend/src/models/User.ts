export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  eventSheetId: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
}

export interface UserSession {
  user: User;
  accessToken: string;
  refreshToken: string;
}
