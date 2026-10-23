const WIDTH = { year: 4, field: 2, milliseconds: 3 } as const;

function pad(value: number, digits: number): string {
  return String(value).padStart(digits, "0");
}

function formatClock(date: Date): string {
  const hours = pad(date.getHours(), WIDTH.field);
  const minutes = pad(date.getMinutes(), WIDTH.field);
  return `${hours}:${minutes}:${pad(date.getSeconds(), WIDTH.field)}`;
}

export function formatDate(date: Date): string {
  const month = date.getMonth() + 1;
  const year = pad(date.getFullYear(), WIDTH.year);
  return `${year}-${pad(month, WIDTH.field)}-${pad(date.getDate(), WIDTH.field)}`;
}

export function formatTime(date: Date): string {
  return `${formatClock(date)}.${pad(date.getMilliseconds(), WIDTH.milliseconds)}`;
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatClock(date)}`;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString();
}
