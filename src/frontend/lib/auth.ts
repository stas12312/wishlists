"use server"
import { jwtDecode } from "jwt-decode"
import {cookies} from "next/headers"
import { redirect } from "next/navigation"
import {ITokens} from "./models";
import { refreshTokens } from "./requests";

export async function refreshTokenIfNeed(){
    const cookie = await cookies()

    const accessToken: string | undefined = cookie.get("access_token")?.value
    if (accessToken) {
        const tokenData = jwtDecode(accessToken)
        const exporedTime = tokenData.exp
        if (exporedTime && exporedTime * 1000 < Date.now()) {
            await refreshToken()
        }
    }



}

export async function logout() {
    const cookie = await cookies();
    cookie.delete("access_token");
    cookie.delete("refresh_token");
    redirect("/login")
}

export async function setTokens(tokens: ITokens) {
    const cookie = await cookies();
    cookie.set("access_token", tokens.access_token);
    cookie.set("refresh_token", tokens.refresh_token);
    redirect("/")
}

async function refreshToken() {
    const cookie = await cookies()
    const refreshToken = cookie.get("refresh_token")?.value

    if (!refreshToken) {
        throw "Токен не найден"
    }
    const response = await refreshTokens(refreshToken)
    if ("message" in response) {
        throw "Некорректный ответ"
    }

 
    cookie.set("access_token", response.access_token)
    cookie.set("refresh_token", response.refresh_token)
}