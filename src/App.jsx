import { useState } from 'react'
import './App.css'

function App() {
  const [csvFile, setCsvFile] = useState(null)
  const [multiplexing, setMultiplexing] = useState('none')
  const [protocol, setProtocol] = useState('none')

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

    // Use full URL in development, relative URL in production
    const apiUrl = import.meta.env.DEV
      ? 'http://localhost:5000/api/process'
      : '/api/process'

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: csvFile.name,
          multiplexing: multiplexing,
          protocol: protocol,
        }),
      })

      const data = await response.json()
      alert(data.message)
    } catch (error) {
      alert('Error connecting to server: ' + error.message)
    }
  }

  return (
    <div className="app">
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
            />
            {csvFile && <p className="file-name">Selected: {csvFile.name}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="multiplexing">Multiplexing:</label>
            <select
              id="multiplexing"
              value={multiplexing}
              onChange={(e) => setMultiplexing(e.target.value)}
            >
              <option value="none">none</option>
              <option value="byte mask">byte mask</option>
              <option value="byte">byte</option>
              <option value="2 byte">2 byte</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="protocol">Protocol:</label>
            <select
              id="protocol"
              value={protocol}
              onChange={(e) => setProtocol(e.target.value)}
            >
              <option value="none">none</option>
              <option value="isotp">isotp</option>
              <option value="J1939">J1939</option>
            </select>
          </div>

          <button type="submit">Process</button>
        </form>
      </div>
    </div>
  )
}

export default App
