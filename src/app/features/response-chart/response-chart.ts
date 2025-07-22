import {Component, computed, inject, signal} from '@angular/core';
import {HlmCardImports} from '@spartan-ng/helm/card';
import {NgxEchartsDirective} from 'ngx-echarts';
import {EChartsOption} from 'echarts';
import {getCssVariableValue} from '../../shared/utils/css-vars.util';
import {BenchmarkHistoryService} from '../../core/services/benchmark-history.service';

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
  private readonly history = inject(BenchmarkHistoryService);

  protected readonly chartsOptions = computed(() => {
    const result = this.history.selected();
    const opts = this.initOptions();
    if (!result || !result.durations?.length) return opts;
    opts.series = [
      {
        name: 'Response Time',
        type: 'line',
        smooth: true,
        data: result.durations.map((d, i) => [i + 1, d]),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#2b7fff'
        }
      }
    ];
    return opts;
  });

  initOptions(): EChartsOption {
    return {
      xAxis: {
        type: 'value',
        name: 'Request #',
        axisLabel: {
          color: getCssVariableValue('--color-foreground'),
          fontSize: 12,
          formatter: (value: number) => value.toFixed(0),
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
          formatter: (value: number) => value.toPrecision(3),
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
          data: [[1, 100], [2, 300], [3, 700], [4, 200], [5, 500]],
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
