"use client";

import { ExternalLink, RotateCcw } from "lucide-react";

interface Props {
  connected: boolean;
  authUrl: string;
}

export default function ConnectCalendarButton({ connected, authUrl }: Props) {
  return connected ? (
    <a href={authUrl} className="btn-secondary text-sm gap-2">
      <RotateCcw className="h-3.5 w-3.5" />
      Reconnect
    </a>
  ) : (
    <a href={authUrl} className="btn-primary text-sm gap-2">
      <ExternalLink className="h-3.5 w-3.5" />
      Connect Google Calendar
    </a>
  );
}
