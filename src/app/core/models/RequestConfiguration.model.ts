export interface RequestConfiguration {
  targetUrl: string;
  method: string;
  customCode: string;
  requests: number;
  interval: number;
  warmupRequest: boolean;
}
