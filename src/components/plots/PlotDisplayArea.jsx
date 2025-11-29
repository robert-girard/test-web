import ChartWrapper from './charts/ChartWrapper.jsx';

/**
 * Right main area for displaying the plot
 */
function PlotDisplayArea({ signalData, chartEngine = 'plotly' }) {
  return (
    <div className="plot-display-area">
      <div className="plot-display-header">
        <h2>Signal Plot</h2>
        <div className="plot-info">
          {signalData && signalData.length > 0 && (
            <span>{signalData.length} signal{signalData.length !== 1 ? 's' : ''} plotted</span>
          )}
        </div>
      </div>

      <div className="plot-display-content">
        <ChartWrapper
          engine={chartEngine}
          signalData={signalData}
          config={{
            title: 'CAN Signal Analysis'
          }}
        />
      </div>
    </div>
  );
}

export default PlotDisplayArea;
