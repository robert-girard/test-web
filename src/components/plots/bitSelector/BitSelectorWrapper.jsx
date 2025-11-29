import GridBitSelector from './GridBitSelector.jsx';

/**
 * Strategy wrapper for bit selector implementations
 * Currently supports GridBitSelector, can be extended with other implementations
 */
function BitSelectorWrapper({ mode = 'grid', payloadSize, startBit, bitLength, onChange }) {
  // Strategy pattern: select implementation based on mode
  switch (mode) {
    case 'grid':
      return (
        <GridBitSelector
          payloadSize={payloadSize}
          startBit={startBit}
          bitLength={bitLength}
          onChange={onChange}
        />
      );

    // Future implementations can be added here:
    // case 'diagram':
    //   return <DiagramBitSelector ... />;

    default:
      return (
        <GridBitSelector
          payloadSize={payloadSize}
          startBit={startBit}
          bitLength={bitLength}
          onChange={onChange}
        />
      );
  }
}

export default BitSelectorWrapper;
