# CAN Analysis Tool - Architecture Documentation

## Phase 3: Signal Plotting & Extraction Architecture

This document defines the architectural patterns and component structure for the Signal Plotting & Extraction feature.

---

## 1. Component Architecture

### 1.1 Component Hierarchy

```mermaid
graph TD
    App[App.jsx<br/>Router & State Container]
    Nav[Navigation.jsx<br/>Tab Navigation]
    Plots[PlotsPage.jsx<br/>Main Plotting Container]

    PlotConfig[PlotConfigPanel.jsx<br/>Left Sidebar]
    PlotDisplay[PlotDisplayArea.jsx<br/>Right Main Area]

    EntryList[PlotEntryList.jsx<br/>List of Configurations]
    EntryForm[PlotEntryForm.jsx<br/>Configuration Form]

    BitSelector[BitSelectorWrapper.jsx<br/>Abstraction Layer]
    BitUI1[GridBitSelector.jsx<br/>Implementation 1]
    BitUI2[DiagramBitSelector.jsx<br/>Implementation 2]

    ChartWrapper[ChartWrapper.jsx<br/>Abstraction Layer]
    Chart1[ChartJsAdapter.jsx<br/>Chart.js Implementation]
    Chart2[RechartsAdapter.jsx<br/>Recharts Implementation]
    Chart3[PlotlyAdapter.jsx<br/>Plotly Implementation]

    Extractor[SignalExtractor.js<br/>Utility Module]

    App --> Nav
    App --> Plots

    Plots --> PlotConfig
    Plots --> PlotDisplay

    PlotConfig --> EntryList
    PlotConfig --> EntryForm

    EntryForm --> BitSelector
    BitSelector -.->|Strategy| BitUI1
    BitSelector -.->|Strategy| BitUI2

    PlotDisplay --> ChartWrapper
    ChartWrapper -.->|Strategy| Chart1
    ChartWrapper -.->|Strategy| Chart2
    ChartWrapper -.->|Strategy| Chart3

    Plots --> Extractor

    style BitSelector fill:#e1f5ff
    style ChartWrapper fill:#e1f5ff
    style Extractor fill:#ffe1e1
```

### 1.2 Strategy Pattern for Swappable Components

```mermaid
classDiagram
    class BitSelectorInterface {
        <<interface>>
        +render(config, onChange)
        +getSelectedBits() BitRange
    }

    class GridBitSelector {
        +render(config, onChange)
        +getSelectedBits() BitRange
        -handleBitClick()
    }

    class DiagramBitSelector {
        +render(config, onChange)
        +getSelectedBits() BitRange
        -handleDragSelect()
    }

    class BitSelectorWrapper {
        -strategy BitSelectorInterface
        +setStrategy(strategy)
        +render()
    }

    BitSelectorInterface <|.. GridBitSelector
    BitSelectorInterface <|.. DiagramBitSelector
    BitSelectorWrapper o-- BitSelectorInterface

    class ChartInterface {
        <<interface>>
        +render(data, config)
        +updateData(data)
        +destroy()
    }

    class ChartJsAdapter {
        +render(data, config)
        +updateData(data)
        +destroy()
    }

    class RechartsAdapter {
        +render(data, config)
        +updateData(data)
        +destroy()
    }

    class ChartWrapper {
        -adapter ChartInterface
        +setAdapter(adapter)
        +render()
    }

    ChartInterface <|.. ChartJsAdapter
    ChartInterface <|.. RechartsAdapter
    ChartWrapper o-- ChartInterface
```

---

## 2. Data Models

### 2.1 Entity Relationship Diagram

```mermaid
erDiagram
    ProcessedData ||--o{ CANMessage : contains
    PlotConfiguration ||--o{ SignalConfig : defines
    SignalConfig ||--o{ ExtractedSignal : produces
    ExtractedSignal }o--|| CANMessage : "extracted from"

    ProcessedData {
        int total_messages
        int unique_arbids
        string protocol
        string multiplexing
        array messages
    }

    CANMessage {
        float timestamp
        string arbitration_id
        string payload
        int length
    }

    PlotConfiguration {
        string id
        array signalConfigs
        string chartType
        object chartOptions
    }

    SignalConfig {
        string id
        string name
        string arbid
        int startBit
        string dataType
        string endianness
        float scale
        float offset
        string color
    }

    ExtractedSignal {
        string signalId
        array dataPoints
    }

    DataPoint {
        float timestamp
        float rawValue
        float physicalValue
    }

    ExtractedSignal ||--o{ DataPoint : contains
```

