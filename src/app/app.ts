import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Configuration} from './features/configuration/configuration';
import {ResponseChart} from './features/response-chart/response-chart';
import {LiveLogs} from './features/live-logs/live-logs';
import {History} from './features/history/history';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Configuration, ResponseChart, LiveLogs, History],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('RequestFetcher');
}
