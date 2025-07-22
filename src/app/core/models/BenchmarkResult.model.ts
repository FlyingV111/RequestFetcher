export interface BenchmarkResult {
  id: string;
  requests: number;
  url: string;
  averageTime: number;
  timestamp: Date;
  minTime: number;
  maxTime: number;
  log: string[];
  durations: number[];
}
