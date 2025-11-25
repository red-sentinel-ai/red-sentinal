'use client'

import { useState, FormEvent, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const jobOpenings = [
  {
    title: 'Frontend Developer',
    slug: 'frontend-developer',
  },
  {
    title: 'Web Designer',
    slug: 'web-designer',
  },
]

type FormState = 'idle' | 'submitting' | 'success' | 'error'

export default function JobApplicationPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [githubLink, setGithubLink] = useState('')
  const [resume, setResume] = useState<File | null>(null)
  const [interestNotes, setInterestNotes] = useState('')
  const [availabilityNotes, setAvailabilityNotes] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  useEffect(() => {
    const job = jobOpenings.find((j) => j.slug === slug)
    if (job) {
      setJobTitle(job.title)
    } else if (slug) {
      // Handle case where job slug is invalid
      setErrorMessage('Invalid job position.')
      setFormState('error')
    }
  }, [slug])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!resume) {
      setErrorMessage('A resume file is required.')
      return
    }
    setFormState('submitting')
    setErrorMessage('')

    const formData = new FormData()
    formData.append('job_title', jobTitle)
    formData.append('name', name)
    formData.append('email', email)
    formData.append('github_link', githubLink)
    formData.append('resume', resume)
    formData.append('interest_notes', interestNotes)
    formData.append('availability_notes', availabilityNotes)

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit application.')
      }

      setFormState('success')
      setTimeout(() => {
        router.push('/careers')
      }, 3000)
    } catch (err) {
      setFormState('error')
      if (err instanceof Error) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('An unknown error occurred.')
      }
    }
  }

  if (formState === 'success') {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen text-center py-24 pt-48 px-4 bg-no-repeat"
        style={{
          backgroundImage: "url('/img/hero_bg.png')",
          backgroundSize: '100% auto',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <CheckCircle className="size-16 text-green-600 mx-auto" />
          <h2 className="text-3xl font-bold mt-6 mb-2">Application Sent!</h2>
          <p className="text-lg text-gray-700">
            We&apos;ve received your application for {jobTitle}. Good luck!
          </p>
          <p className="text-gray-600 mt-2">Redirecting you back to careers...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <section
      className="py-24 pt-48 relative text-black min-h-screen bg-no-repeat"
      style={{
        backgroundImage: "url('/img/hero_bg.png')",
        backgroundSize: '100% auto',
      }}
    >
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-2">Apply for</h1>
          <p className="text-2xl md:text-3xl text-gray-700 mb-8">{jobTitle}</p>

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-3 focus:ring-black"
                disabled={formState === 'submitting'}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-3 focus:ring-black"
                disabled={formState === 'submitting'}
              />
            </div>

            <div>
              <label
                htmlFor="github_link"
                className="block text-sm font-medium text-gray-700"
              >
                GitHub Link (Optional)
              </label>
              <input
                type="url"
                id="github_link"
                value={githubLink}
                onChange={(e) => setGithubLink(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-3 focus:ring-black"
                disabled={formState === 'submitting'}
              />
            </div>

            <div>
              <label
                htmlFor="resume"
                className="block text-sm font-medium text-gray-700"
              >
                Resume (PDF, DOCX) *
              </label>
              <input
                type="file"
                id="resume"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResume(e.target.files ? e.target.files[0] : null)}
                required
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200"
                disabled={formState === 'submitting'}
              />
            </div>

            <div>
              <label
                htmlFor="interest_notes"
                className="block text-sm font-medium text-gray-700"
              >
                Why are you interested in this role? (Optional)
              </label>
              <textarea
                id="interest_notes"
                rows={4}
                value={interestNotes}
                onChange={(e) => setInterestNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-3 focus:ring-black"
                disabled={formState === 'submitting'}
              />
            </div>

            <div>
              <label
                htmlFor="availability_notes"
                className="block text-sm font-medium text-gray-700"
              >
                Can you overlap with GMT + 5:30 timezone? (Optional)
              </label>
              <textarea
                id="availability_notes"
                rows={2}
                value={availabilityNotes}
                onChange={(e) => setAvailabilityNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-3 focus:ring-black"
                disabled={formState === 'submitting'}
              />
            </div>

            {formState === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}

            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="btn btn-black w-full flex items-center justify-center"
                disabled={formState === 'submitting' || !jobTitle}
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
              <Link
                href="/careers"
                className="btn btn-outline w-full flex items-center justify-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
