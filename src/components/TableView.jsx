import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import './TableView.css'

function TableView({ processedData }) {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState('time') // 'time' or 'arbid'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc' or 'desc'
  const [payloadFilter, setPayloadFilter] = useState('')
  const [arbidFilter, setArbidFilter] = useState('')
  const [filterType, setFilterType] = useState('include') // 'include' or 'exclude'
  const [regexError, setRegexError] = useState(null)
  const [displayMode, setDisplayMode] = useState('hex') // 'hex' or 'binary'

  if (!processedData || !processedData.messages) {
    return (
      <div className="table-container">
        <h1>Table View</h1>
        <p className="no-data">No data available. Please upload a CSV file first.</p>
        <button onClick={() => navigate('/')}>Go to Input Page</button>
      </div>
    )
  }

  const messages = processedData.messages

  // Filter and sort messages
  const filteredAndSortedMessages = useMemo(() => {
    let filtered = [...messages]

    // Apply payload regex filter
    if (payloadFilter) {
      try {
        const regex = new RegExp(payloadFilter, 'i')
        setRegexError(null)
        filtered = filtered.filter(msg => regex.test(msg.payload))
      } catch (e) {
        setRegexError('Invalid regex pattern')
      }
    }

    // Apply ArbID filter
    if (arbidFilter) {
      const arbidList = arbidFilter.split(',').map(id => id.trim().toLowerCase())
      if (filterType === 'include') {
        filtered = filtered.filter(msg =>
          arbidList.some(id => msg.arbitration_id.toLowerCase().includes(id))
        )
      } else {
        filtered = filtered.filter(msg =>
          !arbidList.some(id => msg.arbitration_id.toLowerCase().includes(id))
        )
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0

      if (sortBy === 'time') {
        comparison = a.timestamp - b.timestamp
      } else if (sortBy === 'arbid') {
        // Convert hex strings to integers for proper sorting
        const aId = parseInt(a.arbitration_id, 16)
        const bId = parseInt(b.arbitration_id, 16)
        comparison = aId - bId
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [messages, sortBy, sortOrder, payloadFilter, arbidFilter, filterType])

  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const hexToBinary = (hexString) => {
    // Convert hex string to binary with byte grouping
    const bytes = hexString.match(/.{1,2}/g) || []
    return bytes.map(byte => {
      const decimal = parseInt(byte, 16)
      return decimal.toString(2).padStart(8, '0')
    }).join(' ')
  }

  const formatPayload = (payload) => {
    if (displayMode === 'binary') {
      return hexToBinary(payload)
    } else {
      // Add spaces every 2 characters for hex readability
      return payload.match(/.{1,2}/g)?.join(' ') || payload
    }
  }

  return (
    <div className="table-container">
      <div className="table-header">
        <h1>Table View - Raw CAN Data</h1>
        <div className="stats">
          <span>Total Messages: {processedData.total_messages}</span>
          <span>Unique ArbIDs: {processedData.unique_arbids}</span>
          <span>Protocol: {processedData.protocol}</span>
          <span>Filtered: {filteredAndSortedMessages.length}</span>
        </div>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Payload Regex Filter:</label>
          <input
            type="text"
            placeholder="e.g., ^00FF or .*DEAD.*"
            value={payloadFilter}
            onChange={(e) => setPayloadFilter(e.target.value)}
            className={regexError ? 'error' : ''}
          />
          {regexError && <span className="error-text">{regexError}</span>}
        </div>

        <div className="filter-group">
          <label>ArbID Filter (comma-separated):</label>
          <div className="arbid-filter">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="include">Include</option>
              <option value="exclude">Exclude</option>
            </select>
            <input
              type="text"
              placeholder="e.g., 0x100, 0x200, 7E8"
              value={arbidFilter}
              onChange={(e) => setArbidFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <label>Payload Display:</label>
          <div className="display-toggle">
            <button
              className={displayMode === 'hex' ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setDisplayMode('hex')}
            >
              Hex
            </button>
            <button
              className={displayMode === 'binary' ? 'toggle-btn active' : 'toggle-btn'}
              onClick={() => setDisplayMode('binary')}
            >
              Binary
            </button>
          </div>
        </div>

        <button
          className="clear-filters"
          onClick={() => {
            setPayloadFilter('')
            setArbidFilter('')
            setRegexError(null)
          }}
        >
          Clear Filters
        </button>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort('time')} className="sortable">
                Timestamp {sortBy === 'time' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => toggleSort('arbid')} className="sortable">
                Arbitration ID {sortBy === 'arbid' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Payload (Hex)</th>
              <th>Length</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedMessages.map((msg, index) => (
              <tr key={index}>
                <td className="timestamp">{msg.timestamp.toFixed(6)}</td>
                <td className="arbid">{msg.arbitration_id}</td>
                <td className="payload">{formatPayload(msg.payload)}</td>
                <td className="length">{msg.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableView
