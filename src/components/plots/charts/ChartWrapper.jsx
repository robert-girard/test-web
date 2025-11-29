import PlotlyAdapter from './PlotlyAdapter.jsx';

/**
 * Strategy wrapper for chart implementations
 * Currently supports Plotly, can be extended with Chart.js, Recharts, etc.
 */
function ChartWrapper({ engine = 'plotly', signalData, config }) {
  // If no signal data or empty, show placeholder
  if (!signalData || signalData.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No signals configured yet.</p>
        <p>Add a signal configuration to see the plot.</p>
      </div>
    );
  }

  // Check if all signals have no data points
  const hasData = signalData.some(signal => signal.dataPoints && signal.dataPoints.length > 0);
  if (!hasData) {
    return (
      <div className="chart-placeholder">
        <p>No data points found for the configured signals.</p>
        <p>Check that the ArbID exists in the uploaded data.</p>
      </div>
    );
  }

  // Strategy pattern: select chart engine
  switch (engine) {
    case 'plotly':
      return <PlotlyAdapter signalData={signalData} config={config} />;

    // Future implementations:
    // case 'chartjs':
    //   return <ChartJsAdapter signalData={signalData} config={config} />;
    //
    // case 'recharts':
    //   return <RechartsAdapter signalData={signalData} config={config} />;

    default:
      return <PlotlyAdapter signalData={signalData} config={config} />;
  }
}

export default ChartWrapper;
