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
      window.opener.location = "/";
      window.close();
    }
    loginAndReload();
  }, []);
  return <></>;
};

export default WindowReload;
