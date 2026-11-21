"use client";

import { useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { defaultParams, getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";

const localUpdate = "notifications-changed";

export function refreshNotifications() {
  window.dispatchEvent(new Event(localUpdate));
}

export function useNotificationRefresh(load: (signal: AbortSignal) => void) {
  const { lastMessage, readyState } = useWebSocket(getWebsocketUrl, {
    ...defaultParams,
    retryOnError: true,
    shouldReconnect: () => true,
    filter: (message) => isEvent(message, WSEvent.NotificationsChanged),
  });
  const connected = readyState === ReadyState.OPEN;

  useEffect(() => {
    let request: AbortController;
    const refresh = () => {
      request?.abort();
      request = new AbortController();
      load(request.signal);
    };
    refresh();
    window.addEventListener(localUpdate, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      request.abort();
      window.removeEventListener(localUpdate, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [connected, lastMessage, load]);
}
