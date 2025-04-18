"use client";
import { useEffect } from "react";

import { login } from "./oauth";

const WindowReload = ({
  oAuthType,
  token,
}: {
  oAuthType: string;
  token: string;
}) => {
  useEffect(() => {
    async function loginAndReload() {
      const href = localStorage.getItem("path") || "/";
      localStorage.removeItem("path");
      await login(oAuthType, token);
      if (window.opener) {
        window.opener.location = href;
        window.close();
      } else {
        window.location.href = href;
      }
    }
    loginAndReload();
  }, []);
  return <></>;
};

export default WindowReload;
