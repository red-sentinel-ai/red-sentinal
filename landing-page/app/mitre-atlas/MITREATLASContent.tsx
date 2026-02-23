'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield,
  Target,
  Zap,
  Eye,
  Database,
  Lock,
  Globe,
  Users,
  ChevronDown,
  CheckCircle,
} from 'lucide-react'
import { SUI_SENTINEL_APP_URL } from '@/constants'

const tactics = [
  {
    id: 'TA1',
    icon: Target,
    title: 'Reconnaissance',
    description:
      'Gathering information about the target AI system, its capabilities, and potential weaknesses.',
    techniques: [
      'Search for publicly available information about the model',
      'Probe system capabilities through interaction',
      'Identify input/output boundaries',
    ],
    howWeHelp:
      'Our platform provides a legitimate arena for reconnaissance—defenders see exactly what information attackers can gather and how it might be exploited.',
  },
  {
    id: 'TA2',
    icon: Zap,
    title: 'Resource Development',
    description:
      'Acquiring or developing tools, techniques, and infrastructure for attacking AI systems.',
    techniques: [
      'Develop adversarial example generation tools',
      'Create prompt injection payloads',
      'Build automated attack frameworks',
    ],
    howWeHelp:
      'The Sui Sentinel community continuously develops and tests new attack techniques—successful methods become part of the collective knowledge base.',
  },
  {
    id: 'TA3',
    icon: Globe,
    title: 'Initial Access',
    description: 'Gaining initial entry into the AI system or its surrounding infrastructure.',
    techniques: [
      'Prompt injection through user inputs',
      'Exploiting trust in AI outputs',
      'Bypassing input validation',
    ],
    howWeHelp:
      'Attackers attempt various initial access techniques against your Sentinel—every successful method is documented so you can strengthen defenses.',
  },
  {
    id: 'TA4',
    icon: Lock,
    title: 'ML Model Access',
    description: 'Gaining direct access to the model weights, architecture, or inference API.',
    techniques: [
      'Model extraction through queries',
      'Side-channel attacks on inference',
      'Exploiting model serving infrastructure',
    ],
    howWeHelp:
      'We test if your model can be extracted or probed for architectural information through clever querying patterns.',
  },
  {
    id: 'TA5',
    icon: Database,
    title: 'ML Artifact Collection',
    description:
      'Collecting training data, model outputs, or other artifacts that enable further attacks.',
    techniques: [
      'Training data extraction',
      'Membership inference attacks',
      'Output collection for model stealing',
    ],
    howWeHelp:
      'Our community attempts data extraction and membership inference—if your model leaks training data, you will know before malicious actors exploit it.',
  },
  {
    id: 'TA6',
    icon: Eye,
    title: 'Discovery',
    description:
      'Understanding the target system&apos;s behavior, boundaries, and vulnerabilities through interaction.',
    techniques: [
      'Systematic probing of model capabilities',
      'Identifying failure modes',
      'Mapping safety boundary locations',
    ],
    howWeHelp:
      'Continuous attacks map your AI&apos;s behavior boundaries—defenders receive detailed logs of what attackers discovered and how.',
  },
  {
    id: 'TA7',
    icon: Shield,
    title: 'Evade Defenses',
    description: 'Circumventing security controls, content filters, and safety mechanisms.',
    techniques: [
      'Jailbreaking and safety bypasses',
      'Encoding/obfuscation attacks',
      'Multi-turn context manipulation',
    ],
    howWeHelp:
      'The core of our platform—attackers specialize in evading defenses, giving you real-world data on filter effectiveness.',
  },
  {
    id: 'TA8',
    icon: Users,
    title: 'Persuasion and Deception',
    description: 'Using social engineering techniques against AI systems or their users.',
    techniques: [
      'Roleplay and persona attacks',
      'Authority exploitation',
      'Emotional manipulation',
    ],
    howWeHelp:
      'Our red teamers are creative social engineers—testing if your AI can be manipulated through persuasion rather than technical exploits.',
  },
]

