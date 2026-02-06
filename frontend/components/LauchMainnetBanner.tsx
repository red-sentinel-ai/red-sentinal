export const LaunchMainnetBanner = () => {
  return (
    <div className="fixed left-0 right-0 z-20 bg-gradient-to-r from-[#558EB4] via-[#1388D5] to-[#8F564E] p-[1px]">
      <div className="relative w-full bg-[#12121266] backdrop-blur-sm">
        <div className="relative mx-auto max-w-7xl items-center px-4 py-2 text-center">
          <div className="flex items-center justify-center space-x-4 text-center text-sm">
            Launching on Mainnet Soon
          </div>
        </div>

        <div className="flex w-full">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#558EB4] to-[#1388D5]"></div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#1388D5] via-[#8F564E] to-transparent"></div>
        </div>
      </div>
    </div>
  )
}
