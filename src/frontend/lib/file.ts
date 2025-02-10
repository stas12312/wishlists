const FILE_SIZE_LIMIT = 3 * 1024 * 1024; // 3 МБ
const FILE_SIZE_NAME = "3 МБ";

export function isValidFile(file: File, acceptedFormats: string[]): boolean {
  const ext = getFileExt(file.name);
  return acceptedFormats.indexOf(ext) !== -1;
}

export function getFileExt(filename: string): string {
  const parts = filename.split(".");
  return parts[parts.length - 1];
}

export function checkFile(
  file: File,
  accepedFormats: string[],
  maxSize: number = FILE_SIZE_LIMIT,
  maxSizeName: string = FILE_SIZE_NAME,
): string | null {
  if (!isValidFile(file, accepedFormats)) {
    return `Неподдерживаемый тип файла .${getFileExt(file.name)}`;
  }
  if (file.size > maxSize) {
    return `Размер файла превышает допустимый размер (${maxSizeName})`;
  }
  return null;
}
