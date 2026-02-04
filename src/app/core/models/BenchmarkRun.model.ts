import { RequestConfiguration } from "./RequestConfiguration.model";
export interface BenchmarkRun {
  config: RequestConfiguration;
  results: number[];
  timestamp: string; // ISO
}