const faqs = [
  {
    question: 'What is MITRE ATLAS?',
    answer:
      'MITRE ATLAS (Adversarial Threat Landscape for Artificial-Intelligence Systems) is a knowledge base of adversary tactics and techniques based on real-world observations, demonstrations from AI red teams and security groups, and the state of the possible. It is modeled after the MITRE ATT&CK framework but specifically for AI/ML systems.',
  },
  {
    question: 'How does Sui Sentinel relate to ATLAS?',
    answer:
      'Sui Sentinel provides a live testing environment where the tactics and techniques cataloged in ATLAS are attempted against your AI systems. Instead of theoretical assessments, you get real attack data mapped to the ATLAS framework, showing which techniques succeed against your defenses.',
  },
  {
    question: 'What is the difference between ATLAS and OWASP LLM Top 10?',
    answer:
      'OWASP LLM Top 10 focuses on application security risks specific to LLM-based applications. ATLAS is broader, covering the full spectrum of adversarial ML attacks including model extraction, data poisoning, and traditional ML attacks beyond just language models. They complement each other—OWASP for app security, ATLAS for adversarial threat modeling.',
  },
  {
    question: 'Can Sui Sentinel test all ATLAS techniques?',
    answer:
      'Sui Sentinel specializes in runtime, inference-time attacks (tactics like Initial Access, Discovery, Evasion). Some ATLAS techniques related to training-time attacks or infrastructure compromise require different testing approaches. Our platform covers the techniques most relevant to deployed AI systems.',
  },
]

