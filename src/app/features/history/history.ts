import {Component, computed, inject} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import { BenchmarkHistoryService } from '../../core/services/benchmark-history.service';
import { BenchmarkRun } from '../../core/models/BenchmarkRun.model';

@Component({
  selector: 'history',
  imports: [
    HlmCardImports,
    LucideAngularModule,
    HlmBadgeImports,
    HlmButtonDirective,
    HlmInputDirective
  ],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  private readonly historyService = inject(BenchmarkHistoryService);
  benchmarkResults = this.historyService.history;

  clearHistory(): void {
    this.historyService.clear();
  }

  average(run: BenchmarkRun): number {
    const success = run.results.filter(r => r !== -1);
    if (!success.length) return 0;
    return Math.round(success.reduce((a, b) => a + b, 0) / success.length);
  }
}
