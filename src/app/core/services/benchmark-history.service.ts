import { Injectable, computed, signal } from '@angular/core';
import { BenchmarkResult } from '../models/BenchmarkResult.model';

@Injectable({ providedIn: 'root' })
export class BenchmarkHistoryService {
  private readonly resultsSignal = signal<BenchmarkResult[]>([]);
  private readonly selectedSignal = signal<BenchmarkResult | null>(null);

  readonly results = computed(() => this.resultsSignal());
  readonly selected = computed(() => this.selectedSignal());

  addResult(result: Omit<BenchmarkResult, 'id' | 'timestamp'>) {
    const newResult: BenchmarkResult = {
      ...result,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    this.resultsSignal.update(res => [newResult, ...res]);
    this.selectedSignal.set(newResult);
  }

  clear() {
    this.resultsSignal.set([]);
    this.selectedSignal.set(null);
  }

  select(id: string) {
    const found = this.resultsSignal().find(r => r.id === id) || null;
    this.selectedSignal.set(found);
  }

  remove(id: string) {
    this.resultsSignal.update(res => res.filter(r => r.id !== id));
    const sel = this.selectedSignal();
    if (sel && sel.id === id) {
      this.selectedSignal.set(null);
    }
  }
}
