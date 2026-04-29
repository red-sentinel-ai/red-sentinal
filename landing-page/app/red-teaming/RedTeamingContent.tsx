'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { SUI_SENTINEL_APP_URL, SUI_SENTINEL_DOCS_URL } from '@/constants'

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true
      let start = 0
      const end = value
      const duration = 2000
      const increment = end / (duration / 16)
      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [isInView, value])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

// Comparison table data
const comparisonData = [
  {
    aspect: 'Attack Focus',
    traditional: 'Exploits code vulnerabilities, bugs, misconfigurations',
    genai: 'Manipulates decision-making processes through crafted inputs',
  },
  {
    aspect: 'Attacker Profile',
    traditional: 'Requires deep technical expertise, specialized knowledge',
    genai: 'Accessible to anyone with language skills and creativity',
  },
  {
    aspect: 'Attack Medium',
    traditional: 'Coding, technical exploits, network penetration',
    genai: 'Natural language, images, audio, and human communication',
  },
  {
    aspect: 'Detection',
    traditional: 'Known patterns trigger security alarms',
    genai: 'Subtle manipulation evades traditional detection',
  },
]

// Attack types data with custom SVG icons
const attackTypes = [
  {
    title: 'Prompt Injection',
    description:
      'Override system instructions through carefully crafted user inputs that bypass security guardrails.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path
          d="M12 16h24M12 24h18M12 32h12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="36" cy="32" r="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M34 32l1.5 1.5L38 30"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    gradient: 'bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF]',
    borderColor: 'border-[#C532F6]',
    circleImage: '/img/the_ego_crisis_circles.png',
  },
  {
    title: 'Jailbreaking',
    description:
      'Bypass safety restrictions through roleplay scenarios, hypothetical framing, and creative context manipulation.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="10" y="18" width="28" height="22" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M16 18v-4a8 8 0 0116 0v4" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="29" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M24 32v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    gradient: 'bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2]',
    borderColor: 'border-[#F632F3]',
    circleImage: '/img/the_awaking_circles.png',
  },
  {
    title: 'Data Extraction',
    description:
      'Trick models into leaking training data, memorized information, or sensitive details through targeted queries.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path d="M24 8v32M8 16l16-8 16 8v16l-16 8-16-8V16z" stroke="currentColor" strokeWidth="2" />
        <path d="M16 20l8-4 8 4v8l-8 4-8-4v-8z" stroke="currentColor" strokeWidth="2" />
        <path d="M8 16l16 8 16-8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
    gradient: 'bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED]',
    borderColor: 'border-[#049414]',
    circleImage: '/img/the_cosmic_roast_circles.png',
  },
  {
    title: 'Model Inversion',
    description:
      'Reverse-engineer model outputs to reconstruct input data and uncover hidden training information.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="24" cy="24" r="2" fill="currentColor" />
        <path
          d="M24 6v6M24 36v6M6 24h6M36 24h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    gradient: 'bg-gradient-to-b from-[#F2EFCC] via-[#F7FCEE] to-[#DDE6A9]',
    borderColor: 'border-[#947204]',
    circleImage: '/img/the_challenge_begins_circles.png',
  },
  {
    title: 'Adversarial Prompting',
    description:
      'Cause unintended behaviors through subtle character-level perturbations and semantic manipulation.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path
          d="M8 36l8-24 8 16 8-8 8 16H8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="12" r="2" fill="currentColor" />
        <circle cx="32" cy="20" r="2" fill="currentColor" />
      </svg>
    ),
    gradient: 'bg-gradient-to-b from-[#E5CCF5] via-[#F5EEFB] to-[#EBD9F5]',
    borderColor: 'border-[#8B32F6]',
    circleImage: '/img/the_ego_crisis_circles.png',
  },
  {
    title: 'Social Engineering',
    description:
      'Exploit contextual reasoning and persuasive techniques to deceive AI systems into harmful actions.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <circle cx="24" cy="16" r="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 40c0-6.627 5.373-12 12-12s12 5.373 12 12"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M36 20l4-4M8 20l-4-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
    gradient: 'bg-gradient-to-b from-[#F6D5BC] via-[#FFF8F0] to-[#FCE5CC]',
    borderColor: 'border-[#F67A32]',
    circleImage: '/img/the_awaking_circles.png',
  },
]

