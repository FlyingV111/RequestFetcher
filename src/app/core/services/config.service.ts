import { Injectable, signal } from '@angular/core';
import { RequestConfiguration } from '../models/RequestConfiguration.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly targetUrl = signal('');
  readonly method = signal('GET');
  readonly customHeaders = signal('');
  readonly requests = signal(20);
  readonly interval = signal(1);
  readonly warmupRequest = signal(true);

  getConfiguration(): RequestConfiguration {
    return {
      targetUrl: this.targetUrl(),
      method: this.method(),
      customHeaders: this.customHeaders(),
      requests: this.requests(),
      interval: this.interval(),
      warmupRequest: this.warmupRequest(),
    };
  }

  setConfiguration(config: RequestConfiguration): void {
    this.targetUrl.set(config.targetUrl);
    this.method.set(config.method);
    this.customHeaders.set(config.customHeaders);
    this.requests.set(config.requests);
    this.interval.set(config.interval);
    this.warmupRequest.set(config.warmupRequest);
  }
}
