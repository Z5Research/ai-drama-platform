import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/auth'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectNewPage from './pages/ProjectNewPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import DashboardPage from './pages/DashboardPage'
import CharactersPage from './pages/CharactersPage'
import TemplatesPage from './pages/TemplatesPage'
import ExportPage from './pages/ExportPage'
import CreditsPage from './pages/CreditsPage'
import AdminPage from './pages/AdminPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <Routes>
      {/* 首页 - 公开访问 */}
      <Route path="/" element={<HomePage />} />

      {/* 公开路由 */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 需认证路由 */}
      <Route
        element={
          isAuthenticated ? <MainLayout /> : <Navigate to="/login" replace />
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/new" element={<ProjectNewPage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* 默认重定向 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App