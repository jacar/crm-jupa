import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class CalendarSyncService {
  private readonly logger = new Logger(CalendarSyncService.name);

  async syncToGoogle(calendarEvent: any, accessToken: string) {
    try {
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const calendar = google.calendar({ version: 'v3', auth });

      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: calendarEvent.title,
          description: calendarEvent.description,
          location: calendarEvent.location,
          start: { dateTime: calendarEvent.startDate.toISOString(), timeZone: 'America/Santiago' },
          end: { dateTime: calendarEvent.endDate.toISOString(), timeZone: 'America/Santiago' },
        },
      });

      this.logger.log(`Event synced to Google Calendar: ${event.data.id}`);
      return { googleEventId: event.data.id };
    } catch (error) {
      this.logger.error('Google Calendar sync failed', error);
      return { error };
    }
  }

  async syncToOutlook(calendarEvent: any, accessToken: string) {
    try {
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: calendarEvent.title,
          body: { contentType: 'HTML', content: calendarEvent.description },
          start: { dateTime: calendarEvent.startDate.toISOString(), timeZone: 'America/Santiago' },
          end: { dateTime: calendarEvent.endDate.toISOString(), timeZone: 'America/Santiago' },
        }),
      });
      const data = await response.json();
      this.logger.log(`Event synced to Outlook: ${data.id}`);
      return { outlookEventId: data.id };
    } catch (error) {
      this.logger.error('Outlook Calendar sync failed', error);
      return { error };
    }
  }
}
