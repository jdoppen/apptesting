import { useState } from 'react'

const blankReward = { name: '', cost: 50 }

export default function RewardsTab({ rewards, points, onChange, onRedeem }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blankReward)
  const [editId, setEditId] = useState(null)
  const [redeemed, setRedeemed] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || form.cost < 1) return
    if (editId) {
      onChange(rewards.map(r => r.id === editId ? { ...r, ...form, cost: Number(form.cost) } : r))
      setEditId(null)
    } else {
      onChange([...rewards, { ...form, cost: Number(form.cost), id: crypto.randomUUID() }])
    }
    setForm(blankReward)
    setShowForm(false)
  }

  function startEdit(reward) {
    setForm({ name: reward.name, cost: reward.cost })
    setEditId(reward.id)
    setShowForm(true)
  }

  function deleteReward(id) {
    onChange(rewards.filter(r => r.id !== id))
  }

  function cancelForm() {
    setForm(blankReward)
    setEditId(null)
    setShowForm(false)
  }

  function handleRedeem(reward) {
    onRedeem(reward)
    setRedeemed(reward.id)
    setTimeout(() => setRedeemed(null), 1500)
  }

  const affordable = rewards.filter(r => r.cost <= points)
  const unaffordable = rewards.filter(r => r.cost > points)

  return (
    <div className="tab-content">
      <div className="tab-toolbar">
        <h2 className="section-title">Rewards</h2>
        <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditId(null); setForm(blankReward) }}>
          + Add Reward
        </button>
      </div>

      {showForm && (
        <form className="card form-card" onSubmit={handleSubmit}>
          <h3 className="form-title">{editId ? 'Edit Reward' : 'New Reward'}</h3>
          <div className="form-row">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. 30 min screen time"
              required
            />
          </div>
          <div className="form-row">
            <label className="form-label">Cost (pts)</label>
            <input
              className="form-input"
              type="number"
              min="1"
              value={form.cost}
              onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
              required
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">{editId ? 'Save' : 'Add'}</button>
            <button type="button" className="btn btn-ghost" onClick={cancelForm}>Cancel</button>
          </div>
        </form>
      )}

      {rewards.length === 0 && !showForm && (
        <div className="empty-state">
          <p>No rewards yet. Add something to work towards!</p>
        </div>
      )}

      {affordable.length > 0 && (
        <div className="chore-group">
          <h3 className="group-label">Affordable ({affordable.length})</h3>
          <div className="card-list">
            {affordable.map(reward => (
              <div key={reward.id} className={`card reward-card affordable${redeemed === reward.id ? ' flash' : ''}`}>
                <div className="chore-info">
                  <span className="chore-name">{reward.name}</span>
                  <span className="chore-meta">
                    <span className="badge badge-cost">⭐ {reward.cost} pts</span>
                  </span>
                </div>
                <div className="chore-actions">
                  <button
                    className="btn btn-redeem"
                    onClick={() => handleRedeem(reward)}
                    disabled={redeemed === reward.id}
                  >
                    {redeemed === reward.id ? 'Redeemed! 🎉' : 'Redeem'}
                  </button>
                  <button className="btn btn-icon" onClick={() => startEdit(reward)} title="Edit">✏️</button>
                  <button className="btn btn-icon btn-danger" onClick={() => deleteReward(reward.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unaffordable.length > 0 && (
        <div className="chore-group">
          <h3 className="group-label muted">Need more points ({unaffordable.length})</h3>
          <div className="card-list">
            {unaffordable.map(reward => (
              <div key={reward.id} className="card reward-card unaffordable">
                <div className="chore-info">
                  <span className="chore-name muted">{reward.name}</span>
                  <span className="chore-meta">
                    <span className="badge badge-cost">⭐ {reward.cost} pts</span>
                    <span className="badge badge-need">Need {reward.cost - points} more</span>
                  </span>
                </div>
                <div className="chore-actions">
                  <button className="btn btn-icon" onClick={() => startEdit(reward)} title="Edit">✏️</button>
                  <button className="btn btn-icon btn-danger" onClick={() => deleteReward(reward.id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
