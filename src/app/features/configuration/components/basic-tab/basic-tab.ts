import {Component, inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HlmSwitchImports} from '@spartan-ng/helm/switch';
import {ConfigService} from '../../../../core/services/config.service';
import {RequestConfiguration} from '../../../../core/models/RequestConfiguration.model';
import {BrnSelect, BrnSelectImports} from '@spartan-ng/brain/select';
import {HlmSelectImports} from '@spartan-ng/helm/select';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {HlmLabelImports} from '@spartan-ng/helm/label';

@Component({
  selector: 'basic-tab',
  standalone: true,
  imports: [
    FormsModule,
    HlmSwitchImports,
    BrnSelectImports,
    HlmSelectImports,
    BrnSelect,
    HlmInputImports,
    HlmLabelImports,
  ],
  templateUrl: './basic-tab.html',
  styleUrl: './basic-tab.css'
})
export class BasicTab {
  private readonly service = inject(ConfigService);
  cfg = this.service.config;

  update<K extends keyof RequestConfiguration>(key: K, value: RequestConfiguration[K]): void {
    this.service.update({[key]: value} as Partial<RequestConfiguration>);
  }
}
