import { useState } from 'react'
import Login from './Login'
import UserDashboard from './UserDashboard'
import AdminDashboard from './AdminDashboard'

export default function App() {
  const [isAdmin, setIsAdmin] = useState(null)
  const token = localStorage.getItem('token')

  const handleLogin = (adminStatus) => {
    setIsAdmin(adminStatus)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('is_admin')
    setIsAdmin(null)
  }

  // Not logged in
  if (!token && isAdmin === null) return <Login onLogin={handleLogin} />

  // Logged in — decide which dashboard to show
  const admin = isAdmin !== null ? isAdmin : localStorage.getItem('is_admin') === 'true'

  return admin
    ? <AdminDashboard onLogout={handleLogout} />
    : <UserDashboard onLogout={handleLogout} />
}