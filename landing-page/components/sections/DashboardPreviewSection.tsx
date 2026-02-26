'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Shield, Lock, Sparkles } from 'lucide-react'
import { AdvancedDashboard } from '@/components/AdvancedDashboard'

export function DashboardPreviewSection() {
  return (
    <section id="dashboard" className="py-24 relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/30 to-white pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="badge-pink w-fit mx-auto mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Enterprise Dashboard</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-medium text-black leading-tight mb-6">
            Your Security <span className="text-[#C871FF]">Command Center</span>
          </h2>
          <p className="text-lg text-[#5F5C5C] max-w-2xl mx-auto mb-8">
            Get real-time visibility into your AI security posture. Monitor attacks, track
            resilience scores, and manage vulnerabilities - all in one place.
          </p>
          <Link
            href="/book-a-demo"
            className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all group"
          >
            Book a Demo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Dashboard Preview - Framed */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Browser chrome */}
          <div className="bg-gray-100 rounded-t-2xl border border-gray-200 border-b-0 p-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-lg px-4 py-1.5 text-xs text-gray-500 flex items-center gap-2 border border-gray-200">
                dashboard.suisentinel.xyz/enterprise
              </div>
            </div>
          </div>

          {/* Dashboard Container with fixed height and scroll */}
          <div className="relative bg-[#FAFAFA] rounded-b-2xl border border-gray-200 shadow-2xl shadow-gray-200/50 overflow-hidden">
            {/* Scaled/Contained Dashboard - No navbar in preview */}
            <div className="h-[600px] overflow-y-auto overflow-x-hidden">
              <div className="min-h-full">
                <AdvancedDashboard showNavbar={false} />
              </div>
            </div>

            {/* Gradient overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAFAFA] to-transparent pointer-events-none" />
          </div>

          {/* Decorative glow */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-[#F445AB]/20 blur-[60px] pointer-events-none" />
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 mb-4">
            See how enterprises monitor and protect their AI systems
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/enterprise-offerings"
              className="inline-flex items-center gap-2 text-[#C871FF] hover:text-[#F445AB] font-medium transition-colors group"
            >
              View Full Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <span className="hidden sm:inline text-gray-300">|</span>
            <Link
              href="/book-a-demo"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Schedule a personalized demo
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
