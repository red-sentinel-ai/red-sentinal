import { SuiClient } from "@mysten/sui/client";
import type { AgentDetails } from "@/hooks/agents/useAllAgents";
import { SUI_CONFIG } from "@/constants";

export const fetchAgentDetailsViaObject = async (
  client: SuiClient,
  agentObjectId: string
): Promise<
  Pick<
    AgentDetails,
    "cost_per_message" | "system_prompt" | "balance" | "last_funded_timestamp"
  >
> => {
  try {
    const response = await client.getObject({
      id: agentObjectId,
      options: {
        showContent: true,
      },
    });

    if (
      !response.data?.content ||
      response.data.content.dataType !== "moveObject"
    ) {
      throw new Error("Invalid agent object");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fields = (response.data.content as any).fields;

    return {
      cost_per_message: Number(fields.cost_per_message),
      system_prompt: fields.system_prompt,
      balance: Number(fields.balance),
      last_funded_timestamp: fields.last_funded_timestamp || "0",
    };
  } catch (error) {
    console.error(
      `Error fetching on-chain details for ${agentObjectId}:`,
      error
    );
    return {
      cost_per_message: 0,
      system_prompt: "Error fetching on-chain data.",
      balance: 0,
      last_funded_timestamp: "0",
    };
  }
};

export async function getDefeatedAgentIds(
  client: SuiClient
): Promise<Set<string>> {
  const packageId = SUI_CONFIG.EXAMPLES_PACKAGE_ID;
  const moduleName = SUI_CONFIG.MODULE_NAME;

  try {
    const defeatedEvents = await client.queryEvents({
      query: {
        MoveEventType: `${packageId}::${moduleName}::AgentDefeated`,
      },
      limit: 100,
      order: "descending",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const defeatedIds = defeatedEvents.data.map(
      (event: any) => event.parsedJson.agent_id
    );
    return new Set(defeatedIds);
  } catch (error) {
    console.error("Error fetching defeated agent events:", error);
    return new Set();
  }
}
