import { useState, useCallback } from "react";
import { Transaction } from "@mysten/sui/transactions";
import {
  useSignAndExecuteTransaction,
  useCurrentAccount,
  useSuiClient,
} from "@mysten/dapp-kit";
import { SUI_CLOCK_OBJECT_ID } from "@mysten/sui/utils";
import { toast } from "react-toastify";
import { MIST_PER_SUI, SUI_CONFIG } from "@/constants";

export const useUpdateAgent = () => {
  const client = useSuiClient();
  const account = useCurrentAccount();
  const [isLoading, setIsLoading] = useState(false);

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await client.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      }),
  });

  const getAgentCap = useCallback(
    async (agentId: string) => {
      if (!account?.address) return null;

      let cursor = null;
      let hasNextPage = true;

      while (hasNextPage) {
        const response = await client.getOwnedObjects({
          owner: account.address,
          filter: {
            StructType: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::AgentCap`,
          },
          options: {
            showContent: true,
          },
          cursor,
        });

        if (!response.data) break;

        const foundCap = response.data.find((obj) => {
          const content = obj.data?.content;
          return (
            content?.dataType === "moveObject" &&
            String((content.fields as any).agent_id) === String(agentId)
          );
        });

        if (foundCap) {
          return foundCap.data?.objectId;
        }

        hasNextPage = response.hasNextPage;
        cursor = response.nextCursor;
      }

      return null;
    },
    [account?.address, client]
  );

  const updatePrompt = useCallback(
    async (
      agentId: string,
      agentObjectId: string,
      newPrompt: string,
      onSuccess?: () => void
    ) => {
      if (!account?.address) {
        toast.error("Wallet not connected");
        return;
      }

      setIsLoading(true);
      try {
        const capId = await getAgentCap(agentId);
        if (!capId) {
          throw new Error("You do not own the Capability for this Agent");
        }

        const tx = new Transaction();
        tx.moveCall({
          target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::update_agent_prompt`,
          arguments: [
            tx.object(agentObjectId),
            tx.object(capId),
            tx.pure.string(newPrompt),
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        });

        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: () => {
              toast.success("Agent prompt updated successfully!");
              onSuccess?.();
            },
            onError: (error) => {
              console.error("Update prompt error:", error);
              toast.error(`Failed to update prompt: ${error.message}`);
            },
          }
        );
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [account?.address, getAgentCap, signAndExecuteTransaction]
  );

  const updateCost = useCallback(
    async (
      agentId: string,
      agentObjectId: string,
      newCostSui: number,
      onSuccess?: () => void
    ) => {
      if (!account?.address) {
        toast.error("Wallet not connected");
        return;
      }

      setIsLoading(true);
      try {
        const capId = await getAgentCap(agentId);
        if (!capId) {
          throw new Error("You do not own the Capability for this Agent");
        }

        const costInMist = BigInt(Math.floor(newCostSui * MIST_PER_SUI));

        const tx = new Transaction();
        tx.moveCall({
          target: `${SUI_CONFIG.EXAMPLES_PACKAGE_ID}::${SUI_CONFIG.MODULE_NAME}::update_agent_cost`,
          arguments: [
            tx.object(agentObjectId),
            tx.object(capId),
            tx.pure.u64(costInMist),
            tx.object(SUI_CLOCK_OBJECT_ID),
          ],
        });

        signAndExecuteTransaction(
          { transaction: tx },
          {
            onSuccess: () => {
              toast.success("Agent attack fee updated successfully!");
              onSuccess?.();
            },
            onError: (error) => {
              console.error("Update cost error:", error);
              toast.error(`Failed to update fee: ${error.message}`);
            },
          }
        );
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    },
    [account?.address, getAgentCap, signAndExecuteTransaction]
  );

  return {
    updatePrompt,
    updateCost,
    isLoading,
  };
};
