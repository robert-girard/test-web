# **CAN Analysis Tool Roadmap**

## **Phase 1: UI Polish & Input Handling** ✅ COMPLETED

**Goal:** Refine the initial ingestion interface before moving to complex visualizations.

* \[x\] **UI Logic:** Disable/Gray out the "Multiplexing" dropdown menu initially (User Requirement).
  * *Implementation: Dropdown disabled by default, enabled only when isotp or J1939 protocols are selected (src/App.jsx:10, 87-88)*
* \[x\] **Backend:** Ensure Flask endpoint accepts the file upload and arguments (Protocol/Multiplexing selection).
  * *Implementation: Flask endpoint accepts file content, filename, protocol, and multiplexing options (backend/app.py:98-136)*
* \[x\] **Data Processing:** Implement the logic to strip protocols (ISO-TP, UDS, etc.) and collapse multi-frames into single (Timestamp, ArbID, Payload) objects.
  * *Implementation: ISO-TP processing with multi-frame collapse implemented (backend/app.py:29-96). Handles Single Frame (0x0X), First Frame (0x1X), Consecutive Frame (0x2X), and Flow Control (0x3X) frames.*

## **Phase 2: Tabular Data View (The "Raw" Page)**

**Goal:** A "Source of Truth" view to inspect the processed time-series data.

* \[ \] **Navigation:** Create a tabbed interface or routing structure (e.g., Input, Table View, Heatmaps, Analysis).  
* \[ \] **Grid Component:** Implement a high-performance data table (e.g., Ag-Grid or TanStack Table recommended for large datasets).  
  * \[ \] Columns: Timestamp, Arbitration ID (Hex), Payload (Hex), Length.  
* \[ \] **Filtering & Sorting:**  
  * \[ \] Add "Sort by ArbID" functionality.  
  * \[ \] Add "Sort by Time" functionality.  
  * \[ \] **Search/Filter:** Implement a Regex input field to filter Payloads (e.g., find payloads starting with 00 FF).  
  * \[ \] **ArbID Filter:** specific ArbID inclusion/exclusion list.

## **Phase 3: Heatmap Visualization**

**Goal:** Visual pattern recognition to identify counters, constants, and changing signals.

* \[ \] **Navigation:** Create a sidebar or rapid-selector to jump between Arbitration IDs.  
* \[ \] **Visualization Engine:** Implement Heatmap component (X-axis: Byte Index, Y-axis: Time/Message Sequence).  
  * \[ \] Cell Color: 0-255 (0x00 to 0xFF) gradient.  
  * \[ \] Tooltip: Hovering a cell shows the Hex/Decimal value and timestamp.  
* \[ \] **Optimization:** Ensure rendering handles high-frequency IDs without freezing the browser (consider Canvas API vs. SVG).

## **Phase 4: Automated Candidate Extraction**

**Goal:** Algorithmic detection of engineering values (signals) to reduce manual work.

* \[ \] **Algorithm (Backend/Frontend):**  
  * \[ \] **Gradient Detection:** Identify bytes or bit-groups that increment/decrement smoothly (Counters).  
  * \[ \] **Cutoff Detection:** Identify bytes that hold a constant value and shift sharply to another constant (Status flags/Modes).  
* \[ \] **Candidate UI:**  
  * \[ \] **Global List:** A master list of all detected candidates across *all* ArbIDs, sorted by "Confidence" or "Signal Type".  
  * \[ \] **Per-ID View:** When viewing a specific ArbID Heatmap, show a sub-list of candidates found within that specific ID.  
* \[ \] **Verification:** Allow user to click a candidate to overlay a line graph on top of the heatmap data to verify the extraction.

## **Phase 5: Future Expansions**

**Goal:** Placeholder for advanced decoding and export.

* \[ \] **DBC Export:** Capability to save identified candidates into a .DBC file format.  
* \[ \] **Live Mode:** Hook into a live socket can interface (vs. file upload).  
* \[ \] **Graphing:** Traditional line-plotting for identified signals.