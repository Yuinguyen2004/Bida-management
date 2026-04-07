import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import FBManagement from './pages/FBManagement'
import TableManagement from './pages/TableManagement'
import RevenueAnalytics from './pages/RevenueAnalytics'
import StaffMenu from './pages/StaffMenu'
import StaffTableOperations from './pages/StaffTableOperations'
import CustomerManagement from './pages/CustomerManagement'
import MyProfile from './pages/MyProfile'
import Notifications from './pages/Notifications'
import { getDefaultPageForRole, isPageAllowedForRole, type AppPage } from './utils/navigation'
import './App.css'

type Page = 'login' | 'register' | AppPage

function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState<Page>('login')

  useEffect(() => {
    if (!isLoading && isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage(getDefaultPageForRole(user?.role ?? 'staff'))
    }
  }, [currentPage, isAuthenticated, isLoading, user?.role])

  useEffect(() => {
    if (!isAuthenticated || !user || currentPage === 'login' || currentPage === 'register') {
      return
    }

    if (!isPageAllowedForRole(user.role, currentPage)) {
      setCurrentPage(getDefaultPageForRole(user.role))
    }
  }, [currentPage, isAuthenticated, user])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    setCurrentPage('login')
  }

  const handleNavigate = (page: AppPage) => {
    if (!user || isPageAllowedForRole(user.role, page)) {
      setCurrentPage(page)
    }
  }

  const handleAuthSuccess = () => {
    setCurrentPage('dashboard')
  }

  if (!isAuthenticated) {
    if (currentPage === 'register') {
      return <Register onSuccess={handleAuthSuccess} onSwitchPage={(page) => setCurrentPage(page as Page)} />
    }
    return <Login onSuccess={handleAuthSuccess} onSwitchPage={(page) => setCurrentPage(page as Page)} />
  }

  return (
    <div className="app-container">
      {currentPage === 'dashboard' && (
        <Dashboard onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
      {currentPage === 'fb-management' && (
        <FBManagement onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
      {currentPage === 'table-management' && (
        <TableManagement onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
      {currentPage === 'staff-tables' && (
        <StaffTableOperations onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
      {currentPage === 'revenue-reports' && (
        <RevenueAnalytics onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
      {currentPage === 'staff-menu' && (
        <StaffMenu onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
      {currentPage === 'customers' && (
        <CustomerManagement onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
      {currentPage === 'my-profile' && (
        <MyProfile onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
      {currentPage === 'notifications' && (
        <Notifications onLogout={handleLogout} onNavigate={handleNavigate} user={user} />
      )}
    </div>
  )
}

export default App
