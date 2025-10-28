import { google } from 'googleapis';
import { googleAuthService } from './googleAuth.js';

const MAX_EVENTS_PER_REQUEST = 100;

export class CalendarService {
  async listEvents(tokens: any, maxResults = 100) {
    // Enforce 100 event limit
    const limitedMaxResults = Math.min(maxResults, MAX_EVENTS_PER_REQUEST);

    googleAuthService.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: googleAuthService.getOAuth2Client() });

    const response = await calendar.events.list({
      calendarId: 'primary',
      maxResults: limitedMaxResults,
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
    // Enforce 100 event limit
    const limitedEventIds = eventIds.slice(0, MAX_EVENTS_PER_REQUEST);

    const results = await Promise.allSettled(
      limitedEventIds.map((eventId) => this.deleteEvent(tokens, eventId))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return {
      succeeded,
      failed,
      total: limitedEventIds.length,
      limited: eventIds.length > MAX_EVENTS_PER_REQUEST
    };
  }

  async getUserInfo(tokens: any) {
    googleAuthService.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: googleAuthService.getOAuth2Client() });

    const response = await oauth2.userinfo.get();
    return response.data;
  }
}

export const calendarService = new CalendarService();
