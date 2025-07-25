import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { ConfigService } from '../../core/services/config.service';
import { RequestConfiguration } from '../../core/models/RequestConfiguration.model';

@Component({
  selector: 'headers-tab',
  standalone: true,
  imports: [FormsModule, HlmInputDirective, HlmButtonDirective],
  templateUrl: './headers-tab.html'
})
export class HeadersTab {
  private readonly service = inject(ConfigService);
  cfg = this.service.config;
  headers = signal<{ name: string; value: string }[]>([]);

  constructor() {
    effect(() => {
      const obj = this.cfg().customHeaders;
      const arr = Object.keys(obj).map(key => ({ name: key, value: obj[key] }));
      this.headers.set(arr);
    });
  }

  private sync(): void {
    const obj: Record<string, string> = {};
    for (const h of this.headers()) {
      if (h.name && h.value) obj[h.name] = h.value;
    }
    this.service.update({ customHeaders: obj });
  }

  addHeader(): void {
    this.headers.update(h => [...h, { name: '', value: '' }]);
  }

  removeHeader(i: number): void {
    this.headers.update(h => h.filter((_, idx) => idx !== i));
    this.sync();
  }

  onNameChange(i: number, val: string): void {
    this.headers.update(h => {
      const copy = [...h];
      copy[i] = { ...copy[i], name: val };
      return copy;
    });
    this.sync();
  }

  onValueChange(i: number, val: string): void {
    this.headers.update(h => {
      const copy = [...h];
      copy[i] = { ...copy[i], value: val };
      return copy;
    });
    this.sync();
  }
}
