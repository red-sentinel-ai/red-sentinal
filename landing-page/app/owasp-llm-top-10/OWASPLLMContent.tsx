'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Shield,
  AlertTriangle,
  Lock,
  Eye,
  Server,
  Code,
  FileText,
  Database,
  Globe,
  Layers,
  ChevronDown,
  Target,
} from 'lucide-react'
import { SUI_SENTINEL_APP_URL } from '@/constants'

const owaspItems = [
  {
    id: 'LLM01',
    icon: AlertTriangle,
    title: 'Prompt Injection',
    description:
      'Manipulating LLMs via crafted inputs to bypass safeguards, execute unauthorized commands, or extract sensitive information.',
    direct: true,
    howWeTest:
      'Our community attempts direct, indirect, and multi-turn prompt injection attacks. Every successful manipulation is logged with the exact payload used.',
  },
  {
    id: 'LLM02',
    icon: Eye,
    title: 'Sensitive Information Disclosure',
    description:
      'LLMs may expose confidential data, proprietary algorithms, or training data through carefully crafted queries.',
    direct: true,
    howWeTest:
      'Attackers systematically probe for data extraction vulnerabilities, testing membership inference and attempting to reconstruct training data.',
  },
  {
    id: 'LLM03',
    icon: Lock,
    title: 'Supply Chain Vulnerabilities',
    description:
      'Risks from third-party models, training data, plugins, and dependencies that may contain backdoors or malicious code.',
    direct: false,
    howWeTest:
      'While we focus on runtime behavior, testing deployed Sentinels can reveal if vulnerable components are exploitable in your specific configuration.',
  },
  {
    id: 'LLM04',
    icon: Shield,
    title: 'Data and Model Poisoning',
    description:
      'Attackers contaminate training data or fine-tuning datasets to introduce backdoors or manipulate model behavior.',
    direct: false,
    howWeTest:
      'Red teaming can reveal behavioral anomalies that might indicate poisoning, though prevention requires secure data pipelines.',
  },
  {
    id: 'LLM05',
    icon: Code,
    title: 'Improper Output Handling',
    description:
      'Insufficient validation of LLM outputs before they are passed to backend systems, leading to XSS, SSRF, or code injection.',
    direct: true,
    howWeTest:
      'Attackers attempt to generate malicious outputs (JavaScript, SQL, commands) and verify if your output filters catch them.',
  },
  {
    id: 'LLM06',
    icon: FileText,
    title: 'Excessive Agency',
    description:
      'Granting LLMs too much capability to invoke functions, access data, or make decisions without adequate oversight.',
    direct: true,
    howWeTest:
      'We test if attackers can manipulate your AI into triggering unintended actions, accessing unauthorized functions, or escalating privileges.',
  },
  {
    id: 'LLM07',
    icon: Database,
    title: 'System Prompt Leakage',
    description:
      'Attackers extract system prompts, instructions, or configuration details that should remain confidential.',
    direct: true,
    howWeTest:
      'Our community attempts various prompt extraction techniques—encoding tricks, social engineering, and iterative probing—to see if your system prompt leaks.',
  },
  {
    id: 'LLM08',
    icon: Globe,
    title: 'Vector and Embedding Weaknesses',
    description:
      'Vulnerabilities in RAG systems where malicious content in vector databases manipulates retrieval and responses.',
    direct: true,
    howWeTest:
      'If your Sentinel uses RAG, attackers can test for context manipulation, injection through retrieved content, and embedding-based attacks.',
  },
  {
    id: 'LLM09',
    icon: Layers,
    title: 'Misinformation Generation',
    description:
      'LLMs producing convincing but false information, leading to decision errors, reputation damage, or safety issues.',
    direct: false,
    howWeTest:
      'While primarily a model quality issue, red teaming can test if adversarial inputs exacerbate hallucination or cause targeted misinformation.',
  },
  {
    id: 'LLM10',
    icon: Server,
    title: 'Unbounded Resource Consumption',
    description:
      'Attacks that cause excessive computational costs through resource-intensive queries or context window exhaustion.',
    direct: true,
    howWeTest:
      'Attackers can attempt resource exhaustion attacks, testing if your rate limiting and resource controls are effective.',
  },
]

const faqs = [
  {
    question: 'What is OWASP LLM Top 10?',
    answer:
      'The OWASP Top 10 for Large Language Model Applications is a standard awareness document for developers and security teams about the most critical security risks specific to LLM-based applications. It is maintained by the Open Web Application Security Project (OWASP) foundation.',
  },
  {
    question: 'How does Sui Sentinel help with OWASP compliance?',
    answer:
      'Sui Sentinel provides continuous, real-world testing for the vulnerabilities that can be tested through adversarial interaction (7 of the 10 categories). Our community attempts the same attacks real adversaries would use, giving you actionable data on your security posture.',
  },
  {
    question: 'Which OWASP items can not be tested through red teaming?',
    answer:
      'Supply chain vulnerabilities (LLM03), data poisoning (LLM04), and misinformation generation (LLM09) primarily require preventive controls and data governance rather than runtime testing. However, the effects of some supply chain or poisoning issues may be observable through red teaming.',
  },
  {
    question: 'How often should I test against OWASP categories?',
    answer:
      'OWASP recommends continuous testing as models, prompts, and configurations change. Sui Sentinel provides 24/7 testing, ensuring you catch new vulnerabilities as they emerge, not just during annual audits.',
  },
]

