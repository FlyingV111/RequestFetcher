export function getCssVariableValue(variable: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

export function hslToRgba(hsl: string, alpha: number = 1): string {
  const [h, s, l] = hsl
    .replace(/[^\d. %]/g, '')
    .trim()
    .split(/\s+/)
    .map((v, i) => i === 0 ? parseFloat(v) : parseFloat(v) / 100);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let [r, g, b] = h < 60 ? [c, x, 0] :
    h < 120 ? [x, c, 0] :
      h < 180 ? [0, c, x] :
        h < 240 ? [0, x, c] :
          h < 300 ? [x, 0, c] : [c, 0, x];

  const to255 = (v: number) => Math.round((v + m) * 255);
  return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${alpha})`;
}
