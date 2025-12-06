'use client'

import { motion } from 'framer-motion'
import { Gift, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const DUMMY_API_RESPONSE = {
  total_rewards: 1450,
  history: [
    {
      id: '1',
      amount: 45,
      description: '8-hour cycle reward based on fund increase',
    },
    {
      id: '2',
      amount: 200,
      description: 'Deployed "CyberGuardian Alpha" Sentinel',
    },
    {
      id: '3',
      amount: 150,
      description: 'Added 100 SUI to "DeepBlue" Prize Pool',
    },
    {
      id: '4',
      amount: 5,
      description: 'Attack attempt on "FireWall v1"',
    },
    {
      id: '5',
      amount: 32,
      description: '8-hour cycle reward based on fund increase',
    },
  ],
}

export const RewardsHistory = () => {
  const isLoading = false
  const { total_rewards, history } = DUMMY_API_RESPONSE

  if (isLoading) {
    return (
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Rewards History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg bg-gray-100" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white text-black rounded-xl p-6 shadow-md flex justify-between items-center">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wide">
            Total Rewards
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-bold tracking-tight">
              {total_rewards.toLocaleString()}
            </h3>
            <span className="text-sm font-bold text-green-400">SENTINEL</span>
          </div>
        </div>
        <Gift className="w-10 h-10 text-gray-600" />
      </div>

      <Card className="border-gray-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-xl text-black">History</CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="text-center py-12 px-4">
              <AlertCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No rewards history found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="grid grid-cols-12 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Reward</div>
                <div className="col-span-9">Description</div>
              </div>

              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-12 px-6 py-4 items-center hover:bg-gray-50 transition-colors"
                >
                  <div className="col-span-3">
                    <span className="font-bold text-green-600">
                      +{item.amount} SENTINEL
                    </span>
                  </div>
                  <div className="col-span-9">
                    <p className="text-sm text-gray-700">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}