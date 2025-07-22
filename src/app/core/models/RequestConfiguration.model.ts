export interface RequestConfiguration {
  targetUrl: string;
  method: string;
  requests: number;
  interval: number;
  warmupRequest: boolean;
}
