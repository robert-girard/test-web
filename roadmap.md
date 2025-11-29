# **CAN Analysis Tool Roadmap**

## **Phase 1: UI Polish & Input Handling** ✅ COMPLETED

**Goal:** Refine the initial ingestion interface before moving to complex visualizations.

* \[x\] **UI Logic:** Disable/Gray out the "Multiplexing" dropdown menu initially (User Requirement).
  * *Implementation: Dropdown disabled by default, enabled only when isotp or J1939 protocols are selected (src/App.jsx:10, 87-88)*
* \[x\] **Backend:** Ensure Flask endpoint accepts the file upload and arguments (Protocol/Multiplexing selection).
  * *Implementation: Flask endpoint accepts file content, filename, protocol, and multiplexing options (backend/app.py:98-136)*
* \[x\] **Data Processing:** Implement the logic to strip protocols (ISO-TP, UDS, etc.) and collapse multi-frames into single (Timestamp, ArbID, Payload) objects.
  * *Implementation: ISO-TP processing with multi-frame collapse implemented (backend/app.py:29-96). Handles Single Frame (0x0X), First Frame (0x1X), Consecutive Frame (0x2X), and Flow Control (0x3X) frames.*

## **Phase 2: Tabular Data View (The "Raw" Page)** ✅ COMPLETED

**Goal:** A "Source of Truth" view to inspect the processed time-series data.

* \[x\] **Navigation:** Create a tabbed interface or routing structure (e.g., Input, Table View, Heatmaps, Analysis).
  * *Implementation: React Router with Navigation component (src/components/Navigation.jsx). Routes: "/" (Input), "/table" (Table View)*
* \[x\] **Grid Component:** Implement a high-performance data table (e.g., Ag-Grid or TanStack Table recommended for large datasets).
  * \[x\] Columns: Timestamp, Arbitration ID (Hex), Payload (Hex), Length.
  * *Implementation: Custom data table in TableView component (src/components/TableView.jsx:138-174). Displays timestamp, ArbID, formatted payload, and byte length*
* \[x\] **Filtering & Sorting:**
  * \[x\] Add "Sort by ArbID" functionality.
    * *Implementation: Clickable column header with hex-aware sorting (src/components/TableView.jsx:55-62, 79)*
  * \[x\] Add "Sort by Time" functionality.
    * *Implementation: Clickable column header with numeric sorting (src/components/TableView.jsx:55-62, 77)*
  * \[x\] **Search/Filter:** Implement a Regex input field to filter Payloads (e.g., find payloads starting with 00 FF).
    * *Implementation: Live regex filter with error handling (src/components/TableView.jsx:38-46, 106-116)*
  * \[x\] **ArbID Filter:** specific ArbID inclusion/exclusion list.
    * *Implementation: Comma-separated ArbID list with include/exclude toggle (src/components/TableView.jsx:49-60, 119-134)*

## **Phase 2.5: Table View Enhancements** ✅ COMPLETED

**Goal:** Add binary representation toggle to improve payload inspection.

* \[x\] **Hex/Binary Toggle:** Add a toggle button to switch payload display between hexadecimal and binary representation.
  * \[x\] Global toggle affects all rows in the table.
    * *Implementation: Toggle buttons in filters section (src/components/TableView.jsx:146-162). State stored in `displayMode` (line 13)*
  * \[x\] Binary format should group bits by byte (e.g., `00000001 00000010`).
    * *Implementation: `hexToBinary()` function converts hex to binary with byte grouping (src/components/TableView.jsx:84-91)*
  * \[x\] Maintain current filtering and sorting functionality.
    * *Implementation: Display mode only affects formatting, not filtering/sorting logic (line 93-100)*
  * \[x\] Preserve toggle state when switching between tabs.
    * *Implementation: State persists in React component while navigating between tabs*

## **Phase 3: Signal Plotting & Extraction** ✅ COMPLETED

**Goal:** Manual signal extraction and time-series plotting for CAN data analysis.

* \[x\] **Navigation:** Add "Plots" tab to navigation bar.
  * *Implementation: Added "/plots" route to Navigation component (src/components/Navigation.jsx:23-28)*
