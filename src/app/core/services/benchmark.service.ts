import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RequestConfiguration } from '../models/RequestConfiguration.model';
import { BenchmarkRun } from '../models/BenchmarkRun.model';
import { BenchmarkHistoryService } from './benchmark-history.service';

@Injectable({ providedIn: 'root' })
export class BenchmarkService {
  private readonly http = inject(HttpClient);

  private readonly durationsSignal = signal<number[]>([]);
  private readonly runningSignal = signal(false);
  private readonly logSignal = signal<string[]>([]);

  readonly durations = this.durationsSignal.asReadonly();
  readonly isRunning = this.runningSignal.asReadonly();
  readonly systemLog = this.logSignal.asReadonly();

  readonly stats = computed(() => {
    const vals = this.durationsSignal();
    if (!vals.length) {
      return { avg: 0, min: 0, max: 0, successRate: 0 };
    }
    const success = vals.filter(v => v !== -1);
    const avg = success.length ? success.reduce((a, b) => a + b, 0) / success.length : 0;
    const min = success.length ? Math.min(...success) : 0;
    const max = success.length ? Math.max(...success) : 0;
    const successRate = (success.length / vals.length) * 100;
    return { avg, min, max, successRate };
  });

  constructor(private readonly history: BenchmarkHistoryService) {}

  async startBenchmark(config: RequestConfiguration): Promise<void> {
    if (this.runningSignal()) return;
    this.runningSignal.set(true);
    this.durationsSignal.set([]);
    this.logSignal.set([]);

    if (config.warmupRequest) {
      try {
        await firstValueFrom(this.http.get(config.targetUrl));
        this.appendLog('> Warmup erfolgreich');
      } catch {
        this.appendLog('> Warmup fehlgeschlagen');
      }
    }

    const executeRequest = async (index: number) => {
      const start = performance.now();
      try {
        await firstValueFrom(this.http.get(config.targetUrl));
        const dur = Math.round(performance.now() - start);
        this.updateDuration(index, dur);
        this.appendLog(`> Request ${index + 1} erfolgreich in ${dur}ms`);
      } catch {
        this.updateDuration(index, -1);
        this.appendLog(`> Request ${index + 1} fehlgeschlagen`);
      }
    };

    if (config.asyncMode) {
      await Promise.all(
        Array.from({ length: config.requests }).map((_, i) =>
          new Promise<void>(resolve =>
            setTimeout(() => executeRequest(i).then(resolve), i * config.interval * 1000)
          )
        )
      );
    } else {
      for (let i = 0; i < config.requests; i++) {
        await executeRequest(i);
        if (i < config.requests - 1) {
          await new Promise(res => setTimeout(res, config.interval * 1000));
        }
      }
    }

    this.runningSignal.set(false);
    this.recordRun(config);
  }

  private updateDuration(index: number, value: number): void {
    const copy = [...this.durationsSignal()];
    copy[index] = value;
    this.durationsSignal.set(copy);
  }

  private appendLog(entry: string): void {
    this.logSignal.update(log => [...log, entry]);
  }

  private recordRun(config: RequestConfiguration): void {
    const run: BenchmarkRun = {
      config,
      results: this.durationsSignal(),
      timestamp: new Date().toISOString()
    };
    this.history.addRun(run);
  }
}

