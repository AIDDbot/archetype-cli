export type TextAlign = "start" | "end";

export type TextWidth = { width: number; align: TextAlign };

const ellipsis = "…";

const pads: Readonly<Record<TextAlign, (text: string, width: number) => string>> = {
  start: (text, width) => text.padEnd(width),
  end: (text, width) => text.padStart(width),
};

export function truncateText(text: string, width: number): string {
  const fits = text.length <= width;
  return fits ? text : `${text.slice(0, Math.max(width - 1, 0))}${ellipsis}`;
}

export function padText(text: string, layout: TextWidth): string {
  const cut = truncateText(text, layout.width);
  return pads[layout.align](cut, layout.width);
}