* \[x\] **Plot Entry Management:**
  * \[x\] **Add Entry:** Button to create new plot configuration.
    * *Implementation: PlotConfigPanel with "Add Signal" button (src/components/plots/PlotConfigPanel.jsx:21-26)*
  * \[x\] **Remove Entry:** Delete button for each plot entry.
    * *Implementation: Delete button in PlotEntryList with confirmation dialog (src/components/plots/PlotEntryList.jsx:63-69)*
  * \[x\] **Edit Entry:** Inline editing of plot configuration.
    * *Implementation: Edit button in PlotEntryList, reuses PlotEntryForm (src/components/plots/PlotEntryList.jsx:56-62)*
  * \[x\] **Entry List:** Display all configured plot entries in a sidebar/panel.
    * *Implementation: PlotEntryList component with signal details (src/components/plots/PlotEntryList.jsx)*
* \[x\] **Signal Configuration UI:**
  * \[x\] **ArbID Selector:** Dropdown to select which Arbitration ID to extract from.
    * *Implementation: Dropdown populated from unique ArbIDs in data (src/components/plots/PlotEntryForm.jsx:123-133)*
  * \[x\] **Start Bit:** Input field for bit offset (0-x where x is the size of the payload. they are expected to be the same for an given arb id).
    * *Implementation: Number input with validation (src/components/plots/PlotEntryForm.jsx:164-172)*
  * \[x\] **Data Type Selector:** Dropdown with options:
    * Signed Integer: int8, int16, int24, int32
    * Unsigned Integer: uint8, uint16, uint24, uint32
    * Float: float16 (half), float32 (single)
    * *Implementation: Dropdown with all types from constants (src/components/plots/PlotEntryForm.jsx:135-147, src/constants/plotTypes.js:36-47)*
  * \[x\] **Endianness:** Radio buttons for Big Endian / Little Endian.
    * *Implementation: Dropdown selector for endianness (src/components/plots/PlotEntryForm.jsx:150-160)*
  * \[x\] **Scaling Factor:** Input field for multiplication factor (default: 1.0).
    * *Implementation: Number input with step="any" (src/components/plots/PlotEntryForm.jsx:186-195)*
  * \[x\] **Offset:** Input field for addition offset (default: 0.0).
    * *Implementation: Number input with step="any" (src/components/plots/PlotEntryForm.jsx:198-207)*
  * \[x\] **Signal Name:** Optional text field to label the signal.
    * *Implementation: Text input, required field (src/components/plots/PlotEntryForm.jsx:113-121)*
* \[x\] **Visual Bit Selection:**
  * \[x\] **Payload Diagram:** Visual representation of the payload.
    * *Implementation: GridBitSelector with byte-organized grid (src/components/plots/bitSelector/GridBitSelector.jsx)*
  * \[x\] **Bit Highlighting:** Selected bits (start bit + data type length) should be highlighted.
    * *Implementation: CSS class 'selected' applied to bits in range (src/components/plots/bitSelector/GridBitSelector.jsx:21-23)*
  * \[x\] **Interactive Selection:** Click/drag on diagram to set start bit (stretch goal).
    * *Implementation: Click to set start bit (src/components/plots/bitSelector/GridBitSelector.jsx:26-30, 48)*
  * \[x\] **Bit Numbering:** Show bit indices (0-x) and byte boundaries.
    * *Implementation: Bits numbered and grouped by bytes (src/components/plots/bitSelector/GridBitSelector.jsx:40-60)*
* \[x\] **Plotting Engine:**
  * \[x\] **Chart Library:** Integrate a charting library (e.g., Chart.js, Recharts, or Plotly).
    * *Implementation: Plotly.js via react-plotly.js (src/components/plots/charts/PlotlyAdapter.jsx)*
  * \[x\] **Time-Series Plot:** X-axis: timestamp, Y-axis: extracted signal value.
    * *Implementation: Scatter plot with lines+markers (src/components/plots/charts/PlotlyAdapter.jsx:12-21)*
  * \[x\] **Multi-Signal Support:** Display multiple signals on the same plot with different colors.
    * *Implementation: Multiple traces with automatic color assignment (src/components/plots/charts/PlotlyAdapter.jsx:11, src/constants/plotTypes.js:61-70)*
  * \[x\] **Legend:** Show signal names and colors.
    * *Implementation: Plotly legend with signal names (src/components/plots/charts/PlotlyAdapter.jsx:36-44)*
  * \[x\] **Zoom/Pan:** Interactive controls for exploring data.
    * *Implementation: Plotly built-in zoom/pan with mode bar (src/components/plots/charts/PlotlyAdapter.jsx:53-64)*
