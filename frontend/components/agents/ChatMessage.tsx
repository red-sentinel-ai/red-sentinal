'use client'
import type React from 'react'

import Image from 'next/image'
import { XCircle, Trophy, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { DEFAULT_PROFILE_URL, SUI_TESTNET_BASE_URL } from '@/constants'
import type { AgentDetails } from '@/hooks/agents/useAllAgents'
import { type ChatMessage as ChatMessageType } from './ChatInterface'

type ChatMessageProps = {
  message: ChatMessageType
  agent: AgentDetails
}

export const ChatMessage = ({ message, agent }: ChatMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={clsx('flex', {
        'justify-end': message.type === 'user',
        'justify-start': message.type === 'agent',
      })}
    >
      <div
        className={clsx('max-w-[85%] sm:max-w-[75%] flex items-start gap-2 sm:gap-3 relative', {
          'flex-row-reverse': message.type === 'user',
        })}
      >
        <div className="flex-shrink-0">
          <div
            className={clsx(
              'w-8 h-8 sm:w-10 sm:h-10 rounded-full relative ring-2 ring-opacity-60',
              {
                'ring-[#558EB4]': message.type === 'user',
                'ring-green-400': message.type === 'agent' && message.isSuccess,
                'ring-red-400': message.type === 'agent' && message.isSuccess === false,
                'ring-gray-400': message.type === 'agent' && message.isSuccess === undefined,
              }
            )}
          >
            <Image
              src={
                message.type === 'agent'
                  ? agent.agent_profile || DEFAULT_PROFILE_URL
                  : DEFAULT_PROFILE_URL
              }
              fill
              alt="profile"
              className="rounded-full object-cover"
            />
            {message.type === 'agent' && message.isSuccess !== undefined && (
              <div
                className={clsx(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-white text-xs',
                  {
                    'bg-green-500': message.isSuccess,
                    'bg-red-500': !message.isSuccess,
                  }
                )}
              >
                {message.isSuccess ? (
                  <Trophy className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5" />
                ) : (
                  <XCircle className="w-1.5 h-1.5 sm:w-2.5 sm:h-2.5" />
                )}
              </div>
            )}
          </div>
        </div>

        <div
          className={clsx('rounded-2xl shadow-lg relative min-w-[160px]', {
            'bg-gradient-to-r from-[#558EB4] to-[#1388D5] text-white border border-[#558EB4]/30':
              message.type === 'agent',
            'bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-gray-200 border border-gray-600/50':
              message.type === 'user',
          })}
        >
          {message.type === 'agent' && message.isSuccess !== undefined && (
            <div className="absolute inset-0 rounded-2xl opacity-20 blur-sm" />
          )}
          <div className="relative p-3 sm:p-4">
            {message.type === 'agent' && (
              <div className="text-sm font-semibold text-white">System analysis: </div>
            )}

            {message.type === 'user' && message.sender && (
              <div className="flex flex-col gap-1 text-sm font-semibold text-white mb-2 -mt-1">
                <span> {formatAddress(message.sender)}</span>
              </div>
            )}
            <div className="mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm leading-relaxed break-words">{message.content}</p>
            </div>

            <div
              className={clsx(
                'text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2',
                {
                  'border-white/20': message.type === 'user',
                  'border-gray-500/30': message.type === 'agent',
                }
              )}
            >
              <div className="flex flex-col gap-1">
                {message.type === 'agent' && message.score !== undefined && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    <span className="font-medium">Score: {message.score}/100</span>
                  </div>
                )}
                {message.type === 'agent' && message.txDigest && (
                  <div className="flex items-center gap-1">
                    <span>Verified Tx:</span>
                    <a
                      href={`${SUI_TESTNET_BASE_URL}/${message.txDigest}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 underline font-mono break-all"
                    >
                      {formatAddress(message.txDigest)}
                    </a>
                  </div>
                )}
              </div>
              <span className="text-right opacity-75 text-xs whitespace-nowrap absolute right-3 bottom-1">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const formatTimestamp = (timestamp: string) => {
  return new Date(Number.parseInt(timestamp)).toLocaleString()
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
