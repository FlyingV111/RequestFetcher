import {Component, computed, inject, signal} from '@angular/core';
import {Configuration} from './features/configuration/configuration';
import {ResponseChart} from './features/response-chart/response-chart';
import {LiveLogs} from './features/live-logs/live-logs';
import {History} from './features/history/history';
import {HlmCardDirective} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {NgClass, NgStyle} from '@angular/common';
import {BenchmarkService} from './core/services/benchmark.service';

@Component({
  selector: 'app-root',
  imports: [Configuration, ResponseChart, LiveLogs, History, HlmCardDirective, LucideAngularModule, NgClass, NgStyle],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('RequestFetcher');

  private readonly benchmark = inject(BenchmarkService);

  protected readonly infos = computed(() => {
    const stats = this.benchmark.stats();
    return [
      {
        id: 1,
        icon: 'clock',
        title: 'Average',
        value: `${Math.round(stats.avg)}ms`,
        colorIcon: 'text-orange-500 border border-orange-500',
        color: 'text-orange-500',
        style: null
      },
      {
        id: 2,
        icon: 'move-down',
        title: 'Min',
        value: `${stats.min}ms`,
        colorIcon: '',
        color: '',
        style: null
      },
      {
        id: 3,
        icon: 'move-up',
        title: 'Max',
        value: `${stats.max}ms`,
        colorIcon: '',
        color: '',
        style: null
      },
      {
        id: 4,
        icon: 'check',
        title: 'Success',
        value: `${stats.successRate.toFixed(0)}%`,
        colorIcon: '',
        color: '',
        style: this.successStyle(stats.successRate)
      }
    ];
  });

  private successStyle(rate: number): Record<string, string> {
    const color = rate < 50 ? 'red' : rate < 75 ? 'orange' : '#0fc400';
    return {color, 'border-color': color};
  }
}
