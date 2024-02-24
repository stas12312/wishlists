import {IUser} from "../IUser";

export interface AuthResponse {
    uuid: string;
    access_token: string;
    refresh_token: string;
    user: IUser;
}

export interface AuthRestore extends AuthResponse{
    code: string;
    secret_key: string;
    data: {
        data: boolean
    }
}