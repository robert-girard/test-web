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

  // Plotly layout configuration
  const layout = {
    title: config.title || 'Signal Plot',
    xaxis: {
      title: 'Timestamp (s)',
      gridcolor: '#e0e0e0',
      zeroline: false
    },
    yaxis: {
      title: 'Value',
      gridcolor: '#e0e0e0',
      zeroline: true
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
      l: 60,
      r: 150,
      t: 50,
      b: 60
    },
    autosize: true,
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
        data={traces}
        layout={layout}
        config={plotConfig}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
}

export default PlotlyAdapter;
