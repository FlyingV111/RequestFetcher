import {Component, inject} from '@angular/core';
import {HlmLabelDirective} from '@spartan-ng/helm/label';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HlmSwitchImports} from '@spartan-ng/helm/switch';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import { BenchmarkService } from '../../core/services/benchmark.service';
import { ConfigService } from '../../core/services/config.service';

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

  targetUrl = this.config.targetUrl;
  method = this.config.method;
  customCode = this.config.customCode;
  requests = this.config.requests;
  interval = this.config.interval;
  warmupRequest = this.config.warmupRequest;

  showCustom = false;

  readonly isRunning = this.benchmark.isRunning;

  isValidConfiguration(): boolean {
    const url = this.targetUrl();
    const method = this.method().trim();
    const code = this.customCode().trim();
    const reqs = this.requests();
    const int = this.interval();

    try {
      new URL(url);
      return reqs > 0 && int > 0 && (method.length > 0 || code.length > 0);
    } catch {
      return false;
    }
  }

  startBenchmark(): void {
    if (!this.isValidConfiguration()) return;
    this.benchmark.startBenchmark(this.config.getConfiguration());
  }

  toggleCustom(): void {
    this.showCustom = !this.showCustom;
  }
}