### 2.2 Data Type Definitions

```typescript
// TypeScript-style definitions for clarity

interface PlotEntry {
  id: string;
  name: string;
  arbid: string;
  startBit: number;
  dataType: 'int8' | 'int16' | 'int24' | 'int32' | 'uint8' | 'uint16' | 'uint24' | 'uint32' | 'float16' | 'float32';
  endianness: 'big' | 'little';
  scale: number;
  offset: number;
  color?: string;
}

interface ExtractedDataPoint {
  timestamp: number;
  rawValue: number;
  physicalValue: number;
}

interface SignalData {
  signalId: string;
  signalName: string;
  dataPoints: ExtractedDataPoint[];
}

interface BitRange {
  startBit: number;
  bitLength: number;
}
```

---

## 3. Data Flow & Sequence Diagrams

### 3.1 Signal Extraction Flow

```mermaid
sequenceDiagram
    participant User
    participant PlotsPage
    participant PlotEntryForm
    participant SignalExtractor
    participant ChartWrapper

    User->>PlotsPage: Add New Plot Entry
    PlotsPage->>PlotEntryForm: Show Form

    User->>PlotEntryForm: Configure Signal
    Note over PlotEntryForm: ArbID, Start Bit,<br/>Data Type, etc.

    PlotEntryForm->>PlotsPage: Submit Config
    PlotsPage->>PlotsPage: Add to plotEntries[]

    PlotsPage->>SignalExtractor: extractSignal(messages, config)

    loop For each message with matching ArbID
        SignalExtractor->>SignalExtractor: extractBits(payload, startBit, bitLength)
        SignalExtractor->>SignalExtractor: convertToDataType(bits, type, endianness)
        SignalExtractor->>SignalExtractor: applyScaling(value, scale, offset)
    end

    SignalExtractor-->>PlotsPage: Return SignalData[]

    PlotsPage->>ChartWrapper: render(signalData)
    ChartWrapper->>ChartWrapper: Delegate to active adapter
    ChartWrapper-->>User: Display Plot
```

### 3.2 Plot Engine Switching Flow

```mermaid
sequenceDiagram
    participant User
    participant PlotsPage
    participant ChartWrapper
    participant OldAdapter
    participant NewAdapter

    User->>PlotsPage: Change Plot Engine (Settings)
    PlotsPage->>ChartWrapper: setAdapter(newAdapterType)

    ChartWrapper->>OldAdapter: destroy()
    OldAdapter-->>ChartWrapper: Cleanup complete

    ChartWrapper->>ChartWrapper: Instantiate NewAdapter
    ChartWrapper->>NewAdapter: initialize()

    ChartWrapper->>NewAdapter: render(currentData, config)
    NewAdapter-->>User: Display with new engine
```

---

## 4. State Management

### 4.1 Plot Entry Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> Empty: No Entries

    Empty --> Editing: Add Entry
    Editing --> Configured: Submit Valid Config
    Editing --> Empty: Cancel
    Configured --> Extracting: Extract Signal

    Extracting --> Plotting: Extraction Success
    Extracting --> Error: Extraction Failed

    Error --> Editing: Edit Config
    Error --> Configured: Retry

    Plotting --> Editing: Edit Entry
    Plotting --> Configured: Remove from Plot
    Configured --> Empty: Delete Entry

    Plotting --> Plotting: Add Another Entry
    Plotting --> [*]: Clear All
