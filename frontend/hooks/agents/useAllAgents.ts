import { useQuery } from "@tanstack/react-query";
import { useSuiClient } from "@mysten/dapp-kit";
import { AgentStatus } from "@/types";
import {
  getDefeatedAgentIds,
  fetchAgentDetailsViaObject,
} from "@/lib/sui-utils";

export interface AgentDetails {
  agent_id: string;
  agent_name: string;
  agent_profile: string;
  object_id: string;
  owner: string;
  is_featured: boolean;
  cost_per_message: number;
  system_prompt: string;
  balance: number;
  status: AgentStatus;
  agent_path: string;
  created_at: string;
  last_funded_timestamp: string;
  accumulated_fees: number;
}

export const useAllAgents = () => {
  const client = useSuiClient();

  return useQuery<AgentDetails[], Error>({
    queryKey: ["allAgents"],
    queryFn: async () => {
      const [defeatedAgentIds, basicAgentsRes] = await Promise.all([
        getDefeatedAgentIds(client),
        fetch("/api/agents/all"),
      ]);

      if (!basicAgentsRes.ok) {
        const err = await basicAgentsRes.json();
        throw new Error(err.error || "Failed to fetch agents");
      }

      const basicAgents: Omit<
        AgentDetails,
        | "cost_per_message"
        | "system_prompt"
        | "balance"
        | "status"
        | "last_funded_timestamp"
        | "accumulated_fees"
      >[] = await basicAgentsRes.json();

      const enrichedAgents = await Promise.all(
        basicAgents.map(async (agent) => {
          const onchain = await fetchAgentDetailsViaObject(
            client,
            agent.object_id
          );

          const status: AgentStatus = defeatedAgentIds.has(
            String(agent.agent_id)
          )
            ? "Defeated"
            : "Active";

          return {
            ...agent,
            ...onchain,
            agent_id: String(agent.agent_id),
            status,
          } as AgentDetails;
        })
      );

      return enrichedAgents;
    },
  });
};
