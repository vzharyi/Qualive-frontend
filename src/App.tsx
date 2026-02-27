import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "@/pages/landing-page"
import AuthPage from "@/pages/auth-page"
import OAuthCallbackPage from "@/pages/oauth-callback-page"
import DashboardPage from "@/pages/dashboard-page"
import BoardPage from "@/pages/board-page"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/oauth-callback" element={<OAuthCallbackPage />} />

        {/* Protected */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects/:id" element={<BoardPage />} />
      </Routes>
    </Router>
  )
}

export default App
