import { useState } from 'react'

const PERIODS = [
  { value: 'daily', label: 'Daily', ms: 24 * 60 * 60 * 1000 },
  { value: 'weekly', label: 'Weekly', ms: 7 * 24 * 60 * 60 * 1000 },
  { value: 'monthly', label: 'Monthly', ms: 30 * 24 * 60 * 60 * 1000 },
  { value: 'one-time', label: 'One-time', ms: null },
]

function isAvailable(chore) {
  if (!chore.lastCompleted) return true
  const period = PERIODS.find(p => p.value === chore.period)
  if (!period || period.ms === null) return false // one-time: done forever
  return Date.now() - new Date(chore.lastCompleted).getTime() >= period.ms
}

function nextAvailable(chore) {
  if (!chore.lastCompleted) return null
  const period = PERIODS.find(p => p.value === chore.period)
  if (!period || period.ms === null) return null
  const next = new Date(new Date(chore.lastCompleted).getTime() + period.ms)
  return next
}

function formatCountdown(date) {
  const diff = date - Date.now()
  if (diff <= 0) return 'now'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h >= 24) return `${Math.ceil(h / 24)}d`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const blankChore = { name: '', period: 'daily', points: 10 }

export default function ChoresTab({ chores, onChange, onComplete }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blankChore)
  const [editId, setEditId] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || form.points < 1) return
    if (editId) {
      onChange(chores.map(c => c.id === editId ? { ...c, ...form, points: Number(form.points) } : c))
      setEditId(null)
    } else {
      onChange([...chores, { ...form, points: Number(form.points), id: crypto.randomUUID(), lastCompleted: null }])
    }
    setForm(blankChore)
    setShowForm(false)
  }

  function startEdit(chore) {
    setForm({ name: chore.name, period: chore.period, points: chore.points })
    setEditId(chore.id)
    setShowForm(true)
  }

  function deleteChore(id) {
    onChange(chores.filter(c => c.id !== id))
  }

  function cancelForm() {
    setForm(blankChore)
    setEditId(null)
    setShowForm(false)
  }

  const available = chores.filter(isAvailable)
  const unavailable = chores.filter(c => !isAvailable(c))

  return (
    <div className="tab-content">
      <div className="tab-toolbar">
        <h2 className="section-title">Chores</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(blankChore) }}>
          + Add Chore
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h3 className="form-title">{editId ? 'Edit Chore' : 'New Chore'}</h3>
          <div className="form-row">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Wash dishes"
              required
            />
          </div>
          <div className="form-row">
            <label className="form-label">Period</label>
            <select
              className="form-input"
              value={form.period}
              onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
            >
              {PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label className="form-label">Points</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={form.points}
              onChange={e => setForm(f => ({ ...f, points: e.target.value }))}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Add'}</button>
            <button type="button" className="btn btn-ghost" onClick={cancelForm}>Cancel</button>
          </div>
        </form>
      )}

      {chores.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No chores yet. Add one to get started!</p>
        </div>
      )}

      {available.length > 0 && (
        <div className="chore-group">
          <h3 className="group-label">Available ({available.length})</h3>
          <div className="card-list">
            {available.map(chore => (
              <div key={chore.id} className="card chore-card available">
                <div className="chore-info">
                  <span className="chore-name">{chore.name}</span>
                  <span className="chore-meta">
                    <span className="badge badge-period">{PERIODS.find(p => p.value === chore.period)?.label}</span>
                    <span className="badge badge-points">+{chore.points} pts</span>
                  </span>
                </div>
                <div className="chore-actions">
                  <button className="btn btn-complete" onClick={() => onComplete(chore)}>Complete ✓</button>
                  <button className="btn btn-icon" onClick={() => startEdit(chore)} title="Edit">✏️</button>
                  <button className="btn btn-icon btn-danger" onClick={() => deleteChore(chore.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unavailable.length > 0 && (
        <div className="chore-group">
          <h3 className="group-label muted">Completed / Cooldown ({unavailable.length})</h3>
          <div className="card-list">
            {unavailable.map(chore => {
              const next = nextAvailable(chore)
              return (
                <div key={chore.id} className="card chore-card unavailable">
                  <div className="chore-info">
                    <span className="chore-name muted">{chore.name}</span>
                    <span className="chore-meta">
                      <span className="badge badge-period">{PERIODS.find(p => p.value === chore.period)?.label}</span>
                      <span className="badge badge-points">+{chore.points} pts</span>
                      {next && <span className="badge badge-cooldown">Ready in {formatCountdown(next)}</span>}
                      {!next && <span className="badge badge-done">Done</span>}
                    </span>
                  </div>
                  <div className="chore-actions">
                    <button className="btn btn-icon" onClick={() => startEdit(chore)} title="Edit">✏️</button>
                    <button className="btn btn-icon btn-danger" onClick={() => deleteChore(chore.id)} title="Delete">🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
