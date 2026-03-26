import { useEffect } from 'react'
import { SESSION_KEYS } from '@/constants'
import type { DefendFormData } from './useDefendForm'

interface UseTemplateLoaderOptions {
  setFormData: React.Dispatch<React.SetStateAction<DefendFormData>>
  countTokens: (text: string) => void
  countPrivateTokens: (text: string) => void
  countAttackGoalTokens: (text: string) => void
  countJuryPromptTokens: (text: string) => void
}

export function useTemplateLoader({
  setFormData,
  countTokens,
  countPrivateTokens,
  countAttackGoalTokens,
  countJuryPromptTokens,
}: UseTemplateLoaderOptions) {
  useEffect(() => {
    const templateData = sessionStorage.getItem(SESSION_KEYS.SELECTED_TEMPLATE)
    const savedFormData = sessionStorage.getItem(SESSION_KEYS.DEFEND_FORM_DATA)

    if (templateData) {
      try {
        const template = JSON.parse(templateData)
        const fields: Partial<DefendFormData> = {}

        if (template.public_instructions) fields.systemPrompt = template.public_instructions
        else if (template.prompt) fields.systemPrompt = template.prompt
        if (template.hidden_instructions) fields.privatePrompt = template.hidden_instructions
        if (template.attack_goal) fields.attackGoal = template.attack_goal
        if (template.jury_prompt) fields.juryPrompt = template.jury_prompt
        if (template.name) fields.agentName = template.name

        if (savedFormData) {
          const parsed = JSON.parse(savedFormData)
          setFormData({ ...parsed, ...fields })
          sessionStorage.removeItem(SESSION_KEYS.DEFEND_FORM_DATA)
        } else {
          setFormData(prev => ({ ...prev, ...fields }))
        }

        if (fields.systemPrompt) countTokens(fields.systemPrompt)
        if (fields.privatePrompt) countPrivateTokens(fields.privatePrompt)
        if (fields.attackGoal) countAttackGoalTokens(fields.attackGoal)
        if (fields.juryPrompt) countJuryPromptTokens(fields.juryPrompt)

        sessionStorage.removeItem(SESSION_KEYS.SELECTED_TEMPLATE)
      } catch (error) {
        console.error('Failed to load template:', error)
      }
    } else if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData)
        setFormData(parsed)
        if (parsed.systemPrompt) countTokens(parsed.systemPrompt)
        sessionStorage.removeItem(SESSION_KEYS.DEFEND_FORM_DATA)
      } catch (error) {
        console.error('Failed to restore form data:', error)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
