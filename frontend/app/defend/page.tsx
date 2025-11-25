/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CameraIcon, ChevronLeft, Loader2 } from 'lucide-react'
import { toast } from 'react-toastify'
import posthog from 'posthog-js'
import { Transaction } from '@mysten/sui/transactions'
import { SuiTransactionBlockResponse } from '@mysten/sui/client'
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from '@mysten/dapp-kit'
import {
  MIST_PER_SUI,
  SENTINEL_GIFS,
  SENTINEL_IMAGES,
  SUI_CONFIG,
  SUI_SENTINEL_DOCS_URL,
  SYSTEM_PROMPT_MAX_TOKENS,
} from '@/constants'
import { hexToVector } from '@/lib/utils'
import { registerAgentUtil } from './utils'
import { useAgentObjectNames } from '@/hooks/useAgentObjectNames'
import { FundAgentModal } from '@/components/FundAgentModal'
import { SuccessModal } from '@/components/DefenderSuccessModal'
import { useCreateAgent } from '@/hooks/agents/useCreateAgent'
import { useTokenCount } from '@/hooks/useTokenCount'
import { ImagePickerSheet } from '@/components/agents/ImagePickerSheet'
import { FundSuccessModal } from '@/components/FundSuccessModal'
import { useRewardsMissionTracker } from '@/hooks/rewards/useRewardsMissionTracker'

interface FormData {
  agentName: string
  systemPrompt: string
  feePerMessage: string
}

