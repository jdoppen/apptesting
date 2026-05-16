import { useState, useEffect } from 'react'
import ChoresTab from './components/ChoresTab'
import RewardsTab from './components/RewardsTab'
import HistoryTab from './components/HistoryTab'
import './App.css'

const STORAGE_KEY = 'chore-tracker-data'

const defaultData = {
  points: 0,
  chores: [],
  rewards: [],
  history: [],
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData
  } catch {
    return defaultData
  }
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [tab, setTab] = useState('chores')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  function completeChore(chore) {
    const now = new Date().toISOString()
    setData(prev => ({
      ...prev,
      points: prev.points + chore.points,
      chores: prev.chores.map(c =>
        c.id === chore.id ? { ...c, lastCompleted: now } : c
      ),
      history: [
        { type: 'chore', label: chore.name, points: chore.points, date: now },
        ...prev.history,
      ].slice(0, 300),
    }))
  }

  function redeemReward(reward) {
    if (data.points < reward.cost) return
    const now = new Date().toISOString()
    setData(prev => ({
      ...prev,
      points: prev.points - reward.cost,
      history: [
        { type: 'reward', label: reward.name, points: -reward.cost, date: now },
        ...prev.history,
      ].slice(0, 300),
    }))
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Chore Tracker</h1>
        <div className="points-badge">
          <span className="points-star">⭐</span>
          <span className="points-num">{data.points}</span>
          <span className="points-label">pts</span>
        </div>
      </header>

      <nav className="tab-nav">
        {[
          { key: 'chores', label: '✅ Chores' },
          { key: 'rewards', label: '🎁 Rewards' },
          { key: 'history', label: '📋 History' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`tab-btn${tab === key ? ' active' : ''}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {tab === 'chores' && (
          <ChoresTab
            chores={data.chores}
            onChange={chores => setData(prev => ({ ...prev, chores }))}
            onComplete={completeChore}
          />
        )}
        {tab === 'rewards' && (
          <RewardsTab
            rewards={data.rewards}
            points={data.points}
            onChange={rewards => setData(prev => ({ ...prev, rewards }))}
            onRedeem={redeemReward}
          />
        )}
        {tab === 'history' && <HistoryTab history={data.history} />}
      </main>
    </div>
  )
}
