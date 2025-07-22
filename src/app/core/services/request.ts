import {computed, inject, Injectable, signal} from '@angular/core';
import {RequestConfiguration} from '../models/RequestConfiguration.model';
import {HttpClient} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Request {
  private readonly http = inject(HttpClient)
  private durationsSignal = signal<number[]>([]);
  private runningSignal = signal(false);

  readonly durations = computed(() => this.durationsSignal());
  readonly isRunning = computed(() => this.runningSignal());

  async startRequests(config: RequestConfiguration): Promise<void> {
    this.runningSignal.set(true);
    this.durationsSignal.set([]);

    if (config.warmupRequest) {
      try {
        await firstValueFrom(this.http.get(config.targetUrl));
        console.log('[WARMUP] erfolgreich');
      } catch (e) {
        console.warn('[WARMUP] fehlgeschlagen:', e);
      }
    }

    const executeRequest = async (index: number) => {
      const start = performance.now();
      try {
        await firstValueFrom(this.http.get(config.targetUrl));
        const duration = (performance.now() - start) / 1000;
        this.updateDuration(index, +duration.toFixed(3));
        console.log(`[${index + 1}] OK in ${duration.toFixed(3)}s`);
      } catch (e) {
        this.updateDuration(index, -1); // -1 für Fehler
        console.warn(`[${index + 1}] Fehler`, e);
      }
    };

    if (config.asyncMode) {
      await Promise.all(
        Array.from({length: config.requests}).map((_, i) =>
          new Promise<void>((resolve) =>
            setTimeout(() => executeRequest(i).then(resolve), i * config.interval * 1000)
          )
        )
      );
    } else {
      for (let i = 0; i < config.requests; i++) {
        await executeRequest(i);
        if (i < config.requests - 1) {
          await new Promise((res) => setTimeout(res, config.interval * 1000));
        }
      }
    }

    this.runningSignal.set(false);
  }

  private updateDuration(index: number, value: number) {
    const copy = [...this.durationsSignal()];
    copy[index] = value;
    this.durationsSignal.set(copy);
  }
}
