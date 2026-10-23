const MILLISECONDS_PER_SECOND = 1000;

export function formatMilliseconds(milliseconds: number): string {
  return `${Math.round(milliseconds)}ms`;
}

export function toSeconds(milliseconds: number): number {
  return Math.round(milliseconds) / MILLISECONDS_PER_SECOND;
}
