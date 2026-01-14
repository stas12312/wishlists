import { Options } from "react-use-websocket";

import { getCookie } from "./cookie";

export function getWebsocketUrl(): string {
  const accessToken = getCookie("access_token");
  return `${process.env.NEXT_PUBLIC_WS_URL}?token=${accessToken}`;
}

export enum WSEvent {
  ChangeIncomingFriendsRequests = "ChangeIncomingFriendsRequests",
  Update = "Update",
  Subscribe = "Subscribe",
  Unsubscribe = "Unsubscribe",

  Ping = "Ping",
  Pong = "Pong",
}

export interface WSMessage {
  channel: string;
  data: any;
  event: WSEvent;
}

export function isEvent(
  message: MessageEvent,
  event: string,
  channel?: string,
): boolean {
  const data: WSMessage = JSON.parse(message.data);
  return (
    data?.event === event && (channel === undefined || channel == data?.channel)
  );
}

export const defaultParams: Options = {
  share: true,
  heartbeat: {
    message: JSON.stringify({ event: WSEvent.Ping }),
    returnMessage: JSON.stringify({
      event: WSEvent.Pong,
      channel: "",
      data: null,
    }),
    timeout: 60000,
    interval: 25000,
  },
};
