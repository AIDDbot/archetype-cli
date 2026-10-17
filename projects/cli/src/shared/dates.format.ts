function pad(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}
export function formatDate(date: Date): string {
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
}
export function formatTime(date: Date): string {
  return (
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join(":") +
    "." +
    pad(date.getMilliseconds(), 3)
  );
}
export function formatDateTime(date: Date): string {
  return formatDate(date) + " " + formatTime(date).slice(0, 8);
}
