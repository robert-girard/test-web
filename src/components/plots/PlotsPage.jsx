import { useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PlotConfigPanel from './PlotConfigPanel.jsx';
import PlotDisplayArea from './PlotDisplayArea.jsx';
import { DataContext } from '../../App.jsx';
import { extractMultipleSignals, getUniqueArbIds } from '../../utils/signalExtractor.js';
import { SIGNAL_COLORS } from '../../constants/plotTypes.js';
import './PlotsPage.css';

/**
 * Main plots page container
 * Manages plot entries, signal extraction, and rendering
 */
function PlotsPage() {
  const navigate = useNavigate();
  const { processedData } = useContext(DataContext);

  // State for plot entries
  const [plotEntries, setPlotEntries] = useState([]);
  const [chartEngine] = useState('plotly'); // Can be extended to support switching

  // Check if data is loaded
  if (!processedData || !processedData.messages || processedData.messages.length === 0) {
    return (
      <div className="plots-page-empty">
        <h2>No Data Loaded</h2>
        <p>Please upload and process a CAN data file first.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Go to Upload
        </button>
      </div>
    );
  }

  // Get available ArbIDs from data
  const availableArbIds = useMemo(() => {
    return getUniqueArbIds(processedData.messages);
  }, [processedData.messages]);

  // Extract signals from CAN data based on plot entries
  const extractedSignals = useMemo(() => {
    if (plotEntries.length === 0) {
      return [];
    }

    try {
      return extractMultipleSignals(processedData.messages, plotEntries);
    } catch (error) {
      console.error('Error extracting signals:', error);
      return [];
    }
  }, [processedData.messages, plotEntries]);

  // Add a new plot entry
  const handleAddEntry = (formData) => {
    const newEntry = {
      ...formData,
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      color: SIGNAL_COLORS[plotEntries.length % SIGNAL_COLORS.length]
    };

    setPlotEntries(prev => [...prev, newEntry]);
  };

  // Update an existing plot entry
  const handleUpdateEntry = (entryId, formData) => {
    setPlotEntries(prev =>
      prev.map(entry =>
        entry.id === entryId
          ? { ...entry, ...formData }
          : entry
      )
    );
  };

  // Delete a plot entry
  const handleDeleteEntry = (entryId) => {
    setPlotEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  return (
    <div className="plots-page">
      <div className="plots-container">
        <PlotConfigPanel
          entries={plotEntries}
          messages={processedData.messages}
          availableArbIds={availableArbIds}
          onAddEntry={handleAddEntry}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
        />

        <PlotDisplayArea
          signalData={extractedSignals}
          chartEngine={chartEngine}
        />
      </div>
    </div>
  );
}

export default PlotsPage;
