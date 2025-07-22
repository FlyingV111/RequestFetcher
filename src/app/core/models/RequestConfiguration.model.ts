export interface RequestConfiguration {
  targetUrl: string;
  requests: number;
  interval: number;
  asyncMode: boolean;
  warmupRequest: boolean;
}