export function MITREATLASContent() {
  return (
    <div className="text-black">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-[#F7F9FF] overflow-hidden">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl"
          >
            <div className="badge-pink w-fit mb-6">• threat framework</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
              MITRE <span className="text-[#C871FF]">ATLAS</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5F5C5C] max-w-2xl mb-8">
              The Adversarial Threat Landscape for Artificial-Intelligence Systems. Understand AI
              attack tactics and how crowdsourced red teaming maps to them.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="btn btn-black px-8">Start Testing</button>
              </Link>
              <Link href="#tactics">
                <button className="btn btn-outline px-8">View Tactics</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is ATLAS */}
      <section className="py-24 relative">
        <div className="vertical-line left-4"></div>
        <div className="vertical-line right-4"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <div className="badge-pink w-fit mb-6">• about</div>
              <h2 className="text-3xl md:text-4xl font-medium mb-6">What is MITRE ATLAS?</h2>
              <p className="text-lg text-[#5F5C5C] mb-6">
                MITRE ATLAS is a globally accessible knowledge base of adversary tactics and
                techniques based on real-world attacks and demonstrations against AI systems.
              </p>
              <p className="text-lg text-[#5F5C5C] mb-6">
                Modeled after the industry-standard MITRE ATT&CK framework, ATLAS specifically
                addresses the unique threat landscape of machine learning and AI systems—from data
                poisoning to model extraction to adversarial examples.
              </p>
              <div className="flex items-center gap-2 text-[#C871FF]">
                <Target className="w-5 h-5" />
                <span className="font-medium">14 Tactics, 60+ Techniques, Real-World Based</span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="bg-[#F5F5F5] p-6 border border-black">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#C871FF]" />
                  Threat Intelligence
                </h3>
                <p className="text-sm text-[#5F5C5C]">
                  Based on documented real-world AI attacks and security research
                </p>
              </div>
              <div className="bg-[#F5F5F5] p-6 border border-black">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#C871FF]" />
                  Community-Driven
                </h3>
                <p className="text-sm text-[#5F5C5C]">
                  Continuously updated with new techniques from the security community
                </p>
              </div>
              <div className="bg-[#F5F5F5] p-6 border border-black">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[#C871FF]" />
                  Industry Standard
                </h3>
                <p className="text-sm text-[#5F5C5C]">
                  Used by enterprises, government, and security vendors worldwide
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tactics Grid */}
      <section id="tactics" className="py-24 relative bg-[#F7F9FF]">
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
            <div className="badge-pink w-fit mx-auto mb-6">• tactics</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              ATLAS <span className="text-[#C871FF]">Tactics</span>
            </h2>
            <p className="text-lg text-[#5F5C5C] max-w-2xl mx-auto">
              How Sui Sentinel crowdsourced red teaming maps to ATLAS tactics
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {tactics.map((tactic, index) => (
              <motion.div
                key={tactic.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white border border-black overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center gap-4 p-6 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <div className="w-12 h-12 bg-[#C871FF]/10 flex items-center justify-center shrink-0">
                      <tactic.icon className="w-6 h-6 text-[#C871FF]" />
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-[#C871FF]">{tactic.id}</span>
                      <h3 className="text-lg font-medium">{tactic.title}</h3>
                    </div>
                    <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pl-[88px]">
                    <p className="text-[#5F5C5C] mb-4">{tactic.description}</p>
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-2">Key Techniques:</div>
                      <ul className="space-y-1">
                        {tactic.techniques.map((tech, i) => (
                          <li key={i} className="text-sm text-[#5F5C5C] flex items-start gap-2">
                            <span className="text-[#C871FF]">•</span>
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#F7F9FF] p-4 border-l-4 border-[#C871FF]">
                      <div className="font-medium mb-1">How Sui Sentinel Helps:</div>
                      <p className="text-sm text-[#5F5C5C]">{tactic.howWeHelp}</p>
                    </div>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Framework Comparison */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• comparison</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              ATLAS vs <span className="text-[#C871FF]">OWASP LLM</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            viewport={{ once: true }}
            className="overflow-x-auto"
          >
            <table className="w-full border border-black">
              <thead>
                <tr className="bg-[#F5F5F5]">
                  <th className="p-4 text-left border-b border-r border-black font-medium">
                    Aspect
                  </th>
                  <th className="p-4 text-left border-b border-r border-black font-medium">
                    MITRE ATLAS
                  </th>
                  <th className="p-4 text-left border-b border-black font-medium">
                    OWASP LLM Top 10
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    aspect: 'Focus',
                    atlas: 'Adversarial tactics and techniques',
                    owasp: 'Application security risks',
                  },
                  {
                    aspect: 'Scope',
                    atlas: 'All ML/AI systems (not just LLMs)',
                    owasp: 'LLM-based applications',
                  },
                  {
                    aspect: 'Structure',
                    atlas: 'Tactics → Techniques → Procedures',
                    owasp: 'Top 10 risk categories',
                  },
                  {
                    aspect: 'Primary Use',
                    atlas: 'Threat modeling, detection, response',
                    owasp: 'Secure development, compliance',
                  },
                  {
                    aspect: 'Attacker Perspective',
                    atlas: 'Yes - attack lifecycle focused',
                    owasp: 'Risk-focused, defender-oriented',
                  },
                ].map((row, index) => (
                  <tr key={index} className="border-b border-black last:border-b-0">
                    <td className="p-4 border-r border-black font-medium">{row.aspect}</td>
                    <td className="p-4 border-r border-black text-[#5F5C5C]">{row.atlas}</td>
                    <td className="p-4 text-[#5F5C5C]">{row.owasp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-8 p-6 bg-[#C871FF]/10 border border-[#C871FF]/30"
          >
            <p className="text-center">
              <span className="font-medium">Recommendation:</span> Use both frameworks together.
              ATLAS for threat modeling and understanding adversary behavior, OWASP for application
              security requirements and compliance checklists.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testing Coverage */}
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
              • coverage
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Sui Sentinel <span className="text-[#C871FF]">Coverage</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Fully Covered
              </h3>
              <ul className="space-y-3 text-white/70">
                <li>• Reconnaissance through interaction</li>
                <li>• Initial Access (prompt injection)</li>
                <li>• Discovery and behavior mapping</li>
                <li>• Defense evasion (jailbreaking)</li>
                <li>• Persuasion and deception attacks</li>
                <li>• ML model access attempts</li>
                <li>• ML artifact collection</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Partial Coverage
              </h3>
              <ul className="space-y-3 text-white/70">
                <li>• Resource Development (indirectly)</li>
                <li>• Infrastructure-focused techniques</li>
                <li>• Training-time attacks</li>
              </ul>
              <p className="mt-4 text-sm text-white/50">
                These require different testing approaches beyond runtime red teaming.
              </p>
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
              Test Against ATLAS Tactics
            </h2>
            <p className="text-lg text-[#5F5C5C] mb-8 max-w-2xl mx-auto">
              Deploy a Sentinel and let the global red team community test your AI against MITRE
              ATLAS techniques.
            </p>
            <Link href={SUI_SENTINEL_APP_URL} target="_blank">
              <button className="btn btn-black px-8">Start Testing</button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
