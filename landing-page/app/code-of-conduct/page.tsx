'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const sections = [
  {
    id: 'pledge',
    title: '1. Our Pledge',
    content: (
      <p className="text-gray-700 leading-relaxed">
        Sui Sentinel is an adversarial AI security platform built on the premise that
        constructive conflict makes systems safer. We pledge to maintain an environment where
        attackers, defenders, researchers, and builders can collaborate with mutual respect. We are
        committed to providing a harassment-free experience for everyone, regardless of age,
        nationality, experience level, gender identity, sexual orientation, disability, or
        background. Excellence in security research and integrity in competition are the values that
        define this community.
      </p>
    ),
  },
  {
    id: 'standards',
    title: '2. Community Standards',
    content: (
      <>
        <h4 className="text-lg font-semibold mb-3">Expected Behaviour</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>Engage respectfully and professionally with all community members.</li>
          <li>
            Share knowledge openly. If you discover a new attack technique or defence strategy,
            consider contributing to the ecosystem.
          </li>
          <li>
            Provide constructive, evidence-based feedback when disputing outcomes or raising
            concerns.
          </li>
          <li>Credit others&apos; original research and acknowledge prior work.</li>
          <li>
            Act in good faith; competition on the platform is about skill, not exploitation of
            edge-cases in bad faith.
          </li>
          <li>
            Respect the cryptographic and on-chain nature of the platform. Outcomes verified by the
            protocol are final.
          </li>
        </ul>

        <h4 className="text-lg font-semibold mb-3">Unacceptable Behaviour</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            Harassment, intimidation, hate speech, or personal attacks directed at any individual or
            group.
          </li>
          <li>
            Sharing, publishing, or threatening to publish private information about others
            (&ldquo;doxing&rdquo;).
          </li>
          <li>Sexualised language, imagery, or unwelcome advances of any kind.</li>
          <li>Deliberately spreading misinformation or false claims about the platform or users.</li>
          <li>Impersonating other users, team members, or Cyphronix Software personnel.</li>
          <li>
            Attempting to manipulate governance, votes, or community decisions through deceptive
            means.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'platform-rules',
    title: '3. Platform Rules',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          Sui Sentinel is a red teaming platform. All adversarial activity <strong>must</strong>{' '}
          occur exclusively within the bounds of the platform protocol. The following rules apply at
          all times:
        </p>

        <h4 className="text-lg font-semibold mb-3">For Attackers</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>
            Attacks are strictly limited to the AI Sentinel systems deployed on-chain within the
            platform. Targeting any system, infrastructure, or service outside of the Sui Sentinel
            protocol is a violation of this Code and may be illegal.
          </li>
          <li>
            Do not attempt to exploit vulnerabilities in the Sui Sentinel smart contracts or
            infrastructure itself. Responsible disclosure applies (see Section 7).
          </li>
          <li>
            Prompt injection, jailbreaking, and adversarial prompting are fair game against Sentinel
            agents; these are the intended attack vectors.
          </li>
          <li>
            You may not use automated spam bots to flood Sentinels with low-quality attacks solely
            to drain fees, as this undermines the ecosystem.
          </li>
          <li>
            Collusion between an attacker and a Sentinel&apos;s owner to fraudulently claim bounties
            is strictly prohibited and may result in a permanent ban.
          </li>
        </ul>

        <h4 className="text-lg font-semibold mb-3">For Defenders (Sentinel Operators)</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>
            You may not deploy Sentinels designed to collect, extract, or exfiltrate personal data
            from users.
          </li>
          <li>
            Sentinels must not be used to generate illegal, harmful, or abusive content regardless
            of attacker prompts.
          </li>
          <li>
            Accurately represent your Sentinel&apos;s capabilities and system prompt complexity.
            Deliberately misleading descriptions of defences undermine community trust.
          </li>
        </ul>

        <h4 className="text-lg font-semibold mb-3">General Platform Rules</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            All on-chain interactions are final and governed by the smart contracts. The protocol
            outcome is authoritative.
          </li>
          <li>
            Do not attempt to manipulate, front-run, or exploit the Sui Sentinel smart contract
            logic outside of its intended use.
          </li>
          <li>
            Using the platform for money laundering, sanctions evasion, or other financial crimes is
            strictly prohibited.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'research-ethics',
    title: '4. Research & Disclosure Ethics',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          We believe that responsible security research is a public good. We encourage:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>
            Publishing findings, novel attack strategies, and defence techniques that advance the
            field of AI security.
          </li>
          <li>
            Writing blog posts, papers, or threads that educate the community, provided they do not
            reveal sensitive platform infrastructure details.
          </li>
          <li>
            Engaging with the broader AI safety and security research community on findings from the
            platform.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          If you discover a vulnerability in the Sui Sentinel platform, contracts, or
          infrastructure, please practise responsible disclosure by reporting it to{' '}
          <a
            href="mailto:suisentinal@gmail.com"
            className="underline font-medium hover:text-black transition-colors"
          >
            suisentinal@gmail.com
          </a>{' '}
          before any public disclosure. We will acknowledge your report within 48 hours.
        </p>
      </>
    ),
  },
  {
    id: 'scope',
    title: '5. Scope',
    content: (
      <p className="text-gray-700 leading-relaxed">
        This Code of Conduct applies to all spaces managed by Sui Sentinel and Cyphronix Software
        Private Limited, including the Sui Sentinel web application and landing page, official
        Telegram and Discord communities, the GitHub organisation, social media channels, and any
        in-person or virtual events. It applies equally to all participants: users, contributors,
        community members, ambassadors, and team members.
      </p>
    ),
  },
  {
    id: 'enforcement',
    title: '6. Enforcement',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Cyphronix Software team is responsible for clarifying and enforcing this Code.
          Violations will be addressed proportionately, and may result in:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>
            <strong>Warning:</strong> A private written warning with an explanation of the
            violation.
          </li>
          <li>
            <strong>Temporary Suspension:</strong> Temporary removal from platform features or
            community spaces.
          </li>
          <li>
            <strong>Permanent Ban:</strong> Permanent exclusion from all Sui Sentinel community
            spaces and, where technically feasible, platform access.
          </li>
          <li>
            <strong>Legal Action:</strong> Referral to relevant authorities where activity is
            illegal.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          Community leaders will exercise good-faith judgement in all enforcement decisions. Appeals
          may be submitted to{' '}
          <a
            href="mailto:suisentinal@gmail.com"
            className="underline font-medium hover:text-black transition-colors"
          >
            suisentinal@gmail.com
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: 'reporting',
    title: '7. Reporting a Violation',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          If you witness or experience behaviour that violates this Code of Conduct, please report
          it. All reports will be handled with discretion and confidentiality.
        </p>
        <div className="border border-black rounded-lg p-6 space-y-2">
          <p className="font-semibold text-black">Contact the Sui Sentinel Team</p>
          <p className="text-gray-700">
            Email:{' '}
            <a
              href="mailto:suisentinal@gmail.com"
              className="underline font-medium hover:text-black transition-colors"
            >
              suisentinal@gmail.com
            </a>
          </p>
          <p className="text-gray-700 text-sm mt-2">
            Please include: a description of the incident, any relevant links, usernames, or
            on-chain addresses, and whether you would like your identity kept confidential.
          </p>
        </div>
      </>
    ),
  },
  {
    id: 'attribution',
    title: '8. Attribution',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          This Code of Conduct is published by{' '}
          <a
            href="https://www.indiafilings.com/search/cyphronix-software-private-limited-cin-U62013MP2025PTC075797"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:text-black transition-colors"
          >
            Cyphronix Software Private Limited
          </a>{' '}
          (CIN: U62013MP2025PTC075797).
        </p>
        <p className="text-gray-700 leading-relaxed">
          We reserve the right to update this Code of Conduct as the platform evolves. Changes will
          be communicated via our official channels. Continued participation in the Sui Sentinel
          community after updates constitutes acceptance of the revised Code.
        </p>
      </>
    ),
  },
]

