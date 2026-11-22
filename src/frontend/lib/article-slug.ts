const russianLetters = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
const latinLetters = [
  "a",
  "b",
  "v",
  "g",
  "d",
  "e",
  "yo",
  "zh",
  "z",
  "i",
  "y",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "r",
  "s",
  "t",
  "u",
  "f",
  "kh",
  "ts",
  "ch",
  "sh",
  "shch",
  "",
  "y",
  "",
  "e",
  "yu",
  "ya",
];

export function createArticleSlug(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .replace(
      /[а-яё]/g,
      (letter) => latinLetters[russianLetters.indexOf(letter)],
    )
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
