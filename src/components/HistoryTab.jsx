export default function HistoryTab({ history }) {
  if (history.length === 0) {
    return (
      <div className="tab-content">
        <div className="tab-toolbar">
          <h2 className="section-title">History</h2>
        </div>
        <div className="empty-state">
          <p>No activity yet. Complete a chore or redeem a reward to see history here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tab-content">
      <div className="tab-toolbar">
        <h2 className="section-title">History</h2>
        <span className="muted" style={{ fontSize: '14px' }}>{history.length} entries</span>
      </div>
      <div className="history-list">
        {history.map((entry, i) => (
          <div key={i} className={`history-entry ${entry.type}`}>
            <span className="history-icon">{entry.type === 'chore' ? '✅' : '🎁'}</span>
            <span className="history-label">{entry.label}</span>
            <span className="history-date">{formatDate(entry.date)}</span>
            <span className={`history-points ${entry.points > 0 ? 'gain' : 'spend'}`}>
              {entry.points > 0 ? `+${entry.points}` : entry.points} pts
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(iso) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}d ago`
  return d.toLocaleDateString()
}
