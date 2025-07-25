import { Injectable, signal } from '@angular/core';
import { RequestConfiguration } from '../models/RequestConfiguration.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly config = signal<RequestConfiguration>({
    targetUrl: '',
    method: 'GET',
    customHeaders: {},
    requests: 20,
    interval: 1,
    timeout: 5000,
    warmupRequest: false,
    followRedirects: true,
    asyncMode: false,
    concurrentLimit: 5,
    randomDelay: false,
    maxRetries: 0,
    contentType: 'application/json',
    authentication: 'none',
    authUsername: '',
    authPassword: '',
    authToken: '',
  });

  getConfiguration(): RequestConfiguration {
    return { ...this.config() };
  }

  setConfiguration(cfg: RequestConfiguration): void {
    this.config.set({ ...cfg });
  }

  update(partial: Partial<RequestConfiguration>): void {
    this.config.update(cfg => ({ ...cfg, ...partial }));
  }
}
