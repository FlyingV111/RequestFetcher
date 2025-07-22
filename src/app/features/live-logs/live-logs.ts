import { Component, computed, inject } from '@angular/core';
import {HlmCardDirective, HlmCardHeaderDirective, HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import { BenchmarkService } from '../../core/services/benchmark.service';

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

  private readonly benchmark = inject(BenchmarkService);
  logs = this.benchmark.systemLog;
  hasLogs = computed(() => this.logs().length > 0);
}

