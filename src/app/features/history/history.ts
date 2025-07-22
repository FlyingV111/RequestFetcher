import {Component, signal} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {BenchmarkResult} from '../../core/BenchmarkResult.model';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'history',
  imports: [
    HlmCardImports,
    LucideAngularModule
  ],
  templateUrl: './history.html',
  styleUrl: './history.css'
})
export class History {
  benchmarkResults = signal<BenchmarkResult[]>([
    {
      id: '1',
      requests: 10,
      url: 'https://jsonplaceholder.typicode.com/',
      averageTime: 265.30,
      timestamp: new Date()
    }
  ]);

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
