import {IUser} from "../models/IUser";
import {makeAutoObservable} from "mobx";
import AuthService from "../services/AuthService";
import {jwtDecode} from "jwt-decode";
import UserService from "../services/UserService";
import {AxiosResponse} from "axios";
import WishlistService from "../services/WishlistService";
import {IWishList} from "../models/IWish";

export default class Store {
    user = {} as IUser;
    isAuth = false;
    wishlist = {} as IWishList;

    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool: boolean) {
        this.isAuth = bool;
    }

    setUser(user: IUser) {
        this.user = user;
    }

    setWishlist(wishlist: IWishList) {
        this.wishlist = wishlist
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
            return error;
        }
    }

    async registration(name: string, email: string, password: string) {
        try {
            const response = await AuthService.registration(name, email, password);
            console.log(response);
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            this.setAuth(true);
        } catch (error: any) {
            console.log(error.response?.data?.message);
            return error;
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
            const response = await UserService.fetchUsers();
            console.log(response);
            this.setUser(response.data);
        } catch (e: any) {
            console.log(e.response?.data);

        }
    }

    async createNewWishlist(name: string, description: string) {
        try {
            const response = await WishlistService.create(name, description);
            console.log(response);
            this.setAuth(true);
        } catch (error: any) {
            console.log(error.response?.data?.message);
            return error;
        }
    }
}