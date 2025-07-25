import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import { HlmLabelDirective } from '@spartan-ng/helm/label';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { ConfigService } from '../../core/services/config.service';
import { RequestConfiguration } from '../../core/models/RequestConfiguration.model';

@Component({
  selector: 'basic-tab',
  standalone: true,
  imports: [FormsModule, HlmInputDirective, HlmLabelDirective, HlmSwitchImports],
  templateUrl: './basic-tab.html'
})
export class BasicTab {
  private readonly service = inject(ConfigService);
  cfg = this.service.config;

  update<K extends keyof RequestConfiguration>(key: K, value: RequestConfiguration[K]): void {
    this.service.update({ [key]: value } as Partial<RequestConfiguration>);
  }
}
