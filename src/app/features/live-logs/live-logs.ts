import { Component } from '@angular/core';
import {HlmCardDirective, HlmCardHeaderDirective, HlmCardImports} from '@spartan-ng/helm/card';
import {LucideAngularModule} from 'lucide-angular';

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

}
