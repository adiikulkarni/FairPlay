const base = 'https://placehold.co';

function encode(text: string): string {
  return encodeURIComponent(text.replace(/\s+/g, ' ').trim());
}

export function placeholderImage(
  width: number,
  height: number,
  label: string,
  background = 'dcefe5',
  foreground = '184c39'
): string {
  return `${base}/${width}x${height}/${background}/${foreground}?text=${encode(label)}`;
}

export function sportPlaceholder(label: string, width = 1200, height = 800): string {
  return placeholderImage(width, height, `FairPlay ${label}`);
}
