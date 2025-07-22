import {Component, signal} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {BenchmarkResult} from '../../core/models/BenchmarkResult.model';
import {LucideAngularModule} from 'lucide-angular';
import {HlmBadgeImports} from '@spartan-ng/helm/badge';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {HlmInputDirective} from '@spartan-ng/helm/input';

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
  benchmarkResults = signal<BenchmarkResult[]>([]);

  addBenchmarkResult(result: Omit<BenchmarkResult, 'id' | 'timestamp'>): void {
    const newResult: BenchmarkResult = {
      ...result,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.benchmarkResults.update(results => [newResult, ...results]);
  }

  clearHistory(): void {
    this.benchmarkResults.set([]);
  }
}
