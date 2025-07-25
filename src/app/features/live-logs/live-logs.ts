import {Component, computed, effect, ElementRef, inject, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {HlmCardDirective, HlmCardHeaderDirective, HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {BenchmarkService} from '../../core/services/benchmark.service';

@Component({
  selector: 'live-logs',
  imports: [
    HlmCardDirective,
    HlmCardHeaderDirective,
    HlmCardImports,
    LucideAngularModule
  ],
  templateUrl: './live-logs.html',
  styleUrl: './live-logs.css'
})
export class LiveLogs {
  @ViewChild('scrollframe', {static: false}) scrollFrame?: ElementRef<HTMLDivElement>;
  @ViewChildren('logItem') logItems!: QueryList<ElementRef>;

  private readonly benchmark = inject(BenchmarkService);
  logs = this.benchmark.systemLog;
  hasLogs = computed(() => this.logs().length > 0);

  constructor() {
    effect(() => {
      this.logs();
      queueMicrotask(() => {
        const lastEl = this.logItems?.last?.nativeElement;
        if (lastEl) {
          lastEl.scrollIntoView({behavior: 'smooth', block: 'end'});
        }
      });
    });
  }
}

