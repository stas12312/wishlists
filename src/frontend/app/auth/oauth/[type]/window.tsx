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
      await login(oAuthType, token);
      if (window.opener) {
        window.opener.location = "/";
        window.close();
      } else {
        window.location.href = "/";
      }
    }
    loginAndReload();
  }, []);
  return <></>;
};

export default WindowReload;
