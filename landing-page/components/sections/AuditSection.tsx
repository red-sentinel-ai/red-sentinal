'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline'
import { SUI_SENTINEL_AUDIT_REPORT_URL, OTTERSEC_URL } from '@/constants'

export function AuditSection() {
  return (
    <section id="audit" className="py-24 relative text-black">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Main Credibility Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2] border border-[#F632F3] rounded-2xl p-8 md:p-12 lg:p-16 relative overflow-hidden"
        >
          {/* Background Circle Decorations */}
          <div className="absolute -left-20 -top-20 w-64 h-64 opacity-20 pointer-events-none">
            <Image src="/img/the_awaking_circles.png" alt="" fill className="object-contain" />
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 opacity-20 pointer-events-none">
            <Image src="/img/the_ego_crisis_circles.png" alt="" fill className="object-contain" />
          </div>
          <div className="absolute right-1/4 top-0 w-48 h-48 opacity-10 pointer-events-none">
            <Image src="/img/the_cosmic_roast_circles.png" alt="" fill className="object-contain" />
          </div>

          <div className="relative z-10">
            {/* Top Badge */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#F632F3]/20">
                <ShieldCheckIcon className="w-5 h-5 text-[#049414]" />
                <span className="text-sm font-medium text-black">Security Verified</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl md:text-5xl lg:text-[56px] font-medium mb-6 leading-tight">
                Battle-Tested & <span className="text-[#C871FF]">Audited</span>
              </h2>
              <p className="text-lg text-[#5F5C5C]">
                Our smart contracts are audited by{' '}
                <Link
                  href={OTTERSEC_URL}
                  target="_blank"
                  className="text-[#C871FF] hover:text-[#F632F3] transition-colors underline decoration-2 underline-offset-4 font-medium"
                >
                  OtterSec
                </Link>
                , winners of the cryptography track at the Overflow Hackathon. Live on Sui & Solana Mainnet.
                We don&apos;t just talk about security, we prove it.
              </p>
            </div>

            {/* Credibility Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                {
                  label: 'Audited By',
                  value: 'OtterSec',
                  subtext: 'Industry Leader',
                  icon: ShieldCheckIcon,
                  color: 'text-[#C532F6]',
                },
                {
                  label: 'Status',
                  value: 'Mainnet',
                  subtext: 'Production Live',
                  icon: ShieldCheckIcon,
                  color: 'text-[#049414]',
                },
                {
                  label: 'Recognition',
                  value: 'Winner',
                  subtext: 'Overflow Hackathon',
                  icon: ShieldCheckIcon,
                  color: 'text-[#F632F3]',
                },
                {
                  label: 'Code Coverage',
                  value: '100%',
                  subtext: 'Audited & Verified',
                  icon: ShieldCheckIcon,
                  color: 'text-[#947204]',
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border border-[#F632F3]/10 hover:bg-white/80 transition-colors"
                >
                  <div className={`text-2xl md:text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-black">{stat.label}</div>
                  <div className="text-xs text-[#5F5C5C]">{stat.subtext}</div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href={SUI_SENTINEL_AUDIT_REPORT_URL} target="_blank">
                <button className="btn btn-black flex items-center gap-3 px-8 group">
                  <DocumentTextIcon className="w-5 h-5" />
                  <span>View Audit Report</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
              </Link>
              <Link href={OTTERSEC_URL} target="_blank">
                <button className="btn btn-outline flex items-center gap-2 px-8 bg-white hover:bg-black hover:text-white transition-all">
                  <span>About OtterSec</span>
                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Bottom Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {[
            { label: 'Lines of Code Audited', value: '2,500+' },
            { label: 'Critical Findings', value: '0' },
            { label: 'Security Fixes Applied', value: '100%' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-[#C871FF]">{stat.value}</div>
              <div className="text-sm text-[#5F5C5C] mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
