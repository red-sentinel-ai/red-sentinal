'use client'

import { Fragment, type ReactNode } from 'react'
import Link from 'next/link'

const MENTION_PATTERN = /(^|[^a-zA-Z0-9_-])@([a-zA-Z0-9_-]{3,32})/g

interface ChatMessageContentProps {
  content: string
}

export function ChatMessageContent({ content }: ChatMessageContentProps) {
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let key = 0

  for (const match of content.matchAll(MENTION_PATTERN)) {
    const [fullMatch, boundary, username] = match
    const mentionStart = match.index + boundary.length

    if (mentionStart > lastIndex) {
      nodes.push(<Fragment key={key++}>{content.slice(lastIndex, mentionStart)}</Fragment>)
    }

    nodes.push(
      <Link
        key={key++}
        href={`/u/${username}`}
        className="text-[var(--color-accent)] transition-opacity hover:opacity-70"
      >
        @{username}
      </Link>
    )

    lastIndex = match.index + fullMatch.length
  }

  if (lastIndex < content.length) {
    nodes.push(<Fragment key={key++}>{content.slice(lastIndex)}</Fragment>)
  }

  return <>{nodes}</>
}
