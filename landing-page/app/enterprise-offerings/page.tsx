'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { AdvancedDashboard } from '@/components/AdvancedDashboard'
import { Navbar } from '@/components/sections/NavBar'
import { SUI_SENTINEL_APP_URL } from '@/constants'
import {
  Shield,
  ChevronRight,
  Check,
  Lock,
  FileText,
  Clock,
  Users,
  Zap,
  Sparkles,
} from 'lucide-react'

const enterpriseFeatures = [
  {
    icon: Shield,
    title: 'Real-time Threat Monitoring',
    description:
      'Track every attack attempt with millisecond precision. Our dashboard provides live updates on attacker behavior, attack vectors, and system resilience.',
  },
  {
    icon: Lock,
    title: 'TEE-Verified Security',
    description:
      'Every attack is verified inside a Trusted Execution Environment with cryptographic attestations. No fake attacks, no disputed results.',
  },
  {
    icon: FileText,
    title: 'Compliance Reports',
    description:
      'Generate SOC 2, ISO 27001, and custom compliance reports with one click. Full audit trails for all security testing activities.',
  },
  {
    icon: Clock,
    title: 'Historical Analytics',
    description:
      'Analyze security trends over time. Compare resilience scores, attack patterns, and vulnerability discovery rates across months.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Multi-user access with role-based permissions. Share insights with your security team, executives, and auditors.',
  },
  {
    icon: Zap,
    title: 'Instant Alerts',
    description:
      'Get notified immediately when critical vulnerabilities are discovered. Integrate with Slack, PagerDuty, or your existing SOC tools.',
  },
]

export default function DashboardDemoPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F445AB]/10 text-[#F445AB] text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Enterprise Dashboard
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-medium text-gray-900 leading-tight mb-6">
            Your AI Security{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#F445AB] to-[#C871FF]">
              Command Center
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Monitor, analyze, and harden your AI systems with enterprise-grade security
            intelligence. Real-time visibility into every attack attempt.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            {[
              'SOC 2 Type II Certified',
              'TEE-Verified Attestations',
              '24/7 Enterprise Support',
            ].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span>{badge}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Dashboard Preview */}
      <section className="relative bg-[#FAFAFA]">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Browser chrome decoration */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-t-2xl border border-gray-200 border-b-0 p-3 flex items-center gap-2 shadow-sm">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-gray-100 rounded-lg px-4 py-1.5 text-xs text-gray-500 flex items-center gap-2">
                  dashboard.suisentinel.xyz/enterprise
                </div>
              </div>
            </div>
          </div>

          {/* The actual dashboard */}
          <div className="border-t border-gray-200">
            <AdvancedDashboard />
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-medium text-gray-900 mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need to secure your AI systems at scale
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enterpriseFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-[#F445AB]/20 hover:shadow-lg hover:shadow-[#F445AB]/5 transition-all duration-300 bg-white"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F445AB]/10 to-[#C871FF]/10 flex items-center justify-center mb-4 group-hover:from-[#F445AB]/20 group-hover:to-[#C871FF]/20 transition-all">
                  <feature.icon className="w-6 h-6 text-[#F445AB]" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-medium text-gray-900 mb-6">
            Ready to secure your AI?
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Deploy your first Sentinel and get real-time visibility into your AI security posture.
            Join enterprises already using Sui Sentinel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={SUI_SENTINEL_APP_URL}
              target="_blank"
              className="group flex items-center gap-2 bg-gradient-to-r from-[#F445AB] to-[#C871FF] text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-[#F445AB]/25 hover:shadow-[#F445AB]/40 hover:scale-105 transition-all"
            >
              Deploy Your Sentinel
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/book-a-demo"
              className="flex items-center gap-2 bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              Schedule Demo
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
