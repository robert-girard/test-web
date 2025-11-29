/**
 * List of configured plot entries with edit/delete actions
 */
function PlotEntryList({ entries, onEdit, onDelete }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="plot-entry-list-empty">
        <p>No signals configured yet.</p>
        <p>Click "Add Signal" to get started.</p>
      </div>
    );
  }

  return (
    <div className="plot-entry-list">
      <h3>Configured Signals ({entries.length})</h3>

      <div className="entry-items">
        {entries.map((entry) => (
          <div key={entry.id} className="entry-item">
            <div className="entry-header">
              <div
                className="entry-color"
                style={{ backgroundColor: entry.color }}
                title={`Color: ${entry.color}`}
              ></div>
              <div className="entry-name">{entry.name}</div>
            </div>

            <div className="entry-details">
              <div className="entry-detail">
                <span className="label">ArbID:</span>
                <span className="value">{entry.arbid}</span>
              </div>
              <div className="entry-detail">
                <span className="label">Type:</span>
                <span className="value">{entry.dataType}</span>
              </div>
              <div className="entry-detail">
                <span className="label">Bits:</span>
                <span className="value">{entry.startBit} - {entry.startBit + (parseInt(entry.dataType.match(/\d+/)[0]) - 1)}</span>
              </div>
              <div className="entry-detail">
                <span className="label">Endian:</span>
                <span className="value">{entry.endianness}</span>
              </div>
              <div className="entry-detail">
                <span className="label">Scale:</span>
                <span className="value">{entry.scale}</span>
              </div>
              <div className="entry-detail">
                <span className="label">Offset:</span>
                <span className="value">{entry.offset}</span>
              </div>
            </div>

            <div className="entry-actions">
              <button
                className="btn-edit"
                onClick={() => onEdit(entry)}
                title="Edit signal"
              >
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => onDelete(entry.id)}
                title="Delete signal"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PlotEntryList;
