'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ConnectButton as SuiConnectButton } from '@mysten/dapp-kit'
import { useWalletContext } from '@/lib/wallet/context'
import { Wallet, Mail } from 'lucide-react'

interface WalletSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalletSelector({ open, onOpenChange }: WalletSelectorProps) {
  const { connect } = useWalletContext()

  const handlePrivyLogin = async () => {
    await connect('privy')
    onOpenChange(false)
  }

  const handleSlushConnect = () => {
    connect('slush')
    // Don't close the modal - the SuiConnectButton will handle its own UI
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold">Connect Wallet</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* External Wallet Option */}
          <div className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">External Wallet</h3>
                <p className="text-sm text-gray-500">Connect your existing Sui wallet</p>
              </div>
            </div>
            <div onClick={handleSlushConnect}>
              <SuiConnectButton className="w-full" />
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-400">or</span>
            </div>
          </div>

          {/* Privy Option */}
          <div className="rounded-xl border border-gray-200 p-4 transition-colors hover:border-gray-300 hover:bg-gray-50">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Sign In</h3>
                <p className="text-sm text-gray-500">Use email or social login</p>
              </div>
            </div>
            <button
              onClick={handlePrivyLogin}
              className="w-full rounded-lg bg-black py-3 px-4 font-medium text-white transition-colors hover:bg-gray-800"
            >
              Continue with Email / Social
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