// Flywheel steps
const flywheelSteps = [
  {
    step: '01',
    title: 'Deploy',
    desc: 'Defender deploys Sentinel with bounty pool',
    color: '#C532F6',
    circleImage: '/img/the_ego_crisis_circles.png',
  },
  {
    step: '02',
    title: 'Attack',
    desc: 'Attackers pay fee to attempt breaches',
    color: '#F632F3',
    circleImage: '/img/the_awaking_circles.png',
  },
  {
    step: '03',
    title: 'Grow',
    desc: 'Failed attempts increase the bounty pool',
    color: '#049414',
    circleImage: '/img/the_cosmic_roast_circles.png',
  },
  {
    step: '04',
    title: 'Attract',
    desc: 'Larger bounties attract more attackers',
    color: '#947204',
    circleImage: '/img/the_challenge_begins_circles.png',
  },
  {
    step: '05',
    title: 'Learn',
    desc: 'More attacks generate security data',
    color: '#8B32F6',
    circleImage: '/img/the_ego_crisis_circles.png',
  },
  {
    step: '06',
    title: 'Improve',
    desc: 'Defender strengthens AI defenses',
    color: '#F67A32',
    circleImage: '/img/the_awaking_circles.png',
  },
]

// Best practices
const bestPractices = [
  'Assemble diverse teams for comprehensive vulnerability coverage',
  'Develop detailed testing plans with clear objectives',
  'Iteratively refine strategies based on findings',
  'Prioritize ethics throughout the testing process',
  'Maintain detailed records of attack strategies and outcomes',
]

