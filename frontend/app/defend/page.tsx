"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CameraIcon, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import posthog from "posthog-js";
import { Transaction } from "@mysten/sui/transactions";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import {
  MIST_PER_SUI,
  PROVIDER_MODELS,
  SENTINEL_GIFS,
  SENTINEL_IMAGES,
  SUI_CONFIG,
  SUI_SENTINEL_DOCS_URL,
  SYSTEM_PROMPT_MAX_TOKENS,
} from "@/constants";
import { hexToVector } from "@/lib/utils";
import { registerAgentUtil } from "./utils";
import { useAgentObjectNames } from "@/hooks/useAgentObjectNames";
import { FundAgentModal } from "@/components/FundAgentModal";
import { SuccessModal } from "@/components/DefenderSuccessModal";
import { useCreateAgent } from "@/hooks/agents/useCreateAgent";
import { useTokenCount } from "@/hooks/useTokenCount";
import { ImagePickerSheet } from "@/components/agents/ImagePickerSheet";
import { FundSuccessModal } from "@/components/FundSuccessModal";
import { useRewardsMissionTracker } from "@/hooks/rewards/useRewardsMissionTracker";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { CustomDropdown } from "@/components/ui/common/CustomDropdown";
import { RewardsConditions } from "@/components/defend/RewardsConditions";

interface FormData {
  agentName: string;
  systemPrompt: string;
  feePerMessage: string;
  rewardPool: string;
  llmProvider: string;
  llmModel: string;
}

