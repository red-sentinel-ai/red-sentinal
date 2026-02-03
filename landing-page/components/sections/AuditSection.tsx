'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, FileText, ExternalLink } from 'lucide-react'
import { SUI_SENTINEL_AUDIT_REPORT_URL } from '@/constants'

export function AuditSection() {
  return (
    <section id="audit" className="py-24 relative text-black">
      <div className="vertical-line left-4"></div>
      <div className="vertical-line right-4"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7 }}
           viewport={{ once: true }}
           className="border border-black bg-[#F5F5F5] p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16"
        >
          <div className="flex flex-col items-start w-full md:w-3/5">
            <div className="badge-pink mb-6 inline-block">• Security Audit</div>
            <h2 className="text-3xl md:text-5xl font-medium mb-6 leading-tight">
              Uncompromised Security
            </h2>
            <p className="text-lg text-[#939393] mb-8 leading-relaxed">
              We believe in building a secure future for decentralized AI. That&apos;s why our core infrastructure and smart contracts have been rigorously audited by <span className="text-black font-semibold">OtterSec</span>, ensuring that your assets and agents are protected by industry-leading security standards.
            </p>
            
            <Link 
              href={SUI_SENTINEL_AUDIT_REPORT_URL} 
              target="_blank"
            >
              <button className="btn btn-outline flex items-center gap-3 px-8 group bg-white hover:bg-black hover:text-white transition-all duration-300">
                <FileText className="size-5" />
                <span>View Audit Report</span>
                <ExternalLink className="size-4 opacity-50 group-hover:opacity-100 transition-opacity" />
              </button>
            </Link>
          </div>

          <div className="w-full md:w-2/5 flex justify-center items-center">
             <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white border border-black rounded-full flex flex-col items-center justify-center p-8 shadow-sm">
                <Shield className="w-24 h-24 text-black mb-4" strokeWidth={1} />
                <div className="text-2xl font-bold tracking-wider uppercase">Audited By</div>
                <div className="text-3xl font-black mt-1">OtterSec</div>
                
                {/* Decorative dots/elements */}
                <div className="absolute top-4 right-12 text-2xl text-[#C871FF]">+</div>
                <div className="absolute bottom-10 left-8 text-xl text-[#C871FF]">✦</div>
             </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
