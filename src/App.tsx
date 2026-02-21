import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainLayout from "@/layouts/main-layout"
import BoardPage from "@/pages/board-page"
import AuthPage from "@/pages/auth-page"
import LandingPage from "@/pages/landing-page"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<BoardPage />} />
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
