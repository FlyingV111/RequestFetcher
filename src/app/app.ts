import {Component, computed, inject, signal} from '@angular/core';
import {Configuration} from './features/configuration/configuration';
import {ResponseChart} from './features/response-chart/response-chart';
import {LiveLogs} from './features/live-logs/live-logs';
import {History} from './features/history/history';
import {HlmCardDirective} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {NgClass} from '@angular/common';
import {BenchmarkHistoryService} from './core/services/benchmark-history.service';

@Component({
  selector: 'app-root',
  imports: [Configuration, ResponseChart, LiveLogs, History, HlmCardDirective, LucideAngularModule, NgClass],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('RequestFetcher');

  private readonly history = inject(BenchmarkHistoryService);

  protected readonly infos = computed(() => {
    const result = this.history.selected();
    const base = [
      { id: 1, icon: 'clock', title: 'Average', colorIcon: 'text-orange-500 border border-orange-500', color: 'text-orange-500' },
      { id: 2, icon: 'move-down', title: 'Min', colorIcon: '', color: '' },
      { id: 3, icon: 'move-up', title: 'Max', colorIcon: '', color: '' },
      { id: 4, icon: 'check', title: 'Success', colorIcon: 'text-green-500 border border-green-500', color: 'text-green-500' }
    ];

    if (!result) {
      return base.map(info => ({ ...info, value: '-' }));
    }

    const success = this.calculateSuccessRate(result.durations);

    return [
      { ...base[0], value: `${result.averageTime}ms` },
      { ...base[1], value: `${result.minTime}ms` },
      { ...base[2], value: `${result.maxTime}ms` },
      { ...base[3], value: `${success}%` }
    ];
  });

  private calculateSuccessRate(durations: number[]): number {
    if (!durations?.length) return 100;
    const ok = durations.filter(d => d >= 0).length;
    return Math.round((ok / durations.length) * 100);
  }
}
