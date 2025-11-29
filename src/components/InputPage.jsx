import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function InputPage({ onDataProcessed }) {
  const [csvFile, setCsvFile] = useState(null)
  const [multiplexing, setMultiplexing] = useState('none')
  const [protocol, setProtocol] = useState('none')
  const [isProcessing, setIsProcessing] = useState(false)
  const navigate = useNavigate()

  // Multiplexing is only enabled for isotp and J1939 protocols
  const isMultiplexingEnabled = protocol === 'isotp' || protocol === 'J1939'

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
    } else {
      alert('Please select a valid CSV file')
      event.target.value = null
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!csvFile) {
      alert('Please select a CSV file')
      return
    }

    setIsProcessing(true)

    // Use full URL in development, relative URL in production
    const apiUrl = import.meta.env.DEV
      ? 'http://localhost:5000/api/process'
      : '/api/process'

    try {
      // Read file content
      const fileContent = await csvFile.text()

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: csvFile.name,
          content: fileContent,
          multiplexing: multiplexing,
          protocol: protocol,
        }),
      })

      const data = await response.json()

      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        // Pass processed data to parent
        onDataProcessed(data)

        // Show success message
        alert(`Processed ${data.total_messages} messages\nUnique ArbIDs: ${data.unique_arbids}\n\nNavigating to Table View...`)

        // Navigate to table view
        navigate('/table')
      }
    } catch (error) {
      alert('Error connecting to server: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="form-container">
      <h1>CSV File Processor</h1>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="csvFile">CSV File:</label>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isProcessing}
          />
          {csvFile && <p className="file-name">Selected: {csvFile.name}</p>}
        </div>

        <div className="form-group">
          <label htmlFor="protocol">Protocol:</label>
          <select
            id="protocol"
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            disabled={isProcessing}
          >
            <option value="none">none</option>
            <option value="isotp">isotp</option>
            <option value="J1939">J1939</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="multiplexing">Multiplexing:</label>
          <select
            id="multiplexing"
            value={multiplexing}
            onChange={(e) => setMultiplexing(e.target.value)}
            disabled={!isMultiplexingEnabled || isProcessing}
            className={!isMultiplexingEnabled ? 'disabled' : ''}
          >
            <option value="none">none</option>
            <option value="byte mask">byte mask</option>
            <option value="byte">byte</option>
            <option value="2 byte">2 byte</option>
          </select>
        </div>

        <button type="submit" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Process'}
        </button>
      </form>
    </div>
  )
}

export default InputPage
