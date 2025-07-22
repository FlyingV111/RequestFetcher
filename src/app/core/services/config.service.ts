import { Injectable, signal } from '@angular/core';
import { RequestConfiguration } from '../models/RequestConfiguration.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly targetUrl = signal('');
  readonly requests = signal(20);
  readonly interval = signal(1);
  readonly asyncMode = signal(false);
  readonly warmupRequest = signal(true);

  getConfiguration(): RequestConfiguration {
    return {
      targetUrl: this.targetUrl(),
      requests: this.requests(),
      interval: this.interval(),
      asyncMode: this.asyncMode(),
      warmupRequest: this.warmupRequest(),
    };
  }

  setConfiguration(config: RequestConfiguration): void {
    this.targetUrl.set(config.targetUrl);
    this.requests.set(config.requests);
    this.interval.set(config.interval);
    this.asyncMode.set(config.asyncMode);
    this.warmupRequest.set(config.warmupRequest);
  }
}
