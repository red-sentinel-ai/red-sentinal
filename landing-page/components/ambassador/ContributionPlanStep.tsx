'use client'

import { UseFormReturn } from 'react-hook-form'
import { AmbassadorApplicationFormData } from '@/lib/ambassadorSchema'

interface ContributionPlanStepProps {
  form: UseFormReturn<AmbassadorApplicationFormData>
  disabled?: boolean
}

export default function ContributionPlanStep({ form, disabled }: ContributionPlanStepProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="why_become_ambassador" className="block text-2xl font-medium">
          Why do you want to become a Sui Sentinel Ambassador? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="why_become_ambassador"
          rows={5}
          {...register('why_become_ambassador')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="Tell us about your motivation and what drives you to join our ambassador program..."
        />
        {errors.why_become_ambassador && (
          <p className="mt-1 text-sm text-red-600">{errors.why_become_ambassador.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="first_30_days_plan" className="block text-2xl font-medium">
          What will you do for Sui Sentinel in your first 30 days? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="first_30_days_plan"
          rows={5}
          {...register('first_30_days_plan')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="Describe your action plan for the first 30 days as an ambassador..."
        />
        {errors.first_30_days_plan && (
          <p className="mt-1 text-sm text-red-600">{errors.first_30_days_plan.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="target_region_language_audience" className="block text-2xl font-medium">
          Which region / language / audience will you focus on? <span className="text-red-500">*</span>
        </label>
        <textarea
          id="target_region_language_audience"
          rows={3}
          {...register('target_region_language_audience')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="e.g., Southeast Asia, English and Vietnamese speaking developers and crypto enthusiasts"
        />
        {errors.target_region_language_audience && (
          <p className="mt-1 text-sm text-red-600">{errors.target_region_language_audience.message}</p>
        )}
      </div>
    </div>
  )
}
