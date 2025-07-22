export interface BenchmarkResult {
  id: string;
  requests: number;
  url: string;
  averageTime: number;
  timestamp: Date;
}
