import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import StudentsPage from './pages/Students'
import ExamsPage from './pages/Exams'
import ResultsPage from './pages/Results'
import UploadPage from './pages/Upload'
import AiGrading from './pages/AiGrading'
import AnalyticsPage from './pages/Analytics'
import ReportsPage from './pages/Reports'
import SettingsPage from './pages/Settings'
import AboutPage from './pages/About'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import './styles.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <div className="content">
          <Topbar />
          <main style={{ marginTop:12 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/exams" element={<ExamsPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/aigrading" element={<AiGrading />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
