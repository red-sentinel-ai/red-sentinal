'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          Welcome to Red Sentinel, a decentralized AI security platform operated by{' '}
          <a
            href="https://www.indiafilings.com/search/cyphronix-software-private-limited-cin-U62013MP2025PTC075797"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium hover:text-black transition-colors"
          >
            Cyphronix Software Private Limited
          </a>{' '}
          (CIN: U62013MP2025PTC075797). This Privacy Policy explains how we collect, use, disclose,
          and safeguard your information when you visit{' '}
          <Link href="/" className="underline font-medium hover:text-black transition-colors">
            redsentinel.xyz
          </Link>{' '}
          or use our platform.
        </p>
        <p className="text-gray-700 leading-relaxed">
          By accessing or using Red Sentinel, you consent to the practices described in this policy.
          If you do not agree with any part of this Privacy Policy, please discontinue use of our
          services.
        </p>
      </>
    ),
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-6">
          We collect information across two surfaces: the landing page (redsentinel.xyz) and the
          main application (app.redsentinel.xyz). Here is a full account of every category of data
          we collect.
        </p>

        <h4 className="text-lg font-semibold mb-3">2.1 Account & Identity Data</h4>
        <p className="text-gray-700 leading-relaxed mb-2">
          When you create a Red Sentinel account, we collect and store:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>
            <strong>Sui wallet address</strong>, used as your primary identity on the platform.
          </li>
          <li>
            <strong>Username and display name</strong>, chosen by you during onboarding.
          </li>
          <li>
            <strong>Email address</strong>, optionally provided for notifications and updates.
          </li>
          <li>
            <strong>Profile avatar</strong>, uploaded by you and stored in our secure file storage.
          </li>
          <li>
            <strong>Email notification preference</strong>, controlling whether you receive updates.
          </li>
        </ul>

        <h4 className="text-lg font-semibold mb-3">2.2 Social Account Connections</h4>
        <p className="text-gray-700 leading-relaxed mb-2">
          You may optionally connect social accounts via OAuth to verify your identity and
          participate in rewards missions. When you do, we receive and store:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>
            <strong>Twitter/X:</strong> Platform user ID, username, and profile avatar URL.
          </li>
          <li>
            <strong>Discord:</strong> Platform user ID, username, and profile avatar URL.
          </li>
          <p className="text-gray-600 text-sm pl-1">
            We do not receive your social passwords, direct messages, or private content. You can
            disconnect social accounts at any time from your profile settings.
          </p>
        </ul>

        <h4 className="text-lg font-semibold mb-3">2.3 AI Agent (Sentinel) Data</h4>
        <p className="text-gray-700 leading-relaxed mb-2">
          When you deploy an AI Sentinel, we collect:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>Agent name and URL-friendly slug.</li>
          <li>Agent profile image (uploaded to secure file storage).</li>
          <li>AI model provider and model name (e.g., OpenAI, GPT-4o).</li>
          <li>
            Sui blockchain object ID and transaction digest, which are also publicly recorded
            on-chain.
          </li>
          <li>Your wallet address, recorded as the agent owner.</li>
        </ul>

        <h4 className="text-lg font-semibold mb-3">2.4 Platform Activity Data</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>
            <strong>Featured Agent Requests:</strong> Name, email, wallet address, Twitter username,
            Telegram username, and a description submitted when requesting a featured listing.
          </li>
          <li>
            <strong>User Feedback:</strong> Name, email, wallet address, feedback type, and message
            submitted via the in-app feedback form.
          </li>
        </ul>

        <h4 className="text-lg font-semibold mb-3">2.5 Landing Page Submissions</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>
            <strong>Manifesto Signatures:</strong> Email address and timestamp when you sign the
            community manifesto.
          </li>
          <li>
            <strong>Job Applications:</strong> Full name, email, resume file, GitHub profile link,
            a note on your interest in the role, and availability information.
          </li>
          <li>
            <strong>Demo Requests:</strong> First name, last name, email, company name, an optional
            message, and whether you wish to join the beta.
          </li>
          <li>
            <strong>Ambassador Programme:</strong> Full name, preferred name, country, timezone, and Telegram handle, Twitter and GitHub URLs, Sui wallet address, desired
            roles, Web3 experience level, motivation, a 30-day contribution plan, and weekly
            availability.
          </li>
        </ul>

        <h4 className="text-lg font-semibold mb-3">2.6 Automatically Collected Data</h4>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
          <li>
            <strong>Usage Data:</strong> Pages visited, time spent, referral URLs, and interaction
            events collected via Vercel Analytics (privacy-focused, no personal identifiers stored).
          </li>
          <li>
            <strong>Device & Browser Data:</strong> IP address, browser type, operating system, and
            device identifiers.
          </li>
          <li>
            <strong>Session Cookies:</strong> Authentication session tokens managed by NextAuth.js
            to keep you logged in.
          </li>
        </ul>

        <h4 className="text-lg font-semibold mb-3">2.7 Blockchain Data</h4>
        <p className="text-gray-700 leading-relaxed">
          When you interact with Red Sentinel smart contracts on the Sui blockchain, your wallet
          address and all transaction data are recorded publicly and immutably on-chain. This data
          is outside our control and cannot be erased. Please be aware of the inherently public
          nature of blockchain interactions before participating.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">We use the information we collect to:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Operate, maintain, and improve the Red Sentinel platform and website.</li>
          <li>Process and respond to your applications, demo requests, and enquiries.</li>
          <li>
            Send transactional emails (via AWS SES) such as application confirmations and community
            updates.
          </li>
          <li>Analyse usage patterns to enhance user experience and platform security.</li>
          <li>Comply with applicable legal obligations and enforce our Terms of Service.</li>
          <li>Detect, investigate, and prevent fraudulent, abusive, or illegal activity.</li>
          <li>Communicate important updates about the platform or your account.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '4. Cookies & Tracking Technologies',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          We use cookies and similar technologies to operate and improve our services. These include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>
            <strong>Essential Cookies:</strong> Required for the website to function. These cannot
            be disabled.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our
            site (via Vercel Analytics). These are privacy-focused and do not use personal
            identifiers.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          You can control cookie preferences through your browser settings. Note that disabling
          cookies may affect the functionality of certain features.
        </p>
      </>
    ),
  },
  {
    id: 'third-party',
    title: '5. Third-Party Services',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          We work with the following carefully selected third-party providers. Each processes your
          data only as necessary to deliver their service:
        </p>
        <ul className="list-disc list-inside space-y-3 text-gray-700">
          <li>
            <strong>Supabase (PostgreSQL database & file storage):</strong> Stores all structured
            data including user profiles, agent records, applications, manifesto signatures, rewards
            activity, and more. Also hosts three file storage buckets:{' '}
            <em>ss-agents</em> (agent images), <em>ss-avatars</em> (profile pictures), and{' '}
            <em>job-applications</em> (resume files). Data is processed under Supabase&apos;s data
            processing agreement.
          </li>
          <li>
            <strong>Amazon Web Services (SES):</strong> Used exclusively for sending transactional
            emails (application confirmations, community updates). Subject to the AWS privacy
            policy.
          </li>
          <li>
            <strong>Vercel (Hosting & Analytics):</strong> Hosts the platform. Vercel Analytics
            collects privacy-focused, cookie-less usage data with no personal identifiers stored.
            Subject to Vercel&apos;s privacy policy.
          </li>
          <li>
            <strong>NextAuth.js:</strong> Manages authentication sessions via secure HTTP-only
            cookies. Session tokens are stored locally and not shared with third parties.
          </li>
          <li>
            <strong>Twitter/X (OAuth):</strong> When you connect your Twitter account, Twitter
            shares your user ID, username, and avatar URL with us via their OAuth 2.0 flow. We do
            not receive your password or private messages. Subject to Twitter/X&apos;s privacy
            policy.
          </li>
          <li>
            <strong>Discord (OAuth):</strong> When you connect your Discord account, Discord shares
            your user ID, username, and avatar URL with us. We do not receive your server messages
            or private content. Subject to Discord&apos;s privacy policy.
          </li>
          <li>
            <strong>Sui Blockchain:</strong> The decentralised network underpinning smart contract
            operations. Transaction data, wallet addresses, and agent object IDs are public and
            immutable on-chain.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          We do not sell, trade, or rent your personal information to third parties for marketing
          purposes.
        </p>
      </>
    ),
  },
  {
    id: 'data-security',
    title: '6. Data Security',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          We implement appropriate technical and organisational security measures to protect your
          personal information against unauthorised access, alteration, disclosure, or destruction.
          These measures include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>Encrypted data transmission (TLS/HTTPS) across all platform endpoints.</li>
          <li>
            Server-side Supabase service role keys are never exposed to the client browser.
          </li>
          <li>
            All data operations go through Next.js server-side API routes. The Supabase service
            role key is used exclusively on the server and is never exposed to the client.
          </li>
          <li>
            Smart contract security: Red Sentinel&apos;s contracts are fully audited by{' '}
            <a
              href="https://osec.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-black transition-colors"
            >
              OtterSec
            </a>
            .
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          However, no method of transmission over the internet or electronic storage is 100% secure.
          While we strive to protect your personal information, we cannot guarantee its absolute
          security.
        </p>
      </>
    ),
  },
  {
    id: 'data-retention',
    title: '7. Data Retention',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          We retain your personal information for as long as necessary to fulfil the purposes
          outlined in this policy, unless a longer retention period is required or permitted by law:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>
            <strong>User accounts & profiles:</strong> Retained for the lifetime of your account.
            You may request deletion at any time.
          </li>
          <li>
            <strong>Social connections (Twitter/Discord):</strong> Retained until you disconnect
            them via your profile settings or request deletion.
          </li>
          <li>
            <strong>Agent data:</strong> Agent records and on-chain references are retained
            indefinitely as they are tied to immutable blockchain records.
          </li>
          <li>
            <strong>Rewards activity:</strong> Retained indefinitely to maintain an auditable
            history of on-chain reward claims.
          </li>
          <li>
            <strong>Job applications:</strong> Retained for as long as reasonably necessary for
            hiring purposes. You may request deletion at any time.
          </li>
          <li>
            <strong>Manifesto signatures:</strong> Retained indefinitely as a record of community
            support.
          </li>
          <li>
            <strong>Demo requests & feedback:</strong> Retained for as long as reasonably necessary
            for business purposes.
          </li>
          <li>
            <strong>Ambassador applications:</strong> Retained for as long as reasonably necessary
            after submission.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          You may request deletion of your off-chain personal data at any time by contacting us
          (see Section 10). Note that on-chain data (wallet addresses, transaction hashes, agent
          object IDs) cannot be deleted due to the immutable nature of the blockchain.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: '8. Your Rights',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          Depending on your jurisdiction, you may have the following rights regarding your personal
          data:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
          <li>
            <strong>Access:</strong> Request a copy of the personal data we hold about you.
          </li>
          <li>
            <strong>Rectification:</strong> Request correction of inaccurate or incomplete data.
          </li>
          <li>
            <strong>Erasure:</strong> Request deletion of your personal data, subject to applicable
            legal obligations.
          </li>
          <li>
            <strong>Restriction:</strong> Request that we restrict processing of your personal data.
          </li>
          <li>
            <strong>Portability:</strong> Request a machine-readable copy of data you have provided
            to us.
          </li>
          <li>
            <strong>Objection:</strong> Object to our processing of your personal data.
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed">
          To exercise any of these rights, please contact us at{' '}
          <a
            href="mailto:suisentinal@gmail.com"
            className="underline font-medium hover:text-black transition-colors"
          >
            suisentinal@gmail.com
          </a>
          . We will respond to your request within 30 days.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '9. Changes to This Policy',
    content: (
      <p className="text-gray-700 leading-relaxed">
        We may update this Privacy Policy from time to time to reflect changes in our practices or
        applicable laws. We will notify you of significant changes by updating the &ldquo;Last
        Updated&rdquo; date at the top of this page. We encourage you to review this policy
        periodically.
      </p>
    ),
  },
  {
    id: 'contact',
    title: '10. Contact Us',
    content: (
      <>
        <p className="text-gray-700 leading-relaxed mb-4">
          If you have any questions, concerns, or requests relating to this Privacy Policy, please
          contact us:
        </p>
        <div className="border border-black rounded-lg p-6 space-y-2">
          <p className="font-semibold text-black">Cyphronix Software Private Limited</p>
          <p className="text-gray-700">
            CIN:{' '}
            <a
              href="https://www.indiafilings.com/search/cyphronix-software-private-limited-cin-U62013MP2025PTC075797"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-medium hover:text-black transition-colors"
            >
              U62013MP2025PTC075797
            </a>
          </p>
          <p className="text-gray-700">
            Email:{' '}
            <a
              href="mailto:suisentinal@gmail.com"
              className="underline font-medium hover:text-black transition-colors"
            >
              suisentinal@gmail.com
            </a>
          </p>
          <p className="text-gray-700">Platform: redsentinel.xyz</p>
        </div>
      </>
    ),
  },
]

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last Updated: February 27, 2026</p>
          <p className="text-gray-700 mt-4 text-lg leading-relaxed">
            Cyphronix Software Private Limited is committed to protecting your privacy and being
            transparent about how we handle your data on the Red Sentinel platform.
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
              href="/code-of-conduct"
              className="underline font-medium text-black hover:text-gray-700 transition-colors"
            >
              Code of Conduct
            </Link>
            .
          </p>
        </motion.div>
      </div>
    </section>
  )
}
