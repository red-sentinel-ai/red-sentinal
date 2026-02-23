'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, Building2, User, Mail, MessageSquare, Users } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const demoRequestSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  last_name: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  company_name: z.string().min(1, 'Company name is required').max(200, 'Company name is too long'),
  message: z.string().max(2000, 'Message is too long').optional(),
  join_beta: z.boolean().optional().default(false),
})

type DemoRequestFormData = {
  first_name: string
  last_name: string
  email: string
  company_name: string
  message?: string
  join_beta?: boolean
}

type FormState = 'form' | 'submitting' | 'success' | 'error'

export function DemoRequestContent() {
  const [formState, setFormState] = useState<FormState>('form')
  const [errorMessage, setErrorMessage] = useState('')

  const form = useForm<DemoRequestFormData>({
    resolver: zodResolver(demoRequestSchema),
    mode: 'onBlur',
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      company_name: '',
      message: '',
      join_beta: false,
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = form

  const onSubmit = async (data: DemoRequestFormData) => {
    setFormState('submitting')
    setErrorMessage('')

    try {
      const response = await fetch('/api/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit demo request')
      }

      setFormState('success')
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred')
      setFormState('error')
    }
  }

  // Success state
  if (formState === 'success') {
    return (
      <div className="min-h-screen bg-[#F7F9FF] text-black">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>

        <div className="relative z-10">
          {/* Banner */}
          <div
            className="min-h-[300px] md:min-h-[400px] bg-no-repeat bg-top flex items-end pb-16 justify-center text-center bg-cover"
            style={{
              backgroundImage: 'url("/img/bannerImage.png")',
            }}
          >
            <div className="text-white max-w-4xl mx-auto px-4">
              <h1 className="text-2xl md:text-5xl font-bold">
                Enterprise AI Security
                <br />
                Demo Request
              </h1>
            </div>
          </div>

          <div className="max-w-2xl mx-auto my-16 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
              <h2 className="text-3xl font-bold mt-6 mb-2">Request Submitted!</h2>
              <p className="text-lg text-gray-700 mb-6">
                Thank you for your interest in Sui Sentinel Enterprise. Our team will reach out
                within 24-48 hours to schedule your personalized demo.
              </p>
              <p className="text-gray-600 mb-8">
                We&apos;ve sent a confirmation email to <strong>{watch('email')}</strong>.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center align-middle">
                <Link href="/" className="btn btn-black px-8 inline-flex items-center justify-center">
                  Back to Home
                </Link>
                <Link href="/red-teaming" className="btn btn-outline px-8 inline-flex items-center justify-center">
                  Learn About Red Teaming
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F9FF] text-black">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="relative z-10">
        {/* Banner */}
        <div
          className="min-h-[300px] md:min-h-[500px] bg-no-repeat bg-top flex items-end pb-12 justify-center text-center bg-cover"
          style={{
            backgroundImage: 'url("/img/bannerImage.png")',
          }}
        >
          <div className="text-white max-w-4xl mx-auto px-4">
            <h1 className="text-2xl md:text-5xl font-bold leading-snug">
              Enterprise AI Security
              <br />
              Demo Request
            </h1>
            <p className="mt-4 text-lg text-white/80">
              See how Sui Sentinel can secure your AI agents with crowdsourced red teaming
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto my-8 px-4 md:px-8">
          <Link
            href="/"
            className="font-medium mb-8 inline-block hover:text-[#C871FF] transition-colors"
          >
            ← Back to Home
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-8 md:p-12 border border-black"
            >
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-medium mb-2">
                  Book Your <span className="text-[#C871FF]">Demo</span>
                </h2>
                <p className="text-[#5F5C5C]">
                  Fill out the form below and our team will contact you to schedule a personalized
                  demonstration.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name Row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...register('first_name')}
                        type="text"
                        id="first_name"
                        placeholder="John"
                        disabled={formState === 'submitting'}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.first_name ? 'border-red-500' : 'border-black'
                        } focus:outline-none focus:ring-2 focus:ring-[#C871FF] disabled:bg-gray-100`}
                      />
                    </div>
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...register('last_name')}
                        type="text"
                        id="last_name"
                        placeholder="Doe"
                        disabled={formState === 'submitting'}
                        className={`w-full pl-10 pr-4 py-3 border ${
                          errors.last_name ? 'border-red-500' : 'border-black'
                        } focus:outline-none focus:ring-2 focus:ring-[#C871FF] disabled:bg-gray-100`}
                      />
                    </div>
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('email')}
                      type="email"
                      id="email"
                      placeholder="john@company.com"
                      disabled={formState === 'submitting'}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.email ? 'border-red-500' : 'border-black'
                      } focus:outline-none focus:ring-2 focus:ring-[#C871FF] disabled:bg-gray-100`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Company Name */}
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      {...register('company_name')}
                      type="text"
                      id="company_name"
                      placeholder="Acme Corporation"
                      disabled={formState === 'submitting'}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.company_name ? 'border-red-500' : 'border-black'
                      } focus:outline-none focus:ring-2 focus:ring-[#C871FF] disabled:bg-gray-100`}
                    />
                  </div>
                  {errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      {...register('message')}
                      id="message"
                      rows={4}
                      placeholder="Tell us about your AI security needs, use cases, or any specific questions..."
                      disabled={formState === 'submitting'}
                      className={`w-full pl-10 pr-4 py-3 border ${
                        errors.message ? 'border-red-500' : 'border-black'
                      } focus:outline-none focus:ring-2 focus:ring-[#C871FF] disabled:bg-gray-100 resize-none`}
                    />
                  </div>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {watch('message')?.length || 0}/2000
                  </p>
                </div>

                {/* Beta Checkbox */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      {...register('join_beta')}
                      type="checkbox"
                      disabled={formState === 'submitting'}
                      className="mt-1 w-5 h-5 border border-black rounded focus:ring-[#C871FF] text-[#C871FF] disabled:bg-gray-100"
                    />
                    <div className="flex-1">
                      <span className="font-medium">Join our beta testing community</span>
                      <p className="text-sm text-[#5F5C5C] mt-1">
                        Get early access to new features and help shape the future of AI security
                      </p>
                    </div>
                    <Users className="w-5 h-5 text-[#C871FF] shrink-0" />
                  </label>
                </div>

                {/* Error Message */}
                {(errorMessage || formState === 'error') && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 rounded-md"
                  >
                    <p className="text-sm text-red-600">
                      {errorMessage || 'Something went wrong. Please try again.'}
                    </p>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={formState === 'submitting'}
                  className="w-full btn btn-black py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {formState === 'submitting' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Request Demo'
                  )}
                </button>

                <p className="text-center text-sm text-[#5F5C5C]">
                  By submitting this form, you agree to our{' '}
                  <Link href="/privacy-policy" className="text-[#C871FF] hover:underline">
                    Privacy Policy
                  </Link>{' '}
                  and consent to being contacted about Sui Sentinel products and services.
                </p>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
