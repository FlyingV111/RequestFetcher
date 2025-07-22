import { Injectable, signal } from '@angular/core';
import { BenchmarkRun } from '../models/BenchmarkRun.model';

@Injectable({ providedIn: 'root' })
export class BenchmarkHistoryService {
  private readonly historySignal = signal<BenchmarkRun[]>([]);

  readonly history = this.historySignal.asReadonly();

  constructor() {
    this.loadHistory();
  }

  addRun(run: BenchmarkRun): void {
    this.historySignal.update(h => [run, ...h]);
    this.persist();
  }

  clear(): void {
    this.historySignal.set([]);
    this.persist();
  }

  remove(timestamp: string): void {
    this.historySignal.update(h => h.filter(run => run.timestamp !== timestamp));
    this.persist();
  }

  getRun(timestamp: string): BenchmarkRun | undefined {
    return this.historySignal().find(r => r.timestamp === timestamp);
  }

  updateRun(updated: BenchmarkRun): void {
    this.historySignal.update(h => h.map(r => r.timestamp === updated.timestamp ? updated : r));
    this.persist();
  }

  private persist(): void {
    localStorage.setItem('benchmarkHistory', JSON.stringify(this.historySignal()));
  }

  private loadHistory(): void {
    const raw = localStorage.getItem('benchmarkHistory');
    if (raw) {
      try {
        this.historySignal.set(JSON.parse(raw) as BenchmarkRun[]);
      } catch {
        this.historySignal.set([]);
      }
    }
  }
}
