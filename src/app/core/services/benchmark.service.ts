import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {RequestConfiguration} from '../models/RequestConfiguration.model';
import {BenchmarkRun} from '../models/BenchmarkRun.model';
import {BenchmarkHistoryService} from './benchmark-history.service';
import {ConfigService} from './config.service';

@Injectable({providedIn: 'root'})
export class BenchmarkService {
  private readonly http = inject(HttpClient);
  private readonly historyService = inject(BenchmarkHistoryService);
  private readonly configService = inject(ConfigService);

  private readonly durationsSignal = signal<number[]>([]);
  private readonly runningSignal = signal(false);
  private readonly logSignal = signal<string[]>([]);
  private readonly currentRunSignal = signal<string | null>(null);
  readonly currentRun = this.currentRunSignal.asReadonly();
  private stopRequested = false;

  readonly durations = this.durationsSignal.asReadonly();
  readonly isRunning = this.runningSignal.asReadonly();
  readonly systemLog = this.logSignal.asReadonly();

  readonly stats = computed(() => {
    const vals = this.durationsSignal();
    if (!vals.length) {
      return {avg: 0, min: 0, max: 0, successRate: 0};
    }
    const success = vals.filter(v => v !== -1);
    const avg = success.length ? success.reduce((a, b) => a + b, 0) / success.length : 0;
    const min = success.length ? Math.min(...success) : 0;
    const max = success.length ? Math.max(...success) : 0;
    const successRate = (success.length / vals.length) * 100;
    return {avg, min, max, successRate};
  });

  stopBenchmark(): void {
    if (!this.runningSignal()) return;
    this.stopRequested = true;
  }

  continueBenchmark(timestamp: string): string | undefined {
    const run = this.historyService.getRun(timestamp);
    if (!run) return undefined;
    this.durationsSignal.set(run.results);
    this.logSignal.set(
      run.results.map((r, i) =>
        r === -1
          ? `> Request ${i + 1} fehlgeschlagen`
          : `> Request ${i + 1} erfolgreich in ${r}ms`
      )
    );
    return this.startBenchmark(run.config, timestamp, run.results.length);
  }

  startBenchmark(config: RequestConfiguration, timestamp?: string, startIndex = 0): string {
    if (this.runningSignal()) return this.currentRunSignal()!;
    this.configService.setConfiguration(config);
    this.runningSignal.set(true);
    this.stopRequested = false;

    if (startIndex === 0) {
      this.durationsSignal.set([]);
      this.logSignal.set([]);
    }

    const ts = timestamp ?? new Date().toISOString();
    this.currentRunSignal.set(ts);
    if (startIndex === 0) {
      this.historyService.addRun({config, results: [], timestamp: ts});
    }

    const headers = config.customHeaders;

    const sendOnce = async (index: number): Promise<void> => {
      const start = performance.now();
      this.appendLog(`[${new Date().toLocaleTimeString()}] Sending ${config.method} ${config.targetUrl}`);
      try {
        const res = await firstValueFrom(
          this.http.request(config.method, config.targetUrl, {
            responseType: 'text',
            observe: 'response',
            headers,
            withCredentials: true,
          })
        );
        const dur = Math.round(performance.now() - start);
        this.updateDuration(index, dur);
        this.appendLog(`[${new Date().toLocaleTimeString()}] \u2705 Response ${res.status} ${res.statusText} (${dur} ms)`);
      } catch (err: any) {
        this.updateDuration(index, -1);
        const message = err?.status ? `${err.status} ${err.statusText}` : err?.message ?? 'Error';
        this.appendLog(`[${new Date().toLocaleTimeString()}] \u274C Request failed: ${message}`);
        console.error(`Request ${index + 1} failed:`, err);
      }
    };

    const runAsync = async (): Promise<void> => {
      if (config.warmupRequest) {
        try {
          await sendOnce(-1);
          this.appendLog('---------------------------------------------');
        } catch {}
      }

      const queue = Array.from({ length: config.requests - startIndex }, (_, i) => i + startIndex);
      let active = 0;
      const next = async (): Promise<void> => {
        if (this.stopRequested || !queue.length) return;
        const i = queue.shift()!;
        active++;
        for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
          await sendOnce(i);
          if (!this.stopRequested) break;
        }
        active--;
        this.historyService.updateRun({config, results: this.durationsSignal(), timestamp: ts});
        if (!queue.length && active === 0) return done();
        if (config.asyncMode) {
          next();
        }
      };

      const done = () => {
        this.runningSignal.set(false);
        this.appendLog('---------------------------------------------');
        this.appendLog('> Benchmark abgeschlossen');
        this.historyService.updateRun({config, results: this.durationsSignal(), timestamp: ts});
        this.currentRunSignal.set(null);
      };

      if (config.asyncMode) {
        const limit = Math.max(1, config.concurrentLimit);
        for (let i = 0; i < limit && queue.length; i++) {
          void next();
        }
      } else {
        for (const i of queue) {
          if (this.stopRequested) break;
          await sendOnce(i);
          this.historyService.updateRun({config, results: this.durationsSignal(), timestamp: ts});
          if (this.stopRequested) break;
          if (i < config.requests - 1) {
            const delay = config.randomDelay ? Math.random() * config.interval * 1000 : config.interval * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        done();
      }
    };

    runAsync();
    return ts;
  }

  private updateDuration(index: number, value: number): void {
    const copy = [...this.durationsSignal()];
    copy[index] = value;
    this.durationsSignal.set(copy);
  }

  private appendLog(entry: string): void {
    this.logSignal.update(log => [...log, entry]);
  }

  loadRun(benchmarkRun: BenchmarkRun): void {
    this.durationsSignal.set(benchmarkRun.results);
    this.logSignal.set(
      benchmarkRun.results.map((r, i) =>
        r === -1
          ? `> Request ${i + 1} fehlgeschlagen`
          : `> Request ${i + 1} erfolgreich in ${r}ms`
      )
    );
    this.configService.setConfiguration(benchmarkRun.config);
  }
}
