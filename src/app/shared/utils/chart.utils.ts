export function getBufferedValues(minValues: number[], maxValues: number[], bufferPercentage: number): {
  min: number,
  max: number
} {
  const minValue = Math.min(...minValues);
  const maxValue = Math.max(...maxValues);
  const range = maxValue - minValue;
  const buffer = range * bufferPercentage;
  return {
    min: minValue - buffer,
    max: maxValue + buffer
  };
}

