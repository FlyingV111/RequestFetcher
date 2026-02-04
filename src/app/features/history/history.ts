import {Component, inject} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import {BenchmarkHistoryService} from '../../core/services/benchmark-history.service';
import {BenchmarkRun} from '../../core/models/BenchmarkRun.model';
import {BenchmarkService} from '../../core/services/benchmark.service';
import {NgClass} from '@angular/common';

@Component({
  selector: 'history',
  imports: [
    HlmCardImports,
    LucideAngularModule,
    HlmBadgeImports,
    HlmButtonDirective,
    HlmInputDirective,
    NgClass
  ],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  private readonly historyService = inject(BenchmarkHistoryService);
  private readonly benchmark = inject(BenchmarkService);
  benchmarkResults = this.historyService.history;

  clearHistory(): void {
    this.historyService.clear();
  }

  loadRun(run: BenchmarkRun): void {
    this.benchmark.loadRun(run);
  }

  deleteRun(timestamp: string): void {
    this.historyService.remove(timestamp);
  }

  average(run: BenchmarkRun): number {
    const success = run.results.filter(r => r !== -1);
    if (!success.length) return 0;
    return Math.round(success.reduce((a, b) => a + b, 0) / success.length);
  }

  hasErrors(run: BenchmarkRun): boolean {
    return run.results.some(r => r === -1);
  }

  copyUrl(targetUrl: string) {
    navigator.clipboard.writeText(targetUrl)
      .then(() => console.log('URL kopiert:', targetUrl))
      .catch(err => console.error('Kopieren fehlgeschlagen:', err));
  }
}