export default function CodeOfConductPage() {
  return (
    <section
      className="py-24 pt-48 relative text-black min-h-screen bg-no-repeat"
      style={{
        backgroundImage: "url('/img/hero_bg.png')",
        backgroundSize: '100% auto',
      }}
    >
      <div className="vertical-line left-4 -top-0"></div>
      <div className="vertical-line right-4 -top-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Code of Conduct</h1>
          <p className="text-gray-500 text-sm">Last Updated: February 27, 2026</p>
          <p className="text-gray-700 mt-4 text-lg leading-relaxed">
            Sui Sentinel is a platform built on adversarial trust, where AI systems are challenged
            so they can be made stronger. This Code exists to ensure that competitive spirit never
            crosses into harmful behaviour, and that every participant can contribute to a safer AI
            ecosystem with confidence.
          </p>
        </motion.div>

        <div className="flex flex-col gap-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="border border-black p-6 rounded-lg"
            >
              <h2 className="text-xl md:text-2xl font-bold mb-4">{section.title}</h2>
              <div>{section.content}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 pt-8 border-t border-gray-200 text-center"
        >
          <p className="text-gray-500 text-sm">
            Also see our{' '}
            <Link
              href="/privacy-policy"
              className="underline font-medium text-black hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </section>
  )
}
