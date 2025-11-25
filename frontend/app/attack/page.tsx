import { AgentListView } from '@/components/AgentListView'

export default function AttackPage() {
  return (
    <div className="mt-16 md:mt-0 min-h-[calc(100vh-60px)] bg-cover bg-center bg-no-repeat flex-col items-end md:items-center justify-center md:px-4 relative">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <AgentListView />
    </div>
  )
}
