'use client'

import { UseFormReturn, useFieldArray } from 'react-hook-form'
import { AmbassadorApplicationFormData, AMBASSADOR_ROLES, WEB3_EXPERIENCE_LEVELS } from '@/lib/ambassadorSchema'
import { Plus, Trash2 } from 'lucide-react'

interface RoleExperienceStepProps {
  form: UseFormReturn<AmbassadorApplicationFormData>
  disabled?: boolean
}

export default function RoleExperienceStep({ form, disabled }: RoleExperienceStepProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'previous_ambassador_programs',
  })

  const selectedRoles = watch('roles') || []
  const hasAmbassadorExperience = watch('has_ambassador_experience')

  const handleRoleChange = (roleValue: string, checked: boolean) => {
    if (checked) {
      setValue('roles', [...selectedRoles, roleValue], { shouldValidate: true })
    } else {
      setValue(
        'roles',
        selectedRoles.filter((r) => r !== roleValue),
        { shouldValidate: true }
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Which roles are you applying for? <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {AMBASSADOR_ROLES.map((role) => (
            <label key={role.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedRoles.includes(role.value)}
                onChange={(e) => handleRoleChange(role.value, e.target.checked)}
                disabled={disabled}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="text-sm text-gray-700">{role.label}</span>
            </label>
          ))}
        </div>
        {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Web3 Experience Level <span className="text-red-500">*</span>
        </label>
        <select
          {...register('web3_experience_level')}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-3 focus:ring-black disabled:bg-gray-100"
          disabled={disabled}
        >
          <option value="">Select your experience level</option>
          {WEB3_EXPERIENCE_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.web3_experience_level && (
          <p className="mt-1 text-sm text-red-600">{errors.web3_experience_level.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Have you been part of any ambassador programs before?
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="has_ambassador_experience"
              onChange={() => setValue('has_ambassador_experience', true, { shouldValidate: true })}
              checked={hasAmbassadorExperience === true}
              disabled={disabled}
              className="h-4 w-4 border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm text-gray-700">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="has_ambassador_experience"
              onChange={() => {
                setValue('has_ambassador_experience', false, { shouldValidate: true })
                setValue('previous_ambassador_programs', [])
              }}
              checked={hasAmbassadorExperience === false}
              disabled={disabled}
              className="h-4 w-4 border-gray-300 text-black focus:ring-black"
            />
            <span className="text-sm text-gray-700">No</span>
          </label>
        </div>
      </div>

      {hasAmbassadorExperience && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Previous Ambassador Programs
            </label>
            <button
              type="button"
              onClick={() => append({ project_name: '', role: '', duration: '', proof_links: [] })}
              disabled={disabled}
              className="flex items-center gap-1 text-sm text-black hover:text-gray-600 disabled:opacity-50"
            >
              <Plus size={16} />
              Add Program
            </button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="p-4 bg-white rounded-md border border-gray-200 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Program {index + 1}</span>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={disabled}
                  className="text-red-500 hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`previous_ambassador_programs.${index}.project_name`)}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-2 text-sm focus:ring-black disabled:bg-gray-100"
                  disabled={disabled}
                  placeholder="e.g., Sui Foundation"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`previous_ambassador_programs.${index}.role`)}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-2 text-sm focus:ring-black disabled:bg-gray-100"
                  disabled={disabled}
                  placeholder="e.g., Community Lead"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register(`previous_ambassador_programs.${index}.duration`)}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-2 text-sm focus:ring-black disabled:bg-gray-100"
                  disabled={disabled}
                  placeholder="e.g., 6 months"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Proof Links <span className="text-gray-400">(comma-separated URLs)</span>
                </label>
                <input
                  type="text"
                  onChange={(e) => {
                    const links = e.target.value.split(',').map((l) => l.trim()).filter(Boolean)
                    setValue(`previous_ambassador_programs.${index}.proof_links`, links)
                  }}
                  defaultValue={field.proof_links?.join(', ')}
                  className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-2 text-sm focus:ring-black disabled:bg-gray-100"
                  disabled={disabled}
                  placeholder="https://twitter.com/..., https://medium.com/..."
                />
              </div>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Click &quot;Add Program&quot; to add your previous ambassador experience
            </p>
          )}
        </div>
      )}

      <div>
        <label htmlFor="past_experience" className="block text-sm font-medium text-gray-700">
          Past Experience <span className="text-gray-400">(Other relevant experience)</span>
        </label>
        <textarea
          id="past_experience"
          rows={4}
          {...register('past_experience')}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-black p-3 focus:ring-black disabled:bg-gray-100"
          disabled={disabled}
          placeholder="Describe any other relevant experience in Web3, community building, content creation, etc."
        />
      </div>
    </div>
  )
}
