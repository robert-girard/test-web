import { useMemo } from 'react';

/**
 * Grid-based bit selector component
 * Displays payload bits in a grid with byte boundaries
 * Highlights selected bits based on startBit and bitLength
 */
function GridBitSelector({ payloadSize, startBit, bitLength, onChange }) {
  // Generate bit array
  const bits = useMemo(() => {
    const arr = [];
    for (let i = 0; i < payloadSize; i++) {
      arr.push(i);
    }
    return arr;
  }, [payloadSize]);

  // Check if a bit is selected
  const isBitSelected = (bitIndex) => {
    return bitIndex >= startBit && bitIndex < startBit + bitLength;
  };

  // Handle bit click
  const handleBitClick = (bitIndex) => {
    if (onChange) {
      onChange(bitIndex);
    }
  };

  // Calculate bytes for grouping
  const numBytes = Math.ceil(payloadSize / 8);

  return (
    <div className="grid-bit-selector">
      <div className="bit-selector-header">
        <span>Bit Selection (Click to set start bit)</span>
        <span className="selected-range">
          Selected: Bits {startBit} to {startBit + bitLength - 1}
        </span>
      </div>

      <div className="byte-grid">
        {Array.from({ length: numBytes }, (_, byteIndex) => {
          const byteStartBit = byteIndex * 8;
          const byteEndBit = Math.min(byteStartBit + 8, payloadSize);

          return (
            <div key={byteIndex} className="byte-group">
              <div className="byte-label">Byte {byteIndex}</div>
              <div className="bit-row">
                {bits.slice(byteStartBit, byteEndBit).map(bitIndex => (
                  <button
                    key={bitIndex}
                    className={`bit-cell ${isBitSelected(bitIndex) ? 'selected' : ''}`}
                    onClick={() => handleBitClick(bitIndex)}
                    title={`Bit ${bitIndex}`}
                  >
                    {bitIndex}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bit-selector-legend">
        <div className="legend-item">
          <div className="legend-box selected"></div>
          <span>Selected bits</span>
        </div>
        <div className="legend-item">
          <div className="legend-box"></div>
          <span>Available bits</span>
        </div>
      </div>
    </div>
  );
}

export default GridBitSelector;
