import { useCurrentAccount } from '@mysten/dapp-kit'
import { motion, AnimatePresence } from 'framer-motion'
import { useAgentsByOwner } from '@/hooks/agents/useOwnerAgents'
import { FeaturedAgentsSkeleton } from '../ui/skeletons/FeaturedAgentsSkeleton'
import { FeaturedAgentCard } from '../FeaturedAgentCard'
import { AgentDetails } from '@/hooks/agents/useAllAgents'

export const UserAgents = () => {
  const account = useCurrentAccount()

  const { data: userAgents, isPending: isFetchingAllAgents } = useAgentsByOwner(account?.address)

  return (
    <>
      {isFetchingAllAgents ? (
        <FeaturedAgentsSkeleton />
      ) : (
        <>
          {userAgents.length > 0 && (
            <div className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-[#558EB4] mb-2">
                  Your Sentinels
                </h2>
                <div className="flex max-w-[400px] mx-auto">
                  <div className="gradient-border blue"></div>
                  <div className="gradient-border blue rotate-180"></div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px] mx-auto"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {userAgents.map((agent: AgentDetails, index: number) => (
                    <FeaturedAgentCard
                      key={agent.agent_id}
                      agent={agent}
                      index={index}
                      fromProfile={true}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </>
  )
}
