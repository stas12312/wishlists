export interface IUser {
    email: string;
    id: number;
    name: string;
}

export interface IRegResponse {
    details: string;
    message?: string;
    data: {
        uuid: string;
        secret_key: string;
        key: string;
    }
}