* \[x\] **Signal Extraction Logic (Backend or Frontend):**
  * \[x\] **Bit Extraction:** Extract N bits starting from start bit position.
    * *Implementation: Frontend extraction in signalExtractor.js using bitOperations utilities (src/utils/signalExtractor.js:54-56, src/utils/bitOperations.js:33-47)*
  * \[x\] **Endianness Handling:** Convert between big-endian and little-endian.
    * *Implementation: Byte reversal for little-endian (src/utils/signalExtractor.js:63-65, src/utils/bitOperations.js:81-97)*
  * \[x\] **Type Conversion:** Convert raw bits to int8/16/24, uint8/16/24, float16/32.
    * *Implementation: Type converters for all data types including IEEE 754 floats (src/utils/dataTypeConverters.js)*
  * \[x\] **Scaling & Offset:** Apply formula: `physical_value = (raw_value * scale) + offset`.
    * *Implementation: applyScalingAndOffset function (src/utils/dataTypeConverters.js:93-99, src/utils/signalExtractor.js:71)*
  * \[x\] **Filter by ArbID:** Only process messages matching selected ArbID.
    * *Implementation: Filter in extractSignal function (src/utils/signalExtractor.js:47-49)*
* \[x\] **Data Storage:**
  * \[x\] **Local State:** Store plot configurations in React state.
    * *Implementation: plotEntries state in PlotsPage (src/components/plots/PlotsPage.jsx:20)*
  * \[ \] **Persistence:** Save configurations to localStorage (stretch goal).
    * *Not implemented - future enhancement*
  * \[ \] **Export Configuration:** Download plot config as JSON (stretch goal).
    * *Not implemented - future enhancement*

**Architecture:**
- **Strategy Pattern:** Implemented for bit selectors (BitSelectorWrapper) and chart engines (ChartWrapper)
- **Adapter Pattern:** PlotlyAdapter provides unified interface for Plotly.js
- **Facade Pattern:** signalExtractor.js hides complexity of bit operations, type conversions, and endianness
- **Context API:** DataContext shares processed CAN data across routes (src/App.jsx:10)
- **Memoization:** useMemo for signal extraction and ArbID list generation (src/components/plots/PlotsPage.jsx:36, 42)

## **Phase 4: Heatmap Visualization**

**Goal:** Visual pattern recognition to identify counters, constants, and changing signals.

* \[ \] **Navigation:** Create a sidebar or rapid-selector to jump between Arbitration IDs.
* \[ \] **Visualization Engine:** Implement Heatmap component (X-axis: Byte Index, Y-axis: Time/Message Sequence).
  * \[ \] Cell Color: 0-255 (0x00 to 0xFF) gradient.
  * \[ \] Tooltip: Hovering a cell shows the Hex/Decimal value and timestamp.
* \[ \] **Optimization:** Ensure rendering handles high-frequency IDs without freezing the browser (consider Canvas API vs. SVG).

## **Phase 5: Automated Candidate Extraction**

**Goal:** Algorithmic detection of engineering values (signals) to reduce manual work.

* \[ \] **Algorithm (Backend/Frontend):**
  * \[ \] **Gradient Detection:** Identify bytes or bit-groups that increment/decrement smoothly (Counters).
  * \[ \] **Cutoff Detection:** Identify bytes that hold a constant value and shift sharply to another constant (Status flags/Modes).
* \[ \] **Candidate UI:**
  * \[ \] **Global List:** A master list of all detected candidates across *all* ArbIDs, sorted by "Confidence" or "Signal Type".
  * \[ \] **Per-ID View:** When viewing a specific ArbID Heatmap, show a sub-list of candidates found within that specific ID.
* \[ \] **Verification:** Allow user to click a candidate to overlay a line graph on top of the heatmap data to verify the extraction.

## **Phase 6: Future Expansions**

**Goal:** Placeholder for advanced decoding and export.

* \[ \] **DBC Export:** Capability to save identified candidates into a .DBC file format.
* \[ \] **Live Mode:** Hook into a live socket can interface (vs. file upload).
* \[ \] **Multi-File Analysis:** Load and compare multiple CAN trace files.