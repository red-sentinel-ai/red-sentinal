import { AgentListView } from '@/components/AgentListView'

export default function AttackPage() {
  return (
    <div className="relative mt-16 min-h-[calc(100vh-60px)] flex-col items-end justify-center bg-cover bg-center bg-no-repeat md:mt-0 md:items-center md:px-4">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      <AgentListView />
    </div>
  )
}
