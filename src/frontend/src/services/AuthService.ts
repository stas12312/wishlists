import $api from "../http";
import {AxiosResponse} from "axios";
import {AuthResponse, AuthRestore} from "../models/response/AuthResponse";

export default class AuthService {
    static async login(email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/api/auth/login', {email, password})
    }

    static async registration(name: string, email: string, password: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/api/auth/register', {email, password, name})
    }

    static async confirm(uuid: string, code: string, secret_key: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/api/auth/confirm', {uuid, code, secret_key})
    }

    static async confirm_by_url(uuid: string, key: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post<AuthResponse>('/api/auth/confirm', {uuid, key})
    }

    static  async logout(): Promise<AxiosResponse<AuthResponse>> {
        return $api.post('/api/auth/logout')
    }

    static async refresh(refreshToken: string): Promise<AxiosResponse<AuthResponse>> {
        return $api.post('/api/auth/refresh', {refresh_token: refreshToken})
    }
    static async restore(email: string): Promise<AxiosResponse<AuthRestore>> {
        return $api.post('/api/auth/restore', {email})
    }

    static async check_code(props: {uuid: string, code: string, secret_key: string}): Promise<AxiosResponse<AuthRestore>> {
        return $api.post('/api/auth/check-code', props)
    }

    static async reset_password(props: {uuid: string, code: string, secret_key: string, password: string}): Promise<AxiosResponse<AuthRestore>> {
        return $api.post('/api/auth/reset-password', props)
    }
}

