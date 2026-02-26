'use client'

import { UseFormReturn } from 'react-hook-form'
import { AmbassadorApplicationFormData } from '@/lib/ambassadorSchema'

interface Web3IdentityStepProps {
  form: UseFormReturn<AmbassadorApplicationFormData>
  disabled?: boolean
}

export default function Web3IdentityStep({ form, disabled }: Web3IdentityStepProps) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="sui_wallet_address" className="block text-2xl font-medium">
          Sui Wallet Address <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="text"
          id="sui_wallet_address"
          {...register('sui_wallet_address')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="0x..."
        />
      </div>

      <div>
        <label htmlFor="twitter_url" className="block text-2xl font-medium">
          X (Twitter) Profile URL
        </label>
        <input
          type="url"
          id="twitter_url"
          {...register('twitter_url')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="https://twitter.com/username"
        />
        {errors.twitter_url && (
          <p className="mt-1 text-sm text-red-600">{errors.twitter_url.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="github_url" className="block text-2xl font-medium">
          GitHub Profile <span className="text-gray-400">(Optional)</span>
        </label>
        <input
          type="url"
          id="github_url"
          {...register('github_url')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="https://github.com/username"
        />
        {errors.github_url && (
          <p className="mt-1 text-sm text-red-600">{errors.github_url.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="other_web3_profiles" className="block text-2xl font-medium">
          Other Web3 Profiles <span className="text-gray-400">(Medium / Substack / YouTube / TikTok)</span>
        </label>
        <textarea
          id="other_web3_profiles"
          rows={3}
          {...register('other_web3_profiles')}
          className="mt-1 block w-full rounded-md border border-[#5E5E5E] bg-white min-h-16 focus:border-black p-3 text-xl"
          disabled={disabled}
          placeholder="Enter your profile URLs, one per line"
        />
      </div>
    </div>
  )
}
