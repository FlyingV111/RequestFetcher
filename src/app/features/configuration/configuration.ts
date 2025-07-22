import {Component, signal, inject} from '@angular/core';
import {HlmLabelDirective} from '@spartan-ng/helm/label';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HlmSwitchImports} from '@spartan-ng/helm/switch';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import { BenchmarkService } from '../../core/services/benchmark.service';

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

  targetUrl = signal<string>('');
  requests = signal(20);
  interval = signal(1);
  asyncMode = signal(false);
  warmupRequest = signal(true);

  readonly isRunning = this.benchmark.isRunning;

  isValidConfiguration(): boolean {
    const url = this.targetUrl();
    const reqs = this.requests();
    const int = this.interval();

    try {
      new URL(url);
      return reqs > 0 && int > 0;
    } catch {
      return false;
    }
  }

  startBenchmark(): void {
    if (!this.isValidConfiguration()) return;

    const config = {
      targetUrl: this.targetUrl(),
      requests: this.requests(),
      interval: this.interval(),
      asyncMode: this.asyncMode(),
      warmupRequest: this.warmupRequest()
    };

    this.benchmark.startBenchmark(config);
  }
}

