'use client'

import { UseFormReturn } from 'react-hook-form'
import { AmbassadorApplicationFormData } from '@/lib/ambassadorSchema'

interface CommitmentStepProps {
  form: UseFormReturn<AmbassadorApplicationFormData>
  disabled?: boolean
}

export default function CommitmentStep({ form, disabled }: CommitmentStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const openToRewards = watch('open_to_performance_rewards')

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="weekly_availability" className="block text-2xl font-medium">
          Weekly availability <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="weekly_availability"
          {...register('weekly_availability')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="e.g., 10-15 hours per week"
        />
        {errors.weekly_availability && (
          <p className="mt-1 text-2xl text-red-600">{errors.weekly_availability.message}</p>
        )}
      </div>

      <div>
        <label className="block text-2xl font-medium text-gray-700 mb-3">
          Open to performance-based rewards?
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="open_to_performance_rewards"
              checked={openToRewards === true}
              onChange={() => setValue('open_to_performance_rewards', true)}
              disabled={disabled}
              className="h-4 w-4 border-gray-300 text-black focus:ring-black"
            />
            <span className="text-2xl text-gray-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="open_to_performance_rewards"
              checked={openToRewards === false}
              onChange={() => setValue('open_to_performance_rewards', false)}
              disabled={disabled}
              className="h-4 w-4 border-gray-300 text-black focus:ring-black"
            />
            <span className="text-2xl text-gray-700">No</span>
          </label>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('agreed_to_code_of_conduct')}
            disabled={disabled}
            className="h-6 w-6 mt-1 rounded border-gray-300 text-black focus:ring-black"
          />
          <span className="text-2xl text-gray-700">
            I agree to the{' '}
            <a
              href="#"
              rel="noopener noreferrer"
              className="text-black underline hover:text-gray-600"
            >
              Code of Conduct
            </a>{' '}
            and understand my responsibilities as a Sui Sentinel Ambassador.{' '}
            <span className="text-red-500">*</span>
          </span>
        </label>
        {errors.agreed_to_code_of_conduct && (
          <p className="mt-1 text-2xl text-red-600">{errors.agreed_to_code_of_conduct.message}</p>
        )}
      </div>
    </div>
  )
}
