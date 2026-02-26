'use client'

import { UseFormReturn } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { AmbassadorApplicationFormData } from '@/lib/ambassadorSchema'
import { COUNTRIES, TIMEZONES } from '@/constants/ambassador'

interface BasicInfoStepProps {
  form: UseFormReturn<AmbassadorApplicationFormData>
  disabled?: boolean
  onEmailBlur?: (email: string) => void
  isCheckingEmail?: boolean
}

export default function BasicInfoStep({
  form,
  disabled,
  onEmailBlur,
  isCheckingEmail,
}: BasicInfoStepProps) {
  const {
    register,
    formState: { errors },
  } = form

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value.trim()
    if (email && onEmailBlur) {
      onEmailBlur(email)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="full_name" className="block text-2xl font-medium">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="full_name"
          {...register('full_name')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl text-xl"  
          disabled={disabled}
          placeholder="John Doe"
        />
        {errors.full_name && (
          <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="preferred_name" className="block text-2xl font-medium">
          Preferred Name / Nickname
        </label>
        <input
          type="text"
          id="preferred_name"
          {...register('preferred_name')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="Johnny"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-2xl font-medium">
          Email Address <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            {...register('email')}
            onBlur={handleEmailBlur}
            className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
            disabled={disabled || isCheckingEmail}
            placeholder="john@example.com"
          />
          {isCheckingEmail && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="size-5 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="country" className="block text-2xl font-medium">
          Country <span className="text-red-500">*</span>
        </label>
        <select
          id="country"
          {...register('country')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
        >
          <option value="">Select your country</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>}
      </div>

      <div>
        <label htmlFor="timezone" className="block text-2xl font-medium">
          Time Zone <span className="text-red-500">*</span>
        </label>
        <select
          id="timezone"
          {...register('timezone')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
        >
          <option value="">Select your timezone</option>
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
        {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>}
      </div>

      <div>
        <label htmlFor="telegram_username" className="block text-2xl font-medium">
          Telegram Username
        </label>
        <input
          type="text"
          id="telegram_username"
          {...register('telegram_username')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="@username"
        />
      </div>
    </div>
  )
}
