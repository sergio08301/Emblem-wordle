import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { sendFeedback } from '../services/api'

export default function FeedbackModal({ onClose }) {
  const { user, token } = useAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return
    setStatus('loading')
    try {
      await sendFeedback(token, subject, message)
      setStatus('done')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-2xl p-8 w-full max-w-md relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>

        <h2 className="text-xl font-bold text-white mb-1">Send Feedback</h2>
        <p className="text-gray-400 text-sm mb-6">Share a bug, suggestion or anything you'd like the developer to know.</p>

        {!user ? (
          <div className="text-center py-6">
            <p className="text-gray-300 mb-4">Log in to your account to send feedback.</p>
            <Link
              to="/login"
              onClick={onClose}
              className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2 rounded-xl transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : status === 'done' ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-3">✅</p>
            <p className="text-gray-200 font-semibold">Feedback sent!</p>
            <p className="text-gray-400 text-sm mt-1">Thanks for taking the time.</p>
            <button onClick={onClose} className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm transition-colors">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                maxLength={200}
                placeholder="Bug report, suggestion…"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Message</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                placeholder="Describe the issue or your idea…"
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                disabled={status === 'loading'}
              />
            </div>
            {status === 'error' && <p className="text-red-400 text-sm">{errorMsg}</p>}
            <button
              type="submit"
              disabled={status === 'loading' || !subject.trim() || !message.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-xl transition-colors"
            >
              {status === 'loading' ? 'Sending…' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
