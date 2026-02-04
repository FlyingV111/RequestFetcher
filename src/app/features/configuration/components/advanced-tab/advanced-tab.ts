import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HlmSwitchImports} from '@spartan-ng/helm/switch';
import {ConfigService} from '../../../../core/services/config.service';
import {RequestConfiguration} from '../../../../core/models/RequestConfiguration.model';
import {HlmLabelImports} from '@spartan-ng/helm/label';
import {HlmInputImports} from '@spartan-ng/helm/input';

@Component({
  selector: 'advanced-tab',
  standalone: true,
  imports: [FormsModule, HlmSwitchImports, HlmLabelImports, HlmInputImports],
  templateUrl: './advanced-tab.html',
  styleUrl: './advanced-tab.css',
})
export class AdvancedTab {
  private readonly service = inject(ConfigService);
  cfg = this.service.config;

  update<K extends keyof RequestConfiguration>(key: K, value: RequestConfiguration[K]): void {
    this.service.update({[key]: value} as Partial<RequestConfiguration>);
  }
}
