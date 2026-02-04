import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {icons, LucideAngularModule} from 'lucide-angular';
import {NgxEchartsModule} from 'ngx-echarts';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    importProvidersFrom([
      NgxEchartsModule.forRoot({echarts: () => import('echarts')}),
      LucideAngularModule.pick(icons),
      BrowserModule,
      BrowserAnimationsModule,
    ])

  ]
};
