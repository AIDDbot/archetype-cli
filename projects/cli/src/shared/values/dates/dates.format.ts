function pad(value: number, width: number): string {
  return String(value).padStart(width, "0");
}

function formatClock(date: Date): string {
  return `${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getSeconds(), 2)}`;
}

export function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  return `${pad(date.getFullYear(), 4)}-${pad(month, 2)}-${pad(date.getDate(), 2)}`;
}

export function formatTime(date: Date): string {
  return `${formatClock(date)}.${pad(date.getMilliseconds(), 3)}`;
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatClock(date)}`;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString();
}
