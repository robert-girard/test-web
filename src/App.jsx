import { useState, createContext } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import InputPage from './components/InputPage'
import TableView from './components/TableView'
import PlotsPage from './components/plots/PlotsPage'
import './App.css'

// Create context for sharing processed data across routes
export const DataContext = createContext(null)

function App() {
  const [processedData, setProcessedData] = useState(null)

  const handleDataProcessed = (data) => {
    setProcessedData(data)
  }

  return (
    <Router>
      <DataContext.Provider value={{ processedData, setProcessedData }}>
        <div className="app">
          <Navigation />
          <div className="content">
            <Routes>
              <Route path="/" element={<InputPage onDataProcessed={handleDataProcessed} />} />
              <Route path="/table" element={<TableView processedData={processedData} />} />
              <Route path="/plots" element={<PlotsPage />} />
            </Routes>
          </div>
        </div>
      </DataContext.Provider>
    </Router>
  )
}

export default App
