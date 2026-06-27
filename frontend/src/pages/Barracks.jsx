import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getBarracks, setCharacterSlot } from '../services/api'
import { getLordId, setLordId } from '../utils/lordStorage'

const XP_PER_LEVEL = 100
const MAX_LEVEL = 20
const MAX_DEPLOYMENT = 10

function sortWithLordFirst(chars, lordId) {
  if (!lordId) return chars
  return [...chars].sort((a, b) => {
    if (a.character_id === lordId) return -1
    if (b.character_id === lordId) return 1
    return 0
  })
}

function CharacterCard({ char, isLord, onToggleSlot, onDesignateLord, loading, deploymentFull }) {
  const isDeployed = char.slot === 'deployment'
  const canDeploy = isDeployed || !deploymentFull
  const isMaxLevel = char.level >= MAX_LEVEL

  return (
    <div style={{ position: 'relative', background: '#1e293b', border: `1px solid ${isLord ? '#f59e0b' : '#334155'}`, borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', gap: '14px' }}>
      {isLord && (
        <span style={{ position: 'absolute', top: -12, left: 42, transform: 'translateX(-50%)', fontSize: 18, lineHeight: 1 }} title="Lord">👑</span>
      )}

      <div style={{ position: 'relative', flexShrink: 0 }}>
        {char.character_portrait_url
          ? <img src={char.character_portrait_url} alt={char.character_name} style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover', display: 'block' }} />
          : <div style={{ width: 56, height: 56, borderRadius: 6, background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{char.character_name[0]}</div>
        }
      </div>

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
        {isDeployed && !isLord && (
          <button
            onClick={() => onDesignateLord(char.character_id)}
            disabled={loading}
            title="Designate as Lord"
            style={{
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 'bold',
              borderRadius: 6,
              border: '1px solid #78350f',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              background: '#1c1008',
              color: '#fcd34d',
              whiteSpace: 'nowrap',
            }}
          >
            👑 Lord
          </button>
        )}
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
          }}
        >
          {isDeployed ? 'Bench' : 'Deploy'}
        </button>
      </div>
    </div>
  )
}

const CARD_MIN = 300
const CARD_GAP = 12

function DeploymentSection({ chars, lordId, onToggleSlot, onDesignateLord, loadingId, deploymentFull }) {
  const gridMaxWidth = chars.length > 0
    ? chars.length * CARD_MIN + (chars.length - 1) * CARD_GAP
    : undefined

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Deployment{' '}
        <span style={{ color: '#64748b', fontWeight: 'normal' }}>({chars.length}/{MAX_DEPLOYMENT})</span>
        {deploymentFull && (
          <span style={{ marginLeft: 8, fontSize: 11, color: '#f87171', fontWeight: 'normal', textTransform: 'none' }}>Full</span>
        )}
      </h2>
      {chars.length === 0
        ? (
          <div style={{ border: '1px dashed #334155', borderRadius: 12, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#475569' }}>
            <span style={{ fontSize: 28 }}>⚔️</span>
            <p style={{ fontSize: 14, textAlign: 'center' }}>No units deployed. Move characters from the bench to earn XP on each daily win.</p>
          </div>
        )
        : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${CARD_MIN}px, 1fr))`, gap: CARD_GAP, maxWidth: gridMaxWidth }}>
            {chars.map(c => (
              <CharacterCard
                key={c.character_id}
                char={c}
                isLord={c.character_id === lordId}
                onToggleSlot={onToggleSlot}
                onDesignateLord={onDesignateLord}
                loading={loadingId === c.character_id}
                deploymentFull={deploymentFull}
              />
            ))}
          </div>
        )
      }
    </div>
  )
}

function BenchSection({ chars, onToggleSlot, loadingId, deploymentFull }) {
  const gridMaxWidth = chars.length > 0
    ? chars.length * CARD_MIN + (chars.length - 1) * CARD_GAP
    : undefined

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ color: '#cbd5e1', fontWeight: 'bold', fontSize: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Bench{' '}
        <span style={{ color: '#64748b', fontWeight: 'normal' }}>({chars.length})</span>
      </h2>
      {chars.length === 0
        ? (
          <div style={{ border: '1px dashed #334155', borderRadius: 12, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#475569' }}>
            <span style={{ fontSize: 28 }}>🏰</span>
            <p style={{ fontSize: 14, textAlign: 'center' }}>No characters yet. Win the daily challenge to recruit new units to your army.</p>
          </div>
        )
        : (
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${CARD_MIN}px, 1fr))`, gap: CARD_GAP, maxWidth: gridMaxWidth }}>
            {chars.map(c => (
              <CharacterCard
                key={c.character_id}
                char={c}
                isLord={false}
                onToggleSlot={onToggleSlot}
                onDesignateLord={null}
                loading={loadingId === c.character_id}
                deploymentFull={deploymentFull}
              />
            ))}
          </div>
        )
      }
    </div>
  )
}

export default function Barracks() {
  const { user, token, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [deployment, setDeployment] = useState([])
  const [bench, setBench] = useState([])
  const [lordId, setLordIdState] = useState(null)
  const [loadingId, setLoadingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    const savedLord = getLordId(user.id)
    getBarracks(token)
      .then(data => {
        const dep = data.deployment
        const effectiveLord = savedLord && dep.some(c => c.character_id === savedLord)
          ? savedLord
          : dep[0]?.character_id ?? null
        setLordIdState(effectiveLord)
        setDeployment(sortWithLordFirst(dep, effectiveLord))
        setBench(data.bench)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [user, authLoading])

  function handleDesignateLord(characterId) {
    setLordId(user.id, characterId)
    setLordIdState(characterId)
    setDeployment(prev => sortWithLordFirst(prev, characterId))
  }

  async function handleToggleSlot(characterId, newSlot) {
    setLoadingId(characterId)
    try {
      const updated = await setCharacterSlot(token, characterId, newSlot)
      setDeployment(prev => {
        const next = prev.filter(c => c.character_id !== characterId)
        if (updated.slot === 'deployment') return sortWithLordFirst([...next, updated], lordId)
        return next
      })
      setBench(prev => {
        const next = prev.filter(c => c.character_id !== characterId)
        if (updated.slot === 'bench') return [...next, updated]
        return next
      })
      // If the lord is benched, promote the new first deployed unit
      if (newSlot === 'bench' && characterId === lordId) {
        setDeployment(prev => {
          const newLord = prev[0]?.character_id ?? null
          setLordIdState(newLord)
          if (newLord) setLordId(user.id, newLord)
          return prev
        })
      }
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

      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 28, fontWeight: 'bold' }}>Barracks</h1>
      </div>

      <p style={{ color: '#94a3b8', marginBottom: 28, fontSize: 14 }}>
        Deployed characters earn XP with each daily victory. Up to {XP_PER_LEVEL} XP per win, split equally among deployed units.
      </p>

      {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}

      <DeploymentSection
        chars={deployment}
        lordId={lordId}
        onToggleSlot={handleToggleSlot}
        onDesignateLord={handleDesignateLord}
        loadingId={loadingId}
        deploymentFull={deployment.length >= MAX_DEPLOYMENT}
      />
      <BenchSection
        chars={bench}
        onToggleSlot={handleToggleSlot}
        loadingId={loadingId}
        deploymentFull={deployment.length >= MAX_DEPLOYMENT}
      />
    </div>
  )
}
