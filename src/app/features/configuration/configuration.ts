import {Component, inject, effect} from '@angular/core';
import {HlmLabelDirective} from '@spartan-ng/helm/label';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HlmSwitchImports} from '@spartan-ng/helm/switch';
import {HlmCardImports} from '@spartan-ng/helm/card';
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
    LucideAngularModule
  ],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css'
})
export class Configuration {
  private readonly benchmark = inject(BenchmarkService);
  private readonly config = inject(ConfigService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  targetUrl = this.config.targetUrl;
  method = this.config.method;
  headerName = this.config.headerName;
  headerValue = this.config.headerValue;
  requests = this.config.requests;
  interval = this.config.interval;
  warmupRequest = this.config.warmupRequest;

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
  }

  isValidConfiguration(): boolean {
    const url = this.targetUrl();
    const method = this.method().trim();
    const reqs = this.requests();
    const int = this.interval();

    try {
      new URL(url);
      return reqs > 0 && int > 0 && method.length > 0;
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
}

