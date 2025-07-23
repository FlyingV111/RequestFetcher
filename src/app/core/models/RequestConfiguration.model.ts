export interface RequestConfiguration {
  targetUrl: string;
  method: string;
  headerName: string;
  headerValue: string;
  requests: number;
  interval: number;
  warmupRequest: boolean;
}
