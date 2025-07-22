import { Component, inject } from '@angular/core';
import {HlmCardDirective, HlmCardHeaderDirective, HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';
import {BenchmarkHistoryService} from '../../core/services/benchmark-history.service';

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
  private readonly history = inject(BenchmarkHistoryService);

  readonly selectedResult = this.history.selected;
}
