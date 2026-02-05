import Link from 'next/link'

export default function ProjectInfo() {
  return (
    <div className="min-h-body bg-white pt-12 text-black">
      <div className="mx-auto max-w-4xl px-8 py-20">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-4xl font-bold uppercase md:text-[64px]">SUI SENTINEL</h1>
          <p className="text-xl text-gray-600">AI Agent Security Through Economic Incentives</p>
          <div className="mx-auto mt-8 flex max-w-[600px] border-t border-gray-300"></div>
        </div>

        <div className="space-y-12 text-lg leading-relaxed">
          <section className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-blue-600">Why This Matters</h2>
            <p className="mb-4 text-gray-700">
              We are all in the age of AI. LLMs are being integrated everywhere. We can all see in
              the near future, AI agents will manage our finances, DeFi pools, run DAOs, and make
              bets on our behalf on prediction markets.
            </p>
            <p className="text-gray-700">
              But there is one critical vulnerability: a cleverly crafted sentence can make an AI
              completely disregard its rules. This is called{' '}
              <span className="font-semibold text-blue-600">prompt injection vulnerability</span>.
              As AI agents gain control over real assets and critical decisions, understanding and
              defending against these attacks becomes essential for the security of our digital
              future.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-blue-600">Perfect Economic Alignment</h2>
            <p className="mb-4 text-gray-700">
              The beauty of SUI Sentinel is its economic model. It creates perfect alignment through
              game theory. Defenders are incentivized to deploy the most robust agents possible,
              because they earn SUI tokens for every failed attack attempt. The stronger their
              defenses, the more they earn.
            </p>
            <p className="text-gray-700">
              Attackers are motivated by both the intellectual challenge and the potential to win
              the entire fund held by the agent. This creates a natural testing environment where
              the best security practices emerge through economic competition rather than
              theoretical analysis.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-blue-600">
              Verifiable Off-Chain Architecture
            </h2>
            <p className="mb-4 text-gray-700">
              SUI Sentinel leverages the{' '}
              <span className="font-semibold text-blue-600">Nautilus framework</span> developed by
              the SUI team for verifiable off-chain computation. Our AI agent server runs within a
              Trusted Execution Environment (TEE) using AWS Nitro Enclaves, ensuring complete
              isolation and tamper-proof execution.
            </p>
            <p className="mb-4 text-gray-700">
              Every AI response is cryptographically signed within the TEE and verified on-chain
              through our Move smart contracts. This hybrid architecture allows for complex AI
              computations to run off-chain for performance and cost efficiency, while maintaining
              blockchain-level trust and transparency through cryptographic proofs.
            </p>
            <p className="text-gray-700">
              The result is a trustless system where players can be confident that AI decisions are
              authentic and unmanipulated, while enabling sophisticated gameplay that would be
              impossible with purely on-chain computation.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 bg-gray-50 p-8">
            <h2 className="mb-6 text-2xl font-bold text-blue-600">Six-Month Roadmap</h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-blue-500">
                  Mainnet Launch - Last Week of June 2025
                </h3>
                <p className="text-gray-700">
                  Full production deployment on SUI Mainnet with real economic incentives and
                  community-driven agent battles.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-blue-500">
                  Months 1-3: Model Expansion & Community
                </h3>
                <ul className="ml-4 space-y-2 text-gray-700">
                  <li>
                    • Support for additional AI models: Grok, DeepSeek, Gemini, and custom model
                    integrations
                  </li>
                  <li>• Increased token size limits for more complex prompts and attack vectors</li>
                  <li>• Community building initiatives and educational content</li>
                  <li>• Strategic partnerships with other projects in the SUI ecosystem</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-blue-500">
                  Months 4-6: Ecosystem Growth
                </h3>
                <p className="text-gray-700">
                  Token launch on SUI with governance features, tournament systems, and expansion to
                  support enterprise use cases for AI security testing.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-blue-300 bg-gray-50 p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold">Ready to Join the Battle?</h2>
            <p className="mb-6 text-gray-700">
              Experience the future of AI security through economic incentives. Test your skills as
              either a defender or attacker in the ultimate prompt security arena.
            </p>

            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/" className="btn btn-black">
                Try Demo
              </Link>
              <a
                href="https://www.youtube.com/watch?v=U3qMdgSGASI"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                Watch Demo
              </a>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <p className="mb-4 text-gray-600">
                Interested in partnerships or want to learn more about the project?
              </p>
              <a
                href="https://calendly.com/satyamb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-500"
              >
                Schedule a call with our team →
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
