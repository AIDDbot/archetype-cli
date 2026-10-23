export function formatMilliseconds(milliseconds: number): string {
  return `${Math.round(milliseconds)}ms`;
}

export function toSeconds(milliseconds: number): number {
  return Math.round(milliseconds) / 1000;
}
