'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { SUI_SENTINEL_AUDIT_REPORT_URL } from '@/constants'

const credibilityItems = [
  {
    label: 'Overflow Hackathon',
    value: 'Cryptography Track Winner',
    subtext: '2025',
  },
  {
    label: 'Security Audit',
    value: 'Audited by OtterSec',
    subtext: 'Public Report',
    href: SUI_SENTINEL_AUDIT_REPORT_URL,
  },
  {
    label: 'Network Status',
    value: 'Live on Sui Mainnet',
    subtext: 'Fully Operational',
  },
  {
    label: 'Recognition',
    value: 'Sui Fest Singapore',
    subtext: 'Featured Project',
  },
]

export function SocialProofSection() {
  return (
    <section className="py-16 md:py-20 relative bg-white border-y border-black">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="badge-pink w-fit mx-auto mb-4">• Credibility</div>
          <p className="text-base md:text-lg text-[#5F5C5C]">
            Battle-tested infrastructure powering the future of AI security
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black border border-black">
          {credibilityItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white p-6 md:p-8 flex flex-col items-center text-center"
            >
              <p className="text-xs md:text-sm text-[#939393] uppercase tracking-wider mb-2">
                {item.label}
              </p>
              {item.href ? (
                <Link href={item.href} target="_blank" className="group">
                  <p className="text-base md:text-lg font-medium text-black group-hover:text-[#C871FF] transition-colors">
                    {item.value}
                  </p>
                </Link>
              ) : (
                <p className="text-base md:text-lg font-medium text-black">{item.value}</p>
              )}
              <p className="text-xs text-[#C871FF] mt-1">{item.subtext}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