interface FormInputProps {
  label: string;
  subLabel?: string;
  name: keyof FormData;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  isTextarea?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  subLabel,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required = false,
  isTextarea = false,
  rightElement,
  className = "",
}) => {
  const InputComponent = isTextarea ? "textarea" : "input";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <label className="text-[20px] font-medium text-black leading-tight">
              {label}
            </label>
            {rightElement}
          </div>
          {subLabel && (
            <span className="text-[16px] font-normal text-[#5E5E5E] mt-1">
              {subLabel}
            </span>
          )}
        </div>
      </div>

      <InputComponent
        name={name}
        type={isTextarea ? undefined : type}
        value={value}
        onChange={onChange}
        className={`w-full bg-white border border-[#5E5E5E] rounded-xl p-4 text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all ${
          isTextarea ? "min-h-[200px] resize-none" : "h-[65px]"
        }`}
        placeholder={placeholder}
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

const DEFAULT_PROVIDER = "anthropic";
const DEFAULT_MODEL = PROVIDER_MODELS[DEFAULT_PROVIDER][0];

export default function DefendPage() {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const { addAgentObjectIdWithName } = useAgentObjectNames();
  const { mutate: createAgent } = useCreateAgent();
  const [agentImage, setAgentImage] = useState<File | null>(null);
  const {
    tokenCount,
    countTokens,
    isDebouncing: isTokenCountDebouncing,
  } = useTokenCount();
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    isCustom: boolean;
    file?: File | null;
  } | null>({
    url: SENTINEL_IMAGES[0],
    isCustom: false,
  });

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
  });

  const [formData, setFormData] = useState<FormData>({
    agentName: "",
    systemPrompt: "",
    feePerMessage: "",
    rewardPool: "",
    llmProvider: DEFAULT_PROVIDER,
    llmModel: DEFAULT_MODEL,
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const [deployedAgentObjectId, setDeployedAgentObjectId] = useState<
    string | null
  >(null);
  const [deployedAgentPath, setDeployedAgentPath] = useState<string | null>(
    null
  );
  const [transactionDigest, setTransactionDigest] = useState("");

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);
  const [showFundSuccessModal, setShowFundSuccessModal] = useState(false);
  const [fundedAmount, setFundedAmount] = useState("");
  const { trackLaunchSentinel } = useRewardsMissionTracker();

  const handleProviderChange = (provider: string) => {
    const defaultModelForProvider =
      PROVIDER_MODELS[provider]?.[0] || DEFAULT_MODEL;

    setFormData((prev) => ({
      ...prev,
      llmProvider: provider,
      llmModel: defaultModelForProvider,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "systemPrompt") {
      countTokens(value);
    }

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const resetAllState = () => {
    setDeployedAgentObjectId(null);
    setTransactionDigest("");
    setFormData({
      agentName: "",
      systemPrompt: "",
      feePerMessage: "",
      rewardPool: "",
      llmProvider: DEFAULT_PROVIDER,
      llmModel: DEFAULT_MODEL,
    });
    setFundedAmount("");
    setSelectedImage({
      url: SENTINEL_IMAGES[0],
      isCustom: false,
    });
    setAgentImage(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    resetAllState();
  };

  const handleAddFunds = () => {
    setShowSuccessModal(false);
    setShowFundModal(true);
  };

  const handleCloseFundModal = () => {
    setShowFundModal(false);
  };

  const handleAbortAndCloseFundModal = () => {
    handleCloseFundModal();
    resetAllState();
  };

  const handleFundSuccess = (amount: string) => {
    toast.success("Sentinel funded successfully!");
    setFundedAmount(amount);
    handleCloseFundModal();
    setShowFundSuccessModal(true);
  };

  const handleCloseFundSuccessModal = () => {
    setShowFundSuccessModal(false);
    resetAllState();
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.agentName.trim()) {
      newErrors.agentName = "Sentinel name is required";
    } else if (formData.agentName.length > 31) {
      newErrors.agentName = "Sentinel name must be 31 characters or less";
    }

    if (!formData.systemPrompt.trim()) {
      newErrors.systemPrompt = "System prompt is required";
    } else if (tokenCount > SYSTEM_PROMPT_MAX_TOKENS) {
      return false;
    }

    const fee = parseFloat(formData.feePerMessage);
    if (isNaN(fee) || fee < 0) {
      newErrors.feePerMessage = "Fee must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOffChainSuccess = async (
    result: SuiTransactionBlockResponse,
    agentName: string,
    agent_id: string
  ) => {
    const agentObject = result?.objectChanges?.find(
      (obj: any) =>
        obj.objectType ===
        `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::Agent`
    );

    if (agentObject) {
      const agentObjectId = (agentObject as any).objectId;
      await addAgentObjectIdWithName(`${agentObjectId} ${agentName}`);
      setDeployedAgentObjectId(agentObjectId);
      setTransactionDigest(result.digest.toString());
      setShowSuccessModal(true);

      posthog.capture("sentinel_deployed", {
        agent_name: agentName,
        agent_id: agent_id,
        agent_object_id: (agentObject as any).objectId,
        owner_address: account!.address,
        cost_per_message: formData.feePerMessage,
        system_prompt_length: formData.systemPrompt.length,
        system_prompt_tokens: tokenCount,
        tx_digest: result.digest.toString(),
      });

      trackLaunchSentinel(result.digest.toString(), {
        agent_id: agent_id,
        agent_name: agentName,
        agent_object_id: agentObjectId,
        owner_address: account!.address,
      });

      const payload = new FormData();
      payload.append("agent_id", agent_id);
      payload.append("agent_name", agentName);
      payload.append("object_id", agentObjectId);
      payload.append("owner", account!.address);
      payload.append("digest", result.digest.toString());
      payload.append("model_provider", formData.llmProvider);
      payload.append("model_name", formData.llmModel);

      if (agentImage) {
        payload.append("image", agentImage);
      } else if (selectedImage?.url && !selectedImage.isCustom) {
        payload.append("image_url", selectedImage.url);
      }

      createAgent(payload, {
        onSuccess: (data) => {
          if (data?.data?.agent_path) {
            setDeployedAgentPath(data.data.agent_path);
          }
        },
      });
    }
  };

  const createAgentTransaction = async (agentDetails: any) => {
    const tx = new Transaction();
    const sigVector = hexToVector(agentDetails.signature);

    tx.moveCall({
      target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::register_agent`,
      arguments: [
        tx.object(SUI_CONFIG.AGENT_REGISTRY),
        tx.object(SUI_CONFIG.PROTOCOL_CONFIG_OBJECT_ID),
        tx.pure.string(agentDetails.response.data.agent_id),
        tx.pure.u64(agentDetails.response.timestamp_ms),
        tx.pure.u64(agentDetails.response.data.cost_per_message),
        tx.pure.string(agentDetails.response.data.system_prompt),
        tx.pure.vector("u8", sigVector),
        tx.object(SUI_CONFIG.ENCLAVE_OBJECT_ID),
        tx.object(SUI_CLOCK_OBJECT_ID),
      ],
    });

    return await signAndExecuteTransaction(
      { transaction: tx },
      {
        onSuccess: async (result) => {
          await handleOffChainSuccess(
            result,
            formData.agentName,
            agentDetails.response.data.agent_id
          );
        },
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !account) return;
    setIsLoading(true);

    try {
      const checkResponse = await fetch(
        `/api/agents/check-name?name=${encodeURIComponent(formData.agentName)}`
      );
      const checkData = await checkResponse.json();

      if (!checkResponse.ok) {
        throw new Error(checkData.error || "Failed to validate Sentinel name.");
      }

      if (checkData.exists) {
        setErrors((prev) => ({
          ...prev,
          agentName:
            "This Sentinel name is already taken. Please choose another.",
        }));
        setIsLoading(false);
        return;
      }

      const feePerMessage = parseFloat(formData.feePerMessage) * MIST_PER_SUI;
      const agentDetails = await registerAgentUtil(
        formData.systemPrompt,
        feePerMessage,
        account.address,
        formData.llmProvider,
        formData.llmModel
      );
      setAgentId(agentDetails.response.data.agent_id);
      await createAgentTransaction(agentDetails);
    } catch (error) {
      console.error("Deployment error:", error);
      const message =
        error instanceof Error ? error.message : "Deployment failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 pt-10 min-h-body">
      <form
        onSubmit={handleSubmit}
        className="max-w-[969px] px-4 mx-auto space-y-6 relative"
      >
        <Link
          href="/"
          className="hidden lg:flex items-center gap-1 text-gray-500 hover:text-black transition-colors absolute top-2 -left-32"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-medium mb-3">Deploy Sentinel</h1>
            <p className="text-[#5E5E5E] text-xl font-medium">
              Create, configure, and deploy your AI Sentinel
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className="relative w-[90px] h-[90px] rounded-full border border-black overflow-hidden cursor-pointer transition-colors text-gray-400 hover:text-black group flex items-center justify-center bg-gray-50 hover:bg-gray-100 shadow-sm"
              onClick={() => setImagePickerOpen(true)}
            >
              {selectedImage?.url ? (
                <Image
                  src={selectedImage.url}
                  alt="Selected"
                  width={90}
                  height={90}
                  className="w-full h-full object-cover z-10 relative"
                />
              ) : null}
              <div className="w-full h-full absolute inset-0 bg-black/40 z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <CameraIcon className="w-8 h-8" />
              </span>
            </div>
            <p className="text-xs text-[#5E5E5E] text-center font-medium mt-2">
              Choose Sentinel Image
            </p>
          </div>
        </div>

        <ImagePickerSheet
          open={imagePickerOpen}
          onClose={() => setImagePickerOpen(false)}
          onSelectImage={(img) => {
            setSelectedImage(img);
            setImagePickerOpen(false);
            if (img.isCustom) {
              setAgentImage(img.file ?? null);
            } else {
              setAgentImage(null);
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
          subLabel="Give your Sentinel a unique identity."
          name="agentName"
          value={formData.agentName}
          onChange={handleChange}
          error={errors.agentName}
          placeholder="e.g. Atlas Guard, Void Watcher, Nova Sentinel"
          required
        />

        <div className="border border-[#5E5E5E] rounded-xl p-6 bg-white">
          <h3 className="text-[20px] font-medium text-black mb-6">
            LLM provider
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
            <CustomDropdown
              label="Select service"
              subLabel="Select the service that hosts and serves the LLM."
              options={Object.keys(PROVIDER_MODELS)}
              selected={formData.llmProvider}
              onSelect={handleProviderChange}
            />
            <CustomDropdown
              label="Select Model"
              subLabel="Select the model version for the chosen LLM."
              options={PROVIDER_MODELS[formData.llmProvider] || []}
              selected={formData.llmModel}
              onSelect={(val) =>
                setFormData((prev) => ({ ...prev, llmModel: val }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <FormInput
            label="Fee Per Message (SUI)"
            subLabel="You earn this fee whenever users interact with your Sentinel."
            name="feePerMessage"
            value={formData.feePerMessage}
            onChange={handleChange}
            error={errors.feePerMessage}
            type="number"
            placeholder="0.00"
            required
            className="h-full"
          />

          {/* <FormInput
            label="Reward Pool"
            rightElement={
              <div className="text-gray-400 cursor-pointer hover:text-gray-600">
                <Info className="w-4 h-4" />
              </div>
            }
            subLabel="Add minimum of 1 SUI"
            name="rewardPool"
            value={formData.rewardPool}
            onChange={handleChange}
            type="number"
            placeholder=""
            className="h-full"
          /> */}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-start mb-1">
            <div>
              <label className="text-[20px] font-medium text-black leading-tight block">
                Sentinel Instructions
              </label>
              <span className="text-[16px] font-normal text-[#5E5E5E] mt-1 block">
                Define how your Sentinel thinks, acts, and responds. Describe
                its role, tone, constraints, and objectives.
              </span>
            </div>

            <Link
              href={`${SUI_SENTINEL_DOCS_URL}/guides/defender-guide`}
              target="_blank"
              className="underline text-sm text-[#0077FF] hover:text-[#0077ffd3] mt-1 shrink-0 ml-4"
            >
              View Instructions Example
            </Link>
          </div>

          <textarea
            name="systemPrompt"
            value={formData.systemPrompt}
            onChange={handleChange}
            className="w-full bg-white border border-[#5E5E5E] rounded-xl p-4 min-h-[220px] text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black resize-y transition-all"
            placeholder="Enter sentinel instructions..."
            required
          />

          <div className="flex justify-between items-center mt-1">
            {errors.systemPrompt && (
              <p className="text-sm text-red-500">{errors.systemPrompt}</p>
            )}
            <p
              className={`text-sm text-[#5E5E5E] ml-auto ${
                isTokenCountDebouncing ? "animate-pulse" : ""
              }`}
            >
              Tokens: {tokenCount} / {SYSTEM_PROMPT_MAX_TOKENS}
            </p>
          </div>
          {tokenCount > SYSTEM_PROMPT_MAX_TOKENS && (
            <p className="text-sm text-red-500 text-right">
              System prompt exceeds token limit
            </p>
          )}
        </div>

        <RewardsConditions />

        <div className="pt-2 pb-20">
          {account?.address ? (
            <button
              type="submit"
              disabled={isLoading || tokenCount > SYSTEM_PROMPT_MAX_TOKENS}
              className="w-full bg-black hover:bg-black/90 text-white transition-colors rounded-xl h-[65px] flex items-center justify-center gap-3 text-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Image
                    src="/icons/rocket.png"
                    alt="Rocket"
                    width={25}
                    height={25}
                    className="object-contain invert"
                  />
                  Deploy Sentinel
                </>
              )}
            </button>
          ) : (
            <div className="h-[65px]">
              <ConnectButton className="w-full h-full !rounded-xl !text-xl" />
            </div>
          )}
        </div>
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
          agentId={agentId}
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
  );
}
