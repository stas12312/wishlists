export function findSpaceWithLenght(text: string, maxLength: number): number {
  if (text.length <= maxLength) {
    return text.length;
  }

  const trimmed = text.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace !== -1) {
    return lastSpace;
  } else {
    return maxLength;
  }
}
