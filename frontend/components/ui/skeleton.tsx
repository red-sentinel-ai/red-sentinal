import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-surface-container-high animate-pulse rounded-md', className)} {...props} />
}

export { Skeleton }
