import $api from "../http";
import {AxiosResponse} from "axios";
import {AuthResponse} from "../models/response/AuthResponse";

export default class AuthService {
    static  async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/api/auth/login', {email, password})
    }

    static  async registration(name: string, email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/api/auth/register', {email, password, name})
    }

    static  async logout(): Promise<AxiosResponse<AuthResponse>> {
        return $api.post('/api/auth/logout')
    }

    static  async refresh(refreshToken: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post('/api/auth/refresh', {refresh_token: refreshToken})
    }
}

