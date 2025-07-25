import { Injectable, signal } from '@angular/core';
import { RequestConfiguration } from '../models/RequestConfiguration.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  readonly targetUrl = signal('');
  readonly method = signal('GET');
  readonly customHeaders = signal<Record<string, string>>({});
  readonly requests = signal(20);
  readonly interval = signal(1);
  readonly timeout = signal(5000);
  readonly warmupRequest = signal(false);
  readonly followRedirects = signal(true);

  readonly asyncMode = signal(true);
  readonly concurrentLimit = signal(5);
  readonly randomDelay = signal(false);
  readonly maxRetries = signal(0);
  readonly contentType = signal('application/json');
  readonly authentication = signal<'none' | 'basic' | 'bearer'>('none');
  readonly authUsername = signal('');
  readonly authPassword = signal('');
  readonly authToken = signal('');

  getConfiguration(): RequestConfiguration {
    return {
      targetUrl: this.targetUrl(),
      method: this.method(),
      customHeaders: this.customHeaders(),
      requests: this.requests(),
      interval: this.interval(),
      timeout: this.timeout(),
      warmupRequest: this.warmupRequest(),
      followRedirects: this.followRedirects(),

      asyncMode: this.asyncMode(),
      concurrentLimit: this.concurrentLimit(),
      randomDelay: this.randomDelay(),
      maxRetries: this.maxRetries(),
      contentType: this.contentType(),
      authentication: this.authentication(),
      authUsername: this.authUsername(),
      authPassword: this.authPassword(),
      authToken: this.authToken(),
    };
  }

  setConfiguration(config: RequestConfiguration): void {
    this.targetUrl.set(config.targetUrl);
    this.method.set(config.method);
    this.customHeaders.set(config.customHeaders);
    this.requests.set(config.requests);
    this.interval.set(config.interval);
    this.timeout.set(config.timeout);
    this.warmupRequest.set(config.warmupRequest);
    this.followRedirects.set(config.followRedirects);
    this.asyncMode.set(config.asyncMode);
    this.concurrentLimit.set(config.concurrentLimit);
    this.randomDelay.set(config.randomDelay);
    this.maxRetries.set(config.maxRetries);
    this.contentType.set(config.contentType);
    this.authentication.set(config.authentication);
    this.authUsername.set(config.authUsername ?? '');
    this.authPassword.set(config.authPassword ?? '');
    this.authToken.set(config.authToken ?? '');
  }
}
