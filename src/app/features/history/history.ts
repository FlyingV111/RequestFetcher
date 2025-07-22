import {Component, inject} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {BenchmarkResult} from '../../core/models/BenchmarkResult.model';
import {LucideAngularModule} from 'lucide-angular';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import {BenchmarkHistoryService} from '../../core/services/benchmark-history.service';

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
  private readonly history = inject(BenchmarkHistoryService);

  readonly benchmarkResults = this.history.results;

  addBenchmarkResult(result: Omit<BenchmarkResult, 'id' | 'timestamp'>): void {
    this.history.addResult(result);
  }

  clearHistory(): void {
    this.history.clear();
  }

  selectResult(id: string): void {
    this.history.select(id);
  }

  removeResult(id: string): void {
    this.history.remove(id);
  }
}
