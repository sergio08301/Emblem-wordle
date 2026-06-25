import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBarracks, setCharacterSlot } from '../services/api'

const XP_PER_LEVEL = 100
const MAX_LEVEL = 20
const MAX_DEPLOYMENT = 10

function CharacterCard({ char, onToggleSlot, loading, deploymentFull }) {
  const isDeployed = char.slot === 'deployment'
  const canDeploy = isDeployed || !deploymentFull
  const isMaxLevel = char.level >= MAX_LEVEL

  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      {char.character_portrait_url
        ? <img src={char.character_portrait_url} alt={char.character_name} style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
        : <div style={{ width: 56, height: 56, borderRadius: 6, background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{char.character_name[0]}</div>
      }

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 'bold', color: '#f1f5f9', fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{char.character_name}</span>
          <span style={{ background: '#1d4ed8', color: '#bfdbfe', fontSize: 11, fontWeight: 'bold', padding: '1px 6px', borderRadius: 99, flexShrink: 0 }}>
            Lv.{char.level}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ flex: 1, height: 6, background: '#374151', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: isMaxLevel ? '100%' : `${char.xp}%`,
              background: isMaxLevel ? '#f59e0b' : '#22c55e',
              borderRadius: 99,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ color: '#94a3b8', fontSize: 11, flexShrink: 0 }}>
            {isMaxLevel ? 'MAX' : `${char.xp}/${XP_PER_LEVEL}`}
          </span>
        </div>
      </div>

      <button
        onClick={() => canDeploy && onToggleSlot(char.character_id, isDeployed ? 'bench' : 'deployment')}
        disabled={loading || !canDeploy}
        title={!canDeploy ? `Deployment full (${MAX_DEPLOYMENT} max)` : undefined}
        style={{
          padding: '4px 10px',
          fontSize: 12,
          fontWeight: 'bold',
          borderRadius: 6,
          border: 'none',
          cursor: loading || !canDeploy ? 'not-allowed' : 'pointer',
          opacity: loading || !canDeploy ? 0.35 : 1,
          background: isDeployed ? '#7f1d1d' : '#14532d',
          color: isDeployed ? '#fca5a5' : '#86efac',
          flexShrink: 0,
        }}
      >
        {isDeployed ? 'Bench' : 'Deploy'}
      </button>
    </div>
  )
}

function Section({ title, chars, onToggleSlot, loadingId, emptyText, deploymentFull, maxDeployment }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}{' '}
        <span style={{ color: '#64748b', fontWeight: 'normal' }}>
          ({chars.length}{maxDeployment ? `/${maxDeployment}` : ''})
        </span>
        {deploymentFull && (
          <span style={{ marginLeft: 8, fontSize: 11, color: '#f87171', fontWeight: 'normal', textTransform: 'none' }}>Full</span>
        )}
      </h2>
      {chars.length === 0
        ? <p style={{ color: '#475569', fontSize: 14 }}>{emptyText}</p>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {chars.map(c => (
              <CharacterCard key={c.character_id} char={c} onToggleSlot={onToggleSlot} loading={loadingId === c.character_id} deploymentFull={deploymentFull} />
            ))}
          </div>
      }
    </div>
  )
}

export default function Barracks() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [deployment, setDeployment] = useState([])
  const [bench, setBench] = useState([])
  const [loadingId, setLoadingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    getBarracks(token)
      .then(data => { setDeployment(data.deployment); setBench(data.bench) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user])

  async function handleToggleSlot(characterId, newSlot) {
    setLoadingId(characterId)
    try {
      const updated = await setCharacterSlot(token, characterId, newSlot)
      setDeployment(prev => prev.filter(c => c.character_id !== characterId))
      setBench(prev => prev.filter(c => c.character_id !== characterId))
      if (updated.slot === 'deployment') setDeployment(prev => [...prev, updated])
      else setBench(prev => [...prev, updated])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingId(null)
    }
  }

  if (loading) return (
    <div style={{ color: '#94a3b8', display: 'flex', justifyContent: 'center', paddingTop: 80 }}>Loading...</div>
  )

  return (
    <div style={{ color: 'white', maxWidth: 1600, margin: '0 auto', padding: '24px 24px' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>Barracks</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            to="/"
            style={{ padding: '6px 16px', background: '#374151', borderRadius: 8, color: '#d1d5db', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Daily
          </Link>
          <Link
            to="/infinite"
            style={{ padding: '6px 16px', background: '#5b21b6', borderRadius: 8, color: '#e9d5ff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            Infinite Mode
          </Link>
        </div>
      </div>

      <p style={{ color: '#94a3b8', marginBottom: 28, fontSize: 14 }}>
        Deployed characters earn XP with each daily victory. Up to {XP_PER_LEVEL} XP per win, split equally among deployed units.
      </p>

      {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}

      <Section
        title="Deployment"
        chars={deployment}
        onToggleSlot={handleToggleSlot}
        loadingId={loadingId}
        emptyText="No units deployed. Move characters here to earn XP."
        deploymentFull={deployment.length >= MAX_DEPLOYMENT}
        maxDeployment={MAX_DEPLOYMENT}
      />
      <Section
        title="Bench"
        chars={bench}
        onToggleSlot={handleToggleSlot}
        loadingId={loadingId}
        emptyText="No characters on the bench. Win the daily challenge to recruit new units."
        deploymentFull={deployment.length >= MAX_DEPLOYMENT}
      />
    </div>
  )
}
