import { useState } from 'react';
import PlotEntryList from './PlotEntryList.jsx';
import PlotEntryForm from './PlotEntryForm.jsx';

/**
 * Left sidebar panel for managing plot configurations
 */
function PlotConfigPanel({
  entries,
  messages,
  availableArbIds,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onClearAll,
  filename
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // Handle add button click
  const handleAddClick = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  // Handle edit entry
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  // Handle form submission
  const handleFormSubmit = (formData) => {
    if (editingEntry) {
      // Update existing entry
      onUpdateEntry(editingEntry.id, formData);
    } else {
      // Add new entry
      onAddEntry(formData);
    }

    // Close form
    setShowForm(false);
    setEditingEntry(null);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  // Handle delete entry
  const handleDelete = (entryId) => {
    if (window.confirm('Are you sure you want to delete this signal?')) {
      onDeleteEntry(entryId);
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all signal configurations?')) {
      onClearAll();
    }
  };

  return (
    <div className="plot-config-panel">
      <div className="panel-header">
        <div>
          <h2>Signal Configuration</h2>
          {filename && (
            <div className="filename-indicator">
              {filename} <span className="auto-saved">(Auto-saved)</span>
            </div>
          )}
        </div>
        {!showForm && (
          <div className="header-buttons">
            <button className="btn-add" onClick={handleAddClick}>
              + Add Signal
            </button>
            {entries.length > 0 && (
              <button className="btn-clear" onClick={handleClearAll}>
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      <div className="panel-content">
        {showForm ? (
          <PlotEntryForm
            messages={messages}
            availableArbIds={availableArbIds}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            initialData={editingEntry}
          />
        ) : (
          <PlotEntryList
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

export default PlotConfigPanel;
