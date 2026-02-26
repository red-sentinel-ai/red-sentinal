import { z } from 'zod'

// Previous Ambassador Program schema
export const previousAmbassadorProgramSchema = z.object({
  project_name: z.string().min(1, 'Project name is required'),
  role: z.string().min(1, 'Role is required'),
  duration: z.string().min(1, 'Duration is required'),
  proof_links: z.array(z.string().url('Must be a valid URL')).optional(),
})

export type PreviousAmbassadorProgram = z.infer<typeof previousAmbassadorProgramSchema>

// Available roles
export const AMBASSADOR_ROLES = [
  { value: 'content_creator', label: 'Content Creator' },
  { value: 'community_manager', label: 'Community Manager' },
  { value: 'research_writer', label: 'Research / Writer' },
  { value: 'developer_technical', label: 'Developer / Technical' },
] as const

// Web3 experience levels
export const WEB3_EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
] as const

// Step 1: Basic Information
export const basicInfoSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  preferred_name: z.string().optional(),
  email: z.string().email('Please enter a valid email address'),
  country: z.string().min(1, 'Please select your country'),
  timezone: z.string().min(1, 'Please select your timezone'),
  telegram_username: z.string().optional(),
})

// Step 2: Web3 Identity
export const web3IdentitySchema = z.object({
  sui_wallet_address: z.string().optional(),
  twitter_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  github_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  other_web3_profiles: z.string().optional(),
})

// Step 3: Role & Experience
export const roleExperienceSchema = z.object({
  roles: z.array(z.string()).min(1, 'Please select at least one role'),
  web3_experience_level: z.enum(['beginner', 'intermediate', 'advanced', 'expert'], {
    message: 'Please select your Web3 experience level',
  }),
  has_ambassador_experience: z.boolean(),
  previous_ambassador_programs: z.array(previousAmbassadorProgramSchema).optional(),
  past_experience: z.string().optional(),
})

// Step 4: Contribution Plan
export const contributionPlanSchema = z.object({
  why_become_ambassador: z.string().min(50, 'Please provide at least 50 characters'),
  first_30_days_plan: z.string().min(50, 'Please provide at least 50 characters'),
  target_region_language_audience: z.string().min(10, 'Please provide at least 10 characters'),
})

// Step 5: Commitment & Agreement
export const commitmentSchema = z.object({
  weekly_availability: z.string().min(1, 'Please specify your weekly availability'),
  open_to_performance_rewards: z.boolean(),
  agreed_to_code_of_conduct: z
    .boolean()
    .refine((val) => val === true, { message: 'You must agree to the Code of Conduct' }),
})

// Full application schema
export const ambassadorApplicationSchema = z.object({
  ...basicInfoSchema.shape,
  ...web3IdentitySchema.shape,
  ...roleExperienceSchema.shape,
  ...contributionPlanSchema.shape,
  ...commitmentSchema.shape,
})

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
export type Web3IdentityFormData = z.infer<typeof web3IdentitySchema>
export type RoleExperienceFormData = z.infer<typeof roleExperienceSchema>
export type ContributionPlanFormData = z.infer<typeof contributionPlanSchema>
export type CommitmentFormData = z.infer<typeof commitmentSchema>
export type AmbassadorApplicationFormData = z.infer<typeof ambassadorApplicationSchema>

// Step schemas array for easy access
export const stepSchemas = [
  basicInfoSchema,
  web3IdentitySchema,
  roleExperienceSchema,
  contributionPlanSchema,
  commitmentSchema,
] as const

// Total steps count
export const TOTAL_STEPS = 5
