import {IUser} from "../models/IUser";
import {makeAutoObservable} from "mobx";
import AuthService from "../services/AuthService";
import UserService from "../services/UserService";
import {AxiosResponse} from "axios";
import {IWish} from "../models/IWish";
import {AuthResponse} from "../models/response/AuthResponse";

export default class Store {
    user = {} as IUser;
    isAuth = false;
    wishlist = [] as IWish[];
    reset = true;

    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }

    setResetPage(reset: boolean) {
        this.reset = reset;
    }

    async login(email: string, password: string) {
        try {
            const response = await AuthService.login(email, password);
            console.log(response);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            this.setAuth(true);
        } catch (error: any) {
            console.log(error.response?.data?.message);
            return error.response?.data;
        }
    }

    async registration(name: string, email: string, password: string) {
        try {
            const response = await AuthService.registration(name, email, password);
            console.log(response);
            return response;
        } catch (error: any) {
            console.log(error.response?.data?.message);
            return error.response?.data;
        }
    }

    async confirm(uuid: string, key: string, code: string | null, by_url?: boolean) {
        try {
            let response: AxiosResponse<AuthResponse>;
            if (by_url) {
                response = await AuthService.confirm_by_url(uuid, key);
            } else {
                response = await AuthService.confirm(uuid, <string>code, key);
            }
            return response.data;
        } catch (error: any) {
            console.log(error.response?.data?.message);
            return error.response?.data;
        }
    }

    async logout() {
        try {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            this.setAuth(false);
            this.setUser({} as IUser);
        } catch (error: any) {
            console.log(error.response?.data?.message);
        }
    }

    async checkAuth() {
        try {
            const refreshToken: any = localStorage.getItem('refresh_token');
            const response = await AuthService.refresh(refreshToken);
            console.log(response);
            localStorage.setItem('access_token', response.data.access_token);
            this.setAuth(true);
        } catch (e: any) {
            console.log(e.response?.data?.message);
        }
    }

    async getUserInfo() {
        try {
            const userResponse = await UserService.fetchUsers();
            console.log(userResponse);
            this.setUser(userResponse.data);
        } catch (e: any) {
            console.log(e.response?.data);

        }
    }

    async checkReset(restoreData: {uuid: string, code: string, secret_key: string}) {
        try {
            const checkCode = await AuthService.check_code({
                uuid: restoreData.uuid,
                code: restoreData.code as string,
                secret_key: restoreData.secret_key as string
            });
            if (checkCode.data.data) {
                return restoreData;
            }
        } catch (e: any) {
            return e.response?.data;
        }
    }
}