import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import PrivateRoute from './components/PrivateRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'
import HistoryPage from './pages/HistoryPage'
import BrowsePage from './pages/BrowsePage'
import DetailPage from './pages/DetailPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
          <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/browse/:id" element={<DetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  )
}
