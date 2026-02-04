import {Component, effect, inject} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {HlmTabsImports} from '@spartan-ng/helm/tabs';
import {LucideAngularModule} from 'lucide-angular';
import {BenchmarkService} from '../../core/services/benchmark.service';
import {ConfigService} from '../../core/services/config.service';
import {ActivatedRoute, Router} from '@angular/router';
import {BasicTab} from './components/basic-tab/basic-tab';
import {AdvancedTab} from './components/advanced-tab/advanced-tab';
import {HeadersTab} from './components/header-tab/headers-tab';
import {HlmButtonImports} from '@spartan-ng/helm/button';

@Component({
  selector: 'configuration',
  imports: [
    HlmCardImports,
    LucideAngularModule,
    HlmTabsImports,
    BasicTab,
    AdvancedTab,
    HeadersTab,
    HlmButtonImports
  ],
  templateUrl: './configuration.html',
  styleUrl: './configuration.css'
})
export class Configuration {
  readonly benchmark = inject(BenchmarkService);
  private readonly config = inject(ConfigService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  cfg = this.config.config;

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
    const cfg = this.cfg();
    const url = cfg.targetUrl?.trim();
    const method = cfg.method.trim();
    const reqs = cfg.requests;
    const int = cfg.interval;
    const limit = cfg.concurrentLimit;

    const isRelativeApiPath = typeof url === 'string' && url.startsWith('/');

    try {
      if (!isRelativeApiPath) {
        new URL(url);
      }
      return reqs > 0 && int > 0 && method.length > 0 && (!cfg.asyncMode || limit > 0);
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
