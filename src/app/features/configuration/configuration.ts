import {Component, signal} from '@angular/core';
import {HlmLabelDirective} from '@spartan-ng/helm/label';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HlmSwitchImports} from '@spartan-ng/helm/switch';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';

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
  targetUrl = signal<string>('');
  requests = signal(20);
  interval = signal(1);
  asyncMode = signal(false);
  warmupRequest = signal(true);

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

    console.log('Starting benchmark with config:', config);
  }
}
