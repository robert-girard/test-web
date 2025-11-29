import { useState, useMemo, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlotConfigPanel from './PlotConfigPanel.jsx';
import PlotDisplayArea from './PlotDisplayArea.jsx';
import { DataContext } from '../../App.jsx';
import { extractMultipleSignals, getUniqueArbIds } from '../../utils/signalExtractor.js';
import { SIGNAL_COLORS } from '../../constants/plotTypes.js';
import './PlotsPage.css';

const STORAGE_KEY_PREFIX = 'can_plot_configs_';

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
  const [storageKey, setStorageKey] = useState(null);

  // Load plot configurations from localStorage when data changes
  useEffect(() => {
    if (!processedData || !processedData.filename) return;

    const key = STORAGE_KEY_PREFIX + processedData.filename;
    setStorageKey(key);

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        setPlotEntries(parsed);
        console.log(`Loaded ${parsed.length} plot configurations for ${processedData.filename}`);
      } else {
        setPlotEntries([]);
      }
    } catch (error) {
      console.error('Error loading plot configurations:', error);
      setPlotEntries([]);
    }
  }, [processedData?.filename]);

  // Save plot configurations to localStorage when they change
  useEffect(() => {
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(plotEntries));
      console.log(`Saved ${plotEntries.length} plot configurations`);
    } catch (error) {
      console.error('Error saving plot configurations:', error);
    }
  }, [plotEntries, storageKey]);

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

  // Clear all plot entries
  const handleClearAll = () => {
    setPlotEntries([]);
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
          onClearAll={handleClearAll}
          filename={processedData.filename}
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
