/**
 * Функция вычисления произношения слова
 * @param number
 * @param one
 * @param two
 * @param several
 */
export const getNoun = (number: number, one: string, two: string, several: string) => {
    let n = Math.abs(number);
    n %= 10;

    if (n === 1 && number % 100 !== 11) {
        return one;
    }

    if (n >= 5 && n <= 20 || n === 0) {
        return several;
    }
    if (n >= 2 && n <= 4) {
        return two;
    }
    return several;
}