export function getCookie(name: string) {
  let match = document.cookie.match(new RegExp(name + "=([^;]+)"));
  return match ? match[1] : undefined;
}

export function getWebsocketUrl(): string {
  const accessToken = getCookie("access_token");
  return `${process.env.NEXT_PUBLIC_WS_URL}?token=${accessToken}`;
}

export enum WSEvent {
  ChangeIncomingFriendsRequests = "ChangeIncomingFriendsRequests",
  Update = "Update",
  Subscribe = "Subscribe",
  Unsubscribe = "Unsubscribe",
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
