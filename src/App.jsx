import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './contexts/AppContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Agenda from './pages/Agenda'
import Pacientes from './pages/Pacientes'
import Cadastros from './pages/Cadastros'
import Relatorios from './pages/Relatorios'
import Financeiro from './pages/Financeiro'
import ListaEspera from './pages/ListaEspera'
import FormPublico from './pages/FormPublico'
import FormMapeamento from './pages/FormMapeamento'

function ProtectedRoute({ children }) {
  const { user, needsOnboarding } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (needsOnboarding) return <Navigate to="/onboarding" replace />
  return children
}

function AppRoutes() {
  const { user, needsOnboarding } = useApp()
  return (
    <Routes>
      <Route path="/form" element={<FormPublico />} />
      <Route path="/mapeamento" element={<FormMapeamento />} />
      <Route path="/login" element={user && !needsOnboarding ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/onboarding" element={!user ? <Navigate to="/login" replace /> : needsOnboarding ? <Onboarding /> : <Navigate to="/" replace />} />
      <Route path="/" element={<ProtectedRoute><Layout><Agenda /></Layout></ProtectedRoute>} />
      <Route path="/pacientes" element={<ProtectedRoute><Layout><Pacientes /></Layout></ProtectedRoute>} />
      <Route path="/cadastros" element={<ProtectedRoute><Layout><Cadastros /></Layout></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute><Layout><Financeiro /></Layout></ProtectedRoute>} />
      <Route path="/lista-espera" element={<ProtectedRoute><Layout><ListaEspera /></Layout></ProtectedRoute>} />
      <Route path="/relatorios" element={<ProtectedRoute><Layout><Relatorios /></Layout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
