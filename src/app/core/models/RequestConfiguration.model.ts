export interface RequestConfiguration {
  targetUrl: string;
  method: string;
  customHeaders: Record<string, string>;
  requests: number;
  interval: number;
  timeout: number;
  warmupRequest: boolean;
  followRedirects: boolean;

  asyncMode: boolean;
  concurrentLimit: number;
  randomDelay: boolean;
  maxRetries: number;
  contentType: string;
  authentication: 'none' | 'basic' | 'bearer';
  authUsername?: string;
  authPassword?: string;
  authToken?: string;
}
