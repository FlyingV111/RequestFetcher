import { Injectable, signal } from '@angular/core';
import { RequestConfiguration } from '../models/RequestConfiguration.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly targetUrl = signal('');
  readonly method = signal('GET');
  readonly headerName = signal('');
  readonly headerValue = signal('');
  readonly requests = signal(20);
  readonly interval = signal(1);
  readonly warmupRequest = signal(true);

  getConfiguration(): RequestConfiguration {
    return {
      targetUrl: this.targetUrl(),
      method: this.method(),
      headerName: this.headerName(),
      headerValue: this.headerValue(),
      requests: this.requests(),
      interval: this.interval(),
      warmupRequest: this.warmupRequest(),
    };
  }

  setConfiguration(config: RequestConfiguration): void {
    this.targetUrl.set(config.targetUrl);
    this.method.set(config.method);
    this.headerName.set(config.headerName);
    this.headerValue.set(config.headerValue);
    this.requests.set(config.requests);
    this.interval.set(config.interval);
    this.warmupRequest.set(config.warmupRequest);
  }
}
