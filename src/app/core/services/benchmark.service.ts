import {computed, inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {RequestConfiguration} from '../models/RequestConfiguration.model';
import {BenchmarkRun} from '../models/BenchmarkRun.model';
import {BenchmarkHistoryService} from './benchmark-history.service';
import {ConfigService} from './config.service';
import {LogEntry} from '../models/LogEntry.model';

@Injectable({providedIn: 'root'})
export class BenchmarkService {
  private readonly httpClient = inject(HttpClient);
  private readonly historyService = inject(BenchmarkHistoryService);
  private readonly configService = inject(ConfigService);

  private readonly requestDurations = signal<number[]>([]);
  private readonly isBenchmarkRunning = signal(false);
  private readonly executionLog = signal<LogEntry[]>([]);
  private readonly activeRunId = signal<string | null>(null);

  private shouldStopExecution = false;

  readonly currentRun = this.activeRunId.asReadonly();
  readonly durations = this.requestDurations.asReadonly();
  readonly isRunning = this.isBenchmarkRunning.asReadonly();
  readonly systemLog = this.executionLog.asReadonly();

  readonly stats = computed(() => {
    const durations = this.requestDurations();
    if (!durations.length) {
      return {avg: 0, min: 0, max: 0, successRate: 0};
    }

    const successfulRequests = durations.filter(duration => duration !== -1);
    const totalRequests = durations.length;

    const avg = successfulRequests.length
      ? successfulRequests.reduce((sum, duration) => sum + duration, 0) / successfulRequests.length
      : 0;
    const min = successfulRequests.length ? Math.min(...successfulRequests) : 0;
    const max = successfulRequests.length ? Math.max(...successfulRequests) : 0;
    const successRate = (successfulRequests.length / totalRequests) * 100;

    return {avg, min, max, successRate};
  });

  stopBenchmark(): void {
    if (!this.isBenchmarkRunning()) return;
    this.shouldStopExecution = true;
  }

  continueBenchmark(timestamp: string): string | undefined {
    const existingRun = this.historyService.getRun(timestamp);
    if (!existingRun) return undefined;

    this.loadRunResults(existingRun);
    return this.startBenchmark(existingRun.config, timestamp, existingRun.results.length);
  }

  startBenchmark(config: RequestConfiguration, timestamp?: string, startIndex = 0): string {
    if (this.isBenchmarkRunning()) return this.activeRunId()!;

    this.initializeBenchmarkRun(config, startIndex);

    const runId = timestamp ?? new Date().toISOString();
    this.activeRunId.set(runId);

    if (startIndex === 0) {
      this.historyService.addRun({config, results: [], timestamp: runId});
    }

    this.executeBenchmarkAsync(config, runId, startIndex).finally();
    return runId;
  }

  loadRun(benchmarkRun: BenchmarkRun): void {
    this.loadRunResults(benchmarkRun);
    this.configService.setConfiguration(benchmarkRun.config);
  }

  private initializeBenchmarkRun(config: RequestConfiguration, startIndex: number): void {
    this.configService.setConfiguration(config);
    this.isBenchmarkRunning.set(true);
    this.shouldStopExecution = false;

    if (startIndex === 0) {
      this.requestDurations.set([]);
      this.executionLog.set([]);
    }
  }

  private loadRunResults(benchmarkRun: BenchmarkRun): void {
    this.requestDurations.set(benchmarkRun.results);
    this.executionLog.set(
      benchmarkRun.results.map((result, index) => ({
        message:
          result === -1
            ? `> Request ${index + 1} fehlgeschlagen`
            : `> Request ${index + 1} erfolgreich in ${result}ms`,
        color: result === -1 ? 'red' : undefined,
      }))
    );
  }

  private async executeBenchmarkAsync(config: RequestConfiguration, runId: string, startIndex: number): Promise<void> {
    if (config.warmupRequest) {
      await this.executeWarmupRequest(config);
    }

    if (config.asyncMode) {
      await this.executeAsyncRequests(config, runId, startIndex);
    } else {
      await this.executeSequentialRequests(config, runId, startIndex);
    }
  }

  private async executeWarmupRequest(config: RequestConfiguration): Promise<void> {
    try {
      await this.sendSingleRequest(-1, config);
      this.addLogEntry('---------------------------------------------');
    } catch {
      this.addLogEntry(
        '> Warnung: Warmup-Request fehlgeschlagen, Benchmark wird fortgesetzt',
        {type: 'warning'}
      );
    }
  }

  private async executeAsyncRequests(config: RequestConfiguration, runId: string, startIndex: number): Promise<void> {
    const requestQueue = Array.from(
      {length: config.requests - startIndex},
      (_, i) => i + startIndex
    );

    let activeRequests = 0;
    const concurrencyLimit = Math.max(1, config.concurrentLimit);

    const processNextRequest = async (): Promise<void> => {
      if (this.shouldStopExecution || !requestQueue.length) return;

      const requestIndex = requestQueue.shift()!;
      activeRequests++;

      await this.executeRequestWithRetries(requestIndex, config);
      activeRequests--;

      this.updateHistoryEntry(config, runId);

      if (!requestQueue.length && activeRequests === 0) {
        this.finalizeBenchmarkRun(runId);
        return;
      }

      if (!this.shouldStopExecution) {
        void processNextRequest();
      }
    };

    for (let i = 0; i < concurrencyLimit && requestQueue.length; i++) {
      void processNextRequest();
    }
  }

  private async executeSequentialRequests(config: RequestConfiguration, runId: string, startIndex: number): Promise<void> {
    const totalRequests = config.requests;

    for (let i = startIndex; i < totalRequests; i++) {
      if (this.shouldStopExecution) break;

      await this.executeRequestWithRetries(i, config);
      this.updateHistoryEntry(config, runId);

      if (this.shouldStopExecution) break;

      if (i < totalRequests - 1) {
        await this.waitForNextRequest(config);
      }
    }

    this.finalizeBenchmarkRun(runId);
  }

  private async executeRequestWithRetries(requestIndex: number, config: RequestConfiguration): Promise<void> {
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      await this.sendSingleRequest(requestIndex, config);
      if (!this.shouldStopExecution) break;
    }
  }

  private async sendSingleRequest(requestIndex: number, config: RequestConfiguration): Promise<void> {
    const startTime = performance.now();
    const timestamp = new Date().toLocaleTimeString();

    this.addLogEntry(`[${timestamp}] Sending ${config.method} ${config.targetUrl}`);
    const requiresCredentials = config.authentication === 'basic';
    try {
      const response = await firstValueFrom(
        this.httpClient.request(config.method, config.targetUrl, {
          responseType: 'text',
          observe: 'response',
          headers: config.customHeaders,
          withCredentials: requiresCredentials,
        })
      );

      const duration = Math.round(performance.now() - startTime);
      this.recordRequestDuration(requestIndex, duration);
      this.addLogEntry(
        `[${timestamp}] ✅ Response ${response.status} ${response.statusText} (${duration} ms)`
      );
    } catch (error: any) {
      console.error(error);
      this.recordRequestDuration(requestIndex, -1);

      let errorMessage = 'Unbekannter Fehler';
      const isHttpError = error?.status !== undefined;

      if (error?.status === 0) {
        errorMessage = ` - Netzwerkfehler oder CORS-Verstoß bei ${config.targetUrl}`;
      } else if (isHttpError) {
        errorMessage = `${error.status} ${error.statusText}`;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      this.addLogEntry(`[${timestamp}] ❌ Request failed: ${errorMessage}`, {type: 'error'});
      console.error(`Request ${requestIndex + 1} failed:`, error);
    }
  }

  private async waitForNextRequest(config: RequestConfiguration): Promise<void> {
    const baseDelay = config.interval * 1000;
    const delay = config.randomDelay
      ? Math.random() * baseDelay
      : baseDelay;

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private recordRequestDuration(requestIndex: number, duration: number): void {
    const currentDurations = [...this.requestDurations()];
    currentDurations[requestIndex] = duration;
    this.requestDurations.set(currentDurations);
  }

  private addLogEntry(
    message: string,
    opts?: {type?: 'warning' | 'error' | 'custom'; color?: string}
  ): void {
    let color: string | undefined;
    if (opts?.type === 'warning') {
      color = 'orange';
    } else if (opts?.type === 'error') {
      color = 'red';
    } else if (opts?.type === 'custom' && opts.color) {
      color = opts.color;
    }

    if (color) {
      console.log(`%c${message}`, `color: ${color}`);
    } else {
      console.log(message);
    }

    this.executionLog.update(currentLog => [
      ...currentLog,
      {message, color},
    ]);
  }

  private updateHistoryEntry(config: RequestConfiguration, runId: string): void {
    this.historyService.updateRun({
      config,
      results: this.requestDurations(),
      timestamp: runId
    });
  }

  private finalizeBenchmarkRun(runId: string): void {
    this.isBenchmarkRunning.set(false);
    this.addLogEntry('---------------------------------------------');
    this.addLogEntry('> Benchmark abgeschlossen');
    this.updateHistoryEntry(this.configService.getConfiguration(), runId);
    this.activeRunId.set(null);
  }
}
