import { useState, useEffect } from 'react'
import api from './api'

export default function AdminDashboard({ onLogout }) {
  const [tickets, setTickets] = useState([])
  const [filter, setFilter] = useState('all')

  const loadTickets = async () => {
    const res = await api.get('/tickets/all')
    setTickets(res.data)
  }

  useEffect(() => { loadTickets() }, [])

  const update = async (id, field, value) => {
    await api.patch(`/tickets/${id}`, { [field]: value })
    loadTickets()
  }

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter)

  return (
    <>
      <nav>
        <span>🎫 Helpdesk — Admin</span>
        <button onClick={onLogout}>Logout</button>
      </nav>

      <div className="container">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2>All tickets ({tickets.length})</h2>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {['all', 'open', 'in_progress', 'resolved'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '1px solid #ddd',
                    background: filter === f ? '#4f46e5' : 'white',
                    color: filter === f ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: 13
                  }}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p style={{ color: '#888', fontSize: 14 }}>No tickets found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>User ID</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td>{t.category}</td>
                    <td>{t.created_by}</td>
                    <td>
                      <select
                        value={t.priority}
                        onChange={e => update(t.id, 'priority', e.target.value)}
                        style={{ margin: 0, padding: '4px 8px', width: 'auto' }}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </td>
                    <td>
                      <select
                        value={t.status}
                        onChange={e => update(t.id, 'status', e.target.value)}
                        style={{ margin: 0, padding: '4px 8px', width: 'auto' }}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
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