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

    continueBenchmark(timestamp: string): string | void {
        const run = this.historyService.getRun(timestamp);
        if (!run) return;
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

    startBenchmark(config: RequestConfiguration, timestamp?: string, startIndex = 0): string | void {
        if (this.runningSignal()) return this.currentRunSignal();
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
            this.historyService.addRun({ config, results: [], timestamp: ts });
        }

        const code = config.customCode?.trim();
        const customFn = code
            ? new Function(
                'http',
                'config',
                'index',
                `return (async () => { ${code} })();`
            )
            : null;

        const executeRequest = async (index: number) => {
            const start = performance.now();
            try {
                if (customFn) {
                    await Promise.resolve(customFn(this.http, config, index));
                } else {
                    await firstValueFrom(
                        this.http.request(config.method, config.targetUrl, {
                            responseType: 'text',
                            observe: 'response'
                        })
                    );
                }
                const dur = Math.round(performance.now() - start);
                this.updateDuration(index, dur);
                this.appendLog(`> Request ${index + 1} erfolgreich in ${dur}ms`);
            } catch (err: any) {
                this.updateDuration(index, -1);
                const message = err?.status ? `${err.status} ${err.statusText}` : err?.message ?? 'Fehler';
                this.appendLog(`> Request ${index + 1} fehlgeschlagen (${message})`);
            }
        };

        const runAsync = async () => {
            if (config.warmupRequest) {
                try {
                    if (customFn) {
                        await Promise.resolve(customFn(this.http, config, -1));
                    } else {
                        await firstValueFrom(
                            this.http.request(config.method, config.targetUrl, {
                                responseType: 'text',
                                observe: 'response'
                            })
                        );
                    }
                    this.appendLog('> Warmup erfolgreich');
                } catch (err: any) {
                    const message = err?.status ? `${err.status} ${err.statusText}` : err?.message ?? 'Fehler';
                    this.appendLog(`> Warmup fehlgeschlagen (${message})`);
                }
                this.appendLog('=============================================');
            }

            for (let i = startIndex; i < config.requests; i++) {
                if (this.stopRequested) break;
                await executeRequest(i);
                this.historyService.updateRun({ config, results: this.durationsSignal(), timestamp: ts });
                if (this.stopRequested) break;
                if (i < config.requests - 1) {
                    await new Promise(res => setTimeout(res, config.interval * 1000));
                }
            }

            this.runningSignal.set(false);
            this.appendLog('=============================================');
            this.appendLog('> Benchmark abgeschlossen');
            this.historyService.updateRun({ config, results: this.durationsSignal(), timestamp: ts });
            this.currentRunSignal.set(null);
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

    loadRun(run: BenchmarkRun): void {
        this.durationsSignal.set(run.results);
        this.logSignal.set(
            run.results.map((r, i) =>
                r === -1
                    ? `> Request ${i + 1} fehlgeschlagen`
                    : `> Request ${i + 1} erfolgreich in ${r}ms`
            )
        );
        this.configService.setConfiguration(run.config);
    }
}

