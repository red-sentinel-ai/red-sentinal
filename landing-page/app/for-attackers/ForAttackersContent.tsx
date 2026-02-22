'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Users,
  Zap,
  Trophy,
  Target,
  Brain,
  Flame,
  MessageSquare,
  Puzzle,
  Lightbulb,
  Repeat,
  ChevronDown,
  Shield,
} from 'lucide-react'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_TELEGRAM_URL } from '@/constants'

const steps = [
  {
    icon: Target,
    title: 'Browse & Analyze',
    description:
      'Explore active Sentinels. Study their system prompts, analyze their defenses, identify weaknesses. Every target shows its bounty pool upfront.',
  },
  {
    icon: Zap,
    title: 'Pay & Attack',
    description:
      'Pay the attack fee (goes to the bounty pool + defender + protocol). You get a session with the AI. Use prompt engineering, jailbreaks—whatever works.',
  },
  {
    icon: Trophy,
    title: 'Win & Withdraw',
    description:
      'Successfully convince the AI to send funds? The entire bounty is yours instantly via smart contract. No waiting, no disputes, no KYC.',
  },
]

const skills = [
  {
    icon: MessageSquare,
    title: 'Prompt Engineering',
    desc: 'Craft inputs that bypass filters',
  },
  {
    icon: Brain,
    title: 'Creative Thinking',
    desc: 'Find edge cases developers missed',
  },
  {
    icon: Users,
    title: 'Social Engineering',
    desc: 'Manipulate context and framing',
  },
  {
    icon: Puzzle,
    title: 'Technical Analysis',
    desc: 'Understand model behavior patterns',
  },
  {
    icon: Flame,
    title: 'Persistence',
    desc: 'Try variations until something cracks',
  },
  {
    icon: Lightbulb,
    title: 'Novel Approaches',
    desc: 'Invent new attack vectors',
  },
]

const recentWins = [
  {
    sentinel: '#2842',
    technique: 'Multi-turn context manipulation',
    bounty: '1,200 SUI',
  },
  {
    sentinel: '#1901',
    technique: 'Fictional scenario framing',
    bounty: '850 SUI',
  },
  {
    sentinel: '#3421',
    technique: 'Roleplay attack vector',
    bounty: '2,100 SUI',
  },
]

const faqs = [
  {
    question: 'Do I need to be a professional security researcher?',
    answer:
      'Not at all. While security backgrounds help, many successful attackers are prompt engineers, creative writers, or simply persistent problem-solvers. If you can convince an AI to do something it should not, you can earn.',
  },
  {
    question: 'How much can I earn?',
    answer:
      'Bounties range from small amounts for simple Sentinels to substantial prizes for well-defended targets. Your earnings depend on your skill, creativity, and persistence. Top hunters earn significant returns.',
  },
  {
    question: 'What if I fail to break a Sentinel?',
    answer:
      'Every failed attempt teaches you something. Study successful attacks, refine your techniques, and try again. Many hunters document their attempts and build reputations even before their first win.',
  },
  {
    question: 'Is this legal?',
    answer:
      'Absolutely. You are participating in an authorized bug bounty program. Defenders explicitly deploy Sentinels to be tested. Every attack is logged and verified on-chain as legitimate security research.',
  },
]

