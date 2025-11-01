'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'

type JobApplicationModalProps = {
  isOpen: boolean
  onClose: () => void
  jobTitle: string
}

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export function JobApplicationModal({ isOpen, onClose, jobTitle }: JobApplicationModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [portfolioLink, setPortfolioLink] = useState('')
  const [notes, setNotes] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const resetForm = () => {
    setName('')
    setEmail('')
    setPortfolioLink('')
    setNotes('')
    setFormState('idle')
    setErrorMessage('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormState('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: jobTitle,
          name,
          email,
          portfolio_link: portfolioLink,
          notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit application.')
      }

      setFormState('success')
      setTimeout(handleClose, 2000) // Close modal after 2s on success
    } catch (err) {
      setFormState('error')
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('An unknown error occurred.')
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white w-full max-w-lg rounded-lg shadow-xl p-6 md:p-8 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-2">Apply for</h2>
            <p className="text-xl text-gray-700 mb-6">{jobTitle}</p>

            {formState === 'success' ? (
              <div className="text-center py-10">
                <h3 className="text-2xl font-semibold text-green-600">Application Sent!</h3>
                <p className="text-gray-600 mt-2">
                  We&apos;ve received your application. Good luck!
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="portfolio_link"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Portfolio / Resume Link (Optional)
                  </label>
                  <input
                    type="url"
                    id="portfolio_link"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>
                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>

                {formState === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}

                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn btn-black w-full flex items-center justify-center"
                    disabled={formState === 'submitting'}
                  >
                    {formState === 'submitting' ? (
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
