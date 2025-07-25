import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HlmInputDirective} from '@spartan-ng/helm/input';
import {HlmButtonDirective} from '@spartan-ng/helm/button';
import {ConfigService} from '../../../../core/services/config.service';
import {LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'headers-tab',
  standalone: true,
  imports: [
    FormsModule,
    HlmInputDirective,
    HlmButtonDirective,
    LucideAngularModule
  ],
  templateUrl: './headers-tab.html',
  styleUrl: './header-tab.css',
})
export class HeadersTab {
  private readonly service = inject(ConfigService);
  protected headers = signal<{ name: string; value: string }[]>([]);

  constructor() {
    this.load();
  }

  private load(): void {
    const raw = this.service.config().customHeaders ?? {};
    const list = Object.entries(raw).map(([name, value]) => ({name, value}));
    this.headers.set(list);
  }

  private sync(): void {
    const result: Record<string, string> = {};
    for (const h of this.headers()) {
      result[h.name] = h.value;
    }

    this.service.update({customHeaders: result});
  }

  addHeader(): void {
    this.headers.update(list => [...list, {name: '', value: ''}]);
    this.sync();
  }

  removeHeader(index: number): void {
    this.headers.update(list => list.filter((_, i) => i !== index));
    this.sync();
  }

  updateHeaderName(index: number, name: string): void {
    this.headers.update(list => {
      const updated = [...list];
      updated[index] = {...updated[index], name};
      return updated;
    });
    this.sync();
  }

  updateHeaderValue(index: number, value: string): void {
    this.headers.update(list => {
      const updated = [...list];
      updated[index] = {...updated[index], value};
      return updated;
    });
    this.sync();
  }
}