interface FormInputProps {
  label: string
  name: keyof FormData
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  type?: string
  placeholder?: string
  required?: boolean
  isTextarea?: boolean
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  required = false,
  isTextarea = false,
}) => {
  const InputComponent = isTextarea ? 'textarea' : 'input'

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <InputComponent
        name={name}
        type={isTextarea ? undefined : type}
        value={value}
        onChange={onChange}
        className={`w-full bg-white border border-gray-300 rounded-lg p-3 text-black placeholder-gray-500 focus:ring-1 focus:ring-black focus:border-black ${
          isTextarea ? 'min-h-[200px] resize-vertical' : ''
        }`}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default function DefendPage() {
  const client = useSuiClient()
  const account = useCurrentAccount()
  const { addAgentObjectIdWithName } = useAgentObjectNames()
  const { mutate: createAgent } = useCreateAgent()
  const [agentImage, setAgentImage] = useState<File | null>(null)
  const { tokenCount, countTokens, isDebouncing: isTokenCountDebouncing } = useTokenCount()
  const [imagePickerOpen, setImagePickerOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<{
    url: string
    isCustom: boolean
    file?: File | null
  } | null>({
    url: SENTINEL_IMAGES[0],
    isCustom: false,
  })

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showRawEffects: true,
          showObjectChanges: true,
        },
      }),
  })

  const [formData, setFormData] = useState<FormData>({
    agentName: '',
    systemPrompt: '',
    feePerMessage: '',
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isLoading, setIsLoading] = useState(false)

  const [deployedAgentObjectId, setDeployedAgentObjectId] = useState<string | null>(null)
  const [deployedAgentPath, setDeployedAgentPath] = useState<string | null>(null)
  const [transactionDigest, setTransactionDigest] = useState('')

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFundModal, setShowFundModal] = useState(false)
  const [showFundSuccessModal, setShowFundSuccessModal] = useState(false)
  const [fundedAmount, setFundedAmount] = useState('')
  const { trackLaunchSentinel } = useRewardsMissionTracker()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'systemPrompt') {
      countTokens(value)
    }

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const resetAllState = () => {
    setDeployedAgentObjectId(null)
    setTransactionDigest('')
    setFormData({ agentName: '', systemPrompt: '', feePerMessage: '' })
    setFundedAmount('')
    setSelectedImage({
      url: SENTINEL_IMAGES[0],
      isCustom: false,
    })
    setAgentImage(null)
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    resetAllState()
  }

  const handleAddFunds = () => {
    setShowSuccessModal(false)
    setShowFundModal(true)
  }

  const handleCloseFundModal = () => {
    setShowFundModal(false)
  }

  const handleAbortAndCloseFundModal = () => {
    handleCloseFundModal()
    resetAllState()
  }

  const handleFundSuccess = (amount: string) => {
    toast.success('Sentinel funded successfully!')
    setFundedAmount(amount)
    handleCloseFundModal()
    setShowFundSuccessModal(true)
  }

  const handleCloseFundSuccessModal = () => {
    setShowFundSuccessModal(false)
    resetAllState()
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.agentName.trim()) {
      newErrors.agentName = 'Sentinel name is required'
    } else if (formData.agentName.length > 31) {
      newErrors.agentName = 'Sentinel name must be 31 characters or less'
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = 'System prompt is required'
    } else if (tokenCount > SYSTEM_PROMPT_MAX_TOKENS) {
      return false
    }

    const fee = parseFloat(formData.feePerMessage)
    if (isNaN(fee) || fee < 0) {
      newErrors.feePerMessage = 'Fee must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOffChainSuccess = async (
    result: SuiTransactionBlockResponse,
    agentName: string,
    agent_id: string
  ) => {
    const agentObject = result?.objectChanges?.find(
      (obj: any) =>
        obj.objectType === `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::Agent`
    )

    if (agentObject) {
      const agentObjectId = (agentObject as any).objectId
      await addAgentObjectIdWithName(`${agentObjectId} ${agentName}`)
      setDeployedAgentObjectId(agentObjectId)
      setTransactionDigest(result.digest.toString())
      setShowSuccessModal(true)

      posthog.capture('sentinel_deployed', {
        agent_name: agentName,
        agent_id: agent_id,
        agent_object_id: (agentObject as any).objectId,
        owner_address: account!.address,
        cost_per_message: formData.feePerMessage,
        system_prompt_length: formData.systemPrompt.length,
        system_prompt_tokens: tokenCount,
        tx_digest: result.digest.toString(),
      })

      trackLaunchSentinel(result.digest.toString(), {
        agent_id: agent_id,
        agent_name: agentName,
        agent_object_id: agentObjectId,
        owner_address: account!.address,
      })

      const payload = new FormData()
      payload.append('agent_id', agent_id)
      payload.append('agent_name', agentName)
      payload.append('object_id', agentObjectId)
      payload.append('owner', account!.address)
      payload.append('digest', result.digest.toString())

      if (agentImage) {
        payload.append('image', agentImage)
      } else if (selectedImage?.url && !selectedImage.isCustom) {
        payload.append('image_url', selectedImage.url)
      }

      createAgent(payload, {
        onSuccess: (data) => {
          if (data?.data?.agent_path) {
            setDeployedAgentPath(data.data.agent_path)
          }
        },
      })
    }
  }

  const createAgentTransaction = async (agentDetails: any) => {
    const tx = new Transaction()
    const sigVector = hexToVector(agentDetails.signature)

    tx.moveCall({
      target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::register_agent`,
      typeArguments: [
        `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::${SUI_CONFIG.OTW_NAME}`,
      ],
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY),
        tx.pure.string(agentDetails.response.data.agent_id),
        tx.pure.u64(agentDetails.response.timestamp_ms),
        tx.pure.u64(agentDetails.response.data.cost_per_message),
        tx.pure.string(agentDetails.response.data.system_prompt),
        tx.pure.vector('u8', sigVector),
        tx.object(SUI_CONFIG.ENCLAVE_OBJECT_ID),
      ],
    })

    return await signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          await handleOffChainSuccess(
            result,
            formData.agentName,
            agentDetails.response.data.agent_id
          )
        },
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !account) return
    setIsLoading(true)

    try {
      const checkResponse = await fetch(
        `/api/agents/check-name?name=${encodeURIComponent(formData.agentName)}`
      )
      const checkData = await checkResponse.json()

      if (!checkResponse.ok) {
        throw new Error(checkData.error || 'Failed to validate Sentinel name.')
      }

      if (checkData.exists) {
        setErrors((prev) => ({
          ...prev,
          agentName: 'This Sentinel name is already taken. Please choose another.',
        }))
        setIsLoading(false)
        return
      }

      const feePerMessage = parseFloat(formData.feePerMessage) * MIST_PER_SUI
      const agentDetails = await registerAgentUtil(formData.systemPrompt, feePerMessage)
      await createAgentTransaction(agentDetails)
    } catch (error) {
      console.error('Deployment error:', error)
      const message = error instanceof Error ? error.message : 'Deployment failed'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-4 pt-24 min-h-body">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto space-y-6 relative"
      >
        <Link
          href="/"
          className="hidden lg:flex items-center gap-1 text-gray-500 hover:text-black transition-colors absolute top-2 -left-32"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-4 justify-between">
          <h1 className="text-4xl font-bold">Deploy Sentinel</h1>
          <div className="flex flex-col items-center justify-center gap-1">
            <div
              className="relative w-20 h-20 rounded-full border border-gray-300 overflow-hidden cursor-pointer transition-colors text-gray-400 hover:text-black group flex items-center justify-center bg-gray-50 hover:bg-gray-100"
              onClick={() => setImagePickerOpen(true)}
            >
              {selectedImage?.url ? (
                <Image
                  src={selectedImage.url}
                  alt="Selected"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover z-10 relative"
                />
              ) : null}
              <div className="w-full h-full absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <CameraIcon />
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center">Choose Sentinel Image</p>
          </div>
        </div>

        <ImagePickerSheet
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelectImage={(img) => {
            setSelectedImage(img)
            setImagePickerOpen(false)
            if (img.isCustom) {
              setAgentImage(img.file ?? null)
            } else {
              setAgentImage(null)
            }
          }}
          title="Select Sentinel Image"
          subtitle="Choose a profile image for your Sentinel."
          imageArray={SENTINEL_IMAGES}
          gifArray={SENTINEL_GIFS}
          disableGifs={true}
        />

        <FormInput
          label="Sentinel Name"
          name="agentName"
          value={formData.agentName}
          onChange={handleChange}
          error={errors.agentName}
          placeholder="Enter sentinel name"
          required
        />

        <div>
          <div className="flex justify-between mb-2 items-center">
            <label className="block text-sm font-medium">Sentinel Instructions</label>
            <Link
              href={`${SUI_SENTINEL_DOCS_URL}/guides/defender-guide`}
              target="_blank"
              className="underline text-xs text-blue-600 hover:text-blue-800"
            >
              How to create good instructions?
            </Link>
          </div>
          <textarea
            name="systemPrompt"
            value={formData.systemPrompt}
            onChange={handleChange}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 min-h-[200px] text-black placeholder-gray-500 focus:ring-1 focus:ring-black focus:border-black"
            placeholder="Enter sentinel instructions..."
            required
          />
          <p
            className={`mt-1 text-sm text-gray-500 ${
              isTokenCountDebouncing ? 'animate-pulse' : ''
            }`}
          >
            Tokens: {tokenCount} / {SYSTEM_PROMPT_MAX_TOKENS}
          </p>
          {tokenCount > SYSTEM_PROMPT_MAX_TOKENS && (
            <p className="mt-1 text-sm text-red-500">System prompt exceeds token limit</p>
          )}
          {errors.systemPrompt && (
            <p className="mt-1 text-sm text-red-500">{errors.systemPrompt}</p>
          )}
        </div>

        <FormInput
          label="Fee per Message (SUI)"
          name="feePerMessage"
          value={formData.feePerMessage}
          onChange={handleChange}
          error={errors.feePerMessage}
          type="number"
          placeholder="0.00"
          required
        />

        {account?.address ? (
          <button
            type="submit"
            disabled={isLoading || tokenCount > SYSTEM_PROMPT_MAX_TOKENS}
            className="btn btn-black w-full flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Deploying...
              </>
            ) : (
              'Deploy Sentinel'
            )}
          </button>
        ) : (
          <ConnectButton className="w-full" />
        )}
      </form>

      <SuccessModal
        open={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onAddFunds={handleAddFunds}
        agentName={formData.agentName}
        transactionDigest={transactionDigest}
        agentPath={deployedAgentPath}
      />

      {deployedAgentObjectId && (
        <FundAgentModal
          open={showFundModal}
          onClose={handleAbortAndCloseFundModal}
          agentObjectId={deployedAgentObjectId}
          onSuccess={handleFundSuccess}
        />
      )}

      <FundSuccessModal
        open={showFundSuccessModal}
        onClose={handleCloseFundSuccessModal}
        agentName={formData.agentName}
        prizePoolAmount={fundedAmount}
        sentinelId={deployedAgentObjectId}
      />
    </div>
  )
}
