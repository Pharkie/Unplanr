import { google } from 'googleapis';

const MAX_EVENTS_PER_REQUEST = 100;

export class CalendarService {
  // Create a new authenticated OAuth2Client for each request
  private createAuthClient(tokens: any) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);
    return oauth2Client;
  }

  async listCalendars(tokens: any) {
    const auth = this.createAuthClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.calendarList.list();
    return response.data.items || [];
  }

  async listEvents(
    tokens: any,
    calendarId = 'primary',
    options: {
      maxResults?: number;
      timeMin?: string;
      timeMax?: string;
      q?: string;
    } = {}
  ) {
    // Enforce 100 event limit
    const limitedMaxResults = Math.min(options.maxResults || 100, MAX_EVENTS_PER_REQUEST);

    const auth = this.createAuthClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    // Build the request parameters
    const params: any = {
      calendarId,
      maxResults: limitedMaxResults,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: options.timeMin || new Date().toISOString(),
    };

    // Add optional parameters if provided
    if (options.timeMax) {
      params.timeMax = options.timeMax;
    }

    if (options.q) {
      params.q = options.q;
    }

    const response = await calendar.events.list(params);

    return response.data.items || [];
  }

  async deleteEvent(tokens: any, calendarId: string, eventId: string) {
    const auth = this.createAuthClient(tokens);
    const calendar = google.calendar({ version: 'v3', auth });

    await calendar.events.delete({
      calendarId,
      eventId,
    });
  }

  async deleteMultipleEvents(tokens: any, calendarId: string, eventIds: string[]) {
    // Enforce 100 event limit
    const limitedEventIds = eventIds.slice(0, MAX_EVENTS_PER_REQUEST);

    const results = await Promise.allSettled(
      limitedEventIds.map((eventId) => this.deleteEvent(tokens, calendarId, eventId))
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
}

export const calendarService = new CalendarService();
