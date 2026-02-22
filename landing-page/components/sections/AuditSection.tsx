'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShieldCheckIcon, DocumentTextIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { SUI_SENTINEL_AUDIT_REPORT_URL, OTTERSEC_URL } from '@/constants'

const trustBadges = [
  {
    label: 'Audited By',
    value: 'OtterSec',
    subtext: 'Industry Leading',
    gradient: 'bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF]',
    borderColor: 'border-[#C532F6]',
    circleImage: '/img/the_ego_crisis_circles.png',
  },
  {
    label: 'Status',
    value: 'Mainnet Live',
    subtext: 'Production Ready',
    gradient: 'bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED]',
    borderColor: 'border-[#049414]',
    circleImage: '/img/the_cosmic_roast_circles.png',
  },
  {
    label: 'Recognition',
    value: 'Overflow Winner',
    subtext: 'Cryptography Track',
    gradient: 'bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2]',
    borderColor: 'border-[#F632F3]',
    circleImage: '/img/the_awaking_circles.png',
  },
]

export function AuditSection() {
  return (
    <section id="audit" className="py-24 relative text-black bg-[#F7F9FF]">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="badge-pink w-fit mx-auto mb-6">• Security Audit</div>
          <h2 className="text-3xl md:text-5xl lg:text-[56px] font-medium mb-6 leading-tight">
            Battle-Tested & <span className="text-[#C871FF]">Audited</span>
          </h2>
          <p className="text-lg text-[#5F5C5C] max-w-2xl mx-auto">
            We don&apos;t just talk about security. We prove it with third-party audits,
            open-source transparency, and battle-tested smart contracts.
          </p>
        </motion.div>

        {/* Trust Badges Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`${badge.gradient} ${badge.borderColor} border rounded-2xl p-8 relative overflow-hidden min-h-[200px] flex flex-col justify-center items-center text-center group hover:shadow-lg transition-shadow`}
            >
              <div className="absolute -right-8 -top-8 w-32 h-32 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity">
                <Image src={badge.circleImage} alt="" fill className="object-contain" />
              </div>
              <div className="absolute -left-6 -bottom-6 w-24 h-24 opacity-10 pointer-events-none">
                <Image src={badge.circleImage} alt="" fill className="object-contain" />
              </div>
              <span className="text-sm text-[#5F5C5C] uppercase tracking-wider mb-2 relative z-10">
                {badge.label}
              </span>
              <span className="text-2xl md:text-3xl font-bold text-black relative z-10">
                {badge.value}
              </span>
              <span className="text-sm text-[#5F5C5C] mt-1 relative z-10">{badge.subtext}</span>
            </motion.div>
          ))}
        </div>

        {/* Main Audit Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2] border border-[#F632F3] rounded-2xl p-8 md:p-12 relative overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute -left-16 -top-16 w-48 h-48 opacity-20 pointer-events-none">
            <Image src="/img/the_awaking_circles.png" alt="" fill className="object-contain" />
          </div>
          <div className="absolute -right-16 -bottom-16 w-48 h-48 opacity-20 pointer-events-none">
            <Image src="/img/the_awaking_circles.png" alt="" fill className="object-contain rotate-180" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <ShieldCheckIcon className="w-5 h-5 text-[#049414]" />
                <span className="text-sm font-medium text-black">Security Verified</span>
              </div>
              
              <h3 className="text-2xl md:text-3xl font-medium mb-4">
                Audited by{' '}
                <Link
                  href={OTTERSEC_URL}
                  target="_blank"
                  className="text-[#C871FF] hover:text-[#F632F3] transition-colors underline decoration-2 underline-offset-4"
                >
                  OtterSec
                </Link>
              </h3>
              
              <p className="text-[#5F5C5C] mb-8 leading-relaxed max-w-xl">
                Our smart contracts have been thoroughly audited by OtterSec, 
                winners of the cryptography track at the Overflow Hackathon. 
                Every line of code reviewed, every vulnerability addressed. 
                Live on Sui Mainnet with real value at stake.
              </p>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link href={SUI_SENTINEL_AUDIT_REPORT_URL} target="_blank">
                  <button className="btn btn-black flex items-center gap-3 px-6 group">
                    <DocumentTextIcon className="w-5 h-5" />
                    <span>View Audit Report</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </button>
                </Link>
                <Link href={OTTERSEC_URL} target="_blank">
                  <button className="btn btn-outline flex items-center gap-2 px-6 bg-white">
                    <span>About OtterSec</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Visual - Shield Badge */}
            <div className="flex-shrink-0">
              <div className="relative w-40 h-40 md:w-48 md:h-48">
                {/* Rotating ring effect */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-[#C871FF]/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-dotted border-[#F632F3]/20"
                />
                
                {/* Center Shield */}
                <div className="absolute inset-4 bg-white rounded-full flex flex-col items-center justify-center shadow-lg border border-[#F632F3]/20">
                  <ShieldCheckIcon className="w-12 h-12 md:w-16 md:h-16 text-[#C871FF] mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#5F5C5C]">Verified</span>
                  <span className="text-lg font-bold text-black">Secure</span>
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-2 -right-2 bg-[#049414] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                >
                  v1.0
                </motion.div>
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -bottom-1 -left-2 bg-[#C532F6] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
                >
                  Sui
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-8 text-center"
        >
          {[
            { label: 'Lines Audited', value: '2,500+' },
            { label: 'Findings', value: '0 Critical' },
            { label: 'Fixes Applied', value: '100%' },
          ].map((stat, index) => (
            <div key={index} className="px-6">
              <div className="text-2xl font-bold text-[#C871FF]">{stat.value}</div>
              <div className="text-sm text-[#5F5C5C]">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
