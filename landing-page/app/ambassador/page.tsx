'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { z } from 'zod'

import {
  AmbassadorApplicationFormData,
  TOTAL_STEPS,
  basicInfoSchema,
  web3IdentitySchema,
  roleExperienceSchema,
  contributionPlanSchema,
  commitmentSchema,
} from '@/lib/ambassadorSchema'
import { AMBASSADOR_INTRO_TEXT } from '@/constants/ambassador'
import {
  BasicInfoStep,
  Web3IdentityStep,
  RoleExperienceStep,
  ContributionPlanStep,
  CommitmentStep,
} from '@/components/ambassador'

type FormState = 'intro' | 'form' | 'submitting' | 'success' | 'error'

const STEP_TITLES = [
  'Basic Information',
  'Web3 Identity',
  'Role & Experience',
  'Contribution Plan',
  'Commitment & Agreement',
]

const stepSchemasList = [
  basicInfoSchema,
  web3IdentitySchema,
  roleExperienceSchema,
  contributionPlanSchema,
  commitmentSchema,
]

export default function AmbassadorPage() {
  return <AmbassadorPageContent />
}

function AmbassadorPageContent() {
  const [formState, setFormState] = useState<FormState>('intro')
  const [currentStep, setCurrentStep] = useState(1)
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  const form = useForm<AmbassadorApplicationFormData>({
    mode: 'onSubmit',
    defaultValues: {
      full_name: '',
      preferred_name: '',
      email: '',
      country: '',
      timezone: '',
      telegram_username: '',
      sui_wallet_address: '',
      twitter_url: '',
      github_url: '',
      other_web3_profiles: '',
      roles: [],
      web3_experience_level: undefined,
      has_ambassador_experience: false,
      previous_ambassador_programs: [],
      past_experience: '',
      why_become_ambassador: '',
      first_30_days_plan: '',
      target_region_language_audience: '',
      weekly_availability: '',
      open_to_performance_rewards: false,
      agreed_to_code_of_conduct: false,
    },
  })

  // Clear all form errors when step changes
  useEffect(() => {
    form.clearErrors()
  }, [currentStep, form])

  const validateCurrentStep = async () => {
    const currentSchema = stepSchemasList[currentStep - 1]
    const values = form.getValues()

    const fields = Object.keys(currentSchema.shape) as (keyof AmbassadorApplicationFormData)[]
    fields.forEach((field) => {
      form.clearErrors(field)
    })

    try {
      await currentSchema.parseAsync(values)
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as keyof AmbassadorApplicationFormData
          if (fieldName) {
            form.setError(fieldName, { type: 'manual', message: issue.message })
          }
        })
      }
      return false
    }
  }

  const handleStartApplication = () => {
    setFormState('form')
  }

  const checkExistingEmail = useCallback(async (email: string) => {
    if (!email || applicationId) return

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return

    setIsCheckingEmail(true)
    setErrorMessage('')

    try {
      const response = await fetch(`/api/ambassador?email=${encodeURIComponent(email)}`)
      const result = await response.json()

      if (result.isSubmitted) {
        setErrorMessage('An application has already been submitted with this email.')
        return
      }

      if (result.data) {
        setApplicationId(result.data.id)
        const existingData = result.data
        const currentValues = form.getValues()

        Object.keys(existingData).forEach((key) => {
          if (key in currentValues && existingData[key] !== null) {
            form.setValue(key as keyof AmbassadorApplicationFormData, existingData[key])
          }
        })

        const savedStep = existingData.current_step || 1
        setCurrentStep(savedStep)
      }
    } catch (err) {
      console.error('Error checking email:', err)
    } finally {
      setIsCheckingEmail(false)
    }
  }, [applicationId, form])

  const saveProgress = async (nextStep?: number, submit = false) => {
    setIsSaving(true)
    setErrorMessage('')

    try {
      const values = form.getValues()

      if (!applicationId) {
        // Create new application
        const response = await fetch('/api/ambassador', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...values,
            current_step: nextStep || currentStep,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save application')
        }

        setApplicationId(data.data.id)

        // If existing draft was found, populate form
        if (data.isExisting && data.data) {
          const existingData = data.data
          Object.keys(existingData).forEach((key) => {
            if (key in values && existingData[key] !== null) {
              form.setValue(key as keyof AmbassadorApplicationFormData, existingData[key])
            }
          })
          setCurrentStep(existingData.current_step || 1)
        }
      } else {
        // Update existing application
        const response = await fetch('/api/ambassador', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: applicationId,
            ...values,
            current_step: nextStep || currentStep,
            ...(submit && { status: 'submitted' }),
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to save application')
        }
      }

      if (nextStep) {
        setCurrentStep(nextStep)
      }

      if (submit) {
        setFormState('success')
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred')
      if (submit) {
        setFormState('error')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (!isValid) return

    if (currentStep < TOTAL_STEPS) {
      await saveProgress(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    const isValid = await validateCurrentStep()
    if (!isValid) return

    setFormState('submitting')
    await saveProgress(undefined, true)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            form={form}
            disabled={isSaving}
            onEmailBlur={checkExistingEmail}
            isCheckingEmail={isCheckingEmail}
          />
        )
      case 2:
        return <Web3IdentityStep form={form} disabled={isSaving} />
      case 3:
        return <RoleExperienceStep form={form} disabled={isSaving} />
      case 4:
        return <ContributionPlanStep form={form} disabled={isSaving} />
      case 5:
        return <CommitmentStep form={form} disabled={isSaving} />
      default:
        return null
    }
  }

  // Success state
  if (formState === 'success') {
    return (
      <div
        className="relative min-h-screen bg-white text-black bg-no-repeat"
        style={{
          backgroundImage: "url('/img/hero_bg.png')",
          backgroundSize: '100% auto',
        }}
      >
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>

        <div className="relative z-10">
          <div
            className="min-h-[300px] md:min-h-[400px] bg-no-repeat bg-top h-full flex items-end pb-16 justify-center text-center bg-cover lg:bg-size-[100%_auto]"
            style={{
              backgroundImage: 'url("/img/bannerImage.png")',
            }}
          >
            <div className="text-white max-w-4xl mx-auto px-4">
              <h1 className="text-2xl md:text-5xl font-bold">
                Red Sentinel Ambassador Program
                <br />
                Application
              </h1>
            </div>
          </div>

          <div className="max-w-2xl mx-auto my-16 px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle className="size-16 text-green-600 mx-auto" />
              <h2 className="text-3xl font-bold mt-6 mb-2">Application Submitted!</h2>
              <p className="text-lg text-gray-700 mb-6">
                Thank you for applying to become a Red Sentinel Ambassador. We&apos;ve received your
                application and will review it shortly.
              </p>
              <p className="text-gray-600 mb-8">
                You&apos;ll receive an email confirmation at the address you provided. We&apos;ll be in
                touch soon!
              </p>
              <Link href="/" className="btn btn-black text-2xl items-center justify-center flex">
                Back to Home
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative min-h-screen bg-white text-black bg-no-repeat"
      style={{
        backgroundImage: "url('/img/hero_bg.png')",
        backgroundSize: '100% auto',
      }}
    >
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="relative z-10">
        {/* Banner */}
        <div
          className="min-h-[300px] md:min-h-[500px] bg-no-repeat bg-top h-full flex items-end pb-12 justify-center text-center bg-cover lg:bg-size-[100%_auto]"
          style={{
            backgroundImage: 'url("/img/bannerImage.png")',
          }}
        >
          <div className="text-white max-w-4xl mx-auto px-4">
            <h1 className="text-2xl md:text-5xl font-bold leading-snug">
              Red Sentinel Ambassador Program
              <br />
              Application
            </h1>
          </div>
        </div>

        <div className="max-w-[1286px] mx-auto my-8 px-4 md:px-8">
          <Link href="/" className="font-medium mb-8 inline-block">
            ← Back to Home
          </Link>

          <AnimatePresence mode="wait">
            {formState === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <p className="leading-relaxed whitespace-pre-line mb-8 text-2xl">
                  {AMBASSADOR_INTRO_TEXT}
                </p>
                <button onClick={handleStartApplication} className="btn btn-black w-full md:w-auto text-2xl">
                  Apply Now
                </button>
              </motion.div>
            )}

            {(formState === 'form' || formState === 'submitting' || formState === 'error') && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Section {currentStep} of {TOTAL_STEPS}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-[32px] font-medium mb-6">
                    Section {currentStep}: {STEP_TITLES[currentStep - 1]}
                  </h2>

                  <form onSubmit={(e) => e.preventDefault()}>
                    {renderStep()}

                    {errorMessage && (
                      <p className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        {errorMessage}
                      </p>
                    )}

                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
                      <div>
                        {currentStep > 1 && (
                          <button
                            type="button"
                            onClick={handleBack}
                            disabled={isSaving || formState === 'submitting'}
                            className="btn btn-outline flex items-center gap-2 justify-center min-w-[220px] text-2xl"
                          >
                            <ArrowLeft size={24} />
                            Back
                          </button>
                        )}
                      </div>

                      <div className="flex gap-4">
                        {currentStep < TOTAL_STEPS ? (
                          <button
                            type="button"
                            onClick={handleNext}
                            disabled={isSaving}
                            className="btn btn-black flex items-center justify-center min-w-[220px] text-2xl"
                          >
                            {isSaving ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              'Save and Next'
                            )}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSaving || formState === 'submitting'}
                            className="btn btn-black flex items-center justify-center min-w-[220px] text-2xl"
                          >
                            {formState === 'submitting' || isSaving ? (
                              <Loader2 size={20} className="animate-spin" />
                            ) : (
                              'Submit'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
