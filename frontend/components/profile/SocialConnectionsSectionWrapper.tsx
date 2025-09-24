'use client'

import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ExternalLink } from 'lucide-react'
import { SocialConnectionsSection } from './SocialConnectionsSection'

function SocialConnectionsLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          Social Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="animate-pulse bg-gray-700 h-12 rounded"></div>
          <div className="animate-pulse bg-gray-700 h-12 rounded"></div>
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
