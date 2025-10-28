import { google } from 'googleapis';
import { googleAuthService } from './googleAuth.js';

export class CalendarService {
  async listEvents(tokens: any, maxResults = 100) {
    googleAuthService.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: googleAuthService.getOAuth2Client() });

    const response = await calendar.events.list({
      calendarId: 'primary',
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: new Date().toISOString(),
    });

    return response.data.items || [];
  }

  async deleteEvent(tokens: any, eventId: string) {
    googleAuthService.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: googleAuthService.getOAuth2Client() });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  }

  async deleteMultipleEvents(tokens: any, eventIds: string[]) {
    const results = await Promise.allSettled(
      eventIds.map((eventId) => this.deleteEvent(tokens, eventId))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return { succeeded, failed, total: eventIds.length };
  }

  async getUserInfo(tokens: any) {
    googleAuthService.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: googleAuthService.getOAuth2Client() });

    const response = await oauth2.userinfo.get();
    return response.data;
  }
}

export const calendarService = new CalendarService();
