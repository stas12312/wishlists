export const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 МБ

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
): string | null {
  if (!isValidFile(file, accepedFormats)) {
    return `Неподдерживаемый тип файла .${getFileExt(file.name)}`;
  }
  if (file.size > maxSize) {
    return `Размер файла ${readableBytes(file.size)} превышает допустимый размер (${readableBytes(maxSize, false)})`;
  }
  return null;
}

export function readableBytes(
  bytes: number,
  fixedPoint: boolean = true,
): string {
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const sizes = ["Б", "КБ", "МБ", "ГБ"];

  let converterValue = (bytes / Math.pow(1024, i)).toFixed(2);
  if (!fixedPoint) {
    converterValue = parseFloat(converterValue).toString();
  }

  return `${converterValue} ${sizes[i]}`;
}
