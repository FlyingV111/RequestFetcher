import {Component, inject, effect, signal} from '@angular/core';
import {HlmLabelDirective} from '@spartan-ng/helm/label';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HlmSwitchImports} from '@spartan-ng/helm/switch';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {HlmTabsImports} from '@spartan-ng/helm/tabs';
import {LucideAngularModule} from 'lucide-angular';
import { BenchmarkService } from '../../core/services/benchmark.service';
import { ConfigService } from '../../core/services/config.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'configuration',
  imports: [
    HlmLabelDirective,
    HlmButtonDirective,
    HlmInputDirective,
    ReactiveFormsModule,
    HlmSwitchImports,
    FormsModule,
    HlmCardImports,
    LucideAngularModule,
    HlmTabsImports
  ],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css'
})
export class Configuration {
  readonly benchmark = inject(BenchmarkService);
  private readonly config = inject(ConfigService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  targetUrl = this.config.targetUrl;
  method = this.config.method;
  customHeaders = this.config.customHeaders;
  requests = this.config.requests;
  interval = this.config.interval;
  timeout = this.config.timeout;
  warmupRequest = this.config.warmupRequest;
  followRedirects = this.config.followRedirects;
  asyncMode = this.config.asyncMode;
  concurrentLimit = this.config.concurrentLimit;
  randomDelay = this.config.randomDelay;
  maxRetries = this.config.maxRetries;
  contentType = this.config.contentType;
  authentication = this.config.authentication;
  authUsername = this.config.authUsername;
  authPassword = this.config.authPassword;
  authToken = this.config.authToken;

  headers = signal<{name: string; value: string}[]>([]);

  showCustom = false;

  readonly isRunning = this.benchmark.isRunning;
  readonly currentRun = this.benchmark.currentRun;
  get pendingRun(): string | null {
    return this.route.snapshot.queryParamMap.get('run');
  }

  constructor() {
    effect(() => {
      if (!this.isRunning() && !this.currentRun()) {
        this.router.navigate([], { queryParams: { run: null }, queryParamsHandling: 'merge' });
      }
    });

    effect(() => {
      const obj = this.customHeaders();
      const arr = Object.keys(obj).map(key => ({name: key, value: obj[key]}));
      this.headers.set(arr);
    });
  }

  isValidConfiguration(): boolean {
    const url = this.targetUrl();
    const method = this.method().trim();
    const reqs = this.requests();
    const int = this.interval();
    const limit = this.concurrentLimit();

    try {
      new URL(url);
      return reqs > 0 && int > 0 && method.length > 0 && (!this.asyncMode() || limit > 0);
    } catch {
      return false;
    }
  }

  startBenchmark(): void {
    if (!this.isValidConfiguration()) return;
    const ts = this.benchmark.startBenchmark(this.config.getConfiguration());
    if (ts) {
      this.router.navigate([], { queryParams: { run: ts }, queryParamsHandling: 'merge' });
    }
  }

  stopBenchmark(): void {
    this.benchmark.stopBenchmark();
  }

  continueBenchmark(): void {
    const ts = this.pendingRun;
    if (ts) {
      this.benchmark.continueBenchmark(ts);
    }
  }

  toggleCustom(): void {
    this.showCustom = !this.showCustom;
  }

  addHeader(): void {
    this.headers.update(h => [...h, {name: '', value: ''}]);
  }

  removeHeader(i: number): void {
    this.headers.update(h => h.filter((_, idx) => idx !== i));
    this.syncHeaders();
  }

  syncHeaders(): void {
    const obj: Record<string, string> = {};
    this.headers().forEach(h => {
      if (h.name && h.value) obj[h.name] = h.value;
    });
    this.customHeaders.set(obj);
  }
}

