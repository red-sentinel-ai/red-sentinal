'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Shield,
  Target,
  Coins,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Clock,
  Database,
  Award,
  CheckCircle,
  ChevronDown,
} from 'lucide-react'
import { SUI_SENTINEL_APP_URL } from '@/constants'

const steps = [
  {
    icon: Shield,
    title: 'Deploy',
    description:
      'Launch your AI agent as a Sentinel on Sui with your system prompt and security rules.',
  },
  {
    icon: Coins,
    title: 'Fund',
    description:
      'Deposit SUI, USDC, or ERC20 tokens as the bounty pool. The more you fund, the more attention you attract.',
  },
  {
    icon: Target,
    title: 'Get Attacked (Safely)',
    description:
      'Red teamers worldwide pay to attempt breaches. Every failed attack grows your bounty and puts money in your wallet.',
  },
  {
    icon: Trophy,
    title: 'Learn & Improve',
    description:
      'Review attack logs, understand vulnerabilities, strengthen your prompts. Your AI gets smarter as it is tested.',
  },
]

const benefits = [
  {
    icon: Clock,
    title: 'Continuous Testing',
    description: '24/7 red teaming, not a one-time audit',
  },
  {
    icon: Database,
    title: 'Real Attack Data',
    description: 'See exactly how attackers try to manipulate your AI',
  },
  {
    icon: Coins,
    title: 'Earn While Securing',
    description: 'Collect 40% of all attack fees',
  },
  {
    icon: Award,
    title: 'Public Resilience Score',
    description: 'Build trust with verifiable security credentials',
  },
  {
    icon: TrendingUp,
    title: 'Cost Effective',
    description: 'Pay only for results, not hourly consulting rates',
  },
  {
    icon: CheckCircle,
    title: 'Verifiable Proof',
    description: 'On-chain attestations of your security testing',
  },
]

const faqs = [
  {
    question: 'How much should I fund my Sentinel with?',
    answer:
      'Minimum bounties start small, but we recommend funding based on the complexity of your AI and the sensitivity of what it protects. Higher bounties attract more skilled attackers and provide more comprehensive testing.',
  },
  {
    question: 'What happens if someone breaks my Sentinel?',
    answer:
      'If an attacker successfully exploits your AI, they receive the bounty and you receive valuable data about exactly how the attack worked. This is precisely the vulnerability you want to find before a malicious actor does.',
  },
  {
    question: 'Can I update my Sentinel after deployment?',
    answer:
      'Yes, you can pause, update your system prompt, and redeploy based on attack data you collect. Many defenders iterate rapidly, strengthening their defenses based on real attack patterns.',
  },
  {
    question: 'Is there a risk to my other systems?',
    answer:
      'None. Your Sentinel is isolated from your production infrastructure. Attackers only interact with the deployed AI interface, never with your backend systems, data, or other applications.',
  },
]

export function ForDefendersContent() {
  return (
    <div className="text-black">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-[#F7F9FF] overflow-hidden">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <div className="badge-pink w-fit mb-6">• for defenders</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
              Ship AI Agents with <span className="text-[#C871FF]">Confidence</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5F5C5C] max-w-2xl mb-8">
              Do not wait for a breach to discover your AI&apos;s weaknesses. Deploy a Sentinel, set
              a bounty, and let ethical hackers battle-test your defenses continuously.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="btn btn-black px-8">Deploy Your First Sentinel</button>
              </Link>
              <Link href="#how-it-works">
                <button className="btn btn-outline px-8">How It Works</button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-[#5F5C5C]">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C871FF]" />
                Audited by OtterSec
              </span>
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C871FF]" />
                Live on Sui Mainnet
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Agitation */}
      <section className="py-24 relative">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="badge-pink w-fit mx-auto mb-6">• the problem</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              The AI Security <span className="text-[#C871FF]">Gap</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              {
                stat: '76%',
                label: 'of enterprises',
                desc: 'have experienced an AI-related security incident (Gartner)',
              },
              {
                stat: '$15M',
                label: 'average cost',
                desc: 'of an AI data breach',
              },
              {
                stat: '0%',
                label: 'of traditional tools',
                desc: 'can effectively detect prompt injection',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-[#F5F5F5] border border-black"
              >
                <div className="text-4xl md:text-5xl font-medium text-[#C871FF] mb-2">
                  {item.stat}
                </div>
                <div className="font-medium mb-2">{item.label}</div>
                <div className="text-sm text-[#5F5C5C]">{item.desc}</div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="flex items-start gap-4 p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
              <p className="text-amber-800 text-left">
                You are shipping AI agents that can access data, make decisions, and take
                actions without knowing how they&apos;ll behave under attack. Traditional security
                tools do not work on AI. Penetration testing is a snapshot, not continuous
                protection.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative bg-[#F7F9FF]">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="badge-pink w-fit mx-auto mb-6">• process</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              How It <span className="text-[#C871FF]">Works</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 border border-black relative"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#C871FF] text-white flex items-center justify-center font-medium text-sm">
                  0{index + 1}
                </div>
                <step.icon className="w-10 h-10 text-[#C871FF] mb-4 mt-2" />
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-sm text-[#5F5C5C]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 relative">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="badge-pink w-fit mx-auto mb-6">• benefits</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Why Defenders Choose <span className="text-[#C871FF]">Sui Sentinel</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 border border-black hover:bg-[#F5F5F5] transition-colors"
              >
                <benefit.icon className="w-8 h-8 text-[#C871FF] mb-4" />
                <h3 className="text-lg font-medium mb-2">{benefit.title}</h3>
                <p className="text-sm text-[#5F5C5C]">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Economics Section */}
      <section className="py-24 relative bg-black text-white">
        <div className="vertical-line left-4 border-l-white/20"></div>
        <div className="vertical-line right-4 border-l-white/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="inline-block bg-[linear-gradient(to_right,#FEB9FF_0%,#FDE3FF_100%)] text-black px-3 py-1 rounded-full text-sm mb-6">
                • simple economics
              </div>
              <h2 className="text-3xl md:text-4xl font-medium mb-6">
                Security That Pays <span className="text-[#C871FF]">You Back</span>
              </h2>
              <p className="text-white/70 mb-8">
                Traditional security audits cost money and end with a report. Sui Sentinel keeps
                paying you while making your AI stronger.
              </p>
              <div className="space-y-4">
                {[
                  { pct: '50%', desc: 'Goes back to bounty pool' },
                  { pct: '40%', desc: 'Goes to you, the defender' },
                  { pct: '10%', desc: 'Protocol fee' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#C871FF]/20 flex items-center justify-center text-[#C871FF] font-medium">
                      {item.pct}
                    </div>
                    <div className="text-white/80">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative h-[400px]"
            >
              <Image
                src="/img/incentivizedIntelligence.png"
                alt="Security Economics"
                fill
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative bg-[#F7F9FF]">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="badge-pink w-fit mx-auto mb-6">• FAQ</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium">Defender Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-black overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <span className="font-medium text-left">{faq.question}</span>
                    <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 text-[#5F5C5C]">{faq.answer}</div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Your AI Is Already Being Targeted
            </h2>
            <p className="text-lg text-[#5F5C5C] mb-8 max-w-2xl mx-auto">
              The only question is whether you will find vulnerabilities first, or attackers will.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="btn btn-black px-8">Start Securing Your AI</button>
              </Link>
              <Link href="/reward-calculator">
                <button className="btn btn-outline px-8">Calculate Your Rewards</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
