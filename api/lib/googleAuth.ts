import { google } from 'googleapis';

// Using calendar.events (not calendar) for minimal permissions
// This only allows viewing/editing events, not calendar settings
const SCOPES = ['https://www.googleapis.com/auth/calendar.events'];

export class GoogleAuthService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
    });
  }

  async getTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async refreshAccessToken(refreshToken: string) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });
    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  getOAuth2Client() {
    return this.oauth2Client;
  }

  setCredentials(tokens: any) {
    this.oauth2Client.setCredentials(tokens);
  }
}

export const googleAuthService = new GoogleAuthService();
