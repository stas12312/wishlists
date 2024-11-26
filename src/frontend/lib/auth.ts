'use server'
import { jwtDecode } from "jwt-decode"
import {cookies} from "next/headers"
import { redirect } from "next/navigation"
import {ITokens} from "./models";

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
    console.log("Обновление токена")
    const cookie = await cookies()
    const headers = { 'Authorization': `Bearer ${cookie.get("access_token")?.value}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
     };

    const response = await fetch("https://test.mywishlists.ru/api/auth/refresh",{
        headers: headers,
        method: "post",
        body: JSON.stringify({"refresh_token": cookie.get("refresh_token")?.value},
        )
    }
    )
    if (!response.ok) {
        throw "Некорректный ответ"
    }

    console.log(response.status)
    const data = await response.json()

 
    cookie.set("access_token", data.access_token)
    cookie.set("refresh_token", data.refresh_token)
}