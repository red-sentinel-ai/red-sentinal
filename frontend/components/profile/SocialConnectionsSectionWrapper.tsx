'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import { SocialConnectionsSection } from './SocialConnectionsSection'

function SocialConnectionsLoading() {
  return (
    <Card className="jp-card" style={{ backgroundColor: 'rgba(251, 231, 231, 0.5)', backdropFilter: 'blur(8px)', borderColor: 'var(--jp-dark-pink)' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'var(--jp-black-color)' }}>
          <ExternalLink className="h-5 w-5" style={{ color: 'var(--jp-orange-color)' }} />
          Social Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-12 animate-pulse rounded" style={{ backgroundColor: 'var(--jp-light-pink)' }}></div>
          <div className="h-12 animate-pulse rounded" style={{ backgroundColor: 'var(--jp-light-pink)' }}></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SocialConnectionsSectionWrapper() {
  return (
    <Suspense fallback={<SocialConnectionsLoading />}>
      <SocialConnectionsSection />
    </Suspense>
  )
}
