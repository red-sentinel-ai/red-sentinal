'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export const FeedbackForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [feedbackType, setFeedbackType] = useState('Suggestion')
  const [message, setMessage] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message) {
      setError('A feedback message is required.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || undefined,
          email: email || undefined,
          feedback_type: feedbackType,
          message: message,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to submit feedback')
      }

      setIsSuccess(true)
      setTimeout(() => {
        onSuccess()
        setIsSuccess(false)
        setName('')
        setEmail('')
        setMessage('')
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
        <h3 className="text-xl font-bold text-black">Thank You!</h3>
        <p className="text-gray-600">Your feedback has been submitted.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Name (Optional)
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-black"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email (Optional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white p-2 text-black"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="feedbackType" className="text-sm font-medium text-gray-700">
          Feedback Type
        </label>
        <select
          id="feedbackType"
          value={feedbackType}
          onChange={e => setFeedbackType(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-black"
        >
          <option>Suggestion</option>
          <option>Bug Report</option>
          <option>Other</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="message" className="text-sm font-medium text-gray-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-gray-300 bg-white p-2 text-black"
          placeholder="How can we improve?"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-100 p-2 text-sm text-red-600">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-black flex w-full items-center justify-center"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Feedback'}
      </button>
    </form>
  )
}
