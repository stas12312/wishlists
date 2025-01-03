"use server";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

import { authRequest } from "@/lib/requests";
import { IEnhancer } from "mobx";
import { IError } from "@/lib/models";

interface IToken {
  access_token: string;
  refresh_token: string;
}

interface User {
  email: string;
  id: number;
}

export async function getUser(email: string, password: string): Promise<User | IError> {
  const authData = await auth(email, password);

  if ("message" in authData) {
    return authData
  }

  const cookie = await cookies();

  cookie.set("access_token", authData.access_token);
  cookie.set("refresh_token", authData.refresh_token);

  const decoded = jwtDecode<User>(authData.access_token);

  return {
    email: decoded["email"],
    id: decoded["id"],
  };
}

async function auth(email: string, password: string): Promise<IToken | IError> {
  return await authRequest(email, password);
}
