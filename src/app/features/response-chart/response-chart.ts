import {Component, computed, inject} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {NgxEchartsDirective} from 'ngx-echarts';
import {EChartsOption} from 'echarts';
import {getCssVariableValue} from '../../shared/utils/css-vars.util';
import {BenchmarkService} from '../../core/services/benchmark.service';

@Component({
  selector: 'response-chart',
  imports: [
    HlmCardImports,
    NgxEchartsDirective
  ],
  templateUrl: './response-chart.html',
  styleUrl: './response-chart.css'
})
export class ResponseChart {
  private readonly benchmark = inject(BenchmarkService);
  hasData = computed(() => this.benchmark.durations().length > 0);
  chartsOptions = computed(() => {
    const data = this.benchmark.durations().map((d, i) => {
      if (d === -1) {
        return {value: [i + 1, 0], itemStyle: {color: '#ef4444'}};
      }
      return {value: [i + 1, d]};
    });
    const options = this.baseOptions();
    if (Array.isArray(options.series)) {
      options.series[0].data = data;
    }
    return options;
  });

  private baseOptions(): EChartsOption {
    return {
      xAxis: {
        type: 'value',
        name: 'Request #',
        axisLabel: {
          color: getCssVariableValue('--color-foreground'),
          fontSize: 12,
        },
        min: 1,
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        name: 'Time (ms)',
        nameLocation: 'end',
        scale: true,
        min: 0,
        axisLabel: {
          color: getCssVariableValue('--color-foreground'),
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: getCssVariableValue('--color-muted')
          }
        },
      },
      grid: {
        left: 0,
        right: 10,
        top: '5%',
        bottom: 60,
        containLabel: true,
      },
      tooltip: {
        backgroundColor: getCssVariableValue('--color-background'),
        textStyle: {
          color: getCssVariableValue('--color-foreground'),
        },
        trigger: "axis",
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          return params.map(p => `<b>${p.axisValue}</b> Request | <b>${p.data[1]}</b> ms`).join('<br/>');
        }
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          bottom: 5,
          start: 0,
          end: 100
        }
      ],
      series: [
        {
          name: 'Response Time',
          type: 'line',
          smooth: true,
          data: [],
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            width: 2,
            color: '#2b7fff'
          }
        }
      ]
    };
  }
}