// FAQs
const faqs = [
  {
    question: 'How is this different from hiring a red team firm?',
    answer:
      'Traditional red teaming is a point-in-time assessment. Red Sentinel is continuous. Your AI is tested 24/7 by a global community, with every attack verified and recorded on-chain. You get ongoing security data rather than a single PDF report.',
  },
  {
    question: 'What types of AI systems can I test?',
    answer:
      'Any LLM-based system can be deployed as a Sentinel: chatbots, AI agents, autonomous systems, or custom language models. As long as your system can accept prompts and return responses, it can be tested on our platform.',
  },
  {
    question: 'How do payouts work?',
    answer:
      'When an attacker successfully breaks your Sentinel, the bounty is transferred instantly via smart contract on the Sui blockchain. No invoices, no 30-day delays, no disputes, only pure programmatic execution.',
  },
  {
    question: 'Is my proprietary data safe?',
    answer:
      "Attackers never see your proprietary data or model weights. They interact only with the deployed Sentinel's interface, just like real users would. Your training data and internal systems remain completely isolated.",
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
              AI Red Teaming at <span className="text-[#C871FF]">Scale</span>
            </h1>
            <p className="text-lg md:text-xl text-black max-w-2xl mb-8">
              Stop shipping AI systems blind. Get them battle-tested by a global community of
              security researchers before production.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="btn btn-black px-8">Deploy Your Sentinel</button>
              </Link>
              <Link href="#how-it-works">
                <button className="btn btn-outline px-8">See How It Works</button>
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-black">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C871FF]" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Audited by OtterSec
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#C871FF]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" />
                </svg>
                Live on Sui & Solana Mainnet
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
            <p className="text-lg text-black">
              Red teaming is the practice of roleplaying as an attacker to uncover vulnerabilities
              before malicious actors do.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {/* Origin Card */}
              <div className="bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF] border border-[#C532F6] rounded-lg p-8 relative overflow-hidden group min-h-[200px]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[276px] h-[252px] opacity-30 pointer-events-none">
                  <Image
                    src="/img/the_ego_crisis_circles.png"
                    alt=""
                    fill
                    className="object-contain mix-blend-multiply"
                  />
                </div>
                <h3 className="text-xl font-medium mb-4 relative z-10">The Origin</h3>
                <p className="text-black relative z-10">
                  The term originated during the Cold War, where the &ldquo;red team&rdquo;
                  simulated enemy offensive strategies so the &ldquo;blue team&rdquo; could develop
                  robust defenses. Today, this military-proven approach protects AI systems.
                </p>
              </div>

              {/* Why It Matters Card */}
              <div className="bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2] border border-[#F632F3] rounded-lg p-8 relative overflow-hidden group min-h-[200px]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[276px] h-[252px] opacity-30 pointer-events-none">
                  <Image
                    src="/img/the_awaking_circles.png"
                    alt=""
                    fill
                    className="object-contain mix-blend-multiply"
                  />
                </div>
                <h3 className="text-xl font-medium mb-4 relative z-10">Why It Matters</h3>
                <p className="text-black relative z-10">
                  AI systems face unique threats: prompt injection, jailbreaking, data extraction.
                  Traditional security tools cannot detect these language-based attacks. Red teaming
                  finds vulnerabilities before attackers do.
                </p>
              </div>

              {/* Best Practices */}
              <div className="bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED] border border-[#049414] rounded-lg p-8 relative overflow-hidden min-h-[280px]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[320px] opacity-20 pointer-events-none">
                  <Image
                    src="/img/the_cosmic_roast_circles.png"
                    alt=""
                    fill
                    className="object-contain object-top mix-blend-multiply"
                  />
                </div>
                <h3 className="text-xl font-medium mb-4 relative z-10">Best Practices</h3>
                <ul className="space-y-3 relative z-10">
                  {bestPractices.map((practice, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start gap-3 text-black"
                    >
                      <span className="w-2 h-2 bg-[#049414] rounded-full mt-2 shrink-0" />
                      {practice}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="relative h-[300px] bg-gradient-to-b from-[#F2EFCC] via-[#F7FCEE] to-[#DDE6A9] rounded-lg overflow-hidden border border-[#947204]">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                  <Image
                    src="/img/the_challenge_begins_circles.png"
                    alt=""
                    fill
                    className="object-cover mix-blend-multiply"
                  />
                </div>
                <Image
                  src="/img/evolvingSecurityArt.png"
                  alt="AI Security Testing"
                  fill
                  className="object-contain p-8 relative z-10"
                />
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-b from-[#E5CCF5] via-[#F5EEFB] to-[#EBD9F5] border border-[#8B32F6] rounded-lg p-6 text-center relative overflow-hidden min-h-[140px]"
                >
                  <div className="absolute -right-8 -top-8 w-32 h-32 opacity-20 pointer-events-none">
                    <Image
                      src="/img/the_ego_crisis_circles.png"
                      alt=""
                      fill
                      className="object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="text-3xl font-medium text-[#8B32F6] mb-1 relative z-10">
                    <AnimatedCounter value={76} suffix="%" />
                  </div>
                  <p className="text-sm text-black relative z-10">
                    of enterprises experienced AI security incidents
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-b from-[#F6D5BC] via-[#FFF8F0] to-[#FCE5CC] border border-[#F67A32] rounded-lg p-6 text-center relative overflow-hidden min-h-[140px]"
                >
                  <div className="absolute -right-8 -top-8 w-32 h-32 opacity-20 pointer-events-none">
                    <Image
                      src="/img/the_awaking_circles.png"
                      alt=""
                      fill
                      className="object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="text-3xl font-medium text-[#F67A32] mb-1 relative z-10">
                    $<AnimatedCounter value={15} suffix="M+" />
                  </div>
                  <p className="text-sm text-black relative z-10">
                    average cost of an AI data breach
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GenAI vs Traditional Comparison Table */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• threat landscape</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              GenAI vs Traditional <span className="text-[#C871FF]">Security</span>
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto">
              Understanding the fundamental differences between traditional cybersecurity threats
              and emerging GenAI risks
            </p>
          </motion.div>

          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="overflow-hidden border border-black bg-white rounded-lg"
          >
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-black text-white">
              <div className="p-4 md:p-6 font-medium">Aspect</div>
              <div className="p-4 md:p-6 font-medium border-l border-white/20">
                Traditional Security
              </div>
              <div className="p-4 md:p-6 font-medium border-l border-white/20 text-[#C871FF]">
                GenAI Threats
              </div>
            </div>

            {/* Table Rows */}
            {comparisonData.map((row, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
                className={`grid grid-cols-3 ${index !== comparisonData.length - 1 ? 'border-b border-gray-200' : ''} ${index % 2 === 1 ? 'bg-[#F9F9F9]' : 'bg-white'}`}
              >
                <div className="p-4 md:p-6 font-medium text-sm md:text-base">{row.aspect}</div>
                <div className="p-4 md:p-6 border-l border-gray-200 text-sm md:text-base text-black">
                  {row.traditional}
                </div>
                <div className="p-4 md:p-6 border-l border-gray-200 text-sm md:text-base text-black bg-[#C871FF]/5">
                  {row.genai}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Key Insight Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-8 p-6 bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF] border border-[#C532F6] rounded-lg flex items-start gap-4 relative overflow-hidden"
          >
            <div className="absolute -right-8 -bottom-8 w-[276px] h-[252px] opacity-20 pointer-events-none">
              <Image
                src="/img/the_ego_crisis_circles.png"
                alt=""
                fill
                className="object-contain mix-blend-multiply"
              />
            </div>
            <div className="w-12 h-12 bg-[#C532F6] rounded-full flex items-center justify-center shrink-0 relative z-10">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="relative z-10">
              <h4 className="font-medium text-lg mb-2">Key Insight</h4>
              <p className="text-black">
                Traditional security focuses on protecting code and infrastructure. GenAI security
                focuses on protecting decision-making processes, making it more accessible to
                attackers but harder to detect with conventional tools.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Red Sentinel Difference */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• the difference</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              The Red Sentinel <span className="text-[#C871FF]">Difference</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Always-On Testing',
                description:
                  'Your Sentinels are live 24/7. Attackers worldwide are constantly trying to break them, generating continuous security data.',
                gradient: 'bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF]',
                borderColor: 'border-[#C532F6]',
                circleImage: '/img/the_ego_crisis_circles.png',
                icon: (
                  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <path
                      d="M24 4v4M24 40v4M4 24h4M40 24h4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M24 18v6l4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
              },
              {
                title: 'Verified on Chain',
                description:
                  'Every attack is verified inside a Trusted Execution Environment with cryptographic attestations. No fake attacks, no disputed results.',
                gradient: 'bg-gradient-to-b from-[#C3ECE6] via-[#F1FDFB] to-[#CCF0ED]',
                borderColor: 'border-[#049414]',
                circleImage: '/img/the_cosmic_roast_circles.png',
                icon: (
                  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <rect
                      x="8"
                      y="16"
                      width="32"
                      height="24"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M16 16v-4a8 8 0 0116 0v4" stroke="currentColor" strokeWidth="2" />
                    <circle cx="24" cy="28" r="3" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M12 12l-4-4M36 12l4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                ),
              },
              {
                title: 'Incentivized Community',
                description:
                  'Attackers earn real money for finding vulnerabilities. Defenders earn from attack fees. Everyone wins.',
                gradient: 'bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2]',
                borderColor: 'border-[#F632F3]',
                circleImage: '/img/the_awaking_circles.png',
                icon: (
                  <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
                    <circle cx="24" cy="16" r="6" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M8 40c0-6.627 5.373-12 12-12s12 5.373 12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="38" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M42 26c0-3.314-2.686-6-6-6s-6 2.686-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                ),
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className={`${item.gradient} ${item.borderColor} border rounded-lg p-8 group hover:shadow-lg transition-all relative overflow-hidden min-h-[320px]`}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[276px] h-[252px] opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none">
                  <Image
                    src={item.circleImage}
                    alt=""
                    fill
                    className="object-contain mix-blend-multiply"
                  />
                </div>
                <div className="w-12 h-12 text-black mb-6 group-hover:scale-110 transition-transform relative z-10">
                  {item.icon}
                </div>
                <h3 className="text-xl font-medium mb-4 relative z-10">{item.title}</h3>
                <p className="text-black relative z-10">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Attack Types (Colorful Cards Style) */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• attack vectors</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Attack Types We <span className="text-[#C871FF]">Test For</span>
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto">
              Our community tests against the full spectrum of AI attack vectors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attackTypes.map((attack, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className={`${attack.gradient} ${attack.borderColor} border rounded-lg p-6 group relative overflow-hidden min-h-[260px] flex flex-col`}
              >
                {/* Circle Image */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[180px] opacity-20 pointer-events-none">
                  <Image
                    src={attack.circleImage}
                    alt=""
                    fill
                    className="object-contain object-top mix-blend-multiply"
                  />
                </div>
                <div className="w-10 h-10 text-black mb-4 group-hover:scale-110 transition-transform relative z-10">
                  {attack.icon}
                </div>
                <h3 className="text-lg font-medium mb-2 relative z-10">{attack.title}</h3>
                <p className="text-sm text-black relative z-10 flex-grow">{attack.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Flywheel */}
      <section id="how-it-works" className="py-24 relative">
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
            <div className="badge-pink w-fit mx-auto mb-6">• the flywheel</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              The Self-Reinforcing <span className="text-[#C871FF]">Security Flywheel</span>
            </h2>
            <p className="text-lg text-black max-w-2xl mx-auto">
              A virtuous cycle where more attacks lead to stronger defenses, attracting more
              attackers and creating more value
            </p>
          </motion.div>

          {/* Flywheel Steps */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {flywheelSteps.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div
                  className="bg-white border-2 rounded-lg p-6 h-full text-center relative overflow-hidden min-h-[160px]"
                  style={{ borderColor: item.color }}
                >
                  {/* Circle Image */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[180px] h-[160px] opacity-10 pointer-events-none">
                    <Image
                      src={item.circleImage}
                      alt=""
                      fill
                      className="object-contain object-top mix-blend-multiply"
                    />
                  </div>
                  <span
                    className="text-2xl font-bold block mb-2 relative z-10"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </span>
                  <h3 className="font-medium mb-1 relative z-10">{item.title}</h3>
                  <p className="text-xs text-black relative z-10">{item.desc}</p>
                </div>
                {/* Arrow indicator for desktop */}
                {index < flywheelSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <svg className="w-6 h-6 text-[#C871FF]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Cycle completion card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-4 bg-gradient-to-b from-[#E5CCEF] via-[#FBEEFC] to-[#F1CFEF] border border-[#C532F6] rounded-lg px-8 py-4 relative overflow-hidden">
              <div className="absolute -left-4 -bottom-4 w-[200px] h-[180px] opacity-10 pointer-events-none">
                <Image
                  src="/img/the_ego_crisis_circles.png"
                  alt=""
                  fill
                  className="object-contain mix-blend-multiply"
                />
              </div>
              <svg
                className="w-8 h-8 text-[#C532F6] animate-spin relative z-10"
                style={{ animationDuration: '3s' }}
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-medium relative z-10">
                The cycle repeats, stronger each time
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats / Trust Bar */}
      <section className="py-16 relative border-y border-black bg-[#F7F9FF]">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Live on', value: 'Sui & Solana Mainnet', icon: 'chain' },
              { label: 'Verification', value: 'TEE Attestations', icon: 'shield' },
              { label: 'Audited by', value: 'OtterSec', icon: 'audit' },
              { label: 'Recognition', value: 'Overflow Winner', icon: 'trophy' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="text-[#C871FF] text-sm mb-2 flex items-center justify-center gap-2">
                  {stat.icon === 'chain' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                  {stat.icon === 'shield' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                  {stat.icon === 'audit' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {stat.icon === 'trophy' && (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0V4z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M7 4H5a2 2 0 00-2 2v2a2 2 0 002 2h2M17 4h2a2 2 0 012 2v2a2 2 0 01-2 2h-2"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                  {stat.label}
                </div>
                <div className="font-medium group-hover:text-[#C871FF] transition-colors">
                  {stat.value}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative">
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
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium">Common Questions</h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white border border-black rounded-lg overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <span className="font-medium text-left">{faq.question}</span>
                    <svg
                      className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 text-black">{faq.answer}</div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section (Colorful Card Style) */}
      <section className="py-24 relative bg-[#F7F9FF]">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-gradient-to-b from-[#F6BCE1] via-[#FFFFFF] to-[#FCC3E2] border border-[#F632F3] rounded-2xl p-12 relative overflow-hidden"
          >
            {/* Circle Images */}
            <div className="absolute -left-12 -top-12 w-[300px] h-[280px] opacity-20 pointer-events-none">
              <Image
                src="/img/the_awaking_circles.png"
                alt=""
                fill
                className="object-contain mix-blend-multiply"
              />
            </div>
            <div className="absolute -right-12 -bottom-12 w-[300px] h-[280px] opacity-20 pointer-events-none">
              <Image
                src="/img/the_awaking_circles.png"
                alt=""
                fill
                className="object-contain mix-blend-multiply rotate-180"
              />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
                Ready to Test Your AI&apos;s Limits?
              </h2>
              <p className="text-lg text-black mb-8 max-w-2xl mx-auto">
                Deploy your first Sentinel in minutes. Set your bounty. Let the world&apos;s red
                teamers find what you missed.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                  <button className="btn btn-black px-8">Launch App</button>
                </Link>
                <Link href={SUI_SENTINEL_DOCS_URL} target="_blank">
                  <button className="btn btn-outline px-8">Read Documentation</button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
