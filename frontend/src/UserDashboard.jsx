import { useState, useEffect } from 'react'
import api from './api'

export default function UserDashboard({ onLogout }) {
  const [tickets, setTickets] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')

  const loadTickets = async () => {
    const res = await api.get('/tickets/my')
    setTickets(res.data)
  }

  useEffect(() => { loadTickets() }, [])

  const submitTicket = async () => {
    if (!title || !description) {
      setMessage('Please fill in all fields.')
      return
    }
    try {
      await api.post('/tickets/', { title, description, category })
      setTitle('')
      setDescription('')
      setCategory('general')
      setMessage('Ticket submitted successfully!')
      loadTickets()
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Something went wrong')
    }
  }

  return (
    <>
      <nav>
        <span>🎫 Helpdesk</span>
        <button onClick={onLogout}>Logout</button>
      </nav>

      <div className="container">
        {/* Submit ticket form */}
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>Submit a new ticket</h2>

          {message && (
            <div style={{ background: '#f0fdf4', color: '#166534', padding: 10, borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
              {message}
            </div>
          )}

          <label>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the issue" />

          <label>Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="general">General</option>
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="network">Network</option>
            <option value="access">Access</option>
          </select>

          <label>Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe your issue in detail..."
            rows={4}
            style={{ resize: 'vertical' }}
          />

          <button className="btn-primary" onClick={submitTicket}>Submit ticket</button>
        </div>

        {/* My tickets */}
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>My tickets</h2>

          {tickets.length === 0 ? (
            <p style={{ color: '#888', fontSize: 14 }}>No tickets yet. Submit one above!</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td>{t.category}</td>
                    <td><span className={`badge badge-${t.priority}`}>{t.priority}</span></td>
                    <td><span className={`badge badge-${t.status}`}>{t.status}</span></td>
                    <td>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}