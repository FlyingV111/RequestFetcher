export function toUnixTimestamp(value: string): number;
export function toUnixTimestamp(value: number): number;
export function toUnixTimestamp(value: number[]): number;

export function toUnixTimestamp(value: string | number | number[]): number {
  if (typeof value === 'string') {
    return Math.floor(new Date(value).getTime() / 1000);
  }

  if (Array.isArray(value)) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    const date = new Date(year, month - 1, day, hour, minute, second);
    return Math.floor(date.getTime() / 1000);
  }

  // assume it's already a timestamp in seconds, convert to milliseconds
  return value * 1000;
}
