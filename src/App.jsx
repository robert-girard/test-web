import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import InputPage from './components/InputPage'
import TableView from './components/TableView'
import './App.css'

function App() {
  const [processedData, setProcessedData] = useState(null)

  const handleDataProcessed = (data) => {
    setProcessedData(data)
  }

  return (
    <Router>
      <div className="app">
        <Navigation />
        <div className="content">
          <Routes>
            <Route path="/" element={<InputPage onDataProcessed={handleDataProcessed} />} />
            <Route path="/table" element={<TableView processedData={processedData} />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
