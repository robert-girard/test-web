import { useState, useEffect } from 'react';
import BitSelectorWrapper from './bitSelector/BitSelectorWrapper.jsx';
import { DATA_TYPE_OPTIONS, ENDIANNESS_OPTIONS, DATA_TYPE_INFO } from '../../constants/plotTypes.js';
import { getMaxPayloadSize } from '../../utils/signalExtractor.js';

/**
 * Form for configuring a signal extraction entry
 */
function PlotEntryForm({ messages, availableArbIds, onSubmit, onCancel, initialData = null }) {
  const [formData, setFormData] = useState({
    name: '',
    arbid: '',
    startBit: 0,
    dataType: 'uint8',
    endianness: 'big',
    scale: 1.0,
    offset: 0.0
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [payloadSize, setPayloadSize] = useState(64); // Default 8 bytes = 64 bits

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Update payload size when arbid changes
  useEffect(() => {
    if (formData.arbid && messages.length > 0) {
      const maxSize = getMaxPayloadSize(messages, formData.arbid);
      setPayloadSize(maxSize);
    }
  }, [formData.arbid, messages]);

  // Get bit length for current data type
  const getBitLength = () => {
    return DATA_TYPE_INFO[formData.dataType]?.bits || 8;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationErrors([]);
  };

  // Handle bit selector change
  const handleStartBitChange = (newStartBit) => {
    handleChange('startBit', newStartBit);
  };

  // Validate form
  const validateForm = () => {
    const errors = [];

    if (!formData.name.trim()) {
      errors.push('Signal name is required');
    }

    if (!formData.arbid) {
      errors.push('ArbID is required');
    }

    if (formData.startBit < 0) {
      errors.push('Start bit must be non-negative');
    }

    const bitLength = getBitLength();
    if (formData.startBit + bitLength > payloadSize) {
      errors.push(`Bit range exceeds payload size (${payloadSize} bits)`);
    }

    if (isNaN(formData.scale) || formData.scale === '') {
      errors.push('Scale must be a valid number');
    }

    if (isNaN(formData.offset) || formData.offset === '') {
      errors.push('Offset must be a valid number');
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Convert scale and offset to numbers
    const submitData = {
      ...formData,
      scale: parseFloat(formData.scale),
      offset: parseFloat(formData.offset),
      startBit: parseInt(formData.startBit, 10)
    };

    onSubmit(submitData);
  };

  return (
    <div className="plot-entry-form">
      <h3>{initialData ? 'Edit Signal' : 'Add Signal'}</h3>

      <form onSubmit={handleSubmit}>
        {/* Signal Name */}
        <div className="form-group">
          <label htmlFor="name">Signal Name *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Engine Speed"
          />
        </div>

        {/* ArbID Selector */}
        <div className="form-group">
          <label htmlFor="arbid">Arbitration ID *</label>
          <select
            id="arbid"
            value={formData.arbid}
            onChange={(e) => handleChange('arbid', e.target.value)}
          >
            <option value="">Select ArbID</option>
            {availableArbIds.map(arbid => (
              <option key={arbid} value={arbid}>
                {arbid}
              </option>
            ))}
          </select>
        </div>

        {/* Data Type */}
        <div className="form-group">
          <label htmlFor="dataType">Data Type *</label>
          <select
            id="dataType"
            value={formData.dataType}
            onChange={(e) => handleChange('dataType', e.target.value)}
          >
            {DATA_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Endianness */}
        <div className="form-group">
          <label htmlFor="endianness">Endianness *</label>
          <select
            id="endianness"
            value={formData.endianness}
            onChange={(e) => handleChange('endianness', e.target.value)}
          >
            {ENDIANNESS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start Bit Input */}
        <div className="form-group">
          <label htmlFor="startBit">Start Bit *</label>
          <input
            id="startBit"
            type="number"
            min="0"
            max={payloadSize - 1}
            value={formData.startBit}
            onChange={(e) => handleChange('startBit', parseInt(e.target.value, 10))}
          />
        </div>

        {/* Bit Selector Visualization */}
        {formData.arbid && (
          <div className="form-group bit-selector-group">
            <label>Bit Selection</label>
            <BitSelectorWrapper
              mode="grid"
              payloadSize={payloadSize}
              startBit={formData.startBit}
              bitLength={getBitLength()}
              onChange={handleStartBitChange}
            />
          </div>
        )}

        {/* Scale Factor */}
        <div className="form-group">
          <label htmlFor="scale">Scale Factor</label>
          <input
            id="scale"
            type="number"
            step="any"
            value={formData.scale}
            onChange={(e) => handleChange('scale', e.target.value)}
          />
          <small>Multiply raw value by this factor</small>
        </div>

        {/* Offset */}
        <div className="form-group">
          <label htmlFor="offset">Offset</label>
          <input
            id="offset"
            type="number"
            step="any"
            value={formData.offset}
            onChange={(e) => handleChange('offset', e.target.value)}
          />
          <small>Add this offset after scaling</small>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {initialData ? 'Update Signal' : 'Add Signal'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlotEntryForm;
