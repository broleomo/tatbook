import { google } from "googleapis";

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`
);

export function getAuthUrl(artistId: string) {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    state: artistId,
  });
}

export async function getCalendarClient(
  accessToken: string,
  refreshToken: string
) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/callback`
  );
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
  return google.calendar({ version: "v3", auth: client });
}

export async function createCalendarEvent({
  accessToken,
  refreshToken,
  calendarId = "primary",
  summary,
  description,
  startTime,
  endTime,
  attendeeEmail,
}: {
  accessToken: string;
  refreshToken: string;
  calendarId?: string;
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendeeEmail: string;
}) {
  const calendar = await getCalendarClient(accessToken, refreshToken);

  const event = await calendar.events.insert({
    calendarId,
    sendUpdates: "all",
    requestBody: {
      summary,
      description,
      start: { dateTime: startTime.toISOString(), timeZone: "UTC" },
      end: { dateTime: endTime.toISOString(), timeZone: "UTC" },
      attendees: [{ email: attendeeEmail }],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 60 },
        ],
      },
    },
  });

  return event.data;
}

export async function getAvailableSlots({
  accessToken,
  refreshToken,
  calendarId = "primary",
  startDate,
  endDate,
}: {
  accessToken: string;
  refreshToken: string;
  calendarId?: string;
  startDate: Date;
  endDate: Date;
}) {
  const calendar = await getCalendarClient(accessToken, refreshToken);

  const response = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      items: [{ id: calendarId }],
    },
  });

  return response.data.calendars?.[calendarId]?.busy ?? [];
}
