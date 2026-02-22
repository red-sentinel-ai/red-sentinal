'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Shield,
  RefreshCw,
  Users,
  Target,
  Lock,
  Zap,
  Eye,
  MessageSquare,
  Code,
  Brain,
  ChevronDown,
} from 'lucide-react'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'

const attackTypes = [
  {
    icon: MessageSquare,
    title: 'Prompt Injection',
    description:
      'Manipulate the AI through crafted inputs that override system instructions and security guardrails.',
  },
  {
    icon: Lock,
    title: 'Jailbreaking',
    description:
      'Bypass safety restrictions through roleplay scenarios, hypothetical framing, and creative context manipulation.',
  },
  {
    icon: Eye,
    title: 'Data Extraction',
    description:
      'Trick models into leaking training data, memorized information, or sensitive details through targeted queries.',
  },
  {
    icon: Brain,
    title: 'Model Inversion',
    description:
      'Reverse-engineer model outputs to reconstruct input data and uncover hidden training information.',
  },
  {
    icon: Zap,
    title: 'Adversarial Prompting',
    description:
      'Cause unintended behaviors through subtle character-level perturbations and semantic manipulation.',
  },
  {
    icon: Code,
    title: 'Social Engineering',
    description:
      'Exploit contextual reasoning and persuasive techniques to deceive AI systems into harmful actions.',
  },
]

const faqs = [
  {
    question: 'How is this different from hiring a red team firm?',
    answer:
      'Traditional red teaming is a point-in-time assessment. Sui Sentinel is continuous—your AI is tested 24/7 by a global community, with every attack verified and recorded on-chain. You get ongoing security data rather than a single PDF report.',
  },
  {
    question: 'What types of AI systems can I test?',
    answer:
      'Any LLM-based system can be deployed as a Sentinel: chatbots, AI agents, autonomous systems, or custom language models. As long as your system can accept prompts and return responses, it can be tested on our platform.',
  },
  {
    question: 'How do payouts work?',
    answer:
      'When an attacker successfully breaks your Sentinel, the bounty is transferred instantly via smart contract on the Sui blockchain. No invoices, no 30-day delays, no disputes—pure programmatic execution.',
  },
  {
    question: 'Is my proprietary data safe?',
    answer:
      'Attackers never see your proprietary data or model weights. They interact only with the deployed Sentinel\'s interface, just like real users would. Your training data and internal systems remain completely isolated.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'You set your own bounty amount based on your security needs and budget. Attackers pay a small fee per message attempt. You earn 40% of all attack fees while building your bounty pool. The protocol takes a 10% fee to sustain operations.',
  },
]

