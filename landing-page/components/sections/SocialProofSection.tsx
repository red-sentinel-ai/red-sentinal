'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  TrophyIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { SUI_SENTINEL_AUDIT_REPORT_URL, OTTERSEC_URL } from '@/constants'

const credibilityItems = [
  {
    label: 'Overflow Hackathon',
    value: 'Cryptography Track',
    subtext: 'Winner 2025',
    icon: TrophyIcon,
    gradient: 'bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF]',
    borderColor: 'border-[#C532F6]',
    circleImage: '/img/the_ego_crisis_circles.png',
    href: null,
  },
  {
    label: 'Security Audit',
    value: 'Audited by OtterSec',
    subtext: 'View Report',
    icon: ShieldCheckIcon,
    gradient: 'bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED]',
    borderColor: 'border-[#049414]',
    circleImage: '/img/the_cosmic_roast_circles.png',
    href: SUI_SENTINEL_AUDIT_REPORT_URL,
  },
  {
    label: 'Network Status',
    value: 'Live on Sui & Solana Mainnet',
    subtext: 'Fully Operational',
    icon: RocketLaunchIcon,
    gradient: 'bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2]',
    borderColor: 'border-[#F632F3]',
    circleImage: '/img/the_awaking_circles.png',
    href: null,
  },
  {
    label: 'Recognition',
    value: 'Sui Fest Singapore',
    subtext: 'Featured Project',
    icon: SparklesIcon,
    gradient: 'bg-gradient-to-b from-[#F2EFCC] via-[#F7FCEE] to-[#DDE6A9]',
    borderColor: 'border-[#947204]',
    circleImage: '/img/the_challenge_begins_circles.png',
    href: null,
  },
]

export function SocialProofSection() {
  return (
    <section className="py-20 md:py-28 relative bg-[#F7F9FF]">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="badge-pink w-fit mx-auto mb-6">• Credibility</div>
          <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-4">
            Trusted & <span className="text-[#C871FF]">Verified</span>
          </h2>
          <p className="text-lg text-[#5F5C5C] max-w-2xl mx-auto">
            Battle-tested infrastructure powering the future of AI security. 
            Recognized by industry leaders and live on mainnet.
          </p>
        </motion.div>

        {/* Credibility Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {credibilityItems.map((item, index) => {
            const CardContent = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`${item.gradient} ${item.borderColor} border rounded-2xl p-6 md:p-8 flex flex-col items-center text-center relative overflow-hidden group hover:shadow-lg transition-all duration-300 min-h-[220px] justify-center`}
              >
                {/* Background Circle */}
                <div className="absolute -right-8 -top-8 w-32 h-32 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity">
                  <Image src={item.circleImage} alt="" fill className="object-contain" />
                </div>
                <div className="absolute -left-6 -bottom-6 w-24 h-24 opacity-10 pointer-events-none">
                  <Image src={item.circleImage} alt="" fill className="object-contain" />
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 shadow-sm">
                  <item.icon className="w-6 h-6 text-black" />
                </div>

                {/* Label */}
                <p className="text-xs md:text-sm text-[#5F5C5C] uppercase tracking-wider mb-2 relative z-10">
                  {item.label}
                </p>

                {/* Value */}
                <p className="text-base md:text-lg font-bold text-black relative z-10">
                  {item.value}
                </p>

                {/* Subtext */}
                <div className="flex items-center gap-1 mt-2 relative z-10">
                  <p className="text-xs md:text-sm text-[#C871FF] font-medium">
                    {item.subtext}
                  </p>
                  {item.href && (
                    <ArrowTopRightOnSquareIcon className="w-3 h-3 text-[#C871FF]" />
                  )}
                </div>
              </motion.div>
            )

            return item.href ? (
              <Link key={item.label} href={item.href} target="_blank" className="block">
                {CardContent}
              </Link>
            ) : (
              <div key={item.label}>{CardContent}</div>
            )
          })}
        </div>

        {/* Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-wrap justify-center items-center gap-6 md:gap-10"
        >
          <div className="flex items-center gap-3 text-[#5F5C5C]">
            <div className="w-2 h-2 bg-[#049414] rounded-full animate-pulse"></div>
            <span className="text-sm">All Systems Operational</span>
          </div>
          <div className="hidden md:block w-px h-6 bg-black/20"></div>
          <Link 
            href={OTTERSEC_URL} 
            target="_blank" 
            className="flex items-center gap-2 text-sm text-[#5F5C5C] hover:text-[#C871FF] transition-colors"
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Secured by OtterSec</span>
          </Link>
          <div className="hidden md:block w-px h-6 bg-black/20"></div>
          <div className="flex items-center gap-2 text-sm text-[#5F5C5C]">
            <RocketLaunchIcon className="w-4 h-4" />
            <span>Live on Sui & Solana Mainnet</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
