"use server";
import { jwtDecode } from "jwt-decode";

import { authRequest } from "@/lib/requests";
import { IError } from "@/lib/models";
import { setTokens } from "@/lib/auth";

interface IToken {
  access_token: string;
  refresh_token: string;
}

interface User {
  email: string;
  id: number;
}

export async function getUser(
  email: string,
  password: string,
): Promise<User | IError> {
  const authData = await auth(email, password);

  if ("message" in authData) {
    return authData;
  }

  await setTokens(authData);

  const decoded = jwtDecode<User>(authData.access_token);

  return {
    email: decoded["email"],
    id: decoded["id"],
  };
}

async function auth(email: string, password: string): Promise<IToken | IError> {
  return await authRequest(email, password);
}