export function RedTeamingContent() {
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
            <div className="badge-pink w-fit mb-6">• AI Red Teaming</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
              AI Red Teaming at{' '}
              <span className="text-[#C871FF]">Scale</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5F5C5C] max-w-2xl mb-8">
              Stop shipping AI systems blind. Get them battle-tested by a global
              community of security researchers before production.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="btn btn-black px-8">Deploy Your Sentinel</button>
              </Link>
              <Link href="#how-it-works">
                <button className="btn btn-outline px-8">See How It Works</button>
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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-full hidden lg:block"
        >
          <Image
            src="/img/howItWorksLG.png"
            alt="AI Red Teaming Illustration"
            fill
            className="object-contain object-right opacity-30"
          />
        </motion.div>
      </section>

      {/* What is AI Red Teaming */}
      <section className="py-24 relative">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <div className="badge-pink w-fit mx-auto mb-6">• what is it</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              What is AI Red Teaming?
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-lg text-[#5F5C5C] mb-6">
                AI red teaming is the practice of systematically testing AI systems
                for vulnerabilities, weaknesses, and failure modes. Unlike
                traditional software testing, AI systems are attacked through
                language—prompt injection, jailbreaks, and adversarial inputs that
                can manipulate models into leaking data or executing unintended
                actions.
              </p>
              <p className="text-lg text-[#5F5C5C]">
                Traditional red teaming is expensive, slow, and does not scale. You
                hire a firm, they test for a week, deliver a report, and leave. Your
                AI keeps learning, evolving, and new vulnerabilities emerge the next
                day.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative h-[400px] bg-[#F5F5F5] rounded-lg overflow-hidden"
            >
              <Image
                src="/img/evolvingSecurityArt.png"
                alt="AI Security Testing"
                fill
                className="object-contain p-8"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Sui Sentinel Difference */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• the difference</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              The Sui Sentinel <span className="text-[#C871FF]">Difference</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: RefreshCw,
                title: 'Always-On Testing',
                description:
                  'Your Sentinels are live 24/7. Attackers worldwide are constantly trying to break them, generating continuous security data.',
              },
              {
                icon: Shield,
                title: 'Verified on Chain',
                description:
                  'Every attack is verified inside a Trusted Execution Environment with cryptographic attestations. No fake attacks, no disputed results.',
              },
              {
                icon: Users,
                title: 'Incentivized Community',
                description:
                  'Attackers earn real money for finding vulnerabilities. Defenders earn from attack fees. Everyone wins.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 border border-black"
              >
                <item.icon className="w-10 h-10 text-[#C871FF] mb-6" />
                <h3 className="text-xl font-medium mb-4">{item.title}</h3>
                <p className="text-[#5F5C5C]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Attack Types */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• attack vectors</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Attack Types Our Community{' '}
              <span className="text-[#C871FF]">Tests For</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attackTypes.map((attack, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#F5F5F5] p-6 hover:bg-[#F0F0F0] transition-colors"
              >
                <attack.icon className="w-8 h-8 text-[#C871FF] mb-4" />
                <h3 className="text-lg font-medium mb-2">{attack.title}</h3>
                <p className="text-sm text-[#5F5C5C]">{attack.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Flywheel */}
      <section id="how-it-works" className="py-24 relative bg-black text-white">
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
              • the flywheel
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              The Self-Reinforcing{' '}
              <span className="text-[#C871FF]">Security Flywheel</span>
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                step: '01',
                title: 'Defender Deploys',
                desc: 'Deploy Sentinel with bounty pool',
              },
              {
                step: '02',
                title: 'Attackers Pay',
                desc: 'Fee funds bigger bounties',
              },
              {
                step: '03',
                title: 'Pool Grows',
                desc: 'Failed attempts increase reward',
              },
              {
                step: '04',
                title: 'More Attackers',
                desc: 'Larger bounties attract hunters',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="border border-white/20 p-6"
              >
                <span className="text-[#C871FF] text-sm font-medium">
                  {item.step}
                </span>
                <h3 className="text-lg font-medium mt-2 mb-2">{item.title}</h3>
                <p className="text-sm text-white/60">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              More attacks generate more security data, which helps defenders
              improve, which attracts more attackers. A self-reinforcing system
              that gets more valuable with scale.
            </p>
            <Link href={SUI_SENTINEL_APP_URL} target="_blank">
              <button className="btn btn-white px-8">Launch App</button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats / Trust Bar */}
      <section className="py-16 relative border-b border-black">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Live on', value: 'Sui Mainnet' },
              { label: 'Verification', value: 'TEE Attestations' },
              { label: 'Audited by', value: 'OtterSec' },
              { label: 'Recognition', value: 'Overflow Winner' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-[#C871FF] text-sm mb-1">{stat.label}</div>
                <div className="font-medium">{stat.value}</div>
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
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium">
              Common Questions
            </h2>
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
              Ready to Test Your AI&apos;s Limits?
            </h2>
            <p className="text-lg text-[#5F5C5C] mb-8 max-w-2xl mx-auto">
              Deploy your first Sentinel in minutes. Set your bounty. Let the
              world&apos;s red teamers find what you missed.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="btn btn-black px-8">Launch App</button>
              </Link>
              <Link href={SUI_SENTINEL_DOCS_URL} target="_blank">
                <button className="btn btn-outline px-8">Read Documentation</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
