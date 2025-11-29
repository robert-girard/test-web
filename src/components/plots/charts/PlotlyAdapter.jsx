import { useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';

/**
 * Plotly adapter for chart rendering
 * Implements the ChartAdapter interface
 */
function PlotlyAdapter({ signalData, config = {} }) {
  const plotRef = useRef(null);

  // Convert signal data to Plotly traces
  const traces = signalData.map((signal, index) => ({
    x: signal.dataPoints.map(dp => dp.timestamp),
    y: signal.dataPoints.map(dp => dp.physicalValue),
    type: 'scatter',
    mode: 'lines+markers',
    name: signal.signalName,
    line: {
      color: signal.color || undefined,
      width: 2
    },
    marker: {
      size: 4
    }
  }));

  // Calculate time range for better axis scaling
  const allTimestamps = signalData.flatMap(signal =>
    signal.dataPoints.map(dp => dp.timestamp)
  );
  const minTime = Math.min(...allTimestamps);
  const maxTime = Math.max(...allTimestamps);
  const timeRange = maxTime - minTime;

  // Debug logging
  console.log('Time range:', { minTime, maxTime, timeRange });

  // Don't use relative time - show actual timestamps
  const useRelativeTime = false;

  // Convert to relative time (offset from first point) if needed
  const processedTraces = useRelativeTime ? traces.map(trace => ({
    ...trace,
    x: trace.x.map(t => t - minTime)
  })) : traces;

  const adjustedMinTime = useRelativeTime ? 0 : minTime;
  const adjustedMaxTime = useRelativeTime ? timeRange : maxTime;

  // Add padding - use larger padding for very small ranges
  const paddingPercent = timeRange < 0.01 ? 0.1 : 0.05;
  const timePadding = timeRange * paddingPercent;

  // Plotly layout configuration
  const layout = {
    title: config.title || 'Signal Plot',
    xaxis: {
      title: useRelativeTime ? 'Time (s, relative to start)' : 'Timestamp (s)',
      gridcolor: '#e0e0e0',
      zeroline: false,
      autorange: true,
      rangemode: 'normal',
      tickformat: timeRange < 0.001 ? '.6f' : '.3f'
    },
    yaxis: {
      title: 'Value',
      gridcolor: '#e0e0e0',
      zeroline: true,
      autorange: true
    },
    hovermode: 'closest',
    showlegend: true,
    legend: {
      x: 1.05,
      y: 1,
      xanchor: 'left',
      yanchor: 'top',
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      bordercolor: '#ccc',
      borderwidth: 1
    },
    margin: {
      l: 80,
      r: 180,
      t: 60,
      b: 80
    },
    height: 800,
    width: 1000,
    ...config.layout
  };

  // Plotly configuration options
  const plotConfig = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: 'signal_plot',
      height: 800,
      width: 1200,
      scale: 2
    }
  };

  return (
    <div className="plotly-adapter">
      <Plot
        ref={plotRef}
        data={processedTraces}
        layout={layout}
        config={plotConfig}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}

export default PlotlyAdapter;