```

### 4.2 Application State Structure

```mermaid
graph TB
    AppState[Application State]

    AppState --> ProcessedData[processedData<br/>From CSV Upload]
    %% Quotes required for brackets []
    AppState --> PlotEntries["plotEntries[]<br/>Array of Configurations"]
    AppState --> ExtractedSignals["extractedSignals[]<br/>Computed Signal Data"]
    AppState --> UIState[UI State]

    %% Quotes required for pipes |
    UIState --> ChartEngine["selectedChartEngine<br/>'chartjs' | 'recharts' | 'plotly'"]
    UIState --> BitUIMode["bitSelectorMode<br/>'grid' | 'diagram'"]
    UIState --> EditingEntry["editingEntryId<br/>string | null"]

    style ProcessedData fill:#ffe1e1
    style PlotEntries fill:#e1ffe1
    style ExtractedSignals fill:#e1e1ff
    style UIState fill:#ffffcc
```

---

## 5. Signal Extraction Algorithm

### 5.1 Bit Extraction Flowchart

```mermaid
flowchart TD
    Start([Start: Extract Signal])
    %% Added quotes below to handle []
    Input[/"Input: messages[], config"/]

    FilterMsgs[Filter messages<br/>by ArbID]

    LoopStart{For each<br/>message}

    GetPayload[Get payload hex string]
    ConvertBits[Convert hex to bit array]

    ExtractBits[Extract bits from<br/>startBit to startBit+bitLength]

    CheckEndian{Endianness?}
    BigEndian[Keep bit order<br/>MSB first]
    LittleEndian[Reverse bit order<br/>LSB first]

    ConvertType{Data Type?}
    SignedInt[Convert to<br/>Signed Integer]
    UnsignedInt[Convert to<br/>Unsigned Integer]
    Float[Convert to<br/>Float]

    ApplyScale["Physical Value =<br/>raw * scale + offset"]

    %% Added quotes below to handle {}
    CreatePoint["Create DataPoint<br/>{timestamp, raw, physical}"]
    %% Added quotes below to handle []
    AddToArray["Add to dataPoints[]"]

    LoopEnd{More<br/>messages?}

    Output[/Output: SignalData/]
    End([End])

    Start --> Input
    Input --> FilterMsgs
    FilterMsgs --> LoopStart

    LoopStart -->|Yes| GetPayload
    LoopStart -->|No| Output

    GetPayload --> ConvertBits
    ConvertBits --> ExtractBits

    ExtractBits --> CheckEndian
    CheckEndian -->|Big| BigEndian
    CheckEndian -->|Little| LittleEndian

    BigEndian --> ConvertType
    LittleEndian --> ConvertType

    ConvertType -->|int| SignedInt
    ConvertType -->|uint| UnsignedInt
    ConvertType -->|float| Float

    SignedInt --> ApplyScale
    UnsignedInt --> ApplyScale
    Float --> ApplyScale

    ApplyScale --> CreatePoint
    CreatePoint --> AddToArray
    AddToArray --> LoopEnd

    LoopEnd -->|Yes| LoopStart
    LoopEnd -->|No| Output

    Output --> End
```

---

## 6. Component Interfaces

### 6.1 Bit Selector Interface

All bit selector implementations must conform to this interface:

```javascript
// BitSelectorInterface.js
export const BitSelectorInterface = {
  // Props received
  props: {
    payloadSize: Number,      // Total bits (e.g., 64 for 8 bytes)
    startBit: Number,         // Currently selected start bit
    bitLength: Number,        // Number of bits for data type
    onChange: Function,       // (startBit) => void
  },

  // Methods to implement
  methods: {
    render: Function,         // Render the UI
    highlightBits: Function,  // Visual feedback for selected range
  }
}
```

### 6.2 Chart Adapter Interface

All chart adapters must conform to this interface:

```javascript
// ChartAdapterInterface.js
export const ChartAdapterInterface = {
  // Methods to implement
  methods: {
    initialize: Function,     // (containerId, options) => void
    render: Function,         // (signalData[]) => void
    updateData: Function,     // (signalData[]) => void
    destroy: Function,        // () => void
    setOptions: Function,     // (options) => void
  }
}
```

---

## 7. File Structure

```
src/
├── components/
│   ├── plots/
│   │   ├── PlotsPage.jsx              # Main container
│   │   ├── PlotConfigPanel.jsx        # Left sidebar
│   │   ├── PlotDisplayArea.jsx        # Right area
│   │   ├── PlotEntryList.jsx          # List of configs
│   │   ├── PlotEntryForm.jsx          # Config form
│   │   │
│   │   ├── bitSelector/
│   │   │   ├── BitSelectorWrapper.jsx    # Strategy wrapper
│   │   │   ├── GridBitSelector.jsx       # Grid implementation
│   │   │   └── DiagramBitSelector.jsx    # Diagram implementation
│   │   │
│   │   └── charts/
│   │       ├── ChartWrapper.jsx          # Strategy wrapper
│   │       ├── ChartJsAdapter.jsx        # Chart.js adapter
│   │       ├── RechartsAdapter.jsx       # Recharts adapter
│   │       └── PlotlyAdapter.jsx         # Plotly adapter
│   │
│   └── PlotsPage.css
│
├── utils/
│   ├── signalExtractor.js            # Core extraction logic
│   ├── bitOperations.js              # Low-level bit ops
│   └── dataTypeConverters.js         # Type conversions
│
└── constants/
    └── plotTypes.js                   # Data type definitions