export function ForAttackersContent() {
  return (
    <div className="text-black">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center bg-black text-white overflow-hidden">
        <div className="vertical-line left-4 border-l-white/20"></div>
        <div className="vertical-line right-4 border-l-white/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <div className="inline-block bg-[linear-gradient(to_right,#FEB9FF_0%,#FDE3FF_100%)] text-black px-3 py-1 rounded-full text-sm mb-6">
              • for attackers
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
              Get Paid to <span className="text-[#C871FF]">Break AI</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mb-8">
              Your prompt injection skills are valuable. Put them to work, break AI systems
              ethically, and earn real rewards—verified on-chain, paid instantly.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="btn btn-white px-8">Start Attacking</button>
              </Link>
              <Link href={SUI_SENTINEL_TELEGRAM_URL} target="_blank">
                <button className="btn btn-outline-white px-8">Join Discord</button>
              </Link>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-lg"
            >
              <span className="text-white/60 text-sm">Total Bounty Pool</span>
              <div className="text-2xl font-medium text-[#C871FF]">Available to Win</div>
            </motion.div>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full hidden lg:block"
        >
          <Image
            src="/img/customAIArt.png"
            alt="AI Attacker"
            fill
            className="object-contain object-right"
          />
        </motion.div>
      </section>

      {/* The Opportunity */}
      <section className="py-24 relative bg-[#F7F9FF]">
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
            <div className="badge-pink w-fit mx-auto mb-6">• the opportunity</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              The AI Security <span className="text-[#C871FF]">Gold Rush</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { stat: '$50B+', desc: 'Projected AI security market by 2030' },
              { stat: 'Every', desc: 'Company shipping AI needs testing' },
              { stat: '0', desc: 'Traditional bug bounties for AI' },
              { stat: 'You', desc: 'Your creativity is the exploit' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 bg-white border border-black"
              >
                <div className="text-3xl font-medium text-[#C871FF] mb-2">{item.stat}</div>
                <div className="text-sm text-[#5F5C5C]">{item.desc}</div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <p className="text-lg text-[#5F5C5C]">
              Companies are deploying AI agents with millions in their vaults, and they are begging
              to be tested. While they sleep, you can break their defenses and walk away with
              crypto—legally, ethically, instantly.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• process</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Three Steps to Your First <span className="text-[#C871FF]">Payout</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#F5F5F5] p-8 border border-black"
              >
                <div className="w-12 h-12 bg-[#C871FF] text-white flex items-center justify-center font-medium mb-6">
                  0{index + 1}
                </div>
                <step.icon className="w-8 h-8 text-[#C871FF] mb-4" />
                <h3 className="text-xl font-medium mb-3">{step.title}</h3>
                <p className="text-[#5F5C5C]">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-24 relative bg-black text-white">
        <div className="vertical-line left-4 border-l-white/20"></div>
        <div className="vertical-line right-4 border-l-white/20"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-block bg-[linear-gradient(to_right,#FEB9FF_0%,#FDE3FF_100%)] text-black px-3 py-1 rounded-full text-sm mb-6">
              • leaderboard
            </div>
            <h2 className="text-3xl md:text-4xl font-medium mb-6">
              Top Hunters <span className="text-[#C871FF]">This Month</span>
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="border border-white/20 overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-4 p-4 bg-white/5 text-sm text-white/60">
              <div>Rank</div>
              <div>Hunter</div>
              <div>Successful Breaks</div>
              <div className="text-right">Total Earned</div>
            </div>
            {[
              { rank: 1, hunter: '0x7a2...', breaks: 12, earned: '45,230 SUI' },
              { rank: 2, hunter: '0x3f9...', breaks: 8, earned: '31,100 SUI' },
              { rank: 3, hunter: '0x2b1...', breaks: 6, earned: '28,500 SUI' },
              { rank: 4, hunter: '0x9c4...', breaks: 5, earned: '22,800 SUI' },
              { rank: 5, hunter: '0x1d8...', breaks: 4, earned: '18,400 SUI' },
            ].map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-4 gap-4 p-4 border-t border-white/10 hover:bg-white/5 transition-colors"
              >
                <div className="text-[#C871FF] font-medium">#{row.rank}</div>
                <div className="font-mono">{row.hunter}</div>
                <div>{row.breaks}</div>
                <div className="text-right text-[#C871FF]">{row.earned}</div>
              </div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-white/60 mb-4">Your rank: Join to compete</p>
            <Link href={SUI_SENTINEL_APP_URL} target="_blank">
              <button className="btn btn-white px-8">Start Hunting</button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Skills That Win */}
      <section className="py-24 relative bg-[#F7F9FF]">
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
            <div className="badge-pink w-fit mx-auto mb-6">• skills</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              What Skills <span className="text-[#C871FF]">Pay Off?</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 border border-black hover:shadow-lg transition-shadow"
              >
                <skill.icon className="w-8 h-8 text-[#C871FF] mb-4" />
                <h3 className="text-lg font-medium mb-2">{skill.title}</h3>
                <p className="text-sm text-[#5F5C5C]">{skill.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Wins */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• recent wins</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Successful <span className="text-[#C871FF]">Attacks</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {recentWins.map((win, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#F5F5F5] p-6 border border-black"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-[#5F5C5C]">Sentinel {win.sentinel}</span>
                  <Trophy className="w-5 h-5 text-[#C871FF]" />
                </div>
                <p className="text-sm text-[#5F5C5C] mb-4">{win.technique}</p>
                <div className="text-lg font-medium text-[#C871FF]">Won: {win.bounty}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Hunt Here */}
      <section className="py-24 relative bg-black text-white">
        <div className="vertical-line left-4 border-l-white/20"></div>
        <div className="vertical-line right-4 border-l-white/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-block bg-[linear-gradient(to_right,#FEB9FF_0%,#FDE3FF_100%)] text-black px-3 py-1 rounded-full text-sm mb-6">
              • why hunt here
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Why Hunt on <span className="text-[#C871FF]">Sui Sentinel?</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Zap,
                title: 'Instant Payouts',
                desc: 'Win → Money in wallet in seconds via smart contract',
              },
              {
                icon: Shield,
                title: 'No Middlemen',
                desc: 'Smart contracts handle everything automatically',
              },
              {
                icon: Users,
                title: 'Global Competition',
                desc: 'Test your skills against the best from around the world',
              },
              {
                icon: Brain,
                title: 'Skill Building',
                desc: 'Every failed attempt teaches you something new',
              },
              {
                icon: Trophy,
                title: 'Reputation Scores',
                desc: 'Build your hunter profile and track your progress',
              },
              {
                icon: Repeat,
                title: 'Always Available',
                desc: 'New Sentinels deployed daily, bounties updated live',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 border border-white/20 hover:bg-white/5 transition-colors"
              >
                <item.icon className="w-8 h-8 text-[#C871FF] mb-4" />
                <h3 className="text-lg font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </motion.div>
            ))}
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
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium">Hunter Questions</h2>
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
              Your First Target Is Waiting
            </h2>
            <p className="text-lg text-[#5F5C5C] mb-8 max-w-2xl mx-auto">
              Every minute you wait, someone else might claim that bounty.
            </p>
            <Link href={SUI_SENTINEL_APP_URL} target="_blank">
              <button className="btn btn-black px-8">Browse Active Sentinels</button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
