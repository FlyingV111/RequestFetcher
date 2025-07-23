export interface RequestConfiguration {
  targetUrl: string;
  method: string;
  customHeaders: string;
  requests: number;
  interval: number;
  warmupRequest: boolean;
}