```

---

## 8. Design Patterns Summary

### 8.1 Strategy Pattern
- **Used for:** Bit Selector UI, Chart Rendering
- **Benefit:** Easy to swap implementations without changing core logic
- **Example:** Switch from Chart.js to Recharts with single prop change

### 8.2 Adapter Pattern
- **Used for:** Chart library integration
- **Benefit:** Unified interface for different chart libraries
- **Example:** All adapters expose same `render()`, `updateData()`, `destroy()` methods

### 8.3 Facade Pattern
- **Used for:** SignalExtractor utility
- **Benefit:** Hides complexity of bit operations, endianness, type conversion
- **Example:** Single `extractSignal()` call handles all complexity

---

## 9. Extension Points

### 9.1 Adding a New Chart Library

1. Create new adapter: `src/components/plots/charts/NewLibraryAdapter.jsx`
2. Implement `ChartAdapterInterface` methods
3. Register in `ChartWrapper.jsx`
4. Add to UI selection dropdown

### 9.2 Adding a New Bit Selector UI

1. Create new component: `src/components/plots/bitSelector/NewBitSelector.jsx`
2. Implement `BitSelectorInterface` props and methods
3. Register in `BitSelectorWrapper.jsx`
4. Add to UI selection dropdown (optional)

### 9.3 Adding New Data Types

1. Add type definition to `constants/plotTypes.js`
2. Implement conversion in `utils/dataTypeConverters.js`
3. Update `PlotEntryForm.jsx` dropdown
4. No other changes needed (extensible design)

---

## 10. Performance Considerations

### 10.1 Memoization Strategy

```mermaid
graph LR
    Messages[CAN Messages<br/>Rarely Changes] --> ExtractMemo[useMemo:<br/>Signal Extraction]
    PlotConfig[Plot Configs<br/>User Changes] --> ExtractMemo

    ExtractMemo --> SignalData[Extracted Signal Data]

    SignalData --> ChartMemo[useMemo:<br/>Chart Data Prep]
    ChartOptions[Chart Options] --> ChartMemo

    ChartMemo --> Render[Render Chart]

    style ExtractMemo fill:#ffffcc
    style ChartMemo fill:#ffffcc
```

### 10.2 Optimization Techniques

1. **Memoize signal extraction** - Only recompute when messages or config change
2. **Lazy loading** - Load chart libraries on demand
3. **Virtual scrolling** - For large entry lists (if needed)
4. **Debounce user input** - When editing start bit or scale factors
5. **Web Workers** - For heavy extraction (future enhancement)

---

## 11. Testing Strategy

### 11.1 Unit Tests
- `signalExtractor.js` - All data types, endianness, edge cases
- `bitOperations.js` - Bit extraction, boundary conditions
- `dataTypeConverters.js` - Type conversions, overflow handling

### 11.2 Integration Tests
- Plot entry CRUD operations
- Signal extraction with real CAN data
- Chart adapter switching

### 11.3 E2E Tests
- Complete workflow: Upload → Configure → Plot → Export
- Multi-signal plotting
- UI responsiveness

---

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-11-28 | 1.0 | Initial architecture documentation | Claude |

---

**Note:** This document should be updated whenever architectural decisions change or new patterns are introduced.