export function OWASPLLMContent() {
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
            <div className="badge-pink w-fit mb-6">• security framework</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium leading-tight mb-6">
              OWASP LLM Top 10 <span className="text-[#C871FF]">2025</span>
            </h1>
            <p className="text-lg md:text-xl text-[#5F5C5C] max-w-2xl mb-8">
              The industry-standard framework for LLM security. Understand the top 10
              vulnerabilities and how crowdsourced red teaming helps you test for them.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={SUI_SENTINEL_APP_URL} target="_blank">
                <button className="btn btn-black px-8">Start Testing</button>
              </Link>
              <Link href="#owasp-list">
                <button className="btn btn-outline px-8">View All 10</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What is OWASP */}
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
              <h2 className="text-3xl md:text-4xl font-medium mb-6">What is OWASP LLM Top 10?</h2>
              <p className="text-lg text-[#5F5C5C] mb-6">
                The OWASP Top 10 for Large Language Model Applications is the industry-standard
                awareness document that identifies the most critical security risks specific to AI
                applications powered by LLMs.
              </p>
              <p className="text-lg text-[#5F5C5C] mb-6">
                Unlike traditional application security, LLMs introduce unique attack vectors
                through prompt manipulation, context exploitation, and the inherent unpredictability
                of language models.
              </p>
              <div className="flex items-center gap-2 text-[#C871FF]">
                <Target className="w-5 h-5" />
                <span className="font-medium">
                  Sui Sentinel tests 7 of 10 categories through adversarial red teaming
                </span>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-[#F5F5F5] p-8 border border-black"
            >
              <h3 className="text-xl font-medium mb-4">Why It Matters</h3>
              <ul className="space-y-3 text-[#5F5C5C]">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#C871FF] shrink-0 mt-1" />
                  <span>Industry-standard security framework</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#C871FF] shrink-0 mt-1" />
                  <span>Required for enterprise compliance</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#C871FF] shrink-0 mt-1" />
                  <span>Basis for security audit checklists</span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#C871FF] shrink-0 mt-1" />
                  <span>Common language for security teams</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The 10 Categories */}
      <section id="owasp-list" className="py-24 relative bg-[#F7F9FF]">
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
            <div className="badge-pink w-fit mx-auto mb-6">• the list</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              The <span className="text-[#C871FF]">10 Categories</span>
            </h2>
            <p className="text-lg text-[#5F5C5C] max-w-2xl mx-auto">
              Each category includes how Sui Sentinel red teaming addresses it
            </p>
          </motion.div>

          <div className="space-y-6">
            {owaspItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="bg-white border border-black overflow-hidden"
              >
                <details className="group">
                  <summary className="flex items-center gap-4 p-6 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <div className="w-16 h-16 bg-[#C871FF]/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-8 h-8 text-[#C871FF]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-[#C871FF]">{item.id}</span>
                        {item.direct ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            Directly Testable
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                            Partial Coverage
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-medium">{item.title}</h3>
                    </div>
                    <ChevronDown className="w-5 h-5 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-6 pb-6 pl-[104px]">
                    <p className="text-[#5F5C5C] mb-4">{item.description}</p>
                    <div className="bg-[#F7F9FF] p-4 border-l-4 border-[#C871FF]">
                      <div className="font-medium mb-1">How Sui Sentinel Tests This:</div>
                      <p className="text-sm text-[#5F5C5C]">{item.howWeTest}</p>
                    </div>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Summary */}
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
            <div className="badge-pink w-fit mx-auto mb-6">• coverage</div>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-medium mb-6">
              Red Teaming <span className="text-[#C871FF]">Coverage</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-green-50 border border-green-200 p-8 text-center"
            >
              <div className="text-5xl font-medium text-green-600 mb-2">7</div>
              <div className="font-medium mb-2">Directly Testable</div>
              <p className="text-sm text-[#5F5C5C]">
                Categories that can be tested through adversarial red teaming
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-amber-50 border border-amber-200 p-8 text-center"
            >
              <div className="text-5xl font-medium text-amber-600 mb-2">3</div>
              <div className="font-medium mb-2">Partial Coverage</div>
              <p className="text-sm text-[#5F5C5C]">
                Categories requiring preventive controls + testing
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-[#C871FF]/10 border border-[#C871FF]/30 p-8 text-center"
            >
              <div className="text-5xl font-medium text-[#C871FF] mb-2">24/7</div>
              <div className="font-medium mb-2">Continuous Testing</div>
              <p className="text-sm text-[#5F5C5C]">
                Non-stop adversarial attempts from global red team
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
              Test Against OWASP Standards
            </h2>
            <p className="text-lg text-[#5F5C5C] mb-8 max-w-2xl mx-auto">
              Deploy a Sentinel and let the community test your AI against the industry&apos;s top
              10 LLM vulnerabilities.
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
