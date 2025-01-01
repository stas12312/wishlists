import { IUser } from "./models";

export function getLabelForCount(count: number, labels: string[]): string {
    const cases = [2, 0, 1, 1, 1, 2];
    return labels[count % 100 > 4 && count % 100 < 20 ? 2 : cases[count % 10 < 5 ? count % 10 : 5]];
}

export function getUserLink(username: string): string {
    return `${window.location.origin}/users/${username}`
}