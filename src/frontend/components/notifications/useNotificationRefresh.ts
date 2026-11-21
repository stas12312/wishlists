"use client";

import { useEffect, useRef } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";

import { defaultParams, getWebsocketUrl, isEvent, WSEvent } from "@/lib/socket";

const localUpdate = "notifications-changed";

export function refreshNotifications() {
  window.dispatchEvent(new Event(localUpdate));
}

export function useNotificationRefresh(
  load: (signal: AbortSignal) => Promise<void>,
  { waitForConnection = false }: { waitForConnection?: boolean } = {},
) {
  const refreshRef = useRef<() => Promise<void>>(null);
  const { lastMessage, readyState } = useWebSocket(getWebsocketUrl, {
    ...defaultParams,
    retryOnError: true,
    shouldReconnect: () => true,
    filter: (message) => isEvent(message, WSEvent.NotificationsChanged),
  });
  const connected = readyState === ReadyState.OPEN;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let started = false;
    let loading = false;
    let refreshPending = false;

    async function refresh() {
      started = true;
      if (loading) {
        refreshPending = true;
        return;
      }
      loading = true;
      try {
        do {
          refreshPending = false;
          await load(signal);
        } while (refreshPending && !signal.aborted);
      } finally {
        loading = false;
      }
    }

    function refreshOnWindowEvent() {
      if (started) void refresh();
    }

    refreshRef.current = refresh;
    window.addEventListener(localUpdate, refreshOnWindowEvent);
    window.addEventListener("focus", refreshOnWindowEvent);
    return () => {
      controller.abort();
      refreshRef.current = null;
      window.removeEventListener(localUpdate, refreshOnWindowEvent);
      window.removeEventListener("focus", refreshOnWindowEvent);
    };
  }, [load]);

  useEffect(() => {
    if (!waitForConnection || connected) void refreshRef.current?.();
  }, [connected, lastMessage, load, waitForConnection]);
}
