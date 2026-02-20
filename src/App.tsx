import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import MainLayout from "@/layouts/main-layout"
import BoardPage from "@/pages/board-page"
import LoginPage from "@/pages/login-page"
import LandingPage from "@/pages/landing-page"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
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